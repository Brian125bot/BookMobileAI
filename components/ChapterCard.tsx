"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter, useStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Maximize2, Minimize2, AlertCircle, CheckCircle2, CircleDashed } from 'lucide-react';

interface Props {
  chapter: Chapter;
  index: number;
}

export default function ChapterCard({ chapter, index }: Props) {
  const { updateChapter, deleteChapter, generateChapter, rewriteChapter } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative h-[400px] font-sans text-left ${isDragging ? 'z-50 scale-105' : 'z-0'} transition-all`}
    >
      {/* Dim overlay when maximized */}
      {isMaximized && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default" 
            onClick={(e) => { e.stopPropagation(); setIsMaximized(false); }}
          />
          <div
            className="group relative z-10 w-full h-full bg-white shadow-2xl border border-black/10 flex flex-col p-8"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div className="flex items-center gap-3 w-4/5">
                <div className="bg-black text-white text-[10px] px-2 py-0.5 font-bold shrink-0">{displayNum}</div>
                <input
                  value={chapter.title}
                  onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                  placeholder="Chapter Title"
                  className="font-serif italic leading-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0 w-full text-[#1a1a1a] text-4xl"
                  disabled={isBusy}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMaximized(false); }}
                  className="text-xs p-1.5 hover:bg-black/5 opacity-40 hover:opacity-100 transition-opacity rounded"
                  title="Minimize Card"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
                  className="opacity-0 group-hover:opacity-40 text-xs px-2 hover:opacity-100 transition-opacity"
                  title="Delete Chapter"
                  disabled={isBusy}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0 relative" onPointerDown={(e) => e.stopPropagation()}>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-4 shrink-0 text-center">Generated Manuscript</span>
                <div className="overflow-y-auto flex-1 px-4 md:px-8 pb-12">
                  <div className="mx-auto max-w-3xl">
                    <div className="prose prose-base md:prose-lg prose-gray max-w-none leading-relaxed opacity-90 prose-headings:font-serif prose-p:mb-6 prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-black/20 prose-th:p-3 prose-td:border prose-td:border-black/20 prose-td:p-3 prose-blockquote:border-l-4 prose-blockquote:border-black/30 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:opacity-80">
                      {chapter.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
                      ) : (
                        <div className="italic opacity-40 h-full flex items-center justify-center pt-8 text-center">
                          No manuscript generated yet. Draft this chapter to preview content.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Meta & Actions */}
            <div className="flex justify-between items-center pt-4 mt-4 shrink-0 border-t border-black/10">
              <div className="flex gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); generateChapter(chapter.id); }}
                    disabled={isBusy || !chapter.prompt.trim()}
                    className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] hover:underline disabled:opacity-30 disabled:hover:no-underline"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    Draft
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); rewriteChapter(chapter.id); }}
                    disabled={isBusy || !chapter.content}
                    className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] hover:underline disabled:opacity-30 disabled:hover:no-underline"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    Humanize
                  </button>
              </div>
              
              {isBusy ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Generating</span>
                </div>
              ) : chapter.errorMessage ? (
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200" title={chapter.errorMessage}>
                   <AlertCircle className="w-3.5 h-3.5" />
                   <span className="text-[10px] uppercase font-bold tracking-widest truncate max-w-[150px]">Error</span>
                 </div>
              ) : chapter.status === 'completed' || chapter.content ? (
                 <div className="flex items-center gap-4">
                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{wordCount} Words</span>
                   <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                     <CheckCircle2 className="w-3.5 h-3.5" />
                     <span className="text-[10px] uppercase font-bold tracking-widest">Completed</span>
                   </div>
                 </div>
              ) : (
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200">
                   <CircleDashed className="w-3.5 h-3.5" />
                   <span className="text-[10px] uppercase font-bold tracking-widest">Draft</span>
                 </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* The actual placeholder / card content */}
      <div
        className={`group bg-white absolute inset-0 cursor-grab active:cursor-grabbing border ${isDragging ? 'border-black shadow-2xl' : 'border-black/10 hover:border-black'} transition-all flex flex-col p-6 ${isMaximized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="absolute -top-3 -left-2 bg-black text-white text-[10px] px-2 py-0.5 font-bold z-10">{displayNum}</div>
        
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="flex items-center gap-3 w-4/5">
            <input
              value={chapter.title}
              onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
              placeholder="Chapter Title"
              className="font-serif italic leading-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0 w-full text-[#1a1a1a] text-xl"
              disabled={isBusy}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMaximized(true); }}
              className="text-xs p-1.5 hover:bg-black/5 opacity-40 hover:opacity-100 transition-opacity rounded"
              title="Maximize Card"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
              className="opacity-0 group-hover:opacity-40 text-xs px-2 hover:opacity-100 transition-opacity"
              title="Delete Chapter"
              disabled={isBusy}
              onPointerDown={(e) => e.stopPropagation()}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1 shrink-0">Instruction Prompt</span>
            <textarea
              value={chapter.prompt}
              onChange={(e) => updateChapter(chapter.id, { prompt: e.target.value })}
              placeholder="Specific instructions, plot points, facts for this chapter..."
              className="w-full leading-relaxed opacity-60 bg-transparent border border-transparent hover:border-black/10 focus:border-black/30 focus:opacity-100 focus:outline-none p-2 -mx-2 resize-none shrink-0 text-xs h-[60px]"
              disabled={isBusy}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          
          {chapter.content && (
            <div className="flex flex-col flex-1 min-h-0 relative border-t border-black/5 mt-2 pt-3" onPointerDown={(e) => e.stopPropagation()}>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-2 shrink-0">Generated Manuscript</span>
              <div className="overflow-y-auto flex-1 pr-4">
                <div className="prose prose-sm prose-gray max-w-none leading-relaxed opacity-80 prose-p:mb-4 prose-headings:font-serif text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta & Actions */}
        <div className="flex justify-between items-center pt-4 mt-4 shrink-0 border-t border-black/5">
          <div className="flex gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); generateChapter(chapter.id); }}
                disabled={isBusy || !chapter.prompt.trim()}
                className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] hover:underline disabled:opacity-30 disabled:hover:no-underline"
                onPointerDown={(e) => e.stopPropagation()}
              >
                Draft
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); rewriteChapter(chapter.id); }}
                disabled={isBusy || !chapter.content}
                className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] hover:underline disabled:opacity-30 disabled:hover:no-underline"
                onPointerDown={(e) => e.stopPropagation()}
              >
                Humanize
              </button>
          </div>
          
          {isBusy ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Generating</span>
            </div>
          ) : chapter.errorMessage ? (
             <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200" title={chapter.errorMessage}>
               <AlertCircle className="w-3.5 h-3.5" />
               <span className="text-[10px] uppercase font-bold tracking-widest truncate max-w-[150px]">Error</span>
             </div>
          ) : chapter.status === 'completed' || chapter.content ? (
             <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{wordCount} Words</span>
               <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 <span className="text-[10px] uppercase font-bold tracking-widest">Completed</span>
               </div>
             </div>
          ) : (
             <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200">
               <CircleDashed className="w-3.5 h-3.5" />
               <span className="text-[10px] uppercase font-bold tracking-widest">Draft</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
