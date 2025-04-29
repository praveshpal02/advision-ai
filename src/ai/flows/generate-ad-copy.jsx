'use server';
/**
 * @fileOverview Generates ad copy variations (headline, subheadline, CTA) based on brand guidelines.
 *
 * - generateAdCopy - A function that generates ad copy variations.
 * Imports schemas from `src/types/flow-schemas.js`.
 */

import {ai} from '@/ai/ai-instance';
// Import schemas from the dedicated non-'use server' file
import { GenerateAdCopyInputSchema, GenerateAdCopyOutputSchema } from '@/types/flow-schemas.js';

// Only export the async wrapper function
export async function generateAdCopy(input) {
  return generateAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdCopyPrompt',
  input: {
    schema: GenerateAdCopyInputSchema, // Use the imported schema
  },
  output: {
    schema: GenerateAdCopyOutputSchema, // Use the imported schema
  },
  prompt: `You are an AI copywriter specializing in generating ad copy for various brands and formats. Generate exactly {{{numberOfVariations}}} ad copy variations (each with a headline, subheadline, CTA) based on the following brand guidelines and format:

Brand Style: {{{brandStyle}}}
Colors: {{{colors}}}
Target Audience: {{{targetAudience}}}
Format: {{{format}}}

{{#if referenceText}}
Reference Text: {{{referenceText}}}
{{/if}}

Each variation should be distinct and appeal to the target audience while maintaining the brand's style and color palette. The output should be a JSON array of exactly {{{numberOfVariations}}} ad copy variations, with each variation containing a headline, subheadline, and call to action. Focus on creating compelling and engaging copy that drives conversions. Ensure the copy is appropriate for the specified format.

Output as a JSON object with a single field called "variations", which is an array of objects, each having a "headline", a "subheadline", and a "cta" field. All the fields must be non-empty strings. Ensure the array contains exactly {{{numberOfVariations}}} items.
`,
});

const generateAdCopyFlow = ai.defineFlow({
  name: 'generateAdCopyFlow',
  inputSchema: GenerateAdCopyInputSchema,
  outputSchema: GenerateAdCopyOutputSchema,
}, async input => {
  const {output} = await prompt(input);

  // Basic validation to ensure the output structure is likely correct
  if (!output?.variations || !Array.isArray(output.variations)) {
    console.error("Invalid output structure from AI:", output);
    throw new Error("AI returned an invalid response structure for ad copy.");
  }

  // Ensure the AI returned the requested number of variations (or handle discrepancy)
   if (output.variations.length !== input.numberOfVariations) {
    console.warn(`AI returned ${output.variations.length} variations, but ${input.numberOfVariations} were requested.`);
    // Decide how to handle: throw error, trim, or use what was returned.
    // For now, let's return what we got, the frontend logic handles this.
   }

  return output;
});
