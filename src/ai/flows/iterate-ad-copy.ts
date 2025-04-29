'use server';
/**
 * @fileOverview A flow for iterating and refining ad copy based on user instructions.
 *
 * - iterateAdCopy - A function that handles the ad copy iteration process.
 * - IterateAdCopyInput - The input type for the iterateAdCopy function.
 * - IterateAdCopyOutput - The return type for the iterateAdCopy function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IterateAdCopyInputSchema = z.object({
  originalAdCopy: z.string().describe('The original ad copy to be refined.'),
  instructions: z.string().describe('Specific instructions for refining the ad copy (e.g., Make it more formal).'),
});
export type IterateAdCopyInput = z.infer<typeof IterateAdCopyInputSchema>;

const IterateAdCopyOutputSchema = z.object({
  refinedAdCopy: z.string().describe('The refined ad copy based on the provided instructions.'),
});
export type IterateAdCopyOutput = z.infer<typeof IterateAdCopyOutputSchema>;

export async function iterateAdCopy(input: IterateAdCopyInput): Promise<IterateAdCopyOutput> {
  return iterateAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'iterateAdCopyPrompt',
  input: {
    schema: z.object({
      originalAdCopy: z.string().describe('The original ad copy to be refined.'),
      instructions: z.string().describe('Specific instructions for refining the ad copy (e.g., Make it more formal).'),
    }),
  },
  output: {
    schema: z.object({
      refinedAdCopy: z.string().describe('The refined ad copy based on the provided instructions.'),
    }),
  },
  prompt: `You are an expert advertising copywriter. Refine the following ad copy based on the user's instructions.

Original Ad Copy: {{{originalAdCopy}}}

Instructions: {{{instructions}}}

Refined Ad Copy:`, // No need to HTML-escape here; it's TypeScript, not HTML.
});

const iterateAdCopyFlow = ai.defineFlow<
  typeof IterateAdCopyInputSchema,
  typeof IterateAdCopyOutputSchema
>({
  name: 'iterateAdCopyFlow',
  inputSchema: IterateAdCopyInputSchema,
  outputSchema: IterateAdCopyOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
