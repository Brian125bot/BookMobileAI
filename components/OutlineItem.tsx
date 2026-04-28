"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter, useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

interface Props {
  chapter: Chapter;
  index: number;
}

export default function OutlineItem({ chapter, index }: Props) {
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
  
  // Provide a clean summary stripped of markdown characters
  const cleanSummary = (text: string) => {
    return text.replace(/[#_*>`\[\]]/g, '').replace(/\n/g, ' ').trim();
  };

  let summary = 'Empty chapter prompt. Provide details to begin.';
  if (chapter.content) {
    const text = cleanSummary(chapter.content);
    summary = text.length > 120 ? text.substring(0, 120) + '...' : text;
  } else if (chapter.prompt) {
    const text = cleanSummary(chapter.prompt);
    summary = text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white border ${
        isDragging ? 'border-black shadow-2xl z-50 scale-[1.01] relative' : 'border-black/10 hover:border-black'
      } transition-all flex items-center gap-4 py-4 px-6 font-sans text-left`}
    >
      <div 
        className="w-10 h-10 flex shrink-0 items-center justify-center text-[10px] font-bold bg-black/5 text-[#1a1a1a] cursor-grab active:cursor-grabbing hover:bg-black hover:text-white transition-colors"
        {...attributes}
        {...listeners}
      >
        {displayNum}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-3 mb-1">
          <input
            value={chapter.title}
            onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
            placeholder="Chapter Title"
            className="font-serif italic text-lg leading-tight bg-transparent border-none focus:outline-none focus:ring-0 px-0 w-2/3 text-[#1a1a1a] p-0"
            disabled={isBusy}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
          {chapter.content && (
             <span className="text-[10px] font-bold uppercase opacity-40 shrink-0">{wordCount} Words</span>
          )}
        </div>
        
        <p className="text-xs leading-relaxed opacity-60 truncate">
          {summary}
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0 border-l border-black/10 pl-6">
        <div className="flex flex-col gap-1 items-end w-24">
          {isBusy ? (
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold tracking-widest text-black/60">Processing</span>
              <Loader2 className="w-3 h-3 animate-spin opacity-60" />
            </div>
          ) : chapter.errorMessage ? (
             <span className="text-[9px] uppercase font-bold tracking-widest text-red-600 truncate w-full text-right" title={chapter.errorMessage}>Error</span>
          ) : chapter.content ? (
             <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600">Flow Verified</span>
          ) : (
             <span className="text-[9px] uppercase font-bold tracking-widest text-amber-600">Awaiting Content</span>
          )}
        </div>
      
        <button
          onClick={() => deleteChapter(chapter.id)}
          className="opacity-0 group-hover:opacity-40 text-xs w-6 h-6 flex items-center justify-center hover:opacity-100 hover:bg-black/5 transition-all"
          title="Delete Chapter"
          disabled={isBusy}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
