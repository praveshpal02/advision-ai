
'use server';
/**
 * @fileOverview Generates a detailed DALL-E prompt for visual ad creation.
 *
 * - generatePrompt - A function that generates a DALL-E prompt.
 * - GeneratePromptInput - The input type for the generatePrompt function.
 * - GeneratePromptOutput - The return type for the generatePrompt function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GeneratePromptInputSchema = z.object({
  brandColors: z.array(z.string()).describe('An array of brand colors (hex codes).'),
  brandStyleWords: z.array(z.string()).describe('An array of style words describing the brand (e.g., playful, luxury, modern).'),
  targetAudience: z.string().describe('Description of the target audience (age, interests).'),
  outputFormat: z.string().describe('The format of the ad (e.g., IG Post, Banner, Email).'),
  promptTweaks: z.string().optional().describe('Optional user instructions to refine the prompt.'),
  referenceText: z.string().optional().describe('Optional text description of a reference ad or desired elements.'),
});
export type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;

const GeneratePromptOutputSchema = z.object({
  dallePrompt: z.string().describe('The generated DALL-E prompt for image creation.'),
});
export type GeneratePromptOutput = z.infer<typeof GeneratePromptOutputSchema>;

export async function generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
  return generatePromptFlow(input);
}

const promptGenerator = ai.definePrompt({
  name: 'generateDallePrompt',
  input: {
    schema: GeneratePromptInputSchema,
  },
  output: {
    schema: GeneratePromptOutputSchema,
  },
  prompt: `You are an AI assistant specialized in crafting highly effective DALL-E prompts for generating advertising visuals. Your goal is to create a single, detailed prompt based on the provided brand guidelines and ad requirements.

Instructions:
1.  **Synthesize Inputs:** Combine the brand colors, style words, target audience description, output format, and any reference text or specific tweaks into a coherent and descriptive prompt.
2.  **Focus on Visuals:** The prompt should describe the desired visual elements, mood, style, and composition of the ad image. Mention key objects, scenes, or concepts.
3.  **Incorporate Brand Identity:** Ensure the prompt reflects the brand's style (e.g., "playful and vibrant", "luxurious and minimalist", "modern and clean") and incorporates the primary brand colors prominently.
4.  **Consider Format:** Subtly tailor the description to the output format (e.g., a vertical composition for an Instagram Story, a wide banner layout).
5.  **Clarity and Detail:** Be specific and provide enough detail for DALL-E to understand the desired outcome. Avoid ambiguity. Use descriptive adjectives.
6.  **Clean Font Style:** Explicitly request a clean, modern, and easily readable font style if text elements are implied or expected in the visual.
7.  **Output:** Respond *only* with the generated DALL-E prompt text within a JSON object with the key "dallePrompt". Do not include explanations or surrounding text.

Brand Information:
-   Colors: {{{json brandColors}}}
-   Style Words: {{{json brandStyleWords}}}
-   Target Audience: {{{targetAudience}}}
-   Output Format: {{{outputFormat}}}
{{#if referenceText}}
-   Reference/Notes: {{{referenceText}}}
{{/if}}
{{#if promptTweaks}}
-   User Tweaks: {{{promptTweaks}}}
{{/if}}

Generate the DALL-E prompt now.
`,
});


const generatePromptFlow = ai.defineFlow<
  typeof GeneratePromptInputSchema,
  typeof GeneratePromptOutputSchema
>({
  name: 'generatePromptFlow',
  inputSchema: GeneratePromptInputSchema,
  outputSchema: GeneratePromptOutputSchema,
}, async input => {
  console.log("Calling prompt generator with input:", input);
  const { output } = await promptGenerator(input);

  if (!output?.dallePrompt) {
    console.error("Failed to generate DALL-E prompt from AI:", output);
    throw new Error("AI failed to generate a valid DALL-E prompt.");
  }

  console.log("Received DALL-E prompt:", output.dallePrompt);
  return output;
});
