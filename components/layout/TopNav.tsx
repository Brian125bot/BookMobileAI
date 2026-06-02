"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Save, Upload, Download, Info, Undo2, Redo2, Loader2, Check, ChevronDown, FileText } from 'lucide-react';
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
    setViewMode,
    setSettings
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const AVAILABLE_MODELS = [
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Fast, high quality defaults' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Highly cost efficient' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', desc: 'Standard preview model' },
  ];

  const currentModelId = settings.selectedModel || 'gemini-3.5-flash';
  const currentModelObj = AVAILABLE_MODELS.find(m => m.id === currentModelId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleExportManuscript = (format: 'md' | 'doc' | 'pdf') => {
    const title = settings.subject || 'Manuscript';
    const cleanFileName = settings.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'manuscript';

    if (format === 'md') {
      const content = chapters
        .map((c, idx) => `# Chapter ${String(idx + 1).padStart(2, '0')}: ${c.title || 'Unnamed Segment'}\n\n${c.content || '*(No content generated yet)*'}`)
        .join('\n\n---\n\n');
      
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFileName}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } 
    else if (format === 'doc') {
      const author = 'BookMobile AI';
      const chaptersHtml = chapters
        .map((c, idx) => {
          const safeTitle = c.title || `Chapter ${idx + 1}`;
          const contentMarkdown = c.content || '*(No content generated yet)*';
          
          const htmlParagraphs = contentMarkdown
            .split('\n\n')
            .map(p => {
              const trimmed = p.trim();
              if (trimmed.startsWith('#')) {
                const level = (trimmed.match(/^#+/) || ['#'])[0].length;
                const text = trimmed.replace(/^#+\s*/, '');
                return `<h${level + 1} style="font-family: 'Georgia', serif; font-weight: normal; color: #111; margin-top: 18pt; margin-bottom: 6pt;">${text}</h${level + 1}>`;
              }
              if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const listItems = trimmed
                  .split('\n')
                  .map(li => `<li style="font-family: 'Georgia', serif; font-size: 11pt; margin-bottom: 4pt;">${li.replace(/^[-*]\s*/, '')}</li>`)
                  .join('');
                return `<ul style="margin-bottom: 12pt; padding-left: 20pt;">${listItems}</ul>`;
              }
              return `<p style="font-family: 'Georgia', serif; font-size: 11.5pt; text-indent: 0.5in; margin-bottom: 12pt; line-height: 1.62; text-align: justify; color: #222;">${trimmed}</p>`;
            })
            .join('\n');

          return `
            <div style="page-break-before: always; margin-top: 1.5in;">
              <div style="text-align: center; margin-bottom: 36pt;">
                <p style="font-family: 'Arial', sans-serif; font-size: 9pt; text-transform: uppercase; tracking: 0.15em; color: #777; margin-bottom: 12pt;">Chapter ${String(idx + 1).padStart(2, '0')}</p>
                <h1 style="font-family: 'Georgia', serif; font-size: 20pt; font-weight: bold; font-style: italic; color: #111; margin: 0; line-height: 1.2;">${safeTitle}</h1>
              </div>
              <div style="font-family: 'Georgia', serif; font-size: 11.5pt;">
                ${htmlParagraphs}
              </div>
            </div>
          `;
        })
        .join('\n');

      const fullHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 8.5in 11in;
              margin: 1.0in 1.0in 1.0in 1.0in;
              mso-header-margin: 0.5in;
              mso-footer-margin: 0.5in;
              mso-paper-source: 0;
            }
            body {
              font-family: 'Georgia', serif;
              line-height: 1.62;
              color: #222;
            }
            .cover-page {
              height: 100vh;
              text-align: center;
              padding-top: 2.5in;
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <div class="cover-page" style="text-align: center; margin-top: 1.5in; margin-bottom: 2.0in;">
            <p style="font-family: 'Arial', sans-serif; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.2em; color: #555; margin-bottom: 40pt;">Manuscript Draft</p>
            <h1 style="font-family: 'Georgia', serif; font-size: 32pt; font-weight: bold; font-style: italic; color: #111; margin: 0; line-height: 1.15; margin-bottom: 12pt;">${title}</h1>
            <p style="font-family: 'Georgia', serif; font-size: 14pt; color: #555; font-style: italic; margin-bottom: 60pt;">${settings.tone || 'A work of structural prose'}</p>
            <div style="margin-top: 2.0in;">
              <p style="font-family: 'Georgia', serif; font-size: 11pt; color: #333; font-weight: bold;">Compiled by BookMobile AI</p>
              <p style="font-family: 'Arial', sans-serif; font-size: 9pt; color: #777; margin-top: 6pt;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          ${chaptersHtml}
        </body>
        </html>
      `;

      const blob = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFileName}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } 
    else if (format === 'pdf') {
      const printId = 'bookmobile-print-container';
      let printDiv = document.getElementById(printId);
      if (printDiv) {
        printDiv.remove();
      }
      
      printDiv = document.createElement('div');
      printDiv.id = printId;
      printDiv.className = 'print-only-container';
      
      const tone = settings.tone || 'Philosophical draft';
      const rawChapters = chapters.map((c, idx) => {
        const cTitle = c.title || `Chapter ${idx + 1}`;
        const rawContent = c.content || '*(No content generated yet)*';
        
        const htmlParagraphs = rawContent
          .split('\n\n')
          .map(p => {
            const trimmed = p.trim();
            if (trimmed.startsWith('#')) {
              const level = (trimmed.match(/^#+/) || ['#'])[0].length;
              const text = trimmed.replace(/^#+\s*/, '');
              return `<h${level + 1} class="font-serif text-lg font-bold mt-6 mb-2 text-stone-900 leading-tight">${text}</h${level + 1}>`;
            }
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
              const listItems = trimmed
                .split('\n')
                .map(li => `<li class="font-serif text-stone-800 text-[14px] leading-relaxed mb-1 pl-1 list-disc ml-5">${li.replace(/^[-*]\s*/, '')}</li>`)
                .join('');
              return `<ul class="mb-4 space-y-1">${listItems}</ul>`;
            }
            return `<p class="font-serif text-stone-850 text-[15.5px] leading-[1.8] text-justify mb-5 indent-8 text-stone-900 leading-loose">${trimmed}</p>`;
          })
          .join('\n');

        return `
          <div class="print-chapter-block mt-16 break-before-page" style="page-break-before: always; break-before: page;">
            <div class="text-center mb-10">
              <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-stone-400 mb-2">Chapter ${String(idx + 1).padStart(2, '0')}</p>
              <h2 class="font-serif text-3xl font-normal italic text-stone-900">${cTitle}</h2>
              <div class="w-12 h-[1px] bg-stone-200 mx-auto mt-4"></div>
            </div>
            <div class="prose font-serif max-w-none antialiased">
              ${htmlParagraphs}
            </div>
          </div>
        `;
      }).join('\n');

      printDiv.innerHTML = `
        <style>
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            header, aside, main, section, .toast-container, button, div:not(#bookmobile-print-container):not(#bookmobile-print-container *) {
              display: none !important;
            }
            #bookmobile-print-container {
              display: block !important;
              background: white !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              z-index: 9999999 !important;
              padding: 1.5in 1.2in;
              font-family: 'Georgia', 'Playfair Display', serif !important;
              box-sizing: border-box !important;
            }
            .break-before-page {
              page-break-before: always;
              break-before: page;
            }
          }
          @media screen {
            #bookmobile-print-container {
              display: none !important;
            }
          }
        </style>
        
        <div class="flex flex-col items-center justify-between min-h-[85vh] text-center" style="page-break-after: always; break-after: page;">
          <div class="mt-20">
            <p class="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-8">Manuscript Blueprint</p>
            <h1 class="font-serif text-[42px] font-bold italic text-stone-950 mb-4 tracking-tight leading-tight">${title}</h1>
            <p class="font-serif text-lg italic text-stone-600 font-medium max-w-md mx-auto">${tone}</p>
            <div class="w-20 h-[1.5px] bg-stone-900 mx-auto mt-8"></div>
          </div>
          
          <div class="mb-14">
            <p class="font-serif text-[12.5px] text-stone-800 font-semibold mb-1">BookMobile AI Writer</p>
            <p class="font-sans text-[10px] uppercase tracking-wider text-stone-450">${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        ${rawChapters}
      `;

      document.body.appendChild(printDiv);
      
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          const container = document.getElementById(printId);
          if (container) {
            container.remove();
          }
        }, 1000);
      }, 150);
    }
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
    <header className="h-16 border-b border-stone-200/80 flex shrink-0 items-center justify-between px-6 bg-[#faf9f6]/95 backdrop-blur-md shadow-xs z-40 transition-colors">
      {/* LEFT ZONE: BRANDING & SAVING PIPELINE */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xl font-serif italic font-bold tracking-tight text-stone-900 leading-none">BookMobile AI</span>
          <span className="text-[9px] font-mono uppercase tracking-[0.15em] opacity-40 mt-1">Manuscript Engine</span>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-stone-200/80">
          {isSaving ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 animate-pulse">
              <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
              <span className="text-[8.5px] font-mono uppercase tracking-widest font-bold">Syncing...</span>
            </div>
          ) : hasUnsavedChanges ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[8.5px] font-mono uppercase tracking-widest text-amber-600 font-bold">Unsaved Draft</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
              <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              <span className="text-[8.5px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
                {lastSaved ? `Synced ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Synced with DB'}
              </span>
            </div>
          )}
        </div>
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
        {/* DYNAMIC MODEL SELECTOR DROPDOWN */}
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={() => setIsModelOpen(!isModelOpen)}
            className="flex items-center gap-1.5 bg-stone-200/40 hover:bg-stone-200/80 border border-stone-200 hover:border-stone-300 rounded-full px-3 py-1 transition-all text-stone-600 hover:text-stone-900 cursor-pointer text-[9px] font-mono uppercase tracking-wider select-none"
            title="Switch Gemini AI Models"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{currentModelObj?.name || 'Gemini 3.5 Flash'}</span>
            <span className="text-[7px] text-stone-400 font-sans ml-0.5">▼</span>
          </button>

          {isModelOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3.5 py-2 border-b border-stone-100">
                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 font-mono block">Choose Writing Model</span>
                <span className="text-[9.5px] italic font-serif text-stone-550 block mt-0.5 leading-relaxed">Affects dynamic prose drafting, speed, & creative nuance</span>
              </div>
              <ul className="py-1">
                {AVAILABLE_MODELS.map((model) => {
                  const isActive = (settings.selectedModel || 'gemini-3.5-flash') === model.id;
                  return (
                    <li key={model.id}>
                      <button
                        onClick={() => {
                          setSettings({ selectedModel: model.id });
                          setIsModelOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer ${isActive ? 'bg-stone-50/80' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-semibold text-stone-850 font-sans ${isActive ? 'text-stone-950 font-bold' : ''}`}>
                              {model.name}
                            </span>
                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-stone-850 shrink-0" />
                            )}
                          </div>
                          <p className="text-[9.5px] text-stone-400 font-mono mt-0.5 leading-normal">{model.desc}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
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

        {/* PRIMARY CALL TO ACTION BUTTON WITH FORMATS DROPDOWN */}
        <div className="relative inline-block text-left" ref={exportDropdownRef}>
          <button 
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 border border-stone-900 text-[10px] uppercase font-bold tracking-widest transition-all duration-150 active:scale-[0.97] cursor-pointer rounded-lg flex items-center gap-2 shadow-sm select-none"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Export Manuscript</span>
            <span className="sm:hidden">Export</span>
            <ChevronDown className="w-3 h-3 text-stone-400 font-sans" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3.5 py-2 border-b border-stone-100">
                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 font-mono block">Export Document</span>
                <span className="text-[9.5px] italic font-serif text-stone-550 block mt-0.5 leading-relaxed">Download compiled content into preferred format</span>
              </div>
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      handleExportManuscript('md');
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <div className="bg-emerald-50 text-emerald-700 rounded p-1 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-stone-850 font-sans">
                        Markdown File (.md)
                      </div>
                      <p className="text-[9.5px] text-stone-400 font-mono mt-0.5 leading-normal">Sequential plain text with layout headings</p>
                    </div>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleExportManuscript('doc');
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <div className="bg-blue-50 text-blue-750 html-export rounded p-1 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-stone-850 font-sans">
                        MS Word Document (.doc)
                      </div>
                      <p className="text-[9.5px] text-stone-400 font-mono mt-0.5 leading-normal">Rich-text book layout style, page break separations</p>
                    </div>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleExportManuscript('pdf');
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <div className="bg-red-50 text-red-750 printable-pdf rounded p-1 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-red-650" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-stone-850 font-sans">
                        PDF Publication (.pdf)
                      </div>
                      <p className="text-[9.5px] text-stone-400 font-mono mt-0.5 leading-normal">Typeset book layout, opens print to save as PDF</p>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </header>
  );
}
