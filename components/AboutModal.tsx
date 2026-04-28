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
            <strong>BookMobile AI</strong> is a focused drafting environment designed for serious, long-form writing. It uses targeted system instructions paired with a visual outlining tool to solve the common pitfalls of AI-assisted writing models.
          </p>
          
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-3 border-b border-black/10 pb-2">How it Works</h3>
            <ul className="list-disc pl-4 space-y-4">
              <li>
                <strong>Global Parameters (Left Panel):</strong> Set the overarching tone, style, and instructions. These govern the entire manuscript to ensure consistency. Use the collapse toggle to hide the parameters while you write.
              </li>
              <li>
                <strong>Section-by-Section Drafting:</strong> Break your writing into chapters, acts, or scenes. Use the prompt field on each card to define specific plot points, arguments, or facts for that segment.
              </li>
              <li>
                <strong>Engineered Humanization:</strong> BookMobile uses an ultra-strict background system prompt that aggressively eliminates standard AI hallmarks (numbered lists, dashes, cliches, "in conclusion"), forcing the model to generate varied, professional, full-sentence prose.
              </li>
              <li>
                <strong>Drafting vs. Humanizing:</strong> "Draft" generates initial content based on your chapter prompt from scratch. "Humanize" refines existing content to improve sentence variance, rhythm, and flow without changing the core meaning.
              </li>
              <li>
                <strong>Card vs. Outline Views:</strong> The default Canvas space lets you view the actual text in a grid layout. The Outline space gives you a high-level view showing summaries, word counts, and flow status, allowing for rapid manuscript restructuring via drag-and-drop.
              </li>
              <li>
                <strong>Local Saving:</strong> Work is auto-saved to your browser's local database. For long term storage, use the <em>Save Work</em> and <em>Load</em> buttons in the top navigation to work entirely locally via JSON backups.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
