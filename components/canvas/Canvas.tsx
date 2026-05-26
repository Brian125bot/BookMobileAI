"use client";

import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useStore } from '@/lib/store';
import { Sliders, Menu, Sparkles, Loader2 } from 'lucide-react';
import ChapterCard from './ChapterCard';
import OutlineItem from './OutlineItem';

export default function Canvas() {
  const { 
    chapters, 
    reorderChapters, 
    addChapter, 
    isLoaded, 
    loadFromDb, 
    viewMode, 
    isSidebarOpen, 
    toggleSidebar 
  } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromDb().then(() => setMounted(true));
  }, [loadFromDb]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderChapters(active.id as string, over.id as string);
    }
  }

  if (!mounted || !isLoaded) {
    return (
      <section className="flex-1 p-8 bg-stone-50/50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Initializing Writing Workspace...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-6 md:p-8 bg-stone-50/50 flex flex-col relative overflow-hidden font-sans">
      {/* CANVAS HEADER */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger to toggle sidebar drawer */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200/80 rounded-lg cursor-pointer transition-colors shrink-0"
            title="Configure settings drawer"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
          
          <div>
            <h2 className="text-3xl font-serif text-stone-900 leading-none">Manuscript Canvas</h2>
            <p className="text-xs text-stone-500 font-serif italic mt-1.5 pl-0.5">Drag individual elements to reorder the structural manuscript layout</p>
          </div>
        </div>

        <button 
          onClick={addChapter}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border border-stone-300 rounded-lg bg-white px-4 py-2 hover:bg-stone-900 hover:text-stone-50 hover:border-stone-900 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <span className="text-sm font-normal -mt-0.5 shrink-0">+</span> Add Segment
        </button>
      </div>

      {/* CORE Drag & Drop SWEEPER VIEW CONTAINER */}
      <div className="flex-1 overflow-y-auto pb-28 pr-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {viewMode === 'canvas' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
              <SortableContext
                items={chapters.map(c => c.id)}
                strategy={rectSortingStrategy}
              >
                {chapters.map((chapter, index) => (
                  <ChapterCard key={chapter.id} chapter={chapter} index={index} />
                ))}
              </SortableContext>
              
              <button
                onClick={addChapter}
                className="border-2 border-dashed border-stone-200 hover:border-stone-400 bg-transparent rounded-xl flex flex-col items-center justify-center p-8 min-h-[400px] hover:bg-stone-100/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-stone-800 transition-colors shadow-xs mb-3 text-lg leading-none">+</div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 group-hover:text-stone-700 transition-colors">Add Segment Card</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-w-4xl mx-auto">
              <SortableContext
                items={chapters.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {chapters.map((chapter, index) => (
                  <OutlineItem key={chapter.id} chapter={chapter} index={index} />
                ))}
              </SortableContext>
              
              <button
                onClick={addChapter}
                className="border-2 border-dashed border-stone-200 hover:border-stone-400 bg-transparent rounded-xl flex items-center justify-center py-5 hover:bg-stone-100/40 transition-all duration-300 group cursor-pointer text-center"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 group-hover:text-stone-700 transition-colors">+ Append Outline Row</span>
              </button>
            </div>
          )}
        </DndContext>
      </div>

      {/* PIPELINE ACTIVE RUNTIME BADGE */}
      {chapters.some(c => c.status === 'generating' || c.status === 'rewriting') && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 border border-stone-200/80 rounded-xl flex items-center gap-4 bg-white/95 backdrop-blur-md shadow-lg max-w-lg w-10/12 md:w-full z-20 animate-in fade-in-50 slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center font-mono text-white text-[11px] animate-spin shrink-0">
            ❋
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] font-semibold text-stone-800 shrink-0 block mb-0.5">Gemini Processing Model</span>
            <span className="text-[10px] text-stone-400 block truncate">Writing dynamic chapter sequences with system parameters...</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-bold font-mono px-2 py-1 bg-stone-100 rounded text-stone-600 animate-pulse">Running</span>
        </div>
      )}
    </section>
  );
}
