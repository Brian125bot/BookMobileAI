import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { generateChapterContent, rewriteChapterContent, generateChapterSummary } from './gemini';

export type WritingStyle = 'short_essay' | 'academic_paper' | 'book';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface Chapter {
  id: string;
  title: string;
  prompt: string;
  content: string;
  summary?: string;
  status: 'draft' | 'generating' | 'rewriting' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ProjectSettings {
  subject: string;
  writingStyle: WritingStyle;
  tone: string;
  additionalInstructions: string;
  autoSaveInterval: number;
  selectedModel?: string;
}

const defaultSettings: ProjectSettings = {
  subject: '',
  writingStyle: 'short_essay',
  tone: 'Professional and engaging',
  additionalInstructions: 'Avoid common AI jargon. Write like a human expert.',
  autoSaveInterval: 1, // Default 1 minute
  selectedModel: 'gemini-3.5-flash',
};

interface AppState {
  settings: ProjectSettings;
  chapters: Chapter[];
  isLoaded: boolean;
  viewMode: 'canvas' | 'outline';
  isSidebarOpen: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  setViewMode: (mode: 'canvas' | 'outline') => void;
  toggleSidebar: () => void;
  setSettings: (settings: Partial<ProjectSettings>) => void;
  addChapter: () => void;
  updateChapter: (id: string, data: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  reorderChapters: (activeId: string, overId: string) => void;
  generateChapter: (id: string) => Promise<void>;
  rewriteChapter: (id: string) => Promise<void>;
  loadFromDb: () => Promise<void>;
  importProject: (data: { settings: ProjectSettings, chapters: Chapter[] }) => void;
  manualSaveToDb: () => Promise<void>;
  // History
  past: { settings: ProjectSettings, chapters: Chapter[] }[];
  future: { settings: ProjectSettings, chapters: Chapter[] }[];
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const DB_KEY = 'human-writer-project-data';

let typingTimeout: NodeJS.Timeout | null = null;
let autoSaveTimeout: NodeJS.Timeout | null = null;

// Dual-storage helper: Saves structured data to both LocalStorage and IndexedDB (if supported)
const saveToLocalStorage = (settings: ProjectSettings, chapters: Chapter[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const dataPayload = JSON.stringify({ settings, chapters });
      window.localStorage.setItem(DB_KEY, dataPayload);
      window.localStorage.setItem('bookmobile_project_settings', JSON.stringify(settings));
      window.localStorage.setItem('bookmobile_project_chapters', JSON.stringify(chapters));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }
};

// Generates a 1-second silent debounced auto-save function
const triggerAutoSave = () => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(async () => {
    const store = useStore.getState();
    if (store.hasUnsavedChanges) {
      try {
        const { settings, chapters } = store;
        // Save to IndexedDB
        await set(DB_KEY, { settings, chapters });
        // Save to LocalStorage fallback
        saveToLocalStorage(settings, chapters);
        
        // Quietly reset unsaved state
        useStore.setState({
          hasUnsavedChanges: false,
          lastSaved: new Date()
        });
      } catch (err) {
        console.error('Continuous auto-save failed:', err);
      }
    }
  }, 1000);
};

export const useStore = create<AppState>((setStore, getStore) => {
  return {
    settings: defaultSettings,
    chapters: [],
    isLoaded: false,
    viewMode: 'canvas',
    isSidebarOpen: true,
    hasUnsavedChanges: false,
    lastSaved: null,
    past: [],
    future: [],
    toasts: [],

    addToast: (message, type = 'success') => {
      const id = uuidv4();
      setStore((state) => ({
        toasts: [...state.toasts, { id, message, type }].slice(-5),
      }));
      setTimeout(() => {
        getStore().removeToast(id);
      }, 4500);
    },

    removeToast: (id) => {
      setStore((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    manualSaveToDb: async () => {
      const state = getStore();
      const { settings, chapters } = state;
      try {
        // Direct IndexedDB saving
        await set(DB_KEY, { settings, chapters });
        // Direct LocalStorage saving
        saveToLocalStorage(settings, chapters);
        
        setStore({ hasUnsavedChanges: false, lastSaved: new Date() });
        state.addToast('All progress saved securely to local storage', 'success');
      } catch (error) {
        console.error('Failed to save to DB', error);
        // Fallback to LocalStorage anyway
        try {
          saveToLocalStorage(settings, chapters);
          setStore({ hasUnsavedChanges: false, lastSaved: new Date() });
          state.addToast('Saved to browser localStorage (IndexedDB busy/unavailable)', 'info');
        } catch (localErr) {
          console.error('LocalStorage failed too', localErr);
          state.addToast('Failed to save to local database', 'error');
        }
      }
    },

    pushHistory: () => {
      setStore((state) => {
        const snapshot = {
          settings: JSON.parse(JSON.stringify(state.settings)),
          chapters: JSON.parse(JSON.stringify(state.chapters)),
        };
        const past = [...state.past, snapshot].slice(-50); // limit to 50
        return { past, future: [] };
      });
    },

    undo: () => {
      setStore((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        const currentSnapshot = {
          settings: JSON.parse(JSON.stringify(state.settings)),
          chapters: JSON.parse(JSON.stringify(state.chapters)),
        };
        
        return {
          past: newPast,
          future: [currentSnapshot, ...state.future],
          settings: previous.settings,
          chapters: previous.chapters,
          hasUnsavedChanges: true,
        };
      });
      triggerAutoSave();
    },

    redo: () => {
      setStore((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        const currentSnapshot = {
          settings: JSON.parse(JSON.stringify(state.settings)),
          chapters: JSON.parse(JSON.stringify(state.chapters)),
        };

        return {
          past: [...state.past, currentSnapshot],
          future: newFuture,
          settings: next.settings,
          chapters: next.chapters,
          hasUnsavedChanges: true,
        };
      });
      triggerAutoSave();
    },

    setViewMode: (mode) => setStore({ viewMode: mode }),
    toggleSidebar: () => setStore((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    importProject: (data) => {
      getStore().pushHistory();
      setStore({
        settings: data.settings,
        chapters: data.chapters,
        hasUnsavedChanges: true,
      });
      getStore().addToast('Project imported successfully', 'success');
      triggerAutoSave();
    },

    setSettings: (newSettings) => {
      getStore().pushHistory();
      setStore((state) => {
        const nextSettings = { ...state.settings, ...newSettings };
        return { settings: nextSettings, hasUnsavedChanges: true };
      });
      triggerAutoSave();
    },

    addChapter: () => {
      getStore().pushHistory();
      setStore((state) => {
        const newChapter: Chapter = {
          id: uuidv4(),
          title: `Chapter ${state.chapters.length + 1}`,
          prompt: '',
          content: '',
          status: 'draft',
        };
        const nextChapters = [...state.chapters, newChapter];
        setTimeout(() => getStore().addToast(`Added Chapter ${nextChapters.length}`, 'info'), 30);
        return { chapters: nextChapters, hasUnsavedChanges: true };
      });
      triggerAutoSave();
    },

    updateChapter: (id, data) => {
      if (!typingTimeout) {
        getStore().pushHistory();
      } else {
        clearTimeout(typingTimeout);
      }
      // reset session after 1s of inactivity
      typingTimeout = setTimeout(() => {
        typingTimeout = null;
      }, 1000);

      setStore((state) => {
        const nextChapters = state.chapters.map((ch) =>
          ch.id === id ? { ...ch, ...data } : ch
        );
        return { chapters: nextChapters, hasUnsavedChanges: true };
      });
      triggerAutoSave();
    },

    deleteChapter: (id) => {
      getStore().pushHistory();
      setStore((state) => {
        const nextChapters = state.chapters.filter((ch) => ch.id !== id);
        setTimeout(() => getStore().addToast('Deleted chapter', 'info'), 30);
        return { chapters: nextChapters, hasUnsavedChanges: true };
      });
      triggerAutoSave();
    },

    reorderChapters: (activeId, overId) => {
      getStore().pushHistory();
      setStore((state) => {
        const activeIndex = state.chapters.findIndex(c => c.id === activeId);
        const overIndex = state.chapters.findIndex(c => c.id === overId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const newChapters = [...state.chapters];
          const [moved] = newChapters.splice(activeIndex, 1);
          newChapters.splice(overIndex, 0, moved);
          return { chapters: newChapters, hasUnsavedChanges: true };
        }
        return state;
      });
      triggerAutoSave();
    },

    generateChapter: async (id) => {
      getStore().pushHistory();
      const state = getStore();
      const chapterIndex = state.chapters.findIndex((c) => c.id === id);
      if (chapterIndex === -1) return;

      const chapter = state.chapters[chapterIndex];
      const previousChapters = state.chapters.slice(0, chapterIndex);
      const settings = state.settings;
      const model = settings.selectedModel || 'gemini-3.5-flash';

      getStore().updateChapter(id, { status: 'generating', errorMessage: '' });
      getStore().addToast(`Drafting "${chapter.title}" with Gemini...`, 'info');

      try {
        const content = await generateChapterContent(chapter, previousChapters, settings, model);
        const summary = await generateChapterSummary(content, model);
        getStore().updateChapter(id, { content, summary, status: 'completed' });
        getStore().addToast(`Draft created for "${chapter.title}"`, 'success');
      } catch (error: any) {
        getStore().updateChapter(id, { 
          status: 'error', 
          errorMessage: error?.message || 'Failed to generate chapter' 
        });
        getStore().addToast(`Draft failed: ${error?.message || 'Unknown error'}`, 'error');
      }
    },

    rewriteChapter: async (id) => {
      getStore().pushHistory();
      const state = getStore();
      const chapterIndex = state.chapters.findIndex((c) => c.id === id);
      if (chapterIndex === -1) return;

      const chapter = state.chapters[chapterIndex];
      const previousChapters = state.chapters.slice(0, chapterIndex);
      const settings = state.settings;
      const model = settings.selectedModel || 'gemini-3.5-flash';

      getStore().updateChapter(id, { status: 'rewriting', errorMessage: '' });
      getStore().addToast(`Humanizing critical rewrite...`, 'info');

      try {
        const content = await rewriteChapterContent(chapter, previousChapters, settings, model);
        const summary = await generateChapterSummary(content, model);
        getStore().updateChapter(id, { content, summary, status: 'completed' });
        getStore().addToast(`Manuscript successfully polished!`, 'success');
      } catch (error: any) {
        getStore().updateChapter(id, { 
          status: 'error', 
          errorMessage: error?.message || 'Failed to rewrite chapter' 
        });
        getStore().addToast(`Rewrite failed: ${error?.message || 'Unknown error'}`, 'error');
      }
    },

    loadFromDb: async () => {
      try {
        // Step 1: Attempt to load from IndexedDB
        let data = await get(DB_KEY);
        
        // Step 2: If empty, try fallback LocalStorage
        if (!data && typeof window !== 'undefined' && window.localStorage) {
          const localDataStr = window.localStorage.getItem(DB_KEY);
          if (localDataStr) {
            try {
              data = JSON.parse(localDataStr);
            } catch (err) {
              console.error('Failed to parse localStorage fallback data:', err);
            }
          }
          
          if (!data) {
            const localSettings = window.localStorage.getItem('bookmobile_project_settings');
            const localChapters = window.localStorage.getItem('bookmobile_project_chapters');
            if (localSettings || localChapters) {
              data = {
                settings: localSettings ? JSON.parse(localSettings) : defaultSettings,
                chapters: localChapters ? JSON.parse(localChapters) : [],
              };
            }
          }
        }

        if (data) {
          setStore({
            settings: data.settings || defaultSettings,
            chapters: data.chapters || [],
            isLoaded: true,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
          });
        } else {
          setStore({ isLoaded: true, hasUnsavedChanges: false });
        }
      } catch (error) {
        console.error('Failed to load from DB, applying LocalStorage recovery', error);
        
        // Active recovery mode using LocalStorage
        let fallbackData = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          const localDataStr = window.localStorage.getItem(DB_KEY);
          if (localDataStr) {
            try {
              fallbackData = JSON.parse(localDataStr);
            } catch (err) {}
          }
        }
        
        if (fallbackData) {
          setStore({
            settings: fallbackData.settings || defaultSettings,
            chapters: fallbackData.chapters || [],
            isLoaded: true,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
          });
        } else {
          setStore({ isLoaded: true });
        }
      }
    },
  };
});
