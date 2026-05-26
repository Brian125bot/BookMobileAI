"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter, useStore } from '@/lib/store';
import { Loader2, AlertCircle, CheckCircle2, CircleDashed, GripVertical, Trash2 } from 'lucide-react';

interface Props {
  chapter: Chapter;
  index: number;
}

export default function OutlineItem({ chapter, index }: Props) {
  const { updateChapter, deleteChapter } = useStore();

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl border ${
        isDragging 
          ? 'border-stone-900 shadow-xl z-50 scale-[1.01] relative' 
          : 'border-stone-200/90 shadow-xs hover:border-stone-300'
      } transition-all duration-200 flex items-center py-2.5 px-4 font-sans text-left`}
    >
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
      <div className="w-8 h-8 rounded-lg flex shrink-0 items-center justify-center text-[10px] font-mono font-bold bg-stone-100 text-stone-750 mr-3 border border-stone-200/50">
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
          onClick={() => { if (confirm("Delete this chapter?")) deleteChapter(chapter.id); }}
          className="p-1.5 hover:bg-red-50 text-stone-300 hover:text-red-650 rounded-lg cursor-pointer transition-colors hover:border hover:border-red-100 opacity-0 group-hover:opacity-100 shrink-0 h-8 flex items-center justify-center w-8"
          title="Delete Chapter"
          disabled={isBusy}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
