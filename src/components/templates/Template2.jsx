
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Template2({
  backgroundImage,
  headline,
  subheadline,
  cta,
  primaryColor,
  secondaryColor,
}) {
  const templateRef = useRef(null);
  const handleDownload = async () => {
    const element = templateRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = 'template.png';
    link.click();
  };
   const cardStyle = {
    // Example: Use secondary color slightly desaturated for background
    backgroundColor: secondaryColor ? adjustColor(secondaryColor, -20) : '#e8e8e8',
  };
  const textContainerStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
      color: '#333333', // Darker text for contrast on light background
      padding: '1rem',
      borderRadius: '0.375rem', // md
  };
   const buttonStyle = {
       backgroundColor: primaryColor || '#007bff', // Use primary color for button
       color: primaryColor ? getContrastYIQ(primaryColor) : '#ffffff', // Text color based on primary contrast
   };

  return (
    <div id="template-container" ref={templateRef}>
    <Card className="w-full overflow-hidden shadow-lg relative aspect-square group" >
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Ad background"
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105 z-0"
        />
      )}
      {/* Text overlay on one side */}
       <div className="absolute inset-y-0 left-0 w-1/2 flex items-center p-6 z-10">
         <div style={textContainerStyle} className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: primaryColor || '#000000' }}>{headline}</h2>
            <p className="text-sm md:text-base">{subheadline}</p>
            <Button style={buttonStyle} className="mt-2">
                {cta}
            </Button>
         </div>
       </div>
         <Button className="absolute bottom-4 right-4 z-20" onClick={handleDownload} variant="primary">
            Download
        </Button>

    </Card>
    </div>
  );
}

// Helper functions (same as Template 1)
function getContrastYIQ(hexcolor){
    if (!hexcolor) return '#ffffff';
	hexcolor = hexcolor.replace("#", "");
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? '#000000' : '#ffffff';
}

// Basic color adjustment (example)
function adjustColor(color, amount) {
    if (!color) return '#e8e8e8';
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

import html2canvas from 'html2canvas';
