
'use server';
/**
 * @fileOverview AI-powered visual ad generator flow using DALL-E 3.
 *
 * - generateVisualAd - A function that generates visual ad variations based on reference ad, brand guidelines, and output format.
 * - GenerateVisualAdInput - The input type for the generateVisualAd function.
 * - GenerateVisualAdOutput - The return type for the generateVisualAd function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import OpenAI from 'openai';
import { generatePrompt } from '@/ai/flows/generate-visual-prompt'; // Import the prompt generation flow


// Refined input schema including OpenAI API key
const GenerateVisualAdInputSchema = z.object({
  referenceAdImage: z
    .string()
    .optional() // Make reference optional, as we generate from text prompt
    .describe(
      "A reference ad image (optional), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Used for style analysis if available."
    ),
  openaiApiKey: z.string().optional().describe('The OpenAI API Key for using DALL-E.'),
  brandColors: z.array(z.string()).describe('An array of brand colors (hex codes).'),
  brandStyleWords: z.array(z.string()).describe('An array of style words describing the brand.'),
  targetAudience: z.string().describe('Description of the target audience.'),
  outputFormat: z.string().describe('The desired output format for the ad (e.g., Instagram post, banner, email).'),
  promptTweaks: z.string().optional().describe('Optional prompt tweaks to further refine the ad generation.'),
  numberOfVariations: z.number().int().min(1).max(10).default(1).describe('The number of visual ad variations to generate (1-10, DALL-E 3 currently supports 1 per call).'),
  width: z.number().int().positive().describe('The target width of the generated ad in pixels.'),
  height: z.number().int().positive().describe('The target height of the generated ad in pixels.'),
});
export type GenerateVisualAdInput = z.infer<typeof GenerateVisualAdInputSchema>;


const GenerateVisualAdOutputSchema = z.object({
  // DALL-E typically returns URLs or base64 encoded images
  generatedAdVariations: z.array(z.string().url().or(z.string().startsWith('data:image/'))).describe('An array of generated ad image variations (data URIs or URLs).'),
});
export type GenerateVisualAdOutput = z.infer<typeof GenerateVisualAdOutputSchema>;

// Helper function to get DALL-E compatible size string
const getDalleSize = (width: number, height: number): "1024x1024" | "1792x1024" | "1024x1792" => {
    // Find the closest supported DALL-E 3 size.
    // This is a simple heuristic, might need refinement.
    const aspectRatio = width / height;
    if (aspectRatio > 1.3) return "1792x1024"; // Wider
    if (aspectRatio < 0.7) return "1024x1792"; // Taller
    return "1024x1024"; // Square-ish
};


export async function generateVisualAd(input: GenerateVisualAdInput): Promise<GenerateVisualAdOutput> {
    console.log("Starting generateVisualAd flow...");

    if (!input.openaiApiKey) {
        throw new Error("OpenAI API Key is required for visual ad generation.");
    }

    const openai = new OpenAI({
        apiKey: input.openaiApiKey,
    });

    // --- Generate the DALL-E Prompt ---
    console.log("Generating DALL-E prompt...");
    let dallePromptText = "";
    try {
        const promptResult = await generatePrompt({
             brandColors: input.brandColors,
             brandStyleWords: input.brandStyleWords,
             targetAudience: input.targetAudience,
             outputFormat: input.outputFormat,
             promptTweaks: input.promptTweaks,
             // Include reference text if available and relevant for the prompt
             referenceText: input.referenceAdImage ? "Visual style inspired by the uploaded reference image." : undefined,
        });
        dallePromptText = promptResult.dallePrompt;
        console.log("Generated DALL-E Prompt:", dallePromptText);
    } catch (error) {
        console.error("Error generating DALL-E prompt:", error);
        throw new Error(`Failed to generate DALL-E prompt: ${error instanceof Error ? error.message : String(error)}`);
    }

    // --- Generate Images with DALL-E ---
    const dalleSize = getDalleSize(input.width, input.height);
    const generatedImages: string[] = [];

    // DALL-E 3 currently generates one image per API call.
    // We need to make multiple calls if numberOfVariations > 1.
    const numVariationsToGenerate = Math.min(input.numberOfVariations, 10); // Ensure max 10

    console.log(`Generating ${numVariationsToGenerate} visual variations using DALL-E 3...`);

    for (let i = 0; i < numVariationsToGenerate; i++) {
        console.log(`Generating variation ${i + 1}...`);
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: dallePromptText, // Use the generated prompt
                n: 1, // Generate one image at a time
                size: dalleSize,
                response_format: "b64_json", // Get base64 encoded image data
                // style: 'vivid', // or 'natural' - optional style preference
                // quality: 'hd', // or 'standard' - optional quality preference
            });

            // Add slight variation to prompt for subsequent calls if desired
            if (i < numVariationsToGenerate - 1) {
                dallePromptText += ` (variation ${i + 2})`; // Simple way to potentially get different results
            }


            const b64Json = response.data[0]?.b64_json;
            if (b64Json) {
                // Prepend the necessary data URI prefix
                generatedImages.push(`data:image/png;base64,${b64Json}`);
                console.log(`Variation ${i + 1} generated successfully.`);
            } else {
                console.warn(`DALL-E response for variation ${i + 1} did not contain b64_json.`);
                // Optionally handle missing image (e.g., push a placeholder or skip)
            }
        } catch (error: any) {
            console.error(`Error generating image variation ${i + 1} with DALL-E:`, error);
            // Decide how to handle partial failure: continue, throw, return partial results?
             if (error.response) {
                console.error('DALL-E API Error Status:', error.response.status);
                console.error('DALL-E API Error Data:', error.response.data);
              }
            // For now, let's throw if any variation fails to ensure caller knows
            throw new Error(`Failed to generate image variation ${i + 1}: ${error.message || 'Unknown DALL-E error'}`);
        }
    }


    if (generatedImages.length === 0) {
        throw new Error("No images were successfully generated by DALL-E.");
    }

    console.log(`Successfully generated ${generatedImages.length} visual variations.`);
    return { generatedAdVariations: generatedImages };
}

// Define the flow using the main function directly
const generateVisualAdFlow = ai.defineFlow<
  typeof GenerateVisualAdInputSchema,
  typeof GenerateVisualAdOutputSchema
>(
  {
    name: 'generateVisualAdFlow',
    inputSchema: GenerateVisualAdInputSchema,
    outputSchema: GenerateVisualAdOutputSchema,
  },
  generateVisualAd // Pass the async function directly
);


// Optional: If you still need the wrapper function structure
// export async function generateVisualAdWrapper(input: GenerateVisualAdInput): Promise<GenerateVisualAdOutput> {
//   return generateVisualAdFlow(input);
// }
