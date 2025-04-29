// This file is machine-generated - changes may be lost.
'use server';
/**
 * @fileOverview Generates ad copy variations (headline, subheadline, CTA) based on brand guidelines.
 *
 * - generateAdCopy - A function that generates ad copy variations.
 * - GenerateAdCopyInput - The input type for the generateAdCopy function.
 * - GenerateAdCopyOutput - The return type for the generateAdCopy function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAdCopyInputSchema = z.object({
  brandStyle: z.string().describe('Style words describing the brand (e.g., playful, luxury, modern).'),
  colors: z.array(z.string()).describe('Color palette of the brand (as hex codes).'),
  targetAudience: z.string().describe('Description of the target audience (age, interests).'),
  format: z.string().describe('The format of the ad (e.g., IG Post, Banner, Email).'),
  referenceText: z.string().optional().describe('Optional text description of the ad.'),
});
export type GenerateAdCopyInput = z.infer<typeof GenerateAdCopyInputSchema>;

const AdCopySchema = z.object({
  headline: z.string().describe('The main headline of the ad.'),
  subheadline: z.string().describe('The subheadline of the ad.'),
  cta: z.string().describe('The call to action for the ad.'),
});

const GenerateAdCopyOutputSchema = z.object({
  variations: z.array(AdCopySchema).describe('An array of ad copy variations.'),
});
export type GenerateAdCopyOutput = z.infer<typeof GenerateAdCopyOutputSchema>;

export async function generateAdCopy(input: GenerateAdCopyInput): Promise<GenerateAdCopyOutput> {
  return generateAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdCopyPrompt',
  input: {
    schema: z.object({
      brandStyle: z.string().describe('Style words describing the brand (e.g., playful, luxury, modern).'),
      colors: z.array(z.string()).describe('Color palette of the brand (as hex codes).'),
      targetAudience: z.string().describe('Description of the target audience (age, interests).'),
      format: z.string().describe('The format of the ad (e.g., IG Post, Banner, Email).'),
      referenceText: z.string().optional().describe('Optional text description of the ad.'),
    }),
  },
  output: {
    schema: z.object({
      variations: z.array(z.object({
        headline: z.string().describe('The main headline of the ad.'),
        subheadline: z.string().describe('The subheadline of the ad.'),
        cta: z.string().describe('The call to action for the ad.'),
      })).describe('An array of ad copy variations.'),
    }),
  },
  prompt: `You are an AI copywriter specializing in generating ad copy for various brands and formats. Generate 3 ad copy variations (headline, subheadline, CTA) based on the following brand guidelines and format:

Brand Style: {{{brandStyle}}}
Colors: {{{colors}}}
Target Audience: {{{targetAudience}}}
Format: {{{format}}}

{{#if referenceText}}
Reference Text: {{{referenceText}}}
{{/if}}

Each variation should be distinct and appeal to the target audience while maintaining the brand's style and color palette. The output should be a JSON array of ad copy variations, with each variation containing a headline, subheadline, and call to action. Focus on creating compelling and engaging copy that drives conversions. Ensure the copy is appropriate for the specified format.

Output as a JSON object with a single field called "variations", which is an array of objects, each having a "headline", a "subheadline", and a "cta" field.  All the fields must be non-empty strings.
`,
});

const generateAdCopyFlow = ai.defineFlow<
  typeof GenerateAdCopyInputSchema,
  typeof GenerateAdCopyOutputSchema
>({
  name: 'generateAdCopyFlow',
  inputSchema: GenerateAdCopyInputSchema,
  outputSchema: GenerateAdCopyOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
