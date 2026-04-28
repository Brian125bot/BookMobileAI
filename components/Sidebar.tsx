"use client";

import React, { useEffect, useState } from 'react';
import { useStore, WritingStyle } from '@/lib/store';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Sidebar() {
  const { settings, setSettings, isLoaded, isSidebarOpen, toggleSidebar } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return <aside className="w-72 border-r border-black/10 p-6 flex flex-col gap-8 bg-[#f9f8f4] animate-pulse shrink-0" />;

  if (!isSidebarOpen) {
    return (
      <aside className="w-12 border-r border-black/10 bg-[#f9f8f4] flex flex-col items-center py-4 shrink-0 transition-all duration-300">
        <button 
          onClick={toggleSidebar} 
          className="p-2 hover:bg-black/5 opacity-60 hover:opacity-100 transition-all rounded" 
          title="Open Project Config"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-r border-black/10 p-6 flex flex-col gap-8 bg-[#f9f8f4] overflow-y-auto shrink-0 relative transition-all duration-300">
      <button 
        onClick={toggleSidebar} 
        className="absolute top-4 right-4 p-2 hover:bg-black/5 opacity-60 hover:opacity-100 transition-all rounded" 
        title="Collapse Config"
      >
        <PanelLeftClose className="w-4 h-4" />
      </button>
      
      <section>
        <h3 className="text-[10px] uppercase font-bold tracking-widest mb-4 opacity-50">Project Config</h3>
        
        {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
          <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-sm border border-red-200">
            <p className="font-bold">API Key missing.</p>
            <p className="opacity-80">Set NEXT_PUBLIC_GEMINI_API_KEY to generate.</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[11px] block font-semibold mb-1">Subject</label>
            <textarea
              value={settings.subject}
              onChange={(e) => setSettings({ subject: e.target.value })}
              placeholder="e.g. The Architecture of Silence..."
              className="w-full bg-white border border-black/10 p-2 text-sm italic font-serif focus:outline-none focus:border-black/40 resize-none h-20"
            />
          </div>
          <div>
            <label className="text-[11px] block font-semibold mb-1">Writing Style</label>
            <select
              value={settings.writingStyle}
              onChange={(e) => setSettings({ writingStyle: e.target.value as WritingStyle })}
              className="w-full bg-white border border-black/10 p-2 text-sm italic font-serif focus:outline-none focus:border-black/40"
            >
              <option value="short_essay">Long-form Essay</option>
              <option value="academic_paper">Academic Paper</option>
              <option value="book">Book</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] block font-semibold mb-1">Tone</label>
            <input
              type="text"
              value={settings.tone}
              onChange={(e) => setSettings({ tone: e.target.value })}
              placeholder="e.g. Journalistic, formal..."
              className="w-full bg-white border border-black/10 p-2 text-sm italic font-serif focus:outline-none focus:border-black/40"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] uppercase font-bold tracking-widest mb-4 opacity-50">Global Parameters</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] block font-semibold mb-1">System Instructions</label>
            <textarea
              value={settings.additionalInstructions}
              onChange={(e) => setSettings({ additionalInstructions: e.target.value })}
              placeholder="Rules to enforce globally..."
              className="w-full bg-white border border-black/10 p-2 text-sm italic font-serif focus:outline-none focus:border-black/40 resize-none h-32"
            />
          </div>
        </div>
      </section>

      <div className="mt-auto pt-8">
      </div>
    </aside>
  );
}
