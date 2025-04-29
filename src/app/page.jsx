'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Text,
  Settings,
  // KeyRound, // Removed KeyRound icon
  FileScan, // Icon for analysis
} from 'lucide-react';
import { useBrandContext } from '@/context/BrandContext';
import Stepper from '@/components/Stepper';
import UploadBox from '@/components/UploadBox';
import BrandInputSection from '@/components/BrandInputSection';
import FormatSelector from '@/components/FormatSelector';
import InstructionsBox from '@/components/InstructionsBox';
import VariationsPanel from '@/components/VariationsPanel';
import { analyzeImageWrapper } from '@/ai/flows/analyze-image.jsx'; // Import the updated analysis flow from jsx
import { generateAdCopy } from '@/ai/flows/generate-ad-copy.jsx'; // Import from jsx
// import { generateVisualAdWrapper } from '@/ai/flows/generate-visual-ad.jsx'; // SKIPPED: Import wrapper function
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added import for Alert

const steps = [
  { id: 1, name: 'Upload & Analyze' }, // Renamed step 1
  { id: 2, name: 'Brand Info' },
  { id: 3, name: 'Format' },
  { id: 4, name: 'Generate' },
  { id: 5, name: 'Preview' },
];

// Function to determine ad size based on format
const getAdSizeForFormat = (format) => {
  switch (format) {
    case 'Instagram Post':
      return { width: 1080, height: 1080 };
    case 'Instagram Story':
      return { width: 1080, height: 1920 };
    case 'Facebook Post':
      return { width: 1200, height: 630 };
    case 'Twitter Post':
      return { width: 1080, height: 1080 }; // Or 1600x900
    case 'LinkedIn Post':
      return { width: 1200, height: 627 };
    case 'Email Banner':
      return { width: 600, height: 200 };
    case 'Website Banner (Wide)':
      return { width: 728, height: 90 };
    case 'Website Banner (Skyscraper)':
      return { width: 160, height: 600 };
    case 'JS':
      return { width: 300, height: 250 }; // Example size for JS ad
    default:
      return { width: 1024, height: 1024 }; // Default fallback
  }
};

export default function Home() {
  const { state, dispatch, goToStep, nextStep, prevStep } = useBrandContext();
  const { toast } = useToast();
  const [promptTweaks, setPromptTweaks] = useState(''); // Local state for instructions
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State for analysis loading

  const handleImageUpload = async (imageDataUrl) => {
    if (!imageDataUrl) {
        dispatch({ type: 'SET_REFERENCE_IMAGE', payload: null });
        dispatch({ type: 'SET_ANALYSIS_RESULT', payload: null }); // Clear analysis on removal
        return;
    }
    dispatch({ type: 'SET_REFERENCE_IMAGE', payload: imageDataUrl });
    setIsAnalyzing(true);
    dispatch({ type: 'ANALYSIS_START' }); // Indicate analysis start in context if needed

    try {
      console.log('Starting image analysis...');
      const analysisResult = await analyzeImageWrapper({ photoDataUri: imageDataUrl });
      console.log('Analysis successful:', analysisResult);
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: analysisResult });

      // Optionally pre-fill fields based on analysis
      if (analysisResult.colors?.primary) {
          dispatch({ type: 'SET_PRIMARY_COLOR', payload: analysisResult.colors.primary });
      }
       if (analysisResult.colors?.secondary) {
           dispatch({ type: 'SET_SECONDARY_COLOR', payload: analysisResult.colors.secondary });
       }
      if (analysisResult.styleKeywords?.length > 0) {
        // Replace existing style words or add new ones based on analysis
         dispatch({ type: 'SET_STYLE_WORDS', payload: analysisResult.styleKeywords });
      }
       // Pre-fill reference text if extracted
       const extractedText = [
        analysisResult.textElements?.headline,
        analysisResult.textElements?.subheadline,
        analysisResult.textElements?.cta,
      ].filter(Boolean).join(' | '); // Join extracted text elements

      if (extractedText && !state.referenceText) { // Only prefill if reference text is empty
        dispatch({ type: 'SET_REFERENCE_TEXT', payload: extractedText });
      }


      toast({
        title: 'Analysis Complete',
        description: 'Image analyzed successfully. Brand info pre-filled where possible.',
      });
    } catch (error) {
      console.error('Image Analysis Error:', error);
      dispatch({ type: 'ANALYSIS_ERROR', payload: error.message }); // Store error in context if needed
      toast({
        title: 'Analysis Failed',
        description: `Could not analyze the image: ${error.message}`,
        variant: 'destructive',
      });
       dispatch({ type: 'SET_ANALYSIS_RESULT', payload: null }); // Clear analysis result on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const adSize = useMemo(
    () => getAdSizeForFormat(state.outputFormat),
    [state.outputFormat]
  );

  const handleGenerateAds = async () => {
    // --- Validation ---
    if (!state.referenceImage) {
      toast({
        title: 'Missing Reference Image',
        description: 'Please upload and analyze a reference ad image.',
        variant: 'destructive',
      });
      goToStep(1); // Go back to upload step
      return;
    }
     if (!state.analysisResult && !isAnalyzing) { // Check if analysis completed (or is in progress)
       toast({
         title: 'Analysis Required',
         description: 'Please wait for image analysis to complete or re-upload the image.',
         variant: 'destructive',
       });
       goToStep(1);
       return;
     }
    // SKIPPED: OpenAI Key Check Removed
    // if (!state.openaiApiKey) { // OpenAI Key is now essential for generation
    //   toast({
    //     title: 'Missing OpenAI API Key',
    //     description: 'Please enter your OpenAI API key in Step 1 for image generation.',
    //     variant: 'destructive',
    //   });
    //   goToStep(1);
    //   return;
    // }
    if (
      !state.primaryColor ||
      !state.secondaryColor ||
      state.brandStyleWords.length === 0 ||
      !state.targetAudience
    ) {
      toast({
        title: 'Missing Brand Info',
        description:
          'Please provide primary/secondary colors, style words, and target audience.',
        variant: 'destructive',
      });
      goToStep(2); // Go back to brand info step
      return;
    }
    if (state.numberOfVariations < 1 || state.numberOfVariations > 10) {
      toast({
        title: 'Invalid Number of Variations',
        description: 'Please enter a number between 1 and 10.',
        variant: 'destructive',
      });
      goToStep(4); // Stay on generate step
      return;
    }
    // --- End Validation ---

    dispatch({ type: 'GENERATION_START' });

    try {
      // --- Generate Ad Copy (Leverage analysis results) ---
      const copyInput = {
        // Use analyzed style if available, otherwise fallback to manually entered
        brandStyle: state.analysisResult?.styleKeywords?.join(', ') || state.brandStyleWords.join(', '),
        colors: [
          state.primaryColor || state.analysisResult?.colors?.primary || '#3498db', // Fallback color
          state.secondaryColor || state.analysisResult?.colors?.secondary || '#008080' // Fallback color
        ],
        targetAudience: state.targetAudience,
        format: state.outputFormat,
        // Use analyzed text as reference if manual text is empty
        referenceText: state.referenceText || [
            state.analysisResult?.textElements?.headline,
            state.analysisResult?.textElements?.subheadline,
            state.analysisResult?.textElements?.cta
        ].filter(Boolean).join(' | ') || undefined,
        numberOfVariations: state.numberOfVariations,
      };
      console.log('Generating Copy with input:', copyInput);
      const copyResult = await generateAdCopy(copyInput);
      let adCopies = copyResult.variations; // Expecting array of {headline, subheadline, cta}
      console.log('Generated Copy:', adCopies);

      if (!adCopies || adCopies.length === 0) {
        throw new Error('AI failed to generate ad copy variations.');
      }
      if (adCopies.length !== state.numberOfVariations) {
        console.warn(
          `Requested ${state.numberOfVariations} copy variations, but received ${adCopies.length}. Using received count.`
        );
        // Adjust numberOfVariations if AI returned a different number
        dispatch({
          type: 'SET_NUMBER_OF_VARIATIONS',
          payload: adCopies.length,
        });
         adCopies = adCopies.slice(0, state.numberOfVariations); // Ensure copy array matches requested number
      }

      // --- SKIPPED: Generate Visual Ads ---
      // const visualInput = { ... };
      // console.log('Generating Visuals with input:', JSON.stringify(visualInput, null, 2)); // Log the exact input
      // const visualResult = await generateVisualAdWrapper(visualInput);
      // const visualVariations = visualResult.generatedAdVariations; // Array of data URIs or URLs
      // console.log('Generated Visuals:', visualVariations);
      // if (!visualVariations || visualVariations.length === 0) {
      //   throw new Error('AI failed to generate visual ad variations.');
      // }
      // const finalVariationCount = visualVariations.length;
      // if (finalVariationCount !== adCopies.length) { ... }

      // --- Create Combined Variations with Placeholder Images ---
      const placeholderBaseUrl = 'https://picsum.photos';
      const { width, height } = adSize;

      const combinedVariations = adCopies.map((copy, index) => ({
        // Generate a unique placeholder image URL for each variation
        image: `${placeholderBaseUrl}/${width}/${height}?random=${index}`,
        copy: copy,
      }));
      console.log('Combined Variations (using placeholders):', combinedVariations);

      dispatch({ type: 'GENERATION_SUCCESS', payload: combinedVariations });
    } catch (error) {
      console.error('Ad Generation Error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during ad generation.';
      dispatch({ type: 'GENERATION_ERROR', payload: errorMessage });
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <UploadBox
                onImageUpload={handleImageUpload}
                currentImage={state.referenceImage}
                isAnalyzing={isAnalyzing} // Pass analysis status
            />
            {isAnalyzing && (
                <div className="flex items-center justify-center text-muted-foreground gap-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing image...</span>
                </div>
            )}
             {state.analysisResult && !isAnalyzing && (
                <Card>
                    <CardContent className="pt-6 text-sm text-muted-foreground space-y-1">
                         <p className="font-medium text-foreground flex items-center gap-1"><FileScan className="h-4 w-4" /> Analysis Complete:</p>
                         <p>Colors: {(state.analysisResult.colors?.palette || []).map(c => (
                            <span key={c} className="inline-block w-3 h-3 rounded-full mr-1 border" style={{backgroundColor: c}}></span>
                         ))}
                         {state.analysisResult.colors?.primary && `(Primary: ${state.analysisResult.colors.primary})`}
                         </p>
                         <p>Style: {state.analysisResult.styleKeywords?.join(', ') || 'N/A'}</p>
                         <p>Layout: {state.analysisResult.layoutStyle || 'N/A'}</p>
                         <p>Font: {state.analysisResult.fontStyle || 'N/A'}</p>
                         <p>Headline: {state.analysisResult.textElements?.headline || 'N/A'}</p>
                    </CardContent>
                </Card>
            )}
            {state.analysisError && !isAnalyzing && (
                 <Card className='border-destructive'>
                    <CardContent className="pt-6 text-sm text-destructive space-y-1">
                         <p className="font-medium flex items-center gap-1"><FileScan className="h-4 w-4" /> Analysis Failed:</p>
                         <p>{state.analysisError}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="reference-text" className="mb-2 block">
                    Optional Text Description (Overrides analysis)
                  </Label>
                  <Textarea
                    id="reference-text"
                    value={state.referenceText}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_REFERENCE_TEXT',
                        payload: e.target.value,
                      })
                    }
                    placeholder="Describe the reference ad (e.g., key message, elements). If provided, this text might be prioritized over analyzed text."
                    rows={3}
                  />
                </div>
                {/* SKIPPED: OpenAI API Key Input Removed */}
                {/* <div>
                  <Label
                    htmlFor="openai-api-key"
                    className="mb-2 block flex items-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" /> OpenAI API Key (Required for Image Generation)
                  </Label>
                  <Input
                    id="openai-api-key"
                    type="password" // Use password type to obscure the key
                    value={state.openaiApiKey}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_OPENAI_API_KEY',
                        payload: e.target.value,
                      })
                    }
                    placeholder="Enter your OpenAI API Key"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Needed for generating ad visuals using DALL·E. Your key is
                    not stored persistently.
                  </p>
                </div> */}
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
                  <Label
                    htmlFor="num-variations"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Number of Variations
                  </Label>
                  <Input
                    id="num-variations"
                    type="number"
                    min="1"
                    max="10" // Limit variations
                    value={state.numberOfVariations}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_NUMBER_OF_VARIATIONS',
                        payload: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a number between 1 and 10.
                  </p>
                </div>

                {/* Display Selected Format and Size */}
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Text className="h-4 w-4 text-muted-foreground" /> Selected
                    Format:
                  </p>
                  <p className="text-sm text-muted-foreground pl-6">
                    {state.outputFormat}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />{' '}
                    Target Ad Size:
                  </p>
                  <p className="text-sm text-muted-foreground pl-6">
                    {adSize.width}px &times; {adSize.height}px
                  </p>
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
        // Disable if analyzing, or if image uploaded but analysis failed/not started
        return isAnalyzing || (!state.analysisResult && !!state.referenceImage && !state.analysisError) || !state.referenceImage;
      case 2:
        return (
          !state.primaryColor ||
          !state.secondaryColor ||
          state.brandStyleWords.length === 0 ||
          !state.targetAudience
        );
      case 4:
        // SKIPPED: API Key check removed
        return state.numberOfVariations < 1 || state.numberOfVariations > 10; // || !state.openaiApiKey;
      // Step 3 doesn't have specific validation before proceeding
      default:
        return false;
    }
  };

   const canGenerate = state.currentStep === 4 &&
                        state.referenceImage &&
                        state.analysisResult && // Ensure analysis is done
                        // SKIPPED: API Key check removed
                        // state.openaiApiKey && // Ensure API key is present
                        state.primaryColor &&
                        state.secondaryColor &&
                        state.brandStyleWords.length > 0 &&
                        state.targetAudience &&
                        state.numberOfVariations >= 1 &&
                        state.numberOfVariations <= 10;

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
        AdVision AI
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Generate stunning ad variations powered by AI
      </p>

      <Card className="mb-8 shadow-md">
        <CardContent className="p-6">
          <Stepper
            steps={steps}
            currentStep={state.currentStep}
            onStepClick={goToStep}
          />
        </CardContent>
      </Card>

      <div className="min-h-[400px] mb-8">{renderStepContent()}</div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={state.currentStep === 1 || state.isLoading || isAnalyzing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        {state.currentStep < 4 ? (
          <Button onClick={nextStep} disabled={isNextDisabled() || state.isLoading || isAnalyzing}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : state.currentStep === 4 ? (
          <Button onClick={handleGenerateAds} disabled={state.isLoading || !canGenerate || isAnalyzing}>
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
        ) : (
          // Step 5 (Preview)
          <Button onClick={() => goToStep(1)}>Start Over</Button>
        )}
      </div>
    </main>
  );
}
