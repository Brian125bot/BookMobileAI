"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Save, Upload, Download, Info, Undo2, Redo2, Loader2, Check } from 'lucide-react';
import AboutModal from './AboutModal';

export default function TopNav() {
  const { chapters, settings, importProject, undo, redo, past, future, hasUnsavedChanges, lastSaved, manualSaveToDb } = useStore();
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
    <header className="h-16 border-b border-black/10 flex shrink-0 items-center justify-between px-8 bg-white/50 backdrop-blur-sm z-10">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-serif italic font-bold tracking-tight">BookMobile AI</span>
        <div className="h-4 w-[1px] bg-black/20 mx-2"></div>
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Long-Form Manuscript Engine</span>
      </div>
      <div className="flex items-center gap-4">
        {settings.autoSaveInterval > 0 && (
          <div className="flex items-center gap-2 mr-2 min-w-[120px] justify-end">
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin opacity-50" />
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Unsaved Changes</span>
            ) : lastSaved ? (
              <>
                <Check className="w-3.5 h-3.5 opacity-50 text-emerald-600" />
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">
                  Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            ) : null}
          </div>
        )}

        <div className="flex items-center gap-2 mr-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70 italic">Gemini 3 Flash: Active</span>
        </div>
        
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          onChange={handleLoadProject} 
          className="hidden" 
        />
        
        <div className="flex border border-black/20 mr-2">
            <button 
                onClick={undo}
                disabled={past.length === 0}
                className="px-3 py-2 text-[#1a1a1a] transition-colors hover:bg-black/5 disabled:opacity-30 border-r border-black/20"
                title="Undo"
            >
                <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button 
                onClick={redo}
                disabled={future.length === 0}
                className="px-3 py-2 text-[#1a1a1a] transition-colors hover:bg-black/5 disabled:opacity-30"
                title="Redo"
            >
                <Redo2 className="w-3.5 h-3.5" />
            </button>
        </div>
        
        <div className="flex border border-black/20">
            <button 
                onClick={() => setIsAboutOpen(true)}
                className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-black/5 text-[#1a1a1a] transition-colors flex items-center gap-2 border-r border-black/20"
                title="About BookMobile AI"
            >
                <Info className="w-3.5 h-3.5" />
                About
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-black/5 text-[#1a1a1a] transition-colors flex items-center gap-2 border-r border-black/20"
                title="Load Local Project"
            >
                <Upload className="w-3.5 h-3.5" />
                Load
            </button>
            <button 
                onClick={handleSaveProject}
                className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-black/5 text-[#1a1a1a] transition-colors flex items-center gap-2 border-r border-black/20"
                title="Download Project Locally"
            >
                <Download className="w-3.5 h-3.5" />
                D/L Config
            </button>
            <button 
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-black/5 text-[#1a1a1a] transition-colors flex items-center gap-2 disabled:opacity-40"
                title="Save Database"
            >
                <Save className="w-3.5 h-3.5" />
                Save Data
            </button>
        </div>

        <button 
            onClick={handleExportManuscript}
            className="px-4 py-2 bg-black border border-black text-[#fdfcfb] text-[10px] uppercase font-bold tracking-widest hover:bg-black/90 transition-colors flex items-center gap-2 ml-2"
        >
          <Download className="w-3.5 h-3.5" />
          Export Manuscript
        </button>
      </div>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </header>
  );
}
