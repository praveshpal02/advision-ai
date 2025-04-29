
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Template5({
  backgroundImage,
  headline,
  subheadline,
  cta,
  primaryColor,
  secondaryColor,
}) {
  const templateRef = useRef(null);
    const textBackgroundColor = secondaryColor ? adjustColor(secondaryColor, 30) : '#f8f9fa'; // Lighter secondary color or light gray
    const textColor = secondaryColor ? getContrastYIQ(textBackgroundColor) : '#212529'; // Contrast text or dark gray
    const textContainerStyle = {
        backgroundColor: textBackgroundColor,
        color: textColor,
        padding: '1.5rem',
        borderRadius: '0.5rem', // lg
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    };
    const buttonStyle = {
        backgroundColor: primaryColor || '#007bff',
        color: primaryColor ? getContrastYIQ(primaryColor) : '#ffffff',
    };
     const headlineStyle = {
       color: primaryColor || textColor, // Use primary color for headline, fallback to container text color
     };

  const handleDownload = async () => {
    const element = templateRef.current;
    if (!element) return;

    const canvas = await html2canvas(element);

    const dataURL = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'template5.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   const downloadButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
     };

  return (
    <Card className="w-full overflow-hidden shadow-lg relative aspect-video group bg-muted"> {/* Aspect ratio might need adjustment based on format */}
      {/* Background Image covers half */}
      {backgroundImage && (
        <div className="absolute top-0 left-0 w-1/2 h-full">
          <Image
            src={backgroundImage}
            alt="Ad background"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      {/* Text content on the other half */}
        <div ref={templateRef} className="relative w-full h-full">
            <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center p-6">
                <div style={textContainerStyle} className="space-y-4 max-w-sm text-center">
                    <h2 className="text-xl md:text-2xl font-bold" style={headlineStyle}>{headline}</h2>
                    <p className="text-sm md:text-base">{subheadline}</p>
                    <Button style={buttonStyle} className="mt-4">
                        {cta}
                    </Button>
                </div>
            </div>
           <Button
                style={downloadButtonStyle}
                className="primary"
                onClick={handleDownload}>
                Download
            </Button>
        </div>
    </Card>
  );
}

// Helper functions (similar to Template 2)
function getContrastYIQ(hexcolor){
    if (!hexcolor) return '#ffffff';
	hexcolor = hexcolor.replace("#", "");
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? '#000000' : '#ffffff';
}

function adjustColor(color, amount) {
    if (!color) return '#f8f9fa';
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}
import html2canvas from 'html2canvas';

