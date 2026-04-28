import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { generateChapterContent, rewriteChapterContent } from './gemini';

export type WritingStyle = 'short_essay' | 'academic_paper' | 'book';

export interface Chapter {
  id: string;
  title: string;
  prompt: string;
  content: string;
  status: 'draft' | 'generating' | 'rewriting' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ProjectSettings {
  subject: string;
  writingStyle: WritingStyle;
  tone: string;
  additionalInstructions: string;
}

const defaultSettings: ProjectSettings = {
  subject: '',
  writingStyle: 'short_essay',
  tone: 'Professional and engaging',
  additionalInstructions: 'Avoid common AI jargon. Write like a human expert.',
};

interface AppState {
  settings: ProjectSettings;
  chapters: Chapter[];
  isLoaded: boolean;
  viewMode: 'canvas' | 'outline';
  isSidebarOpen: boolean;
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
}

const DB_KEY = 'human-writer-project-data';

export const useStore = create<AppState>((setStore, getStore) => {
  const saveToDb = (state: Partial<AppState>) => {
    const { settings, chapters } = { ...getStore(), ...state };
    set(DB_KEY, { settings, chapters }).catch(console.error);
  };

  return {
    settings: defaultSettings,
    chapters: [],
    isLoaded: false,
    viewMode: 'canvas',
    isSidebarOpen: true,

    setViewMode: (mode) => setStore({ viewMode: mode }),
    toggleSidebar: () => setStore((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    importProject: (data) => {
      setStore({
        settings: data.settings,
        chapters: data.chapters,
      });
      saveToDb({ settings: data.settings, chapters: data.chapters });
    },

    setSettings: (newSettings) => {
      setStore((state) => {
        const nextSettings = { ...state.settings, ...newSettings };
        saveToDb({ settings: nextSettings });
        return { settings: nextSettings };
      });
    },

    addChapter: () => {
      setStore((state) => {
        const newChapter: Chapter = {
          id: uuidv4(),
          title: `Chapter ${state.chapters.length + 1}`,
          prompt: '',
          content: '',
          status: 'draft',
        };
        const nextChapters = [...state.chapters, newChapter];
        saveToDb({ chapters: nextChapters });
        return { chapters: nextChapters };
      });
    },

    updateChapter: (id, data) => {
      setStore((state) => {
        const nextChapters = state.chapters.map((ch) =>
          ch.id === id ? { ...ch, ...data } : ch
        );
        saveToDb({ chapters: nextChapters });
        return { chapters: nextChapters };
      });
    },

    deleteChapter: (id) => {
      setStore((state) => {
        const nextChapters = state.chapters.filter((ch) => ch.id !== id);
        saveToDb({ chapters: nextChapters });
        return { chapters: nextChapters };
      });
    },

    reorderChapters: (activeId, overId) => {
      setStore((state) => {
        const activeIndex = state.chapters.findIndex(c => c.id === activeId);
        const overIndex = state.chapters.findIndex(c => c.id === overId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const newChapters = [...state.chapters];
          const [moved] = newChapters.splice(activeIndex, 1);
          newChapters.splice(overIndex, 0, moved);
          saveToDb({ chapters: newChapters });
          return { chapters: newChapters };
        }
        return state;
      });
    },

    generateChapter: async (id) => {
      const state = getStore();
      const chapterIndex = state.chapters.findIndex((c) => c.id === id);
      if (chapterIndex === -1) return;

      const chapter = state.chapters[chapterIndex];
      const previousChapters = state.chapters.slice(0, chapterIndex);
      const settings = state.settings;

      getStore().updateChapter(id, { status: 'generating', errorMessage: '' });

      try {
        const content = await generateChapterContent(chapter, previousChapters, settings);
        getStore().updateChapter(id, { content, status: 'completed' });
      } catch (error: any) {
        getStore().updateChapter(id, { 
          status: 'error', 
          errorMessage: error?.message || 'Failed to generate chapter' 
        });
      }
    },

    rewriteChapter: async (id) => {
      const state = getStore();
      const chapterIndex = state.chapters.findIndex((c) => c.id === id);
      if (chapterIndex === -1) return;

      const chapter = state.chapters[chapterIndex];
      const previousChapters = state.chapters.slice(0, chapterIndex);
      const settings = state.settings;

      getStore().updateChapter(id, { status: 'rewriting', errorMessage: '' });

      try {
        const content = await rewriteChapterContent(chapter, previousChapters, settings);
        getStore().updateChapter(id, { content, status: 'completed' });
      } catch (error: any) {
        getStore().updateChapter(id, { 
          status: 'error', 
          errorMessage: error?.message || 'Failed to rewrite chapter' 
        });
      }
    },

    loadFromDb: async () => {
      try {
        const data = await get(DB_KEY);
        if (data) {
          setStore({
            settings: data.settings || defaultSettings,
            chapters: data.chapters || [],
            isLoaded: true,
          });
        } else {
          setStore({ isLoaded: true });
        }
      } catch (error) {
        console.error('Failed to load from DB', error);
        setStore({ isLoaded: true });
      }
    },
  };
});
