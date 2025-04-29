
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

// Refined input schema including size and number of variations
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
  numberOfVariations: z.number().int().min(1).max(10).describe('The number of visual ad variations to generate (1-10).'),
  width: z.number().int().positive().describe('The target width of the generated ad in pixels.'),
  height: z.number().int().positive().describe('The target height of the generated ad in pixels.'),
});
export type GenerateVisualAdInput = z.infer<typeof GenerateVisualAdInputSchema>;


const GenerateVisualAdOutputSchema = z.object({
  generatedAdVariations: z.array(z.string().url().or(z.string().startsWith('data:image/'))).describe('An array of generated ad image variations (data URIs or URLs).'),
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
      numberOfVariations: z.number().int().min(1).max(10).describe('The number of visual ad variations to generate (1-10).'),
      width: z.number().int().positive().describe('The target width of the generated ad in pixels.'),
      height: z.number().int().positive().describe('The target height of the generated ad in pixels.'),
      imageAnalysisResult: z.object({
        colors: z.array(z.string()).describe('Dominant colors found in the image, as hex codes.'),
        styleKeywords: z.array(z.string()).describe('Keywords describing the style of the image.'),
        fontName: z.string().optional().describe('Font name used in the image, if detectable.'),
      }).optional(),
    }),
  },
  output: {
     // Define the expected output structure
     schema: z.object({
        generatedAdVariations: z.array(z.string().url().or(z.string().startsWith('data:image/')))
          .describe('An array containing exactly the requested number of generated ad image variations (as data URIs or URLs).'),
      }),
    // Ensure the model knows to generate the specified number of variations
    // and output them in the correct format.
    // TODO: Update this prompt to use a real image generation model (like DALL-E or Stable Diffusion)
    // and specify size, count, and output format (e.g., data URI or URL).
    // The current prompt is illustrative and won't actually generate images.
    // It needs to be adapted based on the specific image generation API used.
    // For example, if using DALL-E API, you might structure the request differently.
    prompt: `You are an expert ad designer using an image generation model. Generate exactly {{{numberOfVariations}}} visual ad variations based on the following information:

Reference Ad Image: {{media url=referenceAdImage}}

Brand Colors: {{brandColors}}
Brand Style Words: {{brandStyleWords}}
Target Audience: {{targetAudience}}
Output Format: {{outputFormat}}
Target Size: {{width}}px width x {{height}}px height

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

Generate {{{numberOfVariations}}} distinct ad visuals adhering to the brand guidelines, target audience, format, and size. Each variation should be creative and effective.

**Output Requirement:** Respond ONLY with a JSON object containing a single key "generatedAdVariations". The value should be an array of exactly {{{numberOfVariations}}} strings. Each string MUST be a valid data URI (starting with 'data:image/...') or a URL pointing to the generated image. Do not include any other text, explanation, or formatting.

Example output structure:
{
  "generatedAdVariations": [
    "data:image/png;base64,...",
    "https://example.com/image2.png",
    "data:image/jpeg;base64,..."
  ]
}
`,
  },
   // Specify the model capable of image generation if different from the default
   // model: 'openai/dall-e-3', // Example: Replace with your chosen image model if needed
   // If using Gemini, ensure it's a multimodal model capable of generation based on prompts/images.
   // config: { // Optional: Add model-specific config like temperature, safety settings etc.
   //   temperature: 0.7,
   // },
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
      // Simulate analysis - replace with actual call if needed here,
      // or rely on the prompt handling the image directly if the model supports it.
      // imageAnalysisResult = await analyzeImage(imageBuffer);
    } catch (error) {
      console.error('Error processing reference ad image for analysis (optional):', error);
      // Proceed without image analysis if there's an error or if analysis is done within the prompt.
    }

    // --- IMPORTANT ---
    // This is where you would call the actual image generation model API.
    // The current `generateVisualAdPrompt` is primarily text-based and simulates the request.
    // You need to replace the following call with the appropriate SDK/API call
    // for your chosen image generation service (e.g., DALL-E, Stable Diffusion, Gemini Image Gen).

    // Example using the defined prompt (which needs adaptation for a real image model):
    console.log("Sending request to visual generation prompt/model...");
    const { output } = await generateVisualAdPrompt({
      ...input,
      // Pass analysis results if available and needed by the prompt/model
      // imageAnalysisResult,
    });
    console.log("Received response from visual generation prompt/model.");


    // --- SIMULATION ---
    // Remove this simulation block when using a real image generation model.
    if (!output?.generatedAdVariations || output.generatedAdVariations.length === 0) {
        console.warn("AI did not return visual variations. Using reference image as fallback simulation.");
         // Fallback simulation: return the reference image 'n' times
         const simulatedOutput: GenerateVisualAdOutput = {
             generatedAdVariations: Array(input.numberOfVariations).fill(input.referenceAdImage)
         };
         return simulatedOutput;
    }
    // --- END SIMULATION ---


    // Validate the output structure and content
    if (!output?.generatedAdVariations || !Array.isArray(output.generatedAdVariations)) {
        console.error("Invalid output structure from visual AI:", output);
        throw new Error("AI returned an invalid response structure for visual ads.");
      }

    if (output.generatedAdVariations.length !== input.numberOfVariations) {
        console.warn(`Visual AI returned ${output.generatedAdVariations.length} variations, but ${input.numberOfVariations} were requested.`);
        // Handle discrepancy if needed, e.g., return only the requested number or throw error.
        // For now, return what was received.
    }

     // Validate each item in the array (basic check for data URI or URL)
     output.generatedAdVariations.forEach((item, index) => {
        if (typeof item !== 'string' || (!item.startsWith('data:image/') && !item.startsWith('http'))) {
            console.error(`Invalid item at index ${index} in generatedAdVariations:`, item);
            throw new Error(`Visual AI returned an invalid item at index ${index}. Expected data URI or URL.`);
        }
     });


    console.log(`Successfully received ${output.generatedAdVariations.length} visual variations.`);
    return output; // Return the validated output from the AI
  }
);
