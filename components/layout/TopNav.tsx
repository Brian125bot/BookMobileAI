"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Save, Upload, Download, Info, Undo2, Redo2, Loader2, Check } from 'lucide-react';
import AboutModal from '../modals/AboutModal';

export default function TopNav() {
  const { 
    chapters, 
    settings, 
    importProject, 
    undo, 
    redo, 
    past, 
    future, 
    hasUnsavedChanges, 
    lastSaved, 
    manualSaveToDb,
    viewMode,
    setViewMode
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.autoSaveInterval <= 0) return;

    const intervalId = setInterval(async () => {
      if (useStore.getState().hasUnsavedChanges) {
        setIsSaving(true);
        await useStore.getState().manualSaveToDb();
        setIsSaving(false);
      }
    }, settings.autoSaveInterval * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [settings.autoSaveInterval]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useStore.getState().hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleManualSave = async () => {
    setIsSaving(true);
    await manualSaveToDb();
    setIsSaving(false);
  };

  const handleExportManuscript = () => {
    const content = chapters
      .map(c => `# ${c.title}\n\n${c.content || '*(No content generated yet)*'}`)
      .join('\n\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'manuscript'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveProject = () => {
    const projectData = {
      settings,
      chapters,
      version: 1
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmobile_project_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && data.settings && data.chapters) {
          importProject({ settings: data.settings, chapters: data.chapters });
        } else {
          alert('Invalid project file format.');
        }
      } catch (err) {
        alert('Failed to parse project file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <header className="h-16 border-b border-stone-200 flex shrink-0 items-center justify-between px-6 bg-stone-50/95 backdrop-blur-md z-40 transition-colors">
      {/* LEFT ZONE: BRANDING & SAVING PIPELINE */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xl font-serif italic font-bold tracking-tight text-stone-900 leading-none">BookMobile AI</span>
          <span className="text-[9px] font-mono uppercase tracking-[0.15em] opacity-40 mt-1">Manuscript Engine</span>
        </div>
        
        {settings.autoSaveInterval > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 pl-4 border-l border-stone-200">
            {isSaving ? (
              <div className="flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
                <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400">Saving...</span>
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-600 font-medium">Unsaved Draft</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400">
                  Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* CENTER ZONE: DUAL VIEW SWITCHER & HISTORY CONTROLS */}
      <div className="flex items-center gap-4">
        {/* VIEW SELECTOR */}
        <div className="flex items-center p-0.5 bg-stone-200/60 rounded-lg border border-stone-200">
          <button 
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-150 active:scale-95 cursor-pointer ${viewMode === 'canvas' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-[#1a1a1a]'}`}
            onClick={() => setViewMode('canvas')}
          >
            Canvas
          </button>
          <button 
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-150 active:scale-95 cursor-pointer ${viewMode === 'outline' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-[#1a1a1a]'}`}
            onClick={() => setViewMode('outline')}
          >
            Outline
          </button>
        </div>

        {/* HISTORY UNDO/REDO */}
        <div className="flex bg-stone-200/40 rounded-lg border border-stone-200 overflow-hidden">
          <button 
            onClick={undo}
            disabled={past.length === 0}
            className="px-3 py-1.5 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900 disabled:opacity-20 active:scale-95 transition-all cursor-pointer border-r border-stone-200"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={redo}
            disabled={future.length === 0}
            className="px-3 py-1.5 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900 disabled:opacity-20 active:scale-95 transition-all cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RIGHT ZONE: UTILITIES & EXPORTS */}
      <div className="flex items-center gap-3">
        {/* ACTIVE STATUS indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-stone-200/40 border border-stone-200 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-stone-600">Gemini Active</span>
        </div>
        
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          onChange={handleLoadProject} 
          className="hidden" 
        />
        
        {/* UTILITY BUTTON ACTION ROW */}
        <div className="flex items-center bg-stone-200/40 rounded-lg border border-stone-200 p-0.5">
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-white rounded-md text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5"
            title="About BookMobile AI"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden md:inline">About</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-white rounded-md text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5"
            title="Load Local Project backup"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Load</span>
          </button>
          
          <button 
            onClick={handleSaveProject}
            className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-white rounded-md text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5"
            title="Backup configuration project"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Backup</span>
          </button>
          
          <button 
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-white disabled:hover:bg-transparent rounded-md text-stone-700 disabled:opacity-20 disabled:hover:text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5"
            title="Manual Database Save"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-semibold">Save</span>
          </button>
        </div>

        {/* PRIMARY CALL TO ACTION BUTTON */}
        <button 
          onClick={handleExportManuscript}
          className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 border border-stone-900 text-[10px] uppercase font-bold tracking-widest transition-all duration-150 active:scale-[0.97] cursor-pointer rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Export Manuscript</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </header>
  );
}
