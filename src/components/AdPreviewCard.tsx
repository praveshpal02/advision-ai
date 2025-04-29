
"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { AdCopySchema } from '@/types';

interface AdPreviewCardProps {
  imageSrc: string; // Base64 data URL
  copy: AdCopySchema;
  index: number;
}

export default function AdPreviewCard({ imageSrc, copy, index }: AdPreviewCardProps) {
    const { toast } = useToast();

    const handleDownload = () => {
        try {
          const link = document.createElement('a');
          link.href = imageSrc;
          // Extract mime type and generate appropriate extension
          const mimeType = imageSrc.match(/data:(image\/[^;]+);/)?.[1] || 'image/png';
          const extension = mimeType.split('/')[1] || 'png';
          link.download = `ad_variation_${index + 1}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({ title: "Image Downloaded", description: `Variation ${index + 1} saved.` });
        } catch (error) {
          console.error("Download failed:", error);
          toast({ title: "Download Failed", description: "Could not download the image.", variant: "destructive" });
        }
      };

      const handleCopyText = (textToCopy: string, fieldName: string) => {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            toast({ title: "Copied to Clipboard", description: `${fieldName} copied successfully.` });
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
            toast({ title: "Copy Failed", description: `Could not copy ${fieldName}.`, variant: "destructive" });
          });
      };


  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="p-0 relative aspect-square">
        {imageSrc ? (
            <Image
            src={imageSrc}
            alt={`Ad Variation ${index + 1}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                Image Loading...
            </div>
        )}

      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-sm mb-1 flex justify-between items-center">
            Headline
            <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => handleCopyText(copy.headline, 'Headline')}>
                <Copy className="h-3 w-3" />
            </Button>
        </h4>
          <p className="text-xs text-muted-foreground">{copy.headline}</p>
        </div>
        <div>
            <h4 className="font-semibold text-sm mb-1 flex justify-between items-center">
                Subheadline
                <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => handleCopyText(copy.subheadline, 'Subheadline')}>
                    <Copy className="h-3 w-3" />
                </Button>
            </h4>
            <p className="text-xs text-muted-foreground">{copy.subheadline}</p>
        </div>
        <div>
            <h4 className="font-semibold text-sm mb-1 flex justify-between items-center">
                CTA
                <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => handleCopyText(copy.cta, 'CTA')}>
                    <Copy className="h-3 w-3" />
                </Button>
            </h4>
            <p className="text-xs text-muted-foreground">{copy.cta}</p>
        </div>

      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2">
      <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <ZoomIn className="mr-1 h-4 w-4" /> Zoom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Ad Variation {index + 1}</DialogTitle>
              <DialogDescription>
                Zoomed preview of the ad variation.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-center items-center">
              {imageSrc && (
                 <Image
                    src={imageSrc}
                    alt={`Zoomed Ad Variation ${index + 1}`}
                    width={800} // Adjust as needed
                    height={800} // Adjust as needed
                    objectFit="contain"
                    />
              )}

            </div>
          </DialogContent>
        </Dialog>

        <Button variant="default" size="sm" onClick={handleDownload}>
          <Download className="mr-1 h-4 w-4" /> Download
        </Button>
      </CardFooter>
    </Card>
  );
}
