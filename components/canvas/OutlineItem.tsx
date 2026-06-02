"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter, useStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  CircleDashed, 
  GripVertical, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Props {
  chapter: Chapter;
  index: number;
}

export default function OutlineItem({ chapter, index }: Props) {
  const { updateChapter, deleteChapter } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingOutlineManuscript, setIsEditingOutlineManuscript] = useState(false);

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

  const isBusy = chapter.status === 'generating' || chapter.status === 'rewriting';
  const displayNum = (index + 1).toString().padStart(2, '0');
  const wordCount = chapter.content ? chapter.content.trim().split(/\s+/).length : 0;
  
  // Provide a clean summary stripped of markdown characters
  const cleanSummary = (text: string) => {
    return text.replace(/[#_*>`\[\]]/g, '').replace(/\n/g, ' ').trim();
  };

  let summary = 'Instructions brief empty. Outline goals here.';
  if (chapter.summary) {
    summary = chapter.summary;
  } else if (chapter.content) {
    const text = cleanSummary(chapter.content);
    summary = text.length > 120 ? text.substring(0, 120) + '...' : text;
  } else if (chapter.prompt) {
    const text = cleanSummary(chapter.prompt);
    summary = text.length > 120 ? text.substring(0, 120) + '...' : text;
  }

  let borderClass = 'border-stone-200/90 shadow-xs hover:border-stone-300';
  let badgeClass = 'bg-stone-100/80 text-stone-750 border-stone-200/50';
  if (isDragging) {
    borderClass = 'border-stone-900 shadow-xl z-50 scale-[1.01] relative';
    badgeClass = 'bg-stone-900 text-white';
  } else if (isBusy) {
    borderClass = 'border-indigo-200 shadow-xs bg-[#fafbff]/70 border-l-3 border-l-indigo-400';
    badgeClass = 'bg-indigo-600 text-white border-indigo-750 animate-pulse text-[9px]';
  } else if (chapter.errorMessage) {
    borderClass = 'border-red-200 shadow-xs bg-red-50/10 border-l-3 border-l-red-400';
    badgeClass = 'bg-red-600 text-white border-red-700 text-[9px]';
  } else if (chapter.content) {
    borderClass = 'border-emerald-200 shadow-xs bg-white border-l-3 border-l-emerald-500';
    badgeClass = 'bg-emerald-700 text-white border-emerald-800 text-[9px]';
  } else {
    borderClass = 'border-stone-200/90 shadow-xs hover:border-stone-300 border-l-3 border-l-stone-350/70';
    badgeClass = 'bg-stone-200 text-stone-600 border-stone-250 text-[9px]';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl border ${borderClass} transition-all duration-300 flex flex-col font-sans text-left overflow-hidden`}
    >
      {/* CORE ROW CONTAINER */}
      <div className="flex items-center py-2.5 px-4 w-full">
        {/* Isolated Draggable grip six-dot handle */}
        <div 
          {...attributes}
          {...listeners}
          className="p-1 px-1.5 hover:bg-stone-100/80 rounded-md cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-750 transition-colors mr-1 flex items-center shrink-0 h-8"
          title="Drag structural row"
        >
          <GripVertical className="w-4 h-4 text-stone-400" />
        </div>

        {/* Structured item index indicator */}
        <div className={`w-8 h-8 rounded-lg flex shrink-0 items-center justify-center font-mono font-bold mr-3 border transition-colors duration-350 ${badgeClass}`}>
          {displayNum}
        </div>

        {/* Row core values editable title & summary info */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3">
            <input
              value={chapter.title}
              onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
              placeholder="Chapter Title"
              className="font-serif italic font-semibold text-base leading-none bg-transparent border-none focus:ring-0 focus:outline-none p-0 w-[45%] text-stone-900 select-text"
              disabled={isBusy}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
            {chapter.content && (
              <span className="text-[9px] font-mono font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-400 shrink-0">
                {wordCount} Words
              </span>
            )}
          </div>
          
          <p className="text-[11px] leading-relaxed text-stone-400 font-serif italic mt-0.5 truncate select-none text-stone-500 max-w-xl">
            {summary}
          </p>
        </div>

        {/* Right status metrics and trash actions bar */}
        <div className="flex items-center gap-3 shrink-0 border-l border-stone-100 pl-4 h-8">
          <div className="flex flex-col items-end w-22 select-none">
            {isBusy ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-100 text-stone-700/80 rounded border border-stone-200/80">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Loading</span>
              </div>
            ) : chapter.errorMessage ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-700 rounded border border-red-200" title={chapter.errorMessage}>
                <AlertCircle className="w-2.5 h-2.5" />
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Error</span>
              </div>
            ) : chapter.status === 'completed' || chapter.content ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-150">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Done</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded border border-stone-150">
                <CircleDashed className="w-2.5 h-2.5 text-stone-300" />
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Empty</span>
              </div>
            )}
          </div>
        
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className={`p-1.5 rounded-lg border transition-all duration-250 cursor-pointer flex items-center justify-center w-8 h-8 ${isExpanded ? 'bg-stone-900 border-stone-900 text-stone-50' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`}
            title={isExpanded ? "Hide Story Manuscript" : "Edit Story Manuscript"}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5 font-sans" onPointerDown={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChapter(chapter.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-colors"
                title="Confirm Delete"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-1.5 py-1 bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 rounded text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="p-1.5 hover:bg-red-50 text-stone-300 hover:text-red-650 rounded-lg cursor-pointer transition-colors hover:border hover:border-red-100 opacity-40 group-hover:opacity-100 shrink-0 h-8 flex items-center justify-center w-8"
              title="Delete Chapter"
              disabled={isBusy}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* EXPANDED STORY MANUSCRIPT WRITER DRAWER */}
      {isExpanded && (
        <div className="border-t border-stone-100 bg-[#fdfbf9]/60 p-5 font-sans flex flex-col shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold font-mono tracking-widest text-stone-400 uppercase">STORY MANUSCRIPT WRITER</span>
              {chapter.content && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                  {wordCount} words
                </span>
              )}
            </div>
            
            <div className="flex rounded-md bg-stone-100 p-0.5 border border-stone-200">
              <button
                onClick={() => setIsEditingOutlineManuscript(false)}
                className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-all cursor-pointer ${!isEditingOutlineManuscript ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Preview
              </button>
              <button
                onClick={() => setIsEditingOutlineManuscript(true)}
                className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-all cursor-pointer ${isEditingOutlineManuscript ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="min-h-[140px] border border-stone-200/60 rounded-lg p-3.5 bg-white shadow-xs">
            {isEditingOutlineManuscript ? (
              <textarea
                value={chapter.content || ''}
                onChange={(e) => updateChapter(chapter.id, { content: e.target.value })}
                placeholder="Draft formatted narrative story content here manually..."
                className="w-full min-h-[180px] leading-relaxed text-xs text-stone-850 font-serif bg-transparent focus:outline-none resize-y placeholder-stone-300 border-none outline-none"
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            ) : chapter.content ? (
              <article className="prose prose-stone max-w-none text-xs font-serif leading-relaxed text-stone-800 prose-p:mb-2.5 prose-p:indent-4 opacity-90 pr-1 max-h-[300px] overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
              </article>
            ) : (
              <div className="h-[120px] flex flex-col items-center justify-center text-center p-4 select-none bg-stone-50/30 rounded border border-dashed border-stone-200/50">
                <p className="font-serif italic text-stone-400 text-xs max-w-md">
                  There is no written text here yet. Click the &quot;Edit&quot; button above to write or click &quot;Preview&quot; and go to Canvas to draft with Gemini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
