'use server';
/**
 * @fileOverview AI-powered visual ad generator flow.
 *
 * - generateVisualAd - A function that generates visual ad variations based on reference ad, brand guidelines, and output format.
 * - GenerateVisualAdInput - The input type for the generateVisualAd function.
 * - GenerateVisualAdOutput - The return type for the generateVisualAd function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {analyzeImage, ImageAnalysisResult} from '@/services/vision';

const GenerateVisualAdInputSchema = z.object({
  referenceAdImage: z
    .string()
    .describe(
      "A reference ad image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  brandColors: z.array(z.string()).describe('An array of brand colors (hex codes).'),
  brandStyleWords: z.array(z.string()).describe('An array of style words describing the brand.'),
  targetAudience: z.string().describe('Description of the target audience.'),
  outputFormat: z.string().describe('The desired output format for the ad (e.g., Instagram post, banner, email).'),
  promptTweaks: z.string().optional().describe('Optional prompt tweaks to further refine the ad generation.'),
});
export type GenerateVisualAdInput = z.infer<typeof GenerateVisualAdInputSchema>;

const GenerateVisualAdOutputSchema = z.object({
  generatedAdVariations: z.array(z.string()).describe('An array of generated ad image variations (data URIs).'),
});
export type GenerateVisualAdOutput = z.infer<typeof GenerateVisualAdOutputSchema>;

export async function generateVisualAd(input: GenerateVisualAdInput): Promise<GenerateVisualAdOutput> {
  return generateVisualAdFlow(input);
}

const generateVisualAdPrompt = ai.definePrompt({
  name: 'generateVisualAdPrompt',
  input: {
    schema: z.object({
      referenceAdImage: z
        .string()
        .describe(
          "A reference ad image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      brandColors: z.array(z.string()).describe('An array of brand colors (hex codes).'),
      brandStyleWords: z.array(z.string()).describe('An array of style words describing the brand.'),
      targetAudience: z.string().describe('Description of the target audience.'),
      outputFormat: z.string().describe('The desired output format for the ad (e.g., Instagram post, banner, email).'),
      promptTweaks: z.string().optional().describe('Optional prompt tweaks to further refine the ad generation.'),
      imageAnalysisResult: z.object({
        colors: z.array(z.string()).describe('Dominant colors found in the image, as hex codes.'),
        styleKeywords: z.array(z.string()).describe('Keywords describing the style of the image.'),
        fontName: z.string().optional().describe('Font name used in the image, if detectable.'),
      }).optional(),
    }),
  },
  output: {
    schema: z.object({
      generatedAdVariations: z.array(z.string()).describe('An array of generated ad image variations (data URIs).'),
    }),
  },
  prompt: `You are an expert ad designer. Generate visual ad variations based on the following information:

Reference Ad Image: {{media url=referenceAdImage}}

Brand Colors: {{brandColors}}
Brand Style Words: {{brandStyleWords}}
Target Audience: {{targetAudience}}
Output Format: {{outputFormat}}

{{#if promptTweaks}}
Prompt Tweaks: {{promptTweaks}}
{{/if}}

{{#if imageAnalysisResult}}
  Reference ad Image Analysis:
  Dominant Colors: {{imageAnalysisResult.colors}}
  Style Keywords: {{imageAnalysisResult.styleKeywords}}
  {{#if imageAnalysisResult.fontName}}
  Font Name: {{imageAnalysisResult.fontName}}
  {{/if}}
{{/if}}


Generate 3 different ad variations as data URIs.

Output:
`,
});

const generateVisualAdFlow = ai.defineFlow<
  typeof GenerateVisualAdInputSchema,
  typeof GenerateVisualAdOutputSchema
>(
  {
    name: 'generateVisualAdFlow',
    inputSchema: GenerateVisualAdInputSchema,
    outputSchema: GenerateVisualAdOutputSchema,
  },
  async input => {
    // Analyze the reference ad image to extract additional information.
    let imageAnalysisResult: ImageAnalysisResult | undefined;
    try {
      const imageBuffer = Buffer.from(input.referenceAdImage.split(',')[1], 'base64');
      imageAnalysisResult = await analyzeImage(imageBuffer);
    } catch (error) {
      console.error('Error analyzing reference ad image:', error);
      // Proceed without image analysis if there's an error.
    }

    const {output} = await generateVisualAdPrompt({
      ...input,
      imageAnalysisResult,
    });
    return output!;
  }
);
