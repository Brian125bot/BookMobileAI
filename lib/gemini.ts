import { GoogleGenAI } from '@google/genai';
import type { Chapter, ProjectSettings } from './store';

// Check if API key exists. Warn in server logs if missing, but it might be set at runtime in preview.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error('Failed to initialize GoogleGenAI', e);
}

function getSystemInstruction(settings: ProjectSettings): string {
  return `You are a highly skilled professional writer executing a ${settings.writingStyle.replace('_', ' ')}.
The overall subject is: ${settings.subject}.
The desired tone is: ${settings.tone}

CRITICAL RULES:
1. NO AI HALLMARKS: DO NOT use AI clichés or tropes (e.g., "In conclusion", "Delve into", "Tapestry", "Crucial", "It's important to note", "Moreover", "Additionally", "As a language model").
2. NO LISTS OR DASHES: Do NOT use bullet points, numbered lists, or dashes anywhere in your response. Respond ONLY with flowing, full-sentence composition.
3. NO CLICHÉ FORMATS: Avoid the "From X to Y" format completely (e.g., "From the soaring peaks to the deep valleys", "From the micro to the macro").
4. HUMAN DYNAMISM: Write with a highly natural, human-like flow. Aggressively vary sentence structure, rhythm, and length. Use unique and varied vocabulary without sounding pedantic.
5. CONCRETE WRITING: Show, don't just tell. Use vivid, concrete language rather than abstract summaries.
6. STRICT ADHERENCE: Follow any additional instructions strictly: \n${settings.additionalInstructions}
7. CONTENT ONLY: Provide ONLY the final text for the chapter. Do NOT include generic conversational responses, greetings, or meta-commentary (e.g., "Here is your chapter:").
`;
}

function buildContextPrompt(previousChapters: Chapter[]): string {
  if (previousChapters.length === 0) return '';
  
  // To stay within free tier context limits and stay performant, we might summarize or just include previous chapter contents.
  // For a basic MVP, we can include the last 2 chapters fully and title-only for others.
  const contextParts = previousChapters.map((ch, idx) => {
    if (idx >= previousChapters.length - 2) {
      return `[PREVIOUS CHAPTER: ${ch.title}]\n${ch.content}\n`;
    } else if (ch.summary) {
      return `[PREVIOUS CHAPTER SUMMARY: ${ch.title}]\n${ch.summary}\n`;
    } else {
      return `[PREVIOUS CHAPTER SUMMARY: ${ch.title}]\n(Content happened earlier, provided title for continuity)\n`;
    }
  });

  return `\nCONTEXT FROM PREVIOUS CHAPTERS:\n${contextParts.join('\n')}\n---\n`;
}

export async function generateChapterSummary(content: string, model: string = 'gemini-3.5-flash'): Promise<string> {
  if (!ai) {
    return '';
  }

  const prompt = `Summarize the following chapter content concisely in 1-2 short sentences. Focus on the main action or point.\n\nCONTENT:\n${content.substring(0, 4000)}...`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.2, // Low temp for factual summary
      },
    });

    if (response.text) {
      return response.text.trim();
    }
    return '';
  } catch (error) {
    console.error('Gemini API Error (Summary):', error);
    return '';
  }
}

export async function generateChapterContent(
  chapter: Chapter,
  previousChapters: Chapter[],
  settings: ProjectSettings,
  model: string = 'gemini-3.5-flash'
): Promise<string> {
  if (!ai) {
    throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
  }

  const systemInstruction = getSystemInstruction(settings);
  const context = buildContextPrompt(previousChapters);

  const prompt = `${context}
NOW, write the next chapter.
Chapter Title/Focus: ${chapter.title}
Specific Chapter Prompt: ${chapter.prompt}
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7, // Slightly elevated to encourage varied vocab
      },
    });

    if (response.text) {
      return response.text.trim();
    }
    throw new Error('Model produced an empty response.');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export async function rewriteChapterContent(
  chapter: Chapter,
  previousChapters: Chapter[],
  settings: ProjectSettings,
  model: string = 'gemini-3.5-flash'
): Promise<string> {
  if (!ai) {
    throw new Error('Gemini API key is not configured.');
  }

  const systemInstruction = getSystemInstruction(settings) + 
    '\nREWRITE DIRECTIVE: You are taking a drafted piece of text and completely overhauling it to vastly improve human-like flow, pacing, and organic vocabulary. Strip out ANY remaining AI undertones.';
  
  const context = buildContextPrompt(previousChapters);

  const prompt = `${context}
REWRITE THIS EXACT CHAPTER:
Chapter Title/Focus: ${chapter.title}
Original Prompt Goal: ${chapter.prompt}

CURRENT DRAFT TEXT:
${chapter.content}

TASK: Rewrite the current draft text to be more engaging, smoother, and emphatically more human. Do not change the core meaning or events, but elevate the prose significantly.
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    if (response.text) {
      return response.text.trim();
    }
    throw new Error('Model produced an empty response during rewrite.');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
