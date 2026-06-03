"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/20 backdrop-blur-[2px] p-4 font-sans text-stone-800">
      <div className="bg-white border border-stone-200/60 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl relative flex flex-col pt-4">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="px-8 pb-6 pt-5 border-b border-stone-100 shrink-0">
          <h2 className="text-3xl font-serif text-stone-900 mb-1.5 leading-none">BookMobile</h2>
          <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-stone-400">Structured Long-Form Engine</p>
        </div>
        
        <div className="p-8 space-y-8 text-[13.5px] leading-relaxed text-stone-600">
          <p className="text-[14.5px] text-stone-800 font-serif italic">
            A minimalist drafting interface designed for serious, long-form writing. It pairs a visual outlining tool with a structured text-generation pipeline to give you absolute control over narrative progression, tone, and pacing.
          </p>
          
          <div>
            <h3 className="text-[9.5px] uppercase font-bold tracking-widest text-stone-400 mb-4 border-b border-stone-100 pb-2.5">Core Workflow</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0 h-fit">01</span>
                <div>
                  <strong className="text-stone-700 block mb-0.5">Set the Foundation</strong>
                  Use the left-hand drawer to define your global subject, formatting, and tone. These rules ensure stylistic consistency across your entire manuscript.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0 h-fit">02</span>
                <div>
                  <strong className="text-stone-700 block mb-0.5">Assemble the Outline</strong>
                  Build your narrative arc by adding structural nodes to the canvas. Drag and drop them to determine the perfect sequential flow.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0 h-fit">03</span>
                <div>
                  <strong className="text-stone-700 block mb-0.5">Draft and Iterate</strong>
                  Provide specific plot points or arguments for each node and hit &quot;Draft Fragment&quot;. The model will synthesize your instructions to construct the segment.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0 h-fit">04</span>
                <div>
                  <strong className="text-stone-700 block mb-0.5">Refine the Prose</strong>
                  If the text feels mechanical, use the &quot;Rewrite&quot; function or directly edit the manuscript surface to adjust cadence, flow, and vocabulary manually in the seamless editor.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0 h-fit">05</span>
                <div>
                  <strong className="text-stone-700 block mb-0.5">Secure Your Work</strong>
                  Your progress is continuously saved to local storage. Export the completed manuscript, or save a project backup file to preserve your state.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
