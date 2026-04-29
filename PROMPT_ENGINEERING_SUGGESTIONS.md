# Enhancing Chapter Composition in BookMobile

As an expert in prompt engineering and generative AI workflows, I've analyzed the current "BookMobile" implementation. Currently, the system uses a high-quality single-stage generation and a separate "Humanize" (rewrite) stage. 

To elevate the output from "good AI writing" to "professional-grade literature," we can implement **Diversified Thinking Levels** and **Tool Calling**. This approach shifts the model from a "stochastic parrot" mode to a "multi-stage architect" mode.

---

## 1. Diversified Thinking Levels (Multi-Stage Reasoning)

Instead of a single prompt, chapter generation should be broken into distinct cognitive phases. This prevents the "flatness" often seen in AI-generated long-form content.

### Phase 1: The "Architect" (Analytical Thinking)
Before writing a single sentence of prose, the model should perform a **Planning Pass**.
*   **Prompt Goal:** Analyze the chapter prompt and previous context to create a "Emotional and Narrative Blueprint."
*   **Thinking Level:** High-level logical planning.
*   **Outputs:** 
    *   *The "beat" map:* What is the emotional arc of this specific chapter?
    *   *Continuity Check:* What facts or character arcs from previous chapters must be addressed?
    *   *Vocabulary Palette:* 10-15 unique words or motifs (e.g., "obsidian," "staccato," "vitreous") that should reappear in this chapter to create atmosphere.

### Phase 2: The "Artist" (Creative/Generative Thinking)
Using the Blueprint from Phase 1, the model generates the first draft.
*   **Thinking Level:** Creative flow, focusing on rhythm and sensory detail.
*   **Constraint:** The model is instructed to ignore "polish" and prioritize the raw events and descriptions defined in the blueprint.

### Phase 3: The "Editor" (Critical Thinking)
A final pass specifically designed to strip away AI hallmarks.
*   **Thinking Level:** Precision editing and stylistic audit.
*   **Task:** The model must identify sentences that follow a "Standard AI Rhythm" (Subject-Verb-Object) and intentionally disrupt them with fragments, parentheticals, or inverted syntax.

---

## 2. Advanced Tool Calling for Composition

Integrating Tool Calling allows the model to outsource specific sub-tasks to specialized logic or external data.

*   **`ContinuityBuffer`:** Retrieves "lore" from a structured summary of the entire book to prevent "memory fade" (e.g., changing a character's eye color).
*   **`StyleAuditor`:** Scans text for 20+ "Banned AI Hallmarks" (e.g., "pivotal," "undoubtedly") and highlights them for forced rewriting.
*   **`SemanticThesaurus`:** Replaces high-probability words with "Tier 2" vocabulary to make prose feel authored.
*   **`RhythmAnalyzer`:** Calculates sentence length variety and triggers a rewrite if the rhythm becomes too repetitive.

---

## 3. UI/UX Integration Plan: Designing the "Deep Work" Experience

Bringing these backend abstractions into the UI requires **Architectural Honesty**—showing the user the "thinking" without overwhelming them.

### A. The "Thinking Pipeline" Progress UI
*   **Component:** `ChapterCard` Footer & `OutlineItem` Status.
*   **Pattern:** Replace the single "Generating" spinner with a **Segmented Progress Bar**.
*   **Interactions:** 
    *   As the backend cycles through phases (Architect -> Artist -> Editor), the segments "fill" with distinct colors (muted gray for logic, ivory for creative, charcoal for editing).
    *   **Contextual Tooltips:** Hovering over the active segment displays a micro-status: *"Architect is mapping narrative beats..."* or *"Editor is disrupting repetitive rhythms..."*

### B. The "Blueprint & Audit" Tab (Maximized Card View)
*   **Component:** `ChapterCard` Maximized View.
*   **Pattern:** Introduce a horizontal tab switcher at the top of the manuscript section: `[ Manuscript ] [ Blueprint ] [ Style Audit ]`.
*   **Blueprint View:** Displays the Architect's output—the "beats" and "vocabulary palette." This gives the author professional-grade transparency into *why* the AI chose certain directions.
*   **Style Audit View:** A diff-style view showing the "Editor" phase's work. Highlights sentences that were flagged as "too AI-like" and shows the "humanized" correction. This reinforces user trust in the "No AI Tropes" promise.

### C. Sidebar: Composition Engine Controls
*   **Component:** `Sidebar` Settings.
*   **Pattern:** A new "Composition Engine" section.
*   **Features:**
    *   **Engine Mode Toggle:** `[ Standard ] [ Deep Work ]`. Standard for quick drafts; Deep Work for multi-pass literary generation.
    *   **Style Intensity Slider:** Controls how aggressively the `StyleAuditor` and `RhythmAnalyzer` disrupt the text.
    *   **Thesaurus Tier Selector:** `[ Natural ] [ Literary ] [ Academic ]` to control the `SemanticThesaurus` output.

### D. Continuity Visualizers
*   **Component:** `Canvas` Background or Sidebar.
*   **Pattern:** A floating "Continuity Pulse" icon.
*   **Interactions:** When the `ContinuityBuffer` tool is called, the icon pulses. This visual cue tells the user that the system is actively looking across their *entire* project to ensure consistency, reducing anxiety about long-term narrative coherence.

---

## 4. Technical Integration Roadmap

1.  **Store Evolution (`lib/store.ts`):** 
    *   Expand `Chapter` interface to include `blueprint` (JSON object) and `auditLogs` (array of corrections).
    *   Update `status` to support sub-states: `architecting`, `drafting`, `auditing`, `polishing`.
2.  **API Orchestration (`lib/gemini.ts`):**
    *   Refactor `generateChapter` to use a `ThinkingEngine` class that manages the sequence of Gemini calls and tool executions.
    *   Implement real-time status updates via the Store so the UI reflects the current phase immediately.
3.  **UI Refinement:**
    *   Update `ChapterCard` with the segmented progress patterns.
    *   Add the "Blueprint" and "Audit" visualization components.

By wiring these professional UI patterns into the multi-stage backend, **BookMobile** evolves from a text generator into a **Collaborative Writing Partner** that demonstrates its value through transparent, high-level reasoning.
