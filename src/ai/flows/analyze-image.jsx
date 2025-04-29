'use server';

/**
 * @fileOverview Analyzes an image using Gemini Vision via Genkit to extract colors, style, layout, and text elements.
 *
 * - analyzeImageWrapper - A function that analyzes the image and returns the analysis.
 * Imports schemas from `src/types/flow-schemas.js`.
 */

import { ai } from '@/ai/ai-instance';
// Import schemas from the dedicated non-'use server' file
import { AnalyzeImageInputSchema, AnalyzeImageOutputSchema } from '@/types/flow-schemas.js';


const analysisPrompt = ai.definePrompt({
    name: 'analyzeAdImagePrompt',
    input: { schema: AnalyzeImageInputSchema },
    output: { schema: AnalyzeImageOutputSchema },
    prompt: `Analyze this advertisement image meticulously. Extract the following details and provide them in the specified JSON format:

1.  **Color Palette:** Identify the primary, secondary, and background colors. Also list up to 5 dominant colors overall as hex codes.
2.  **Font Style:** Describe the general style of the fonts used (e.g., 'Clean sans-serif', 'Bold serif', 'Handwritten script', 'Modern geometric').
3.  **Layout Style:** Describe the overall layout structure (e.g., 'Centered composition with prominent image', 'Asymmetrical layout with text overlay', 'Grid-based structure', 'Split layout').
4.  **Text Elements:** Extract the main headline, subheadline (if present), and call-to-action (CTA) button text (if present). If an element is not clearly identifiable, omit its field or set it to null.
5.  **Style Keywords:** Provide 3-5 keywords describing the overall visual style (e.g., 'modern', 'minimalist', 'bold', 'playful', 'corporate', 'vintage', 'gradient').

Image to analyze:
{{media url=photoDataUri}}

Respond *only* with the JSON object matching the output schema. Ensure hex codes start with '#'.`,
    model: 'googleai/gemini-1.5-flash', // Ensure a vision-capable model is used
    outputFormat: 'json',
});


const analyzeImageFlow = ai.defineFlow({
  name: 'analyzeImageFlow',
  inputSchema: AnalyzeImageInputSchema,
  outputSchema: AnalyzeImageOutputSchema,
},
  async (input) => {
    console.log("Analyzing image with Gemini Vision...");
    try {
        const { output } = await analysisPrompt(input);
        if (!output) {
            throw new Error("Image analysis failed to return data.");
        }
        console.log("Image Analysis Result:", output);

        // Basic validation/structuring can still happen here if needed, but rely on schema
        const validatedOutput = {
            colors: {
                primary: output.colors?.primary,
                secondary: output.colors?.secondary,
                background: output.colors?.background,
                palette: output.colors?.palette || [],
            },
            styleKeywords: output.styleKeywords || [],
            fontStyle: output.fontStyle,
            layoutStyle: output.layoutStyle,
            textElements: {
                headline: output.textElements?.headline,
                subheadline: output.textElements?.subheadline,
                cta: output.textElements?.cta,
            }
        };

        return validatedOutput;
    } catch (error) {
        console.error("Error during image analysis flow:", error);
        throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

// Only export the async wrapper function
export async function analyzeImageWrapper(input) {
  return analyzeImageFlow(input);
}
