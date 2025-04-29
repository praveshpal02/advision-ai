'use server';
/**
 * @fileOverview Generates a detailed DALL-E prompt for visual ad creation, incorporating analysis and copy generation results, and aiming for a specific style like beam.new.
 *
 * - generatePrompt - A function that generates a DALL-E prompt.
 * Imports schemas from `src/types/flow-schemas.js`.
 */

import { ai } from '@/ai/ai-instance';
// Import schemas from the dedicated non-'use server' file
import { GeneratePromptInputSchema, GeneratePromptOutputSchema } from '@/types/flow-schemas.js';

// Only export the async wrapper function
export async function generatePrompt(input) {
  return generatePromptFlow(input);
}

const promptGenerator = ai.definePrompt({
  name: 'generateDallePrompt',
  input: {
    schema: GeneratePromptInputSchema, // Use imported schema
  },
  output: {
    schema: GeneratePromptOutputSchema, // Use imported schema
  },
  prompt: `You are an AI assistant specialized in crafting highly effective DALL-E prompts for generating advertising visuals. Create a single, detailed prompt based on the provided information, aiming for a style similar to modern tech ads like those seen on beam.new.

Instructions:
1.  **Target Style:** Generate a visual with a clean, modern, professional aesthetic, similar to ads on beam.new. This often involves minimalist layouts, bold sans-serif typography, high-quality product or abstract imagery, and potentially subtle gradients.
2.  **Synthesize Inputs:** Combine brand colors, style words, target audience, output format, analysis results, generated copy, and tweaks into a coherent visual description reflecting the target style.
3.  **Prioritize Generated Copy:** Use the provided 'copyElements' (headline, subheadline, CTA) as the primary text content for the ad visual. If not provided, fall back to analyzed text, then generate generic placeholders if necessary. Ensure text is integrated naturally within the design.
4.  **Use Analysis for Style:** Leverage 'analyzedData' (layoutStyle, fontStyle) to inform the structure and typography, adapting it towards the modern/beam.new aesthetic. If not provided, infer from brandStyleWords and outputFormat, defaulting to clean and minimalist.
5.  **Visual Focus:** Describe the desired visual elements (e.g., abstract shapes, product mockup, clean background), mood (professional, innovative), composition (often centered or clean split), and key objects/scenes. Incorporate the brand's primary colors ({{{json brandColors}}}) prominently but tastefully, perhaps in gradients or accents. Apply brand style words ({{{json brandStyleWords}}}) within the target aesthetic.
6.  **Format Adaptation:** Tailor the description to the '{{{outputFormat}}}' (e.g., vertical for Story, wide for Banner).
7.  **Typography:** Request sharp, legible, modern sans-serif typography (like Helvetica, Inter, or Arial). Specify the exact text for headline, subheadline, and CTA using the prioritized source (copyElements > analyzedData.textElements). Ensure text is clear, well-integrated, and not distorted.
8.  **Clarity & Detail:** Be specific. Use descriptive adjectives (e.g., "sleek", "minimalist", "vibrant gradient"). Mention placement of elements if suggested by layout style or the beam.new aesthetic (e.g., "centered text block", "CTA button bottom right").
9.  **Output:** Respond *only* with the generated DALL-E prompt text within a JSON object with the key "dallePrompt". Do not include explanations or surrounding text.

Brand & Ad Information:
-   Brand Colors: {{{json brandColors}}}
-   Brand Style Words: {{{json brandStyleWords}}}
-   Target Audience: {{{targetAudience}}}
-   Output Format: {{{outputFormat}}}

{{#if analyzedData}}
Analysis Insights:
    {{#if analyzedData.layoutStyle}}- Layout Style: {{{analyzedData.layoutStyle}}}{{/if}}
    {{#if analyzedData.fontStyle}}- Font Style: {{{analyzedData.fontStyle}}}{{/if}}
    {{#if analyzedData.textElements}}
    - Analyzed Headline: {{{analyzedData.textElements.headline}}}
    - Analyzed Subheadline: {{{analyzedData.textElements.subheadline}}}
    - Analyzed CTA: {{{analyzedData.textElements.cta}}}
    {{/if}}
    {{#if analyzedData.colors}}
    - Analyzed Colors: Primary: {{{analyzedData.colors.primary}}}, Secondary: {{{analyzedData.colors.secondary}}}, Background: {{{analyzedData.colors.background}}}
    {{/if}}
{{/if}}

{{#if copyElements}}
Generated Copy (Use this text):
-   Headline: "{{{copyElements.headline}}}"
-   Subheadline: "{{{copyElements.subheadline}}}"
-   CTA: "{{{copyElements.cta}}}"
{{/if}}

{{#if promptTweaks}}
-   User Tweaks: {{{promptTweaks}}}
{{/if}}

Generate the DALL-E prompt now. Ensure it explicitly includes the headline "{{#if copyElements}}{{{copyElements.headline}}}{{#else}}{{#if analyzedData}}{{#if analyzedData.textElements.headline}}{{{analyzedData.textElements.headline}}}{{#else}}Compelling Headline{{/if}}{{/if}}{{#unless analyzedData}}Compelling Headline{{/unless}}{{/if}}", subheadline "{{#if copyElements}}{{{copyElements.subheadline}}}{{#else}}{{#if analyzedData}}{{#if analyzedData.textElements.subheadline}}{{{analyzedData.textElements.subheadline}}}{{#else}}Engaging Subheadline{{/if}}{{/if}}{{#unless analyzedData}}Engaging Subheadline{{/unless}}{{/if}}", and CTA "{{#if copyElements}}{{{copyElements.cta}}}{{#else}}{{#if analyzedData}}{{#if analyzedData.textElements.cta}}{{{analyzedData.textElements.cta}}}{{#else}}Call to Action{{/if}}{{/if}}{{#unless analyzedData}}Call to Action{{/unless}}{{/if}}" with clear, modern sans-serif typography, fitting the beam.new-inspired aesthetic.
`,
});


const generatePromptFlow = ai.defineFlow(
  {
    name: 'generatePromptFlow',
    inputSchema: GeneratePromptInputSchema,
    outputSchema: GeneratePromptOutputSchema,
  },
  async (input) => {
    console.log("Calling DALL-E prompt generator with input:", JSON.stringify(input, null, 2));
    const { output } = await promptGenerator(input);

    if (!output?.dallePrompt) {
      console.error("Failed to generate DALL-E prompt from AI:", output);
      throw new Error("AI failed to generate a valid DALL-E prompt.");
    }

    console.log("Received DALL-E prompt:", output.dallePrompt);
    // Basic check for placeholders which might indicate missing input propagation
    if (output.dallePrompt.includes("Compelling Headline") || output.dallePrompt.includes("Engaging Subheadline")) {
        console.warn("DALL-E prompt contains placeholder text. Check if copy/analysis data was provided correctly.");
    }
    return output;
  }
);
