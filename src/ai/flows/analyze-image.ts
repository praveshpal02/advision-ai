'use server';

/**
 * @fileOverview Analyzes an image using Gemini Vision via Genkit to extract colors, style, layout, and text elements.
 *
 * - analyzeImageFlow - A function that analyzes the image and returns the analysis.
 * - AnalyzeImageInput - The input type for the analyzeImageFlow function.
 * - AnalyzeImageOutput - The return type for the analyzeImageFlow function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
// import { analyzeImage } from '@/services/vision'; // No longer using the separate service

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an ad, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  colors: z.object({
      primary: z.string().optional().describe('Primary color found in the image (hex code).'),
      secondary: z.string().optional().describe('Secondary color found in the image (hex code).'),
      background: z.string().optional().describe('Background color found in the image (hex code).'),
      palette: z.array(z.string()).describe('Dominant colors found in the image, as hex codes.'),
  }).describe("Extracted color information."),
  styleKeywords: z
    .array(z.string())
    .describe('Keywords describing the style of the image (e.g., \'modern\', \'vintage\', \'minimalist\').'),
  fontStyle: z.string().optional().describe('General description of the font style used (e.g., sans-serif, bold, modern).'),
  layoutStyle: z.string().optional().describe('Description of the overall layout style (e.g., centered, asymmetrical).'),
  textElements: z.object({
      headline: z.string().optional().describe('Detected headline text.'),
      subheadline: z.string().optional().describe('Detected subheadline text.'),
      cta: z.string().optional().describe('Detected call-to-action button text.'),
  }).describe("Extracted text elements from the ad."),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;


const analysisPrompt = ai.definePrompt({
    name: 'analyzeAdImagePrompt',
    input: { schema: AnalyzeImageInputSchema },
    output: { schema: AnalyzeImageOutputSchema },
    prompt: `Analyze this advertisement image meticulously. Extract the following details and provide them in the specified JSON format:

1.  **Color Palette:** Identify the primary, secondary, and background colors. Also list up to 5 dominant colors overall as hex codes.
2.  **Font Style:** Describe the general style of the fonts used (e.g., 'Clean sans-serif', 'Bold serif', 'Handwritten script', 'Modern geometric').
3.  **Layout Style:** Describe the overall layout structure (e.g., 'Centered composition with prominent image', 'Asymmetrical layout with text overlay', 'Grid-based structure').
4.  **Text Elements:** Extract the main headline, subheadline (if present), and call-to-action (CTA) button text (if present). If an element is not clearly identifiable, omit its field or set it to null.
5.  **Style Keywords:** Provide 3-5 keywords describing the overall visual style (e.g., 'modern', 'minimalist', 'bold', 'playful', 'corporate', 'vintage').

Image to analyze:
{{media url=photoDataUri}}

Respond *only* with the JSON object matching the output schema. Ensure hex codes start with '#'.`,
    model: 'googleai/gemini-1.5-flash', // Ensure a vision-capable model is used
    outputFormat: 'json',
});


const analyzeImageFlow = ai.defineFlow<
  typeof AnalyzeImageInputSchema,
  typeof AnalyzeImageOutputSchema
>({
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

        // Ensure the output structure matches the schema, especially nested objects
        const validatedOutput: AnalyzeImageOutput = {
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

// Wrapper remains the same
export async function analyzeImageWrapper(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}
