"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter, useStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Loader2, 
  Maximize2, 
  Minimize2, 
  AlertCircle, 
  CheckCircle2, 
  CircleDashed,
  Sparkles,
  Trash2,
  BookOpen
} from 'lucide-react';

interface Props {
  chapter: Chapter;
  index: number;
}

export default function ChapterCard({ chapter, index }: Props) {
  const { updateChapter, deleteChapter, generateChapter, rewriteChapter } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingCanvasManuscript, setIsEditingCanvasManuscript] = useState(false);
  const [isEditingMaximizedManuscript, setIsEditingMaximizedManuscript] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isGenerating = chapter.status === 'generating';
  const isRewriting = chapter.status === 'rewriting';
  const isBusy = isGenerating || isRewriting;
  
  const displayNum = (index + 1).toString().padStart(2, '0');
  const wordCount = chapter.content ? chapter.content.trim().split(/\s+/).length : 0;

  // Render a clean status pill tailored for the Slate Editorial theme
  const renderStatusPill = (size: 'sm' | 'md' = 'sm') => {
    const textStyle = size === 'sm' ? "text-[9px]" : "text-[10px]";
    const iconSize = size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5";

    if (isBusy) {
      return (
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-stone-100 text-stone-700 rounded-md border border-stone-200 animate-pulse ${textStyle}`}>
          <Loader2 className={`${iconSize} animate-spin`} />
          <span className="uppercase tracking-wider font-semibold font-mono">Processing...</span>
        </div>
      );
    }

    if (chapter.errorMessage) {
      return (
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 ${textStyle}`} title={chapter.errorMessage}>
          <AlertCircle className={iconSize} />
          <span className="uppercase tracking-wider font-semibold font-mono">Error</span>
        </div>
      );
    }

    if (chapter.status === 'completed' || chapter.content) {
      return (
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100 ${textStyle}`}>
          <CheckCircle2 className={`${iconSize} text-emerald-600`} />
          <span className="uppercase tracking-wider font-semibold font-mono">Drafted</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 bg-stone-100 text-stone-500 rounded-md border border-stone-200 ${textStyle}`}>
        <CircleDashed className={iconSize} />
        <span className="uppercase tracking-wider font-semibold font-mono">Empty</span>
      </div>
    );
  };

  let cardBorderClass = 'border-stone-200/90 shadow-xs hover:border-stone-450 hover:shadow-md hover:bg-[#fafaf7]/50';
  let badgeClass = 'bg-stone-900 text-stone-50 border-stone-950';
  if (isDragging) {
    cardBorderClass = 'border-stone-950 shadow-2xl bg-white';
    badgeClass = 'bg-stone-900 text-stone-50 border-stone-950';
  } else if (isBusy) {
    cardBorderClass = 'border-indigo-200 shadow-md bg-[#fafbff]/70 border-l-3 border-l-indigo-400 hover:border-indigo-400';
    badgeClass = 'bg-indigo-600 text-white border-indigo-700 animate-pulse';
  } else if (chapter.errorMessage) {
    cardBorderClass = 'border-red-200 shadow-xs bg-red-50/10 border-l-3 border-l-red-400 hover:border-red-300';
    badgeClass = 'bg-red-650 text-white border-red-700';
  } else if (chapter.content) {
    cardBorderClass = 'border-emerald-250/70 hover:border-emerald-350 shadow-xs bg-white border-l-3 border-l-emerald-500 hover:bg-emerald-50/5';
    badgeClass = 'bg-emerald-700 text-white border-emerald-800';
  } else {
    cardBorderClass = 'border-stone-200/90 shadow-xs hover:border-stone-450 hover:shadow-md hover:bg-[#fafaf7]/55 border-l-3 border-l-stone-350/70';
    badgeClass = 'bg-stone-500 text-stone-100 border-stone-600';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative h-[410px] font-sans text-left ${isDragging ? 'z-50 scale-103 shadow-xl' : 'z-0'} transition-all`}
    >
      {/* 1. DUAL-PANE ZEN MODE WORKSPACE PORTAL */}
      {isMaximized && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Blur slide-out backdrop overlay */}
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm cursor-default transition-all duration-300" 
            onClick={(e) => { e.stopPropagation(); setIsMaximized(false); }}
          />
          
          <div
            className="group relative z-10 w-full h-full bg-stone-50 shadow-2xl border border-stone-200 rounded-2xl flex flex-col md:flex-row overflow-hidden font-sans animate-in zoom-in-95 duration-200"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* LEFT ZEN PANE: META DATA AND INSTRUCTION ENGINE */}
            <div className="w-full md:w-80 bg-stone-100/90 border-b md:border-b-0 md:border-r border-stone-200 p-6 flex flex-col gap-5 overflow-y-auto shrink-0 select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-stone-900 text-stone-50 text-[10px] px-2.5 py-1 rounded-md font-mono tracking-wider font-bold">
                    MODULE {displayNum}
                  </div>
                </div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMaximized(false); }}
                  className="p-1 px-2.5 rounded-lg border border-stone-350 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Minimize Workspace"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Minimize2 className="w-3.5 h-3.5" /> Close
                </button>
              </div>

              {/* Editable header */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] text-stone-400">Chapter Title</span>
                <input
                  value={chapter.title}
                  onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                  placeholder="The unspoken path..."
                  className="font-serif italic font-semibold leading-normal bg-transparent border-0 border-b border-transparent hover:border-stone-200 focus:border-stone-400 focus:ring-0 px-0 w-full text-stone-950 text-2xl focus:outline-none py-1 transition-all"
                  disabled={isBusy}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>

              <div className="h-[1px] bg-stone-200"></div>

              {/* Prompt controls */}
              <div className="flex-1 flex flex-col gap-2 min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] text-stone-400">Prompt Instructions</span>
                  {renderStatusPill('sm')}
                </div>
                <textarea
                  value={chapter.prompt}
                  onChange={(e) => updateChapter(chapter.id, { prompt: e.target.value })}
                  placeholder="Instruct Gemini on the key dramatic narrative beats, arguments, historical references, and style restraints for this chapterSegment..."
                  className="w-full bg-white border border-stone-200 rounded-lg p-3.5 text-xs italic font-serif text-stone-800 placeholder-stone-400 h-full min-h-[180px] focus:outline-none focus:ring-2 focus:ring-stone-500/10 focus:border-stone-400/80 transition-shadow resize-none shadow-xs leading-relaxed"
                  disabled={isBusy}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>

              {/* Dual drafting button controls */}
              <div className="space-y-2 mt-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); generateChapter(chapter.id); }}
                  disabled={isBusy || !chapter.prompt.trim()}
                  className="w-full py-2.5 rounded-lg bg-stone-900 border border-stone-900 text-stone-100 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-stone-900 transition-all cursor-pointer shadow-sm active:scale-98"
                  onPointerDown={(e) => e.stopPropagation()}
                  title={!chapter.prompt.trim() ? "Write coordinates in prompt before drafting" : "Begin writing drafts"}
                >
                  Draft Segment
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); rewriteChapter(chapter.id); }}
                  disabled={isBusy || !chapter.content}
                  className="w-full py-2.5 rounded-lg bg-white border border-stone-300 text-stone-750 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-stone-50 hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer shadow-xs active:scale-98"
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Humanize raw outputs"
                >
                  Humanize Prose
                </button>
              </div>

              {/* Bottom deletion control */}
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm("Delete this chapter?")) { deleteChapter(chapter.id); setIsMaximized(false); } }}
                className="py-1 px-2 mt-2 font-mono text-[9px] uppercase tracking-wider text-red-500 hover:text-red-700 hover:underline transition-colors cursor-pointer text-left flex items-center gap-1 shrink-0"
                disabled={isBusy}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-3 h-3" /> Delete Chapter
              </button>
            </div>

            {/* RIGHT ZEN PANE: MANUSCRIPT TYPOGRAPHIC WORKSPACE */}
            <div className="flex-1 bg-white flex flex-col overflow-hidden">
              {/* Workspace Navigation header */}
              <div className="h-14 border-b border-stone-100 px-6 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <BookOpen className="w-4 h-4 text-stone-400" />
                    <span className="text-[10px] uppercase tracking-widest font-bold font-mono">Typographic Workspace</span>
                  </div>
                  
                  {/* Styled Segmented Control Button Pill */}
                  <div className="flex rounded-lg bg-stone-100 p-0.5 border border-stone-200">
                    <button
                      onClick={() => setIsEditingMaximizedManuscript(false)}
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded transition-all cursor-pointer ${!isEditingMaximizedManuscript ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-850'}`}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setIsEditingMaximizedManuscript(true)}
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded transition-all cursor-pointer ${isEditingMaximizedManuscript ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-855'}`}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  Word Count: <span className="text-stone-800 font-semibold">{wordCount} words</span>
                </span>
              </div>

              {/* Continuous clean pages canvas section */}
              <div className="flex-1 overflow-y-auto px-6 md:px-16 py-12 md:py-20 select-text bg-[#fdfdfc]/50">
                <div className="max-w-2xl mx-auto min-h-full">
                  {/* Markdown typographic print renderer */}
                  {isEditingMaximizedManuscript ? (
                    <div className="h-full flex flex-col">
                      <textarea
                        value={chapter.content || ''}
                        onChange={(e) => updateChapter(chapter.id, { content: e.target.value })}
                        placeholder="Draft directly or let Gemini generate it. This workspace supports standard markdown format..."
                        className="w-full flex-1 min-h-[450px] leading-relaxed text-stone-850 text-base md:text-lg font-serif bg-transparent focus:outline-none resize-none placeholder-stone-300 border-none px-0 py-0"
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : chapter.content ? (
                    <article className="prose prose-stone max-w-none font-serif leading-loose text-stone-900 text-base md:text-lg prose-p:mb-8 prose-p:indent-6 prose-headings:font-serif prose-headings:font-normal prose-headings:text-stone-950 prose-p:text-justify antialiased">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
                    </article>
                  ) : (
                    <div className="h-[280px] flex flex-col items-center justify-center text-center p-8 select-none">
                      <div className="w-12 h-12 rounded-full bg-stone-50/50 border border-stone-100 flex items-center justify-center mb-4 text-stone-300">✍</div>
                      <p className="font-serif italic text-stone-400 text-sm max-w-md">
                        There is no written text here yet. Click the &quot;Edit&quot; tab above to formulate story cells manually, or feed coordinates into the prompt field on the left and click &quot;Draft Segment&quot;.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. THE COLLAPSED CARD CONTENT (GRID CANVAS PIECE) */}
      <div
        {...attributes}
        {...listeners}
        className={`group bg-white absolute inset-0 rounded-xl border ${cardBorderClass} transition-all duration-300 flex flex-col p-5 select-none ${isMaximized ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
      >
        {/* Module Number badge */}
        <div className={`absolute -top-2.5 -left-2 border text-[9px] font-mono font-bold px-2 py-0.5 rounded-md z-10 shadow-xs transition-colors duration-300 ${badgeClass}`}>
          CH {displayNum}
        </div>
        
        {/* Card Header Title and Maximize trigger */}
        <div className="flex justify-between items-start mb-3 shrink-0">
          <div className="flex items-center gap-3 w-[78%]">
            <input
              value={chapter.title}
              onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
              placeholder="Unnamed Chapter"
              className="font-serif italic font-semibold leading-tight bg-transparent border-0 outline-none focus:outline-none focus:border-b focus:border-stone-300 focus:ring-0 px-0 w-full text-stone-900 text-lg transition-all"
              disabled={isBusy}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChapter(chapter.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-0.5 bg-red-650 hover:bg-red-700 text-white rounded text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-colors"
                title="Confirm delete segment"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-650 hover:text-stone-900 rounded text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMaximized(true); }}
                className="p-1 px-1.5 hover:bg-stone-100/80 text-stone-400 hover:text-stone-900 transition-colors rounded-md border border-transparent hover:border-stone-200 cursor-pointer"
                title="Maximize Focus Workspace (Zen Mode)"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="p-1 px-1.5 hover:bg-red-50 text-stone-300 hover:text-red-600 transition-colors rounded-md cursor-pointer border border-transparent hover:border-red-100 opacity-40 group-hover:opacity-100"
                title="Delete Structural Segments"
                disabled={isBusy}
                onPointerDown={(e) => e.stopPropagation()}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Card Body Column Panels */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Prompt Section Workspace */}
          <div className="flex flex-col shrink-0 mb-3 block">
            <span className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] text-stone-400 mb-1">DRAFT BRIEF</span>
            <textarea
              value={chapter.prompt}
              onChange={(e) => updateChapter(chapter.id, { prompt: e.target.value })}
              placeholder="Type instructions to outline the path..."
              className="w-full leading-relaxed text-xs italic font-serif text-stone-700 bg-[#fdfbf8] hover:bg-[#faf8f4] border border-stone-200/75 hover:border-stone-300 rounded-lg p-2.5 resize-none shrink-0 h-[64px] focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-stone-600/10 focus:border-stone-550 transition-all duration-150"
              disabled={isBusy}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Generated Text Scroll segment */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-stone-100 mt-1 pt-3">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] text-stone-400">STORY MANUSCRIPT</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditingCanvasManuscript(!isEditingCanvasManuscript); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-[9px] font-mono uppercase tracking-wider text-stone-500 hover:text-stone-900 px-1.5 py-0.5 rounded border border-stone-200 hover:bg-stone-50 transition-all cursor-pointer font-bold"
              >
                {isEditingCanvasManuscript ? "View" : "Edit"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-stone-200" onPointerDown={(e) => e.stopPropagation()}>
              {isEditingCanvasManuscript ? (
                <textarea
                  value={chapter.content || ''}
                  onChange={(e) => updateChapter(chapter.id, { content: e.target.value })}
                  placeholder="Draft story prose content manually here..."
                  className="w-full h-full leading-relaxed text-[11.5px] font-serif text-stone-850 bg-[#fdfbf8] border border-stone-200/75 hover:border-stone-300 rounded-lg p-2.5 resize-none focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-stone-600/10 focus:border-stone-550 transition-all"
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              ) : chapter.content ? (
                <div className="prose prose-stone prose-sm max-w-none text-[11.5px] leading-relaxed text-stone-700 font-serif prose-p:mb-3 prose-p:indent-4 opacity-90">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-4 border border-dashed border-stone-200/60 rounded-lg bg-stone-50/50 text-center text-[10.5px] text-stone-400 font-serif italic selection:bg-transparent">
                  Draft brief empty. Click &quot;Draft&quot; to invoke Gemini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Actions Bottom Row Footer */}
        <div className="flex justify-between items-center pt-3 mt-3 shrink-0 border-t border-stone-100">
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); generateChapter(chapter.id); }}
              disabled={isBusy || !chapter.prompt.trim()}
              className="text-[9px] font-mono uppercase font-bold tracking-widest text-stone-800 hover:text-stone-950 disabled:opacity-30 border border-stone-200 rounded px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 transition-all active:scale-[0.96] disabled:active:scale-100 cursor-pointer shadow-2xs"
              onPointerDown={(e) => e.stopPropagation()}
              title="Generate raw sequence data"
            >
              Draft
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); rewriteChapter(chapter.id); }}
              disabled={isBusy || !chapter.content}
              className="text-[9px] font-mono uppercase font-bold tracking-widest text-stone-650 hover:text-stone-950 disabled:opacity-30 border border-stone-200 rounded px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 transition-all active:scale-[0.96] disabled:active:scale-100 cursor-pointer shadow-2xs"
              onPointerDown={(e) => e.stopPropagation()}
              title="Humantize generated prose"
            >
              Humanize
            </button>
          </div>
          
          {renderStatusPill('sm')}
        </div>
      </div>
    </div>
  );
}
