
"use client";

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';


export default function UploadBox({ onImageUpload, currentImage }) {
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const { toast } = useToast();

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PNG or JPG image.",
          variant: "destructive",
        });
        event.target.value = ''; // Reset the input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setPreviewUrl(result);
        onImageUpload(result);
      };
      reader.onerror = () => {
        toast({
            title: "Error Reading File",
            description: "Could not read the selected image.",
            variant: "destructive",
          });
        onImageUpload(null); // Clear image on error
        setPreviewUrl(null);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      onImageUpload(null);
    }
  }, [onImageUpload, toast]);

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    onImageUpload(null);
    // Reset the file input visually (though the internal value is already handled by react)
    const fileInput = document.getElementById('reference-ad-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  }, [onImageUpload]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Reference Ad</CardTitle>
        <CardDescription>Upload a PNG or JPG image of an ad you like.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full h-64 border-2 border-dashed border-muted rounded-lg flex items-center justify-center relative overflow-hidden bg-muted/50">
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Reference ad preview"
                  layout="fill"
                  objectFit="contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Upload className="mx-auto h-12 w-12" />
                <p>Drag & drop or click to upload</p>
                <p className="text-xs">(PNG, JPG)</p>
              </div>
            )}
            <Label htmlFor="reference-ad-upload" className="absolute inset-0 cursor-pointer">
              <span className="sr-only">Upload reference ad</span>
            </Label>
            <Input
              id="reference-ad-upload"
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              aria-hidden="true" // Hide from screen readers as label handles it
            />
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
