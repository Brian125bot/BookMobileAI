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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 font-sans text-[#1a1a1a]">
      <div className="bg-[#fdfcfb] border border-black/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative flex flex-col pt-4">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded transition-all opacity-60 hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 pb-6 border-b border-black/10">
          <h2 className="text-3xl font-serif italic mb-2">BookMobile AI</h2>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Structured Long-Form Engine</p>
        </div>
        
        <div className="p-8 space-y-8 text-sm leading-relaxed opacity-80">
          <p>
            <strong>BookMobile AI</strong> is a focused drafting environment designed for serious, long-form writing. It uses a structured "Context Waterfall" and targeted system instructions paired with a visual outlining tool to solve the common pitfalls of AI-assisted writing models (like clichéd phrasing and predictable formatting).
          </p>
          
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-3 border-b border-black/10 pb-2">Instructions for Use</h3>
            <ul className="list-disc pl-4 space-y-4">
              <li>
                <strong>1. Establish the Global Context:</strong> Open the sidebar to set the overarching tone, style, and instructions. These govern the entire manuscript securely to ensure consistency across chapters.
              </li>
              <li>
                <strong>2. Outline Your Structure:</strong> Break your writing into chapters using the Outline space. You can drag and drop chapters to rearrange the sequence of events before any text is generated. <em>Note: A chapter cannot be drafted until you provide a prompt!</em>
              </li>
              <li>
                <strong>3. Prompting & Drafting:</strong> Switch to the Canvas view. Use the prompt field on each card to define specific plot points, arguments, or facts. Hit "Draft" to generate a continuous, contextually aware manuscript segment.
              </li>
              <li>
                <strong>4. Review and Humanize:</strong> If the prose feels too "AI-like", click "Humanize". This triggers a dedicated critical-thinking pass by the model to disrupt repetitive sentence lengths and scrub known AI buzzwords.
              </li>
              <li>
                <strong>5. Save & Export:</strong> Work is auto-saved locally. Export your finished manuscript to a unified Markdown (.md) file, or save a JSON backup for long-term secure storage.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
