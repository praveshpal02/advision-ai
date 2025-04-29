/**
 * @fileOverview Zod schemas for Genkit flow inputs and outputs.
 * Separated from flow files to avoid exporting non-async functions from 'use server' modules.
 */
import { z } from 'genkit';
import { AdCopySchema } from '@/types/index'; // Use .ts extension as it exists

// --- Schemas for analyze-image flow ---

export const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an ad, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export const AnalyzeImageOutputSchema = z.object({
  colors: z.object({
      primary: z.string().optional().describe('Primary color found in the image (hex code).'),
      secondary: z.string().optional().describe('Secondary color found in the image (hex code).'),
      background: z.string().optional().describe('Background color found in the image (hex code).'),
      palette: z.array(z.string()).describe('Dominant colors found in the image, as hex codes.'),
  }).describe("Extracted color information."),
  styleKeywords: z
    .array(z.string())
    .describe('Keywords describing the style of the image (e.g., \'modern\', \'vintage\', \'minimalist\').'),
  fontStyle: z.string().optional().describe('General description of the font style used (e.g., sans-serif, bold, modern).'),
  layoutStyle: z.string().optional().describe('Description of the overall layout style (e.g., centered, asymmetrical).'),
  textElements: z.object({
      headline: z.string().optional().describe('Detected headline text.'),
      subheadline: z.string().optional().describe('Detected subheadline text.'),
      cta: z.string().optional().describe('Detected call-to-action button text.'),
  }).optional().describe("Extracted text elements from the ad."), // Made optional as analysis might fail parts
});


// --- Schemas for generate-visual-ad flow ---

export const GenerateVisualAdInputSchema = z.object({
  // referenceAdImage is removed as it's not directly used; analysis data is sufficient.
  openaiApiKey: z.string().min(1, { message: "OpenAI API Key is required." }).describe('The OpenAI API Key for using DALL-E.'),
  brandColors: z.array(z.string()).describe('An array of brand colors (hex codes).'),
  brandStyleWords: z.array(z.string()).describe('An array of style words describing the brand.'),
  targetAudience: z.string().describe('Description of the target audience.'),
  outputFormat: z.string().describe('The desired output format for the ad (e.g., Instagram post, banner, email).'),
  promptTweaks: z.string().optional().describe('Optional prompt tweaks to further refine the ad generation.'),
  numberOfVariations: z.number().int().min(1).max(10).default(1).describe('The number of visual ad variations to generate (1-10, DALL-E 3 currently supports 1 per call).'),
  width: z.number().int().positive().describe('The target width of the generated ad in pixels.'),
  height: z.number().int().positive().describe('The target height of the generated ad in pixels.'),
  // Add complex types for analyzed data and copy elements
  analyzedData: AnalyzeImageOutputSchema.optional().describe('Data extracted from image analysis (layout, font, text).'), // Use the imported schema
  copyElements: AdCopySchema.optional().describe('Generated ad copy elements (headline, subheadline, CTA).'), // Use the imported schema directly
});

export const GenerateVisualAdOutputSchema = z.object({
  // DALL-E typically returns URLs or base64 encoded images
  generatedAdVariations: z.array(z.string().url().or(z.string().startsWith('data:image/'))).describe('An array of generated ad image variations (data URIs or URLs).'),
});

// --- Schemas for generate-ad-copy flow ---

export const GenerateAdCopyInputSchema = z.object({
  brandStyle: z.string().describe('Style words describing the brand (e.g., playful, luxury, modern).'),
  colors: z.array(z.string()).describe('Color palette of the brand (as hex codes).'),
  targetAudience: z.string().describe('Description of the target audience (age, interests).'),
  format: z.string().describe('The format of the ad (e.g., IG Post, Banner, Email).'),
  referenceText: z.string().optional().describe('Optional text description of the ad.'),
  numberOfVariations: z.number().int().min(1).max(10).describe('The number of ad variations to generate (1-10).'),
});

export const GenerateAdCopyOutputSchema = z.object({
  variations: z.array(AdCopySchema).describe('An array of ad copy variations.'),
});


// --- Schemas for generate-visual-prompt flow ---

// Define schema for analyzed data input within the prompt generator input
const AnalyzedDataSchema = z.object({
    fontStyle: z.string().optional().describe('Analyzed font style (e.g., sans-serif, bold).'),
    layoutStyle: z.string().optional().describe('Analyzed layout style (e.g., centered, grid).'),
    textElements: z.object({
        headline: z.string().optional(),
        subheadline: z.string().optional(),
        cta: z.string().optional(),
    }).optional().describe("Analyzed text elements."),
    // Include full colors from analysis if needed, reference AnalyzeImageOutputSchema structure
    colors: AnalyzeImageOutputSchema.shape.colors.optional(),
}).optional();

export const GeneratePromptInputSchema = z.object({
  brandColors: z.array(z.string()).describe('An array of brand colors (hex codes).'),
  brandStyleWords: z.array(z.string()).describe('An array of style words describing the brand (e.g., playful, luxury, modern).'),
  targetAudience: z.string().describe('Description of the target audience (age, interests).'),
  outputFormat: z.string().describe('The format of the ad (e.g., IG Post, Banner, Email).'),
  promptTweaks: z.string().optional().describe('Optional user instructions to refine the prompt.'),
  analyzedData: AnalyzedDataSchema.nullable(), // Allow null
  copyElements: AdCopySchema.optional().nullable(), // Allow null
});


export const GeneratePromptOutputSchema = z.object({
  dallePrompt: z.string().describe('The generated DALL-E prompt for image creation.'),
});


// --- Schemas for iterate-ad-copy flow ---

export const IterateAdCopyInputSchema = z.object({
  originalAdCopy: z.string().describe('The original ad copy to be refined.'),
  instructions: z.string().describe('Specific instructions for refining the ad copy (e.g., Make it more formal).'),
});

export const IterateAdCopyOutputSchema = z.object({
  refinedAdCopy: z.string().describe('The refined ad copy based on the provided instructions.'),
});
