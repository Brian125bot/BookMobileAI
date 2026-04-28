"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter, useStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';

interface Props {
  chapter: Chapter;
  index: number;
}

export default function ChapterCard({ chapter, index }: Props) {
  const { updateChapter, deleteChapter, generateChapter, rewriteChapter } = useStore();

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
      className={`group relative bg-white border ${
        isDragging ? 'border-black shadow-2xl z-50 scale-105' : 'border-black/10 hover:border-black'
      } p-6 transition-all flex flex-col h-[400px] cursor-grab active:cursor-grabbing font-sans text-left`}
      onPointerDown={(e) => {
        // Prevention for input clicks triggering drag is handled via stopPropagation on the inputs
      }}
    >
      <div className="absolute -top-3 -left-2 bg-black text-white text-[10px] px-2 py-0.5 font-bold z-10">{displayNum}</div>
      
      <div className="flex justify-between items-start mb-4 shrink-0">
        <input
          value={chapter.title}
          onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
          placeholder="Chapter Title"
          className="font-serif italic text-xl leading-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0 w-4/5 text-[#1a1a1a]"
          disabled={isBusy}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
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

      <div className="flex flex-col flex-1 min-h-0">
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1 shrink-0">Instruction Prompt</span>
        <textarea
          value={chapter.prompt}
          onChange={(e) => updateChapter(chapter.id, { prompt: e.target.value })}
          placeholder="Specific instructions, plot points, facts for this chapter..."
          className="w-full text-xs leading-relaxed opacity-60 bg-transparent border border-transparent hover:border-black/10 focus:border-black/30 focus:opacity-100 focus:outline-none p-2 -mx-2 resize-none shrink-0"
          style={{ minHeight: chapter.content ? '60px' : '100%' }}
          disabled={isBusy}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
        
        {chapter.content && (
          <div className="flex flex-col flex-1 min-h-0 border-t border-black/5 mt-2 pt-3 relative" onPointerDown={(e) => e.stopPropagation()}>
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-2 shrink-0">Generated Manuscript</span>
            <div className="overflow-y-auto flex-1 pr-1">
              <div className="prose prose-sm prose-gray max-w-none text-xs leading-relaxed opacity-80 prose-p:mb-4 prose-headings:font-serif">
                <ReactMarkdown>{chapter.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="flex justify-between items-center border-t border-black/5 pt-4 mt-4 shrink-0">
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
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin opacity-60" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Processing</span>
          </div>
        ) : chapter.errorMessage ? (
           <span className="text-[10px] uppercase font-bold tracking-widest text-red-600 truncate max-w-[120px]" title={chapter.errorMessage}>Error</span>
        ) : chapter.content ? (
           <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold uppercase opacity-40">{wordCount} Words</span>
             <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Flow Verified</span>
           </div>
        ) : (
           <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Awaiting Content</span>
        )}
      </div>
    </div>
  );
}
