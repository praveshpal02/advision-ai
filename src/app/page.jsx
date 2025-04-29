
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Import Input
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Image as ImageIcon, Text, Settings, KeyRound } from 'lucide-react';
import { useBrandContext } from '@/context/BrandContext';
import Stepper from '@/components/Stepper';
import UploadBox from '@/components/UploadBox';
import BrandInputSection from '@/components/BrandInputSection';
import FormatSelector from '@/components/FormatSelector';
import InstructionsBox from '@/components/InstructionsBox';
import VariationsPanel from '@/components/VariationsPanel';
import { generateAdCopy } from '@/ai/flows/generate-ad-copy';
import { generateVisualAd } from '@/ai/flows/generate-visual-ad';
import { useToast } from '@/hooks/use-toast';


const steps = [
  { id: 1, name: 'Upload Ad' },
  { id: 2, name: 'Brand Info' },
  { id: 3, name: 'Format' },
  { id: 4, name: 'Generate' },
  { id: 5, name: 'Preview' },
];

// Function to determine ad size based on format
const getAdSizeForFormat = (format) => {
    switch (format) {
        case 'Instagram Post': return { width: 1080, height: 1080 };
        case 'Instagram Story': return { width: 1080, height: 1920 };
        case 'Facebook Post': return { width: 1200, height: 630 };
        case 'Twitter Post': return { width: 1080, height: 1080 }; // Or 1600x900
        case 'LinkedIn Post': return { width: 1200, height: 627 };
        case 'Email Banner': return { width: 600, height: 200 };
        case 'Website Banner (Wide)': return { width: 728, height: 90 };
        case 'Website Banner (Skyscraper)': return { width: 160, height: 600 };
        case 'JS': return { width: 300, height: 250 }; // Example size for JS ad
        default: return { width: 1024, height: 1024 }; // Default fallback
    }
};


export default function Home() {
  const { state, dispatch, goToStep, nextStep, prevStep } = useBrandContext();
  const { toast } = useToast();
  const [promptTweaks, setPromptTweaks] = useState(''); // Local state for instructions

  const handleImageUpload = (imageDataUrl) => {
    dispatch({ type: 'SET_REFERENCE_IMAGE', payload: imageDataUrl });
  };

  const adSize = useMemo(() => getAdSizeForFormat(state.outputFormat), [state.outputFormat]);

  const handleGenerateAds = async () => {
    // --- Validation ---
    if (!state.referenceImage) {
        toast({
            title: "Missing Reference Image",
            description: "Please upload a reference ad image before generating.",
            variant: "destructive",
        });
        goToStep(1); // Go back to upload step
        return;
    }
     // Although optional for the flow, check if user intended to input one but left it empty
     // This is a UX check rather than a hard requirement for the current *simulated* flow.
     // if (!state.openaiApiKey) {
     //   toast({
     //     title: "Missing OpenAI API Key",
     //     description: "Please enter your OpenAI API key in Step 1.",
     //     variant: "destructive",
     //   });
     //   goToStep(1);
     //   return;
     // }
    if (!state.primaryColor || !state.secondaryColor || state.brandStyleWords.length === 0 || !state.targetAudience) {
        toast({
            title: "Missing Brand Info",
            description: "Please provide primary/secondary colors, style words, and target audience.",
            variant: "destructive",
        });
        goToStep(2); // Go back to brand info step
        return;
    }
    if (state.numberOfVariations < 1 || state.numberOfVariations > 10) {
        toast({
            title: "Invalid Number of Variations",
            description: "Please enter a number between 1 and 10.",
            variant: "destructive",
        });
        goToStep(4); // Stay on generate step
        return;
    }
    // --- End Validation ---

    dispatch({ type: 'GENERATION_START' });

    try {
      // --- Generate Ad Copy ---
      const copyInput = {
        brandStyle: state.brandStyleWords.join(', '),
        colors: [state.primaryColor, state.secondaryColor],
        targetAudience: state.targetAudience,
        format: state.outputFormat,
        referenceText: state.referenceText || undefined, // Pass if available
        numberOfVariations: state.numberOfVariations, // Pass number of variations
      };
      console.log("Generating Copy with input:", copyInput);
      const copyResult = await generateAdCopy(copyInput);
      const adCopies = copyResult.variations; // Expecting array of {headline, subheadline, cta}
      console.log("Generated Copy:", adCopies);

      if (!adCopies || adCopies.length === 0) {
        throw new Error("AI failed to generate ad copy variations.");
      }
      if (adCopies.length !== state.numberOfVariations) {
          console.warn(`Requested ${state.numberOfVariations} copy variations, but received ${adCopies.length}. Using received count.`);
          // Adjust numberOfVariations if AI returned a different number
          dispatch({ type: 'SET_NUMBER_OF_VARIATIONS', payload: adCopies.length });
      }


       // --- Generate Visual Ads ---
       const visualInput = {
        referenceAdImage: state.referenceImage, // Still useful for style analysis if model supports it
        openaiApiKey: state.openaiApiKey || undefined, // Pass API key
        brandColors: [state.primaryColor, state.secondaryColor],
        brandStyleWords: state.brandStyleWords,
        targetAudience: state.targetAudience,
        outputFormat: state.outputFormat,
        promptTweaks: promptTweaks || undefined,
        numberOfVariations: state.numberOfVariations, // Use potentially adjusted number
        width: adSize.width,
        height: adSize.height,
       };
       console.log("Generating Visuals with input:", visualInput);

      // Call the actual visual ad generation flow
      const visualResult = await generateVisualAd(visualInput);
      const visualVariations = visualResult.generatedAdVariations; // Array of data URIs or URLs
      console.log("Generated Visuals:", visualVariations);

      if (!visualVariations || visualVariations.length === 0) {
          throw new Error("AI failed to generate visual ad variations.");
      }

      // Adjust copy array length if visual generation returned a different number than requested/adjusted copy count
      const finalVariationCount = visualVariations.length;
      if (finalVariationCount !== adCopies.length) {
          console.warn(`Visual variations (${finalVariationCount}) differ from copy variations (${adCopies.length}). Trimming to match visuals.`);
          // Update state and trim copy array
          dispatch({ type: 'SET_NUMBER_OF_VARIATIONS', payload: finalVariationCount });
          adCopies.length = finalVariationCount; // Trim the copy array
      }

      const combinedVariations = visualVariations.map((image, index) => ({
        image: image, // Use generated image URI/URL here
        copy: adCopies[index], // Pair with corresponding copy
      }));
      console.log("Combined Variations:", combinedVariations);

      dispatch({ type: 'GENERATION_SUCCESS', payload: combinedVariations });

    } catch (error) {
      console.error("Ad Generation Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during ad generation.";
      dispatch({ type: 'GENERATION_ERROR', payload: errorMessage });
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <UploadBox onImageUpload={handleImageUpload} currentImage={state.referenceImage} />
             <Card>
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <Label htmlFor="reference-text" className='mb-2 block'>Optional Text Description</Label>
                        <Textarea
                            id="reference-text"
                            value={state.referenceText}
                            onChange={(e) => dispatch({ type: 'SET_REFERENCE_TEXT', payload: e.target.value })}
                            placeholder="Describe the reference ad (e.g., key message, elements)"
                            rows={3}
                        />
                    </div>
                     <div>
                        <Label htmlFor="openai-api-key" className="mb-2 block flex items-center gap-2">
                            <KeyRound className="h-4 w-4" /> OpenAI API Key (Optional for Image Generation)
                        </Label>
                        <Input
                            id="openai-api-key"
                            type="password" // Use password type to obscure the key
                            value={state.openaiApiKey}
                            onChange={(e) => dispatch({ type: 'SET_OPENAI_API_KEY', payload: e.target.value })}
                            placeholder="Enter your OpenAI API Key"
                            />
                        <p className="text-xs text-muted-foreground mt-1">
                            Needed for generating ad visuals using DALL·E. Your key is not stored persistently.
                        </p>
                    </div>
                </CardContent>
             </Card>
          </div>
        );
      case 2:
        return <BrandInputSection />;
      case 3:
        return <FormatSelector />;
      case 4:
        return (
            <div className="space-y-6">
                {/* Number of Variations Input */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="num-variations" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Number of Variations
                            </Label>
                            <Input
                                id="num-variations"
                                type="number"
                                min="1"
                                max="10" // Limit variations
                                value={state.numberOfVariations}
                                onChange={(e) => dispatch({ type: 'SET_NUMBER_OF_VARIATIONS', payload: parseInt(e.target.value, 10) || 1 })}
                                className="w-24"
                            />
                            <p className="text-xs text-muted-foreground">Enter a number between 1 and 10.</p>
                        </div>

                        {/* Display Selected Format and Size */}
                        <div className="space-y-1">
                            <p className="text-sm font-medium flex items-center gap-2"><Text className="h-4 w-4 text-muted-foreground" /> Selected Format:</p>
                            <p className="text-sm text-muted-foreground pl-6">{state.outputFormat}</p>
                        </div>
                        <div className="space-y-1">
                             <p className="text-sm font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" /> Target Ad Size:</p>
                             <p className="text-sm text-muted-foreground pl-6">{adSize.width}px &times; {adSize.height}px</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions Box */}
                 <InstructionsBox value={promptTweaks} onChange={setPromptTweaks} />
            </div>
        );
      case 5:
        return <VariationsPanel />;
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (state.currentStep) {
      case 1:
        // Make OpenAI key optional for proceeding, but required for generation if entered partially?
        // For now, only reference image is strictly required to proceed from step 1.
        return !state.referenceImage;
      case 2:
        return !state.primaryColor || !state.secondaryColor || state.brandStyleWords.length === 0 || !state.targetAudience;
      case 4:
          return state.numberOfVariations < 1 || state.numberOfVariations > 10;
      // Step 3 doesn't have specific validation before proceeding
      default:
        return false;
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
       <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">AdVision AI</h1>
       <p className="text-center text-muted-foreground mb-8">Generate stunning ad variations powered by AI</p>

      <Card className="mb-8 shadow-md">
        <CardContent className="p-6">
            <Stepper steps={steps} currentStep={state.currentStep} onStepClick={goToStep}/>
        </CardContent>
      </Card>

      <div className="min-h-[400px] mb-8">
        {renderStepContent()}
      </div>


      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={state.currentStep === 1 || state.isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        {state.currentStep < 4 ? (
          <Button onClick={nextStep} disabled={isNextDisabled() || state.isLoading}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : state.currentStep === 4 ? (
          <Button onClick={handleGenerateAds} disabled={state.isLoading || isNextDisabled()}>
            {state.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Ads
              </>
            )}
          </Button>
        ) : ( // Step 5 (Preview)
          <Button onClick={() => goToStep(1)}>
            Start Over
          </Button>
        )}
      </div>
    </main>
  );
}
