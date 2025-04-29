
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label"; // Import Label
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
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
import type { AdCopySchema } from '@/types';


const steps = [
  { id: 1, name: 'Upload Ad' },
  { id: 2, name: 'Brand Info' },
  { id: 3, name: 'Format' },
  { id: 4, name: 'Generate' },
  { id: 5, name: 'Preview' },
];

export default function Home() {
  const { state, dispatch, goToStep, nextStep, prevStep } = useBrandContext();
  const { toast } = useToast();
  const [promptTweaks, setPromptTweaks] = useState(''); // Local state for instructions


  const handleImageUpload = (imageDataUrl: string | null) => {
    dispatch({ type: 'SET_REFERENCE_IMAGE', payload: imageDataUrl });
  };


  const handleGenerateAds = async () => {
    if (!state.referenceImage) {
        toast({
            title: "Missing Reference Image",
            description: "Please upload a reference ad image before generating.",
            variant: "destructive",
        });
        goToStep(1); // Go back to upload step
        return;
    }
    if (state.brandColors.length === 0 || state.brandStyleWords.length === 0 || !state.targetAudience) {
        toast({
            title: "Missing Brand Info",
            description: "Please provide brand colors, style words, and target audience.",
            variant: "destructive",
        });
        goToStep(2); // Go back to brand info step
        return;
    }


    dispatch({ type: 'GENERATION_START' });

    try {
      // --- Generate Ad Copy ---
      const copyInput = {
        brandStyle: state.brandStyleWords.join(', '),
        colors: state.brandColors,
        targetAudience: state.targetAudience,
        format: state.outputFormat,
        referenceText: state.referenceText || undefined, // Pass if available
      };
      const copyResult = await generateAdCopy(copyInput);
      const adCopies = copyResult.variations; // Expecting array of {headline, subheadline, cta}


       // --- Generate Visual Ads (Simulated - Replace with actual API call) ---
      // For now, we'll just use the reference image for all variations
      // and pair it with the generated copy.
       const visualInput = {
        referenceAdImage: state.referenceImage,
        brandColors: state.brandColors,
        brandStyleWords: state.brandStyleWords,
        targetAudience: state.targetAudience,
        outputFormat: state.outputFormat,
        promptTweaks: promptTweaks || undefined,
       };

      // In a real scenario, you would call generateVisualAd and get multiple image variations.
      // const visualResult = await generateVisualAd(visualInput);
      // const visualVariations = visualResult.generatedAdVariations; // Array of data URIs

       // Simulate visual variations using the reference image for now
       const visualVariations = Array(adCopies.length).fill(state.referenceImage);


      if (visualVariations.length !== adCopies.length) {
          throw new Error("Mismatch between generated images and copy variations.");
      }


      const combinedVariations = visualVariations.map((image, index) => ({
        image: image, // Use generated image URI here
        copy: adCopies[index], // Pair with corresponding copy
      }));

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
                <CardContent className="pt-6">
                    <Label htmlFor="reference-text">Optional Text Description</Label>
                    <Textarea
                        id="reference-text"
                        value={state.referenceText}
                        onChange={(e) => dispatch({ type: 'SET_REFERENCE_TEXT', payload: e.target.value })}
                        placeholder="Describe the reference ad (e.g., key message, elements)"
                        rows={3}
                        className="mt-2"
                    />
                </CardContent>
             </Card>
          </div>
        );
      case 2:
        return <BrandInputSection />;
      case 3:
        return <FormatSelector />;
      case 4:
        return <InstructionsBox value={promptTweaks} onChange={setPromptTweaks} />;
      case 5:
        return <VariationsPanel />;
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (state.currentStep) {
      case 1:
        return !state.referenceImage;
      case 2:
        return state.brandColors.length === 0 || state.brandStyleWords.length === 0 || !state.targetAudience;
      // Steps 3 and 4 don't have specific validation before proceeding
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
            <Stepper steps={steps} currentStep={state.currentStep} />
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
          <Button onClick={handleGenerateAds} disabled={state.isLoading}>
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

