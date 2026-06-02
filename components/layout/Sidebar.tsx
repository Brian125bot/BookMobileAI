"use client";

import React, { useEffect, useState } from 'react';
import { useStore, WritingStyle } from '@/lib/store';
import { PanelLeftClose, PanelLeftOpen, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

export default function Sidebar() {
  const { settings, setSettings, isLoaded, isSidebarOpen, toggleSidebar } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return <aside className="hidden md:flex w-72 border-r border-stone-200 p-6 flex-col gap-8 bg-stone-50 animate-pulse shrink-0" />;
  }

  // Is there an API key configured? If not, we will display an aesthetic notice
  const isApiKeyMissing = !process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  return (
    <>
      {/* MOBILE DRAWER BACKDROP */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-40 md:hidden cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      {/* MOBILE & DESKTOP SIDEBAR DRAWER PANEL */}
      <aside 
        className={`fixed inset-y-0 left-0 z-45 md:z-30 w-72 border-r border-stone-200/80 p-6 flex flex-col gap-6.5 bg-[#fbfaf7]/98 md:bg-[#faf9f6]/90 md:backdrop-blur-md overflow-y-auto shrink-0 md:sticky md:top-0 md:h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out
          ${isSidebarOpen 
            ? 'translate-x-0 opacity-100 shadow-xl md:shadow-none md:w-72' 
            : '-translate-x-full md:translate-x-0 md:w-14 md:px-2 md:py-4 md:items-center'
          }
        `}
      >
        {/* COLLAPSED DESKTOP STATE TRIGGER VIEW */}
        {!isSidebarOpen && (
          <div className="hidden md:flex flex-col items-center gap-6 w-full font-sans">
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-all rounded-lg cursor-pointer" 
              title="Expand parameters panel"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
            <div className="h-[1px] w-6 bg-stone-200"></div>
            <div className="flex flex-col gap-4 text-stone-400 text-[10px] text-center items-center font-mono tracking-widest uppercase [writing-mode:vertical-lr] scale-90">
              <span className="flex items-center gap-1"><Sliders className="w-3.5 h-3.5" /> Project Config</span>
            </div>
          </div>
        )}

        {/* FULL EXPANDABLE STATE VIEW */}
        {isSidebarOpen && (
          <div className="flex flex-col h-full gap-6 select-none font-sans">
            {/* Header section with explicit placement */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-stone-700" />
                <h3 className="text-[11px] uppercase font-bold tracking-[0.12em] text-stone-800">Project Parameters</h3>
              </div>
              <button 
                onClick={toggleSidebar} 
                className="p-1.5 hover:bg-stone-200 text-stone-550 hover:text-stone-800 transition-all rounded-md cursor-pointer" 
                title="Collapse Panel"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* API KEY INDICATOR ALERT */}
            {isApiKeyMissing && (
              <div className="bg-amber-50 rounded-lg p-3.5 text-[11px] leading-relaxed text-amber-800 border border-amber-200 flex gap-2 w-full animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-0.5">Gemini API Key Missing</p>
                  <p className="opacity-80">Please set <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_GEMINI_API_KEY</code> in environment settings to initiate drawing drafts.</p>
                </div>
              </div>
            )}
            
            {/* Subject configuration container */}
            <section className="space-y-5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1.5">Book / Essay Subject</label>
                <textarea
                  value={settings.subject}
                  onChange={(e) => setSettings({ subject: e.target.value })}
                  placeholder="The unspoken rules of editorial precision..."
                  className="w-full bg-white hover:bg-white/95 border border-stone-200/90 rounded-lg p-3 text-sm italic font-serif text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1.5 focus:ring-stone-800/10 focus:border-stone-500 focus:bg-white transition-all resize-none h-20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1.5">Writing Style Format</label>
                <div className="relative">
                  <select
                    value={settings.writingStyle}
                    onChange={(e) => setSettings({ writingStyle: e.target.value as WritingStyle })}
                    className="w-full bg-white hover:bg-white/95 border border-stone-200/90 rounded-lg py-2.5 px-3 text-sm italic font-serif text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-stone-800/10 focus:border-stone-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-xs"
                  >
                    <option value="short_essay">Long-form Essay</option>
                    <option value="academic_paper">Academic Paper</option>
                    <option value="book">Manuscript Novel</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">▼</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1.5">Narrative Mode & Tone</label>
                <input
                  type="text"
                  value={settings.tone}
                  onChange={(e) => setSettings({ tone: e.target.value })}
                  placeholder="e.g. Philosophical, slow-paced..."
                  className="w-full bg-white hover:bg-white/95 border border-stone-200/90 rounded-lg py-2.5 px-3 text-sm italic font-serif text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1.5 focus:ring-stone-800/10 focus:border-stone-500 focus:bg-white transition-all shadow-xs"
                />
              </div>
            </section>

            <div className="h-[1px] bg-stone-200/60"></div>

            {/* System / LLM controller parameters block */}
            <section className="space-y-5 flex-1">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                  <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">System Anti-Trope Rules</label>
                </div>
                <textarea
                  value={settings.additionalInstructions}
                  onChange={(e) => setSettings({ additionalInstructions: e.target.value })}
                  placeholder="e.g. Eliminate passive voice, use descriptive visual descriptions..."
                  className="w-full bg-white hover:bg-white/95 border border-stone-200/90 rounded-lg p-3 text-xs italic font-serif text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1.5 focus:ring-stone-800/10 focus:border-stone-500 focus:bg-white transition-all resize-none h-30 shadow-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1.5">Local Auto-Save Engine</label>
                <div className="relative">
                  <select
                    value={settings.autoSaveInterval}
                    onChange={(e) => setSettings({ autoSaveInterval: Number(e.target.value) })}
                    className="w-full bg-white hover:bg-white/95 border border-stone-200/90 rounded-lg py-2.5 px-3 text-sm italic font-serif text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-stone-800/10 focus:border-stone-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-xs"
                  >
                    <option value={0}>Disabled / Save Manually</option>
                    <option value={1}>Every 1 Minute</option>
                    <option value={5}>Every 5 Minutes</option>
                    <option value={15}>Every 15 Minutes</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">▼</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </aside>
    </>
  );
}
