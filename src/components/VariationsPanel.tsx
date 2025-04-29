
"use client";

import AdPreviewCard from '@/components/AdPreviewCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBrandContext } from '@/context/BrandContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function VariationsPanel() {
  const { state } = useBrandContext();
  const { generatedVariations, isLoading, error } = state;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Ad Variations</CardTitle>
        <CardDescription>Review the AI-generated ad variations below.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 3 }).map((_, index) => (
             <Card key={index} className="w-full overflow-hidden">
               <Skeleton className="aspect-square w-full" />
               <CardContent className="p-4 space-y-3">
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-4 w-2/4" />
                 <Skeleton className="h-3 w-5/6" />
                 <Skeleton className="h-4 w-1/3" />
                 <Skeleton className="h-3 w-1/2" />
               </CardContent>
               <CardFooter className="p-4 flex justify-end gap-2">
                 <Skeleton className="h-9 w-20" />
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
                {generatedVariations.map((variation, index) => (
                <AdPreviewCard
                    key={index}
                    imageSrc={variation.image}
                    copy={variation.copy}
                    index={index}
                />
                ))}
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
