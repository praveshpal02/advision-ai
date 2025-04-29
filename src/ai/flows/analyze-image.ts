'use server';

/**
 * @fileOverview Analyzes an image and extracts information about its colors, style, and fonts.
 *
 * - analyzeImageFlow - A function that analyzes the image and returns the analysis.
 * - AnalyzeImageInput - The input type for the analyzeImageFlow function.
 * - AnalyzeImageOutput - The return type for the analyzeImageFlow function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {analyzeImage} from '@/services/vision';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an ad, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  colors: z.array(z.string()).describe('Dominant colors found in the image, as hex codes.'),
  styleKeywords: z
    .array(z.string())
    .describe('Keywords describing the style of the image (e.g., \'modern\', \'vintage\').'),
  fontName: z.string().optional().describe('Font name used in the image, if detectable.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImageFlow(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  // Convert the data URI to a Buffer
  const base64String = input.photoDataUri.split(',')[1];
  const imageBuffer = Buffer.from(base64String, 'base64');

  // Analyze the image using the vision service
  const analysisResult = await analyzeImage(imageBuffer);

  return {
    colors: analysisResult.colors,
    styleKeywords: analysisResult.styleKeywords,
    fontName: analysisResult.fontName,
  };
}

const analyzeImageDef = ai.defineFlow<
  typeof AnalyzeImageInputSchema,
  typeof AnalyzeImageOutputSchema
>({
  name: 'analyzeImageDef',
  inputSchema: AnalyzeImageInputSchema,
  outputSchema: AnalyzeImageOutputSchema,
},
  async input => {
    return analyzeImageFlow(input);
  }
);

export async function analyzeImageWrapper(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageDef(input);
}
