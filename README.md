# 📚 BookMobile AI
> A focused drafting environment designed for serious, long-form writing, powered by Google Gemini.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**BookMobile AI** is a structured writing tool that solves the common pitfalls of AI-assisted writing models. It pairs targeted system instructions with a visual outlining tool to help you write long-form content seamlessly. Most notably, it is designed from the ground up to aggressively avoid typical AI hallmarks like clichéd phrasing, repetitive sentence structures, and predictable formatting.

Instead of generating flat, soulless text, BookMobile acts as a **Collaborative Writing Partner** that you guide scene-by-scene, chapter-by-chapter.

---

## ✨ Key Features

- **Global Story Parameters:** Set the overarching tone, style, and premise in the left panel. These parameters govern the entire manuscript securely to ensure consistency across chapters.
- **Section-by-Section Drafting:** Break your writing into chapters, acts, or scenes using "Cards". Use the prompt field on each card to define specific plot points, arguments, or facts for that segment.
- **Engineered Humanization:** BookMobile uses an ultra-strict background system prompt that aggressively eliminates standard AI hallmarks (numbered lists, dashes, cliches, "in conclusion"), forcing the model to generate varied, professional, full-sentence prose.
- **Drafting vs. Humanizing:** 
  - *Drafting:* Generates initial content based on your chapter prompt from scratch.
  - *Humanizing:* Refines existing content to improve sentence variance, rhythm, and flow without changing the core meaning.
- **Canvas vs. Outline Views:** 
  - *Canvas (Default):* View the actual text in a grid layout to focus on writing and reviewing.
  - *Outline:* A high-level drag-and-drop workspace showing chapter summaries, word counts, and flow status, allowing for rapid manuscript restructuring.
- **Local-First & Offline Capable:** Your work is auto-saved continuously to your browser's IndexedDB. For long-term secure storage, use the *Save Work* and *Load* buttons to handle your backups entirely locally via JSON files.
- **Markdown Export:** Export your finished manuscript to a unified Markdown (`.md`) file, ready to be reviewed, formatted, or published.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/bookmobile-ai.git
   cd bookmobile-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn / pnpm / bun install
   ```

3. **Configure Environment:**
   Create a `.env.local` file at the root of the project and add your Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to launch BookMobile.

---

## 📖 Instructions for Use

Getting started with a new manuscript is easy. BookMobile is designed to keep you focused while managing the complexity of maintaining context across thousands of words.

### 1. Establish the Global Context
Open the **Sidebar** (left panel) and define the core rules of your manuscript:
- **Title & Description:** Give your book a working title and a high-level summary of the plot or argument.
- **Writing Style:** Choose the format (Book, Short Essay, Academic Paper) to tune the output structure.
- **System Instructions:** Add specific "do nots" or mandatory rules. (e.g., "Never use the word 'suddenly'. Keep paragraphs dense and descriptive.")

### 2. Outline Your Structure
Switch to the **Outline** view (top center). 
- Click **"Add Chapter"** to begin building your skeleton. 
- You can drag and drop chapters to rearrange the sequence of events before any text is even generated.
- *Tip: A chapter cannot be drafted until you give it a prompt!*

### 3. Prompting & Drafting
Switch back to the **Canvas** view. For each chapter card:
1. Provide a **Prompt**: Write specific instructions, dialogue beats, or facts that must occur in this chapter.
2. Click **Draft**: BookMobile will read the Global Context + all Previous Chapter Summaries + your Current Prompt to generate a continuous, contextually aware manuscript segment.
3. Once generated, an automatic 1-2 sentence **Summary** will be generated and stored for the Outline view and future context continuity.

### 4. Review and Humanize
Review the generated text. If the prose feels a bit too "stiff" or "AI-like", click the **Humanize** button. This triggers a dedicated critical-thinking pass by the model to:
- Disrupt repetitive sentence lengths.
- Scrub known AI buzzwords.
- Enhance atmospheric vocabulary.

### 5. Export Your Work
Click the **Export** button in the top navigation bar to download your manuscript as a clean Markdown file. All chapters will be concatenated in their final order, ready for formatting in tools like Vellum, Word, or Scrivener.

---

## 🏗️ Architecture & Philosophy

BookMobile uses a structured "Context Waterfall" to manage long-form context windows effectively:
1. Every chapter generation request includes the `ProjectSettings` (Global rules).
2. It concatenates the *summaries* of all previous chapters to maintain plot continuity without blowing up the token window or distracting the model.
3. It includes the *full text* of the immediately preceding chapter to ensure a smooth, continuous transition.

**Planned Roadmap: The "Deep Work" Pipeline**
Future iterations of BookMobile aim to introduce *Diversified Thinking Levels*, breaking the "Draft" button into a multi-stage reasoning pipeline:
- **Phase 1: Architect** (Generates a beat map and vocabulary palette)
- **Phase 2: Artist** (Drafts the raw narrative based on the beats)
- **Phase 3: Editor** (Critiques the cadence against a strict stylistic audit)

*(See `PROMPT_ENGINEERING_SUGGESTIONS.md` for our full conceptual roadmap).*

---

## 💻 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **State Management:** Zustand
- **AI Integration:** `@google/genai` (Gemini Flash/Pro)
- **Storage:** IndexedDB (`idb-keyval`)
- **Drag and Drop:** `@dnd-kit`
- **Icons:** `lucide-react`

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.