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
import ChapterCard from './ChapterCard';
import OutlineItem from './OutlineItem';

export default function Canvas() {
  const { chapters, reorderChapters, addChapter, isLoaded, loadFromDb, viewMode, setViewMode } = useStore();
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
      <section className="flex-1 p-8 bg-[#fdfcfb] flex items-center justify-center">
        <div className="text-[10px] uppercase font-bold tracking-widest opacity-50 animate-pulse">Initializing Canvas...</div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-8 bg-[#fdfcfb] flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-4xl font-serif">Manuscript Canvas</h2>
          <p className="text-xs opacity-50 mt-1">Drag and drop to rearrange sequence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex border border-black/20 text-[10px] uppercase font-bold tracking-widest bg-white">
            <button 
              className={`px-4 py-2 ${viewMode === 'canvas' ? 'bg-black text-white' : 'hover:bg-black/5 text-[#1a1a1a]'}`}
              onClick={() => setViewMode('canvas')}
            >
              Cards
            </button>
            <button 
              className={`px-4 py-2 border-l border-black/20 ${viewMode === 'outline' ? 'bg-black text-white' : 'hover:bg-black/5 text-[#1a1a1a]'}`}
              onClick={() => setViewMode('outline')}
            >
              Outline
            </button>
          </div>
          <button 
            onClick={addChapter}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-black/20 px-4 py-2 hover:bg-black hover:text-white transition-colors"
          >
            <span className="text-xl leading-none font-normal shrink-0">+</span> New Chapter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 pr-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {viewMode === 'canvas' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                className="border-[1.5px] border-dashed border-black/10 flex items-center justify-center p-8 min-h-[400px] hover:border-black/40 hover:bg-black/5 transition-colors group bg-transparent"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-20 group-hover:opacity-60">Add Chapter</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-4xl mx-auto">
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
                className="border-[1.5px] border-dashed border-black/10 flex items-center justify-center py-6 mt-2 hover:border-black/40 hover:bg-black/5 transition-colors group bg-transparent"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-20 group-hover:opacity-60">+ Add Chapter</span>
              </button>
            </div>
          )}
        </DndContext>
      </div>

      {chapters.some(c => c.status === 'generating' || c.status === 'rewriting') && (
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 pb-6 border-t border-black/10 flex items-center gap-6 bg-[#fdfcfb]/90 backdrop-blur">
          <div className="flex-1 bg-black/5 h-12 flex items-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 w-[45%] transition-all animate-pulse"></div>
            <span className="relative z-10 text-[10px] uppercase font-bold tracking-widest">Global Rewrite Pipeline: Processing Active Chapter...</span>
          </div>
          <button className="h-12 px-8 bg-black text-white text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 opacity-50 cursor-not-allowed">
            Drafting <span className="text-lg animate-spin">⧗</span>
          </button>
        </div>
      )}
    </section>
  );
}
