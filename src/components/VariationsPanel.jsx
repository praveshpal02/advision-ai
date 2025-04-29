
"use client";

// Removed import of non-existent AdPreviewCard
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { useBrandContext } from '@/context/BrandContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import Templates
import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';
import Template4 from '@/components/templates/Template4';
import Template5 from '@/components/templates/Template5';


const templates = [Template1, Template2, Template3, Template4, Template5];

export default function VariationsPanel() {
  const { state } = useBrandContext();
  const { generatedVariations, isLoading, error, primaryColor, secondaryColor } = state;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Ad Variations</CardTitle>
        <CardDescription>Review the AI-generated ad variations below, rendered using different templates.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Use generic skeleton, template structure varies */}
           {Array.from({ length: Math.min(state.numberOfVariations, 5) }).map((_, index) => ( // Show skeleton for requested variations up to template count
             <Card key={index} className="w-full overflow-hidden">
               <Skeleton className="aspect-square w-full" />
               <CardContent className="p-4 space-y-3">
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-4 w-1/3" />
                 <Skeleton className="h-3 w-1/2" />
               </CardContent>
               <CardFooter className="p-4 flex justify-end gap-2">
                 <Skeleton className="h-9 w-24" />
               </CardFooter>
             </Card>
           ))}
         </div>
        ) : error ? (
            <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>
              {error || "An unexpected error occurred while generating ads."}
            </AlertDescription>
          </Alert>
        ) : generatedVariations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedVariations.map((variation, index) => {
                    // Cycle through templates using modulo operator
                    const TemplateComponent = templates[index % templates.length];
                    return (
                        <TemplateComponent
                            key={index}
                            backgroundImage={variation.image} // Pass image URI/URL as background
                            headline={variation.copy.headline}
                            subheadline={variation.copy.subheadline}
                            cta={variation.copy.cta}
                            primaryColor={primaryColor} // Pass brand colors
                            secondaryColor={secondaryColor}
                        />
                    );
                })}
            </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No variations generated yet. Fill in the details and click "Generate Ads".
          </div>
        )}
      </CardContent>
    </Card>
  );
}
