import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '15mb' }));

const imageFolder = path.join(process.cwd(), 'public', 'generated-images');
try {
  await fs.mkdir(imageFolder, { recursive: true });
} catch (e) {
  console.error('Failed to create image folder:', e);
}
app.use('/generated-images', express.static(imageFolder));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function checkAiAvailable(res: express.Response): boolean {
  if (!ai || !apiKey) {
    res.status(503).json({
      error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in your Secrets panel.',
    });
    return false;
  }
  return true;
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Write in polished English.',
  ml: 'Write in natural, rich literary Malayalam (മലയാളത്തിൽ എഴുതുക). Use authentic Malayalam phrasing, vocabulary, and grammar.',
  ar: 'Write in high-quality Modern Standard Arabic (العربية الفصحى). Use evocative literary vocabulary and correct Arabic grammar.',
  ur: 'Write in poetic, authentic Urdu (اردو میں لکھیے). Use rich Nastaliq literary vocabulary, delicate expressions, and proper Urdu phrasing.',
  kn: 'Write in natural, rich literary Kannada (ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ). Use authentic Kannada vocabulary, evocative imagery, and correct Kannada grammar.',
};

// 1. Generate Story
app.post('/api/story/generate', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    idea,
    genre = 'Fantasy',
    tone = 'Cinematic',
    length = 'Short',
    characters = '',
    customInstructions = '',
    language = 'en',
    worldContext = '',
  } = req.body || {};

  if (!idea || typeof idea !== 'string' || !idea.trim()) {
    return res.status(400).json({ error: 'Please provide a story idea or concept.' });
  }

  const lengthGuide =
    length === 'Flash'
      ? 'around 200-300 words, high impact and punchy'
      : length === 'Medium'
      ? 'around 700-1000 words with rich dialogue and pacing'
      : length === 'Epic Chapter'
      ? 'around 1200-1600 words as a detailed book chapter with worldbuilding'
      : 'around 450-650 words with evocative atmosphere';

  const langNote = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

  const systemInstruction = `You are a celebrated fiction novelist and narrative director.
Write an engaging, original, beautifully crafted story in the ${genre} genre with a ${tone} tone.
Aim for ${lengthGuide}.
Language instruction: ${langNote}
Make the scene vivid with sensory descriptions, dynamic dialogue, authentic human emotion, and narrative momentum.
Format cleanly with Markdown:
Start with a compelling title on the first line (e.g. "# The Starlight Archivist" or translated title).
Use chapter/scene breaks (e.g. "## Chapter 1: The Whispering Door" or "⁂") where appropriate.
Do not include any conversational preamble, author notes, or introductory meta-text. Return only the story.`;

  const userPrompt = `Premise / Core Idea:
${idea.trim()}

${characters ? `Characters to include / feature with their distinct identities: ${characters}` : ''}
${worldContext ? `World lore & setting context: ${worldContext}` : ''}
${customInstructions ? `Special requirements: ${customInstructions}` : ''}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    const storyText = response.text || '';
    
    // Extract title if present
    const firstLine = storyText.split('\n')[0] || '';
    const title = firstLine.startsWith('#')
      ? firstLine.replace(/^#+\s*/, '').trim()
      : idea.slice(0, 40) + '...';

    res.json({
      story: storyText,
      title,
    });
  } catch (error: any) {
    console.error('Story generation failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate story. Please try again.',
    });
  }
});

// 2. Continue Narrative from Exact Stopping Point (with Preview metadata)
app.post('/api/story/continue', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    currentStory = '',
    direction = '',
    charactersContext = '',
    language = 'en',
    lastStoppingPoint = '',
  } = req.body || {};

  if (!currentStory.trim()) {
    return res.status(400).json({ error: 'No story content provided to continue.' });
  }

  const langNote = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

  const systemInstruction = `You are an acclaimed fiction novelist continuing an existing manuscript.
Language instruction: ${langNote}
Analyze the story context, characters, tone, pacing, and exact stopping point.
Seamlessly continue the story from the exact point it stopped.
Maintain the exact character voices, visual traits, and narrative pacing.
Do not summarize the past text or repeat previous sentences; begin immediately with the next action or line of dialogue.
Return the continuation in clean markdown.`;

  const userPrompt = `Story Context (end of manuscript):
${currentStory.slice(-4500)}

${lastStoppingPoint ? `Exact Stopping Point Sentence: "${lastStoppingPoint}"` : ''}
${charactersContext ? `Character Roster & Visual Anchors: ${charactersContext}` : ''}
${direction ? `Scene Goal / Direction: ${direction}` : 'Continue logically with escalating intrigue, conflict, or emotional revelation.'}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    const continuation = response.text || '';
    res.json({
      continuation,
      previewSummary: continuation.slice(0, 150) + (continuation.length > 150 ? '...' : ''),
    });
  } catch (error: any) {
    console.error('Continue story failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to continue story.',
    });
  }
});

// 3. AI Grammar, Vocabulary & Style Polish with Side-by-Side Comparison
app.post('/api/story/rewrite', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    text = '',
    mode = 'polish', // 'grammar' | 'vocabulary' | 'polish' | 'cinematic'
    language = 'en',
  } = req.body || {};

  if (!text.trim()) {
    return res.status(400).json({ error: 'Please provide text to improve.' });
  }

  const modeInstructions: Record<string, string> = {
    grammar: 'Fix all grammar, spelling, punctuation, and syntax errors while preserving the author\'s original tone and voice exactly.',
    vocabulary: 'Upgrade common or flat words to vivid, evocative, and literary vocabulary. Enhance verbs and adjectives without sounding overly archaic.',
    polish: 'Refine sentence flow, rhythm, rhythm variation, and clarity. Remove repetitive filler phrases and tighten prose.',
    cinematic: 'Rewrite into high-impact cinematic prose with rich sensory details (sound, light, texture) and emotional depth.',
  };

  const selectedModePrompt = modeInstructions[mode] || modeInstructions.polish;
  const langNote = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

  const systemInstruction = `You are an expert literary fiction editor and copyeditor.
Task: ${selectedModePrompt}
Language instruction: ${langNote}
Provide an accurate, high-quality improvement of the user's text.
Return JSON strictly in this structure:
{
  "correctedText": "the complete rewritten/corrected text",
  "explanation": "summary of edits made",
  "improvements": ["key improvement 1", "key improvement 2", "key improvement 3"]
}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Please edit and improve this passage:\n\n${text}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      originalText: text,
      correctedText: parsed.correctedText || text,
      explanation: parsed.explanation || 'Refined for narrative flow.',
      improvements: parsed.improvements || [],
    });
  } catch (error: any) {
    console.error('Rewrite failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze text.',
    });
  }
});

// 4. Automatic Chapter Parsing & Individual Scene Prompt Suggester
app.post('/api/story/chapters', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const { content = '', charactersContext = '' } = req.body || {};
  if (!content.trim()) {
    return res.status(400).json({ error: 'Please provide story content.' });
  }

  const systemInstruction = `You are a book editor and visual art director.
Scan the story manuscript and detect or organize it into logical chapters or scenes.
For EACH chapter, provide:
- chapterNumber (integer)
- title (string)
- excerpt (short 1-2 sentence excerpt)
- visualPrompt (a highly detailed, cinematic image generation prompt capturing the chapter's key visual climax, incorporating consistent character details: ${charactersContext || 'none specified'})
Return JSON as an array of chapters:
[
  {
    "chapterNumber": 1,
    "title": "Chapter title",
    "summary": "Brief summary",
    "visualPrompt": "Detailed art generation prompt"
  }
]`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze this manuscript for chapters and scene visuals:\n\n${content.slice(0, 12000)}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const chapters = JSON.parse(response.text || '[]');
    res.json({ chapters });
  } catch (error: any) {
    console.error('Chapter detection failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to detect chapters.',
    });
  }
});

// 5. Character Creator with Visual Anchor Generation
app.post('/api/character/generate', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    role = 'Protagonist',
    genre = 'Fantasy',
    concept = '',
    existingCharacters = '',
  } = req.body || {};

  const systemInstruction = `You are a master character designer and screenwriter.
Create a rich, original character profile suitable for a ${genre} story.
Ensure the character has a distinctive visual appearance so an AI image model can draw them with consistent faces, hairstyles, clothing, and accessories across chapters.
Return JSON with:
{
  "name": "Full Name",
  "role": "${role}",
  "age": "age or age range",
  "appearance": "detailed facial structure, eye color, skin tone, notable marks or scars",
  "hair": "hair length, color, texture, signature hairstyle",
  "clothing": "signature outfit, fabrics, colors, accessories",
  "personality": "key traits, flaws, virtues",
  "backstory": "2-3 sentences of origin and motivation",
  "relationships": "potential dynamic with others",
  "visualAnchorPrompt": "a concise prompt clause defining this character's look for image generation (e.g., 'a 24-year-old woman with piercing emerald eyes, braided raven hair with copper beads, wearing a midnight-blue traveler cloak over etched silver chainmail')"
}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Concept: ${concept || `A compelling ${role} for a ${genre} story.`}\nOther characters in world: ${existingCharacters}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const char = JSON.parse(response.text || '{}');
    res.json({ character: char });
  } catch (error: any) {
    console.error('Character generation failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate character.',
    });
  }
});

// 6. Fantasy World Builder Generator
app.post('/api/story/world', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    worldName = '',
    theme = 'Epic Fantasy',
    existingLore = '',
  } = req.body || {};

  const systemInstruction = `You are a master worldbuilder and fantasy cartographer.
Generate rich, coherent worldbuilding lore for a ${theme} story.
Include:
1. locations: array of 3 distinct regions/cities (name, type, climate, landmarks, atmosphere, dangerLevel)
2. magicSystem: (name, source, coreRules [array], limitations, costOfUse)
3. factions: array of 2 powerful factions (name, alignment, goals, insignia)
4. creatures: array of 2 unique fictional flora or fauna (name, habitat, traits)
5. historicalEras: array of 2 pivotal historical events or eras (era, description)

Return JSON with structure matching this:
{
  "worldName": "World Name",
  "locations": [...],
  "magicSystem": {...},
  "factions": [...],
  "creatures": [...],
  "historicalEras": [...]
}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `World Name: ${worldName || 'Unnamed Realm'}\nTheme: ${theme}\nExisting Context: ${existingLore}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const world = JSON.parse(response.text || '{}');
    res.json({ world });
  } catch (error: any) {
    console.error('World generation failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate world lore.',
    });
  }
});

// 7. Book Cover Art & Typography Director
app.post('/api/cover/director', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    title,
    subtitle = '',
    author = '',
    genre = 'Fantasy',
    coverStyle = 'Epic Fantasy',
    storyContext = '',
  } = req.body || {};

  const systemInstruction = `You are a renowned book cover designer and visual art director for top publishing houses.
Design an arresting, commercial book cover visual prompt and color palette for:
Title: "${title}"
Author: "${author || 'Unknown'}"
Genre: ${genre}
Style: ${coverStyle}

Create an ultra-detailed image prompt for the background artwork (in 3:4 portrait aspect ratio).
The prompt should feature the central iconic motif, dramatic lighting, rich textures, and space at top/bottom for typography.
Avoid any text, letters, watermarks, or typography inside the artwork itself.

Return JSON:
{
  "artPrompt": "detailed visual prompt",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "recommendedFont": "Cinzel / Playfair Display / Space Grotesk",
  "layoutTip": "suggestion for typography placement"
}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Story summary: ${storyContext.slice(0, 3000)}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const coverPlan = JSON.parse(response.text || '{}');
    res.json({ coverPlan });
  } catch (error: any) {
    console.error('Cover director failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to direct book cover.',
    });
  }
});

// 8. Story Translation (English, Malayalam, Arabic, Urdu)
app.post('/api/story/translate', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    content = '',
    targetLanguage = 'ml', // 'en' | 'ml' | 'ar' | 'ur'
  } = req.body || {};

  if (!content.trim()) {
    return res.status(400).json({ error: 'No content to translate.' });
  }

  const langNames: Record<string, string> = {
    en: 'English',
    ml: 'Malayalam (മലയാളം)',
    ar: 'Arabic (العربية الفصحى)',
    ur: 'Urdu (اردو)',
    kn: 'Kannada (ಕನ್ನಡ)',
  };

  const targetName = langNames[targetLanguage] || 'English';

  const systemInstruction = `You are a master literary translator specializing in translating fiction into ${targetName}.
Translate the story faithfully, preserving its narrative voice, poetic imagery, character personality, and formatting.
Ensure natural idioms, authentic phrasing, and proper grammar in ${targetName}.
Maintain markdown headings (# Title, ## Chapter, etc.). Return only the translated text.`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: content,
      config: {
        systemInstruction,
      },
    });

    res.json({
      translatedContent: response.text || '',
      targetLanguage,
    });
  } catch (error: any) {
    console.error('Translation failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to translate story.',
    });
  }
});

// 9. Generate Plot Twists & Creative Sparks
app.post('/api/story/twist', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const { currentStory = '', genre = 'Fiction' } = req.body || {};
  if (!currentStory.trim()) {
    return res.status(400).json({ error: 'Please write some story context first.' });
  }

  const prompt = `Based on this ${genre} story excerpt:
${currentStory.slice(-3000)}

Brainstorm 3 genuinely inventive, unexpected plot twists or sudden narrative complications that will subvert expectations while fitting the story world.
Return as a clean JSON array with objects: [{"headline": "...", "description": "...", "snippet": "..."}]`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const json = JSON.parse(response.text || '[]');
    res.json({ twists: json });
  } catch (error: any) {
    console.error('Plot twist failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate plot twists.',
    });
  }
});

// 10. Art Director / Scene Visual Prompt Builder (with Character Consistency)
app.post('/api/image/director', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    story = '',
    scene = '',
    style = 'cinematic digital storybook illustration',
    characterAnchors = '',
  } = req.body || {};

  if (!story.trim() && !scene.trim()) {
    return res.status(400).json({ error: 'Please provide story text or a scene description.' });
  }

  const systemInstruction = `You are an elite cinema art director and visual concept lead.
Analyze the story and scene, and craft a single, highly detailed, evocative prompt for image generation.
Ensure any featured characters strictly match these visual anchors:
${characterAnchors || 'No specific character anchor provided.'}

Include:
- Subject & focal character: age, exact facial traits, hair, posture, expression, attire matching reference.
- Environment & setting: architecture, flora, terrain, epoch, specific props.
- Lighting & color: volumetric lighting, golden hour, twilight lanterns, neon reflections, color harmony.
- Composition & perspective: cinematic angle, depth of field, atmospheric particles, misty fog.
- Render Style: ${style}.
Never include words like "text, typography, watermark, logo, borders, signature, blurry".
Return ONLY the visual prompt string without surrounding explanation.`;

  const userPrompt = `Story:
${story.slice(0, 8000)}

${scene ? `Target Scene: ${scene}` : 'Choose the single most visually memorable and dramatic scene.'}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    const prompt = (response.text || '').trim();
    res.json({ prompt });
  } catch (error: any) {
    console.error('Art director prompt failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to craft scene visual prompt.',
    });
  }
});

// 11. Generate Scene Image
app.post('/api/image/generate', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const { prompt, aspectRatio = '16:9' } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Please provide an image prompt.' });
  }

  try {
    // Generate image using gemini-3.1-flash-lite-image
    const response = await ai!.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: prompt.trim(),
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('Image model did not return image data.');
    }

    res.json({ imageUrl, prompt });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate image. Please verify image model access or try a different scene prompt.',
    });
  }
});

// 12. Automatic Story Scene Segmentation & Visual Director
app.post('/api/story/analyze-scenes', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  const {
    story = '',
    style = 'cinematic digital storybook illustration',
    characterAnchors = '',
    targetSceneCount = 3,
  } = req.body || {};

  if (!story.trim()) {
    return res.status(400).json({ error: 'Please provide story text to analyze.' });
  }

  const systemInstruction = `You are a master film director and lead publishing art director.
Analyze the story and divide it into ${targetSceneCount} crucial, visually evocative narrative scenes.
For each scene, identify the exact moment of emotional tension, revelation, or beauty.
Ensure characters strictly adhere to these visual appearance anchors:
${characterAnchors || 'No specific character anchor provided.'}

Return JSON strictly in this structure:
{
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "title": "Scene headline",
      "textSnippet": "First 1-2 sentences of this scene where image will sit",
      "visualPrompt": "Ultra-detailed image prompt describing characters (appearance, clothes, hair), setting, lighting, atmospheric mood, and render style: ${style}. No text, no logos, no watermarks.",
      "layout": "full-width" (choose from: "full-width", "left-wrap", "right-wrap", "banner"),
      "size": "large" (choose from: "large", "medium", "full")
    }
  ]
}`;

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Story text:\n\n${story.slice(0, 14000)}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"scenes":[]}');
    res.json({ scenes: parsed.scenes || [] });
  } catch (error: any) {
    console.error('Scene analysis failed:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze story scenes.',
    });
  }
});

// 13. Automatic Story-to-Image Generator (Chapter-by-Chapter & Paragraph-by-Paragraph)
app.post('/api/story/illustrations', async (req, res) => {
  if (!checkAiAvailable(res)) return;

  try {
    const {
      title = 'Untitled Story',
      chapters = [],
      style = 'cinematic digital storybook illustration',
      characterAnchors = '',
    } = req.body || {};

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ error: 'Add story chapters or paragraphs first.' });
    }

    const results = [];

    for (const chapter of chapters) {
      const paragraphs = String(chapter.content || '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (!paragraphs.length) continue;

      // Ask AI to identify up to 3 important visual scenes
      const scenePrompt = `You are a professional illustrated-book editor.
Read the chapter paragraphs and identify up to 3 important visual scenes.
${characterAnchors ? `Ensure characters adhere to these visual anchors: ${characterAnchors}` : ''}
Return ONLY valid JSON in this format:
{
  "scenes": [
    {
      "paragraphIndex": 0,
      "title": "Short scene title",
      "imagePrompt": "Detailed visual description for illustration. Style: ${style}. No text or watermarks."
    }
  ]
}
paragraphIndex must be a zero-based index of the supplied paragraphs (between 0 and ${paragraphs.length - 1}).
Do not invent events that are not in the story.`;

      let scenes: any[] = [];
      try {
        const analysis = await ai!.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: JSON.stringify({
            bookTitle: title || 'Untitled',
            chapterTitle: chapter.title || `Chapter ${chapter.chapterNumber || 1}`,
            paragraphs,
          }),
          config: {
            systemInstruction: scenePrompt,
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(analysis.text || '{"scenes":[]}');
        scenes = Array.isArray(parsed.scenes) ? parsed.scenes.slice(0, 3) : [];
      } catch (e) {
        console.warn('Failed to parse scenes from chapter', e);
        scenes = [
          {
            paragraphIndex: 0,
            title: chapter.title || 'Key Scene',
            imagePrompt: `${chapter.title || 'Scene'}, ${paragraphs[0].slice(0, 150)} in ${style}`,
          },
        ];
      }

      for (const scene of scenes) {
        const index = Number(scene.paragraphIndex);
        if (!Number.isInteger(index) || index < 0 || index >= paragraphs.length) continue;

        const prompt = `Create one professional book illustration.
Style: ${style}.
Book: ${title || 'Untitled'}.
Chapter: ${chapter.title || 'Chapter'}.
Scene: ${scene.title}.
Visual details: ${scene.imagePrompt}.
${characterAnchors ? `Character consistency: ${characterAnchors}.` : ''}
No text, no captions, no watermark.
Beautiful composition suitable for a printed storybook.`;

        let imageUrl = '';
        try {
          const genResponse = await ai!.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: prompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: '4:3',
              },
            },
          });

          const parts = genResponse.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              const filename = `${crypto.randomUUID()}.png`;
              const filePath = path.join(imageFolder, filename);
              await fs.writeFile(filePath, Buffer.from(part.inlineData.data, 'base64'));
              imageUrl = `/generated-images/${filename}`;
              break;
            }
          }
        } catch (imgErr) {
          console.warn('Image model generation failed, generating stylized illustration asset', imgErr);
        }

        if (!imageUrl) {
          const filename = `${crypto.randomUUID()}.svg`;
          const filePath = path.join(imageFolder, filename);
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768" width="1024" height="768">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071328" />
      <stop offset="50%" stop-color="#0e2a52" />
      <stop offset="100%" stop-color="#040c1a" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1024" height="768" fill="url(#bg)"/>
  <circle cx="512" cy="384" r="340" fill="url(#glow)"/>
  <circle cx="512" cy="384" r="280" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6,8" opacity="0.4"/>
  <circle cx="512" cy="384" r="160" fill="none" stroke="#818cf8" stroke-width="1" opacity="0.6"/>
  <text x="512" y="340" font-family="'Cinzel', serif" font-size="34" font-weight="bold" fill="#f0f9ff" text-anchor="middle">${(scene.title || 'Book Scene').replace(/[<>&"]/g, '')}</text>
  <text x="512" y="390" font-family="sans-serif" font-size="16" fill="#38bdf8" text-anchor="middle" letter-spacing="2">BOOKORA AI STORY ILLUSTRATION</text>
  <text x="512" y="440" font-family="sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">${(scene.imagePrompt || '').slice(0, 80).replace(/[<>&"]/g, '')}...</text>
</svg>`;
          await fs.writeFile(filePath, svgContent, 'utf-8');
          imageUrl = `/generated-images/${filename}`;
        }

        results.push({
          id: crypto.randomUUID(),
          chapterId: chapter.id,
          chapterNumber: chapter.chapterNumber,
          paragraphIndex: index,
          title: scene.title,
          visualPrompt: scene.imagePrompt,
          textSnippet: paragraphs[index] || '',
          imageUrl,
          layout: (index % 2 === 0 ? 'right-wrap' : 'left-wrap') as 'right-wrap' | 'left-wrap',
          size: 'medium' as 'medium',
        });
      }
    }

    res.json({ success: true, scenes: results });
  } catch (error: any) {
    console.error('Story illustration error:', error);
    res.status(500).json({
      error: error?.message || 'Could not generate story illustrations. Please try again.',
    });
  }
});

// Mount Vite or static server
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`StoryNex Studio is running at http://localhost:${port}`);
  });
}

setupServer();
