'use server';
/**
 * @fileOverview A flow for iterating and refining ad copy based on user instructions.
 *
 * - iterateAdCopy - A function that handles the ad copy iteration process.
 * Imports schemas from `src/types/flow-schemas.js`.
 */

import {ai} from '@/ai/ai-instance';
// Import schemas from the dedicated non-'use server' file
import { IterateAdCopyInputSchema, IterateAdCopyOutputSchema } from '@/types/flow-schemas.js';

// Only export the async wrapper function
export async function iterateAdCopy(input) {
  return iterateAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'iterateAdCopyPrompt',
  input: {
    schema: IterateAdCopyInputSchema, // Use imported schema
  },
  output: {
    schema: IterateAdCopyOutputSchema, // Use imported schema
  },
  prompt: `You are an expert advertising copywriter. Refine the following ad copy based on the user's instructions.

Original Ad Copy: {{{originalAdCopy}}}

Instructions: {{{instructions}}}

Refined Ad Copy:`,
});

const iterateAdCopyFlow = ai.defineFlow({
  name: 'iterateAdCopyFlow',
  inputSchema: IterateAdCopyInputSchema,
  outputSchema: IterateAdCopyOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  if (!output?.refinedAdCopy) {
      console.error('Iteration failed to return refined copy:', output);
      throw new Error('AI failed to refine the ad copy.');
  }
  return output;
});
