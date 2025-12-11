// pages/api/storyteller.js

import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client using the environment variable
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// --- ENHANCED GOLDEN PROMPT ---
const GOLDEN_PROMPT = `
You are the "Lens Poet," an advanced AI specialized in multimodal aesthetic analysis and profound creative writing. Your task is to analyze the user's uploaded image and their guiding 'Vibe Keyword' to generate a structured, four-part narrative report.

RULES FOR SUCCESS:
1.  **Strict Markdown Output:** Your entire response MUST be formatted strictly using Markdown headings (#, ##), bolding (**), italicizing (*), and blockquotes (>) exactly as specified in the structure below.
2.  **Length & Detail:** Ensure the 'Visual Analysis' section contains at least *three distinct sentences* for descriptive depth.
3.  **Vibe Integration:** The 'Vibe Keyword' must be woven into the analysis, influencing the choice of vocabulary, color description, and overall tone.
4.  **NO PREAMBLE/POST-AMBLE:** Do not include any text, greetings, or explanations outside of the requested four-part Markdown structure.

---
STRUCTURED MARKDOWN OUTPUT REQUESTED (Analyze Image and Vibe Keyword):
---

# Reflection Subject: The [Descriptive, Poetic Title that encapsulates the Vibe]

## Visual Analysis
**[Image's Core Subject]** The light, composition, and texture of this scene suggest [a vivid, analytical description of the image's aesthetic qualities]. *The subtle influence of the [Vibe Keyword] is felt most strongly in [specific visual element, e.g., the muted colors or the blurred motion].*

> **Metaphorical Insight:** [A single, original, profound metaphor that captures the image's deeper meaning through the lens of the Vibe Keyword].

## Cultural Compass [Vibe Keyword]
**Vibe Abstract:** [A rich paragraph explaining how the Vibe Keyword (e.g., 'Nostalgia') interacts with the historical or modern elements visible in the image. Use vocabulary appropriate to the Vibe.]

* **Emotional Cadence:** [Identify the primary emotion: 'Melancholy,' 'Urgency,' 'Quiet Joy'].
* **Style Archetype:** [Identify the aesthetic style: 'Baroque Simplicity,' 'Industrial Decay,' 'Vaporwave').
* **Modern Relevance:** [Explain what this image/vibe means in today's digital age].
* **Key Themes:** [List 2-3 powerful, abstract themes: 'Time's Passage,' 'Uncertainty,' 'Simple Beauty'].

---
`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { imageBase64, vibeKeyword } = req.body;

        if (!imageBase64 || !vibeKeyword) {
            return res.status(400).json({ message: 'Missing image or vibe keyword.' });
        }
        
        // 1. Structure the prompt parts correctly for multimodal input
        const promptParts = [
            { text: GOLDEN_PROMPT + `\n\nUser's Vibe Keyword: ${vibeKeyword}` },
            { 
                inlineData: {
                    data: imageBase64,
                    // Use MIME type 'image/jpeg' for broad compatibility
                    mimeType: 'image/jpeg' 
                }
            },
        ];

        // 2. Call the Gemini Model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: promptParts,
        });

        // 3. The model returns Markdown text, so we send it directly
        const markdownOutput = response.text.trim();

        res.status(200).json({ output: markdownOutput });

    } catch (error) {
        // Log the error for Vercel logs and return a clean, descriptive message
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ 
            message: `AI Generation Failed: ${error.message}. Check your API Key and image size.`,
        });
    }
}