# BookMobile AI

> A focused drafting environment designed for serious, long-form writing, powered by Gemini.

BookMobile AI is a structured writing tool that solves the common pitfalls of AI-assisted writing models. It pairs targeted system instructions with a visual outlining tool to help you write long-form content seamlessly, avoiding typical AI hallmarks like clichéd phrasing and rigid formatting.

## Features

- **Global Parameters (Left Panel):** Set the overarching tone, style, and instructions. These govern the entire manuscript to ensure consistency. Use the collapse toggle to hide the parameters while you write.
- **Section-by-Section Drafting:** Break your writing into chapters, acts, or scenes. Use the prompt field on each card to define specific plot points, arguments, or facts for that segment.
- **Engineered Humanization:** BookMobile uses an ultra-strict background system prompt that aggressively eliminates standard AI hallmarks (numbered lists, dashes, cliches, "in conclusion"), forcing the model to generate varied, professional, full-sentence prose.
- **Drafting vs. Humanizing:** "Draft" generates initial content based on your chapter prompt from scratch. "Humanize" refines existing content to improve sentence variance, rhythm, and flow without changing the core meaning.
- **Card vs. Outline Views:** The default Canvas space lets you view the actual text in a grid layout. The Outline space gives you a high-level view showing summaries, word counts, and flow status, allowing for rapid manuscript restructuring via drag-and-drop.
- **Local Saving:** Work is auto-saved to your browser's IndexedDB. For long-term storage, use the *Save Work* and *Load* buttons in the top navigation to work entirely locally via JSON backups.
- **Markdown Export:** Export your finished manuscript to a unified Markdown `.md` file, ready to be reviewed or published.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **AI Integration:** `@google/genai` (Gemini API)
- **Storage:** IndexedDB (`idb-keyval`)
- **Drag and Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Icons:** `lucide-react`

## Environment Setup

To run this application locally, you will need a valid Google Gemini API Key.
Add the key to a `.env.local` or `.env` file at the root of the project:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## How It Works

1. **Create and Structure:** Add chapters or sections to your canvas. Adjust the sequence using the Outline view.
2. **Define the Voice:** Configure the overarching subject, writing style (e.g., Journalistic, Academic, Fiction), tone, and additional system prompts.
3. **Prompt the Chapters:** Expand a chapter card and provide localized details of what you want the chapter to cover.
4. **Draft and Refine:** Hit "Draft Chapter" to establish the first pass. If you've modified the content or it's not quite right, select "Humanize/Rewrite" to apply the robust AI hallmark scrubbers.
5. **Save your Work:** All saves are local. You can export a structured JSON file to retain all project configuration and chapter configurations safely on your own machine.
