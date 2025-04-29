
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Template3({
  backgroundImage,
  headline,
  subheadline,
  cta,
  primaryColor,
  secondaryColor,
}) {
    const templateRef = useRef(null);

    const handleDownload = async () => {
        if (templateRef.current) {
            const canvas = await html2canvas(templateRef.current, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: null,
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'template.png';
            link.click();
        }
    };

    const cardStyle = {
        border: `2px solid ${primaryColor || '#007bff'}`, // Border with primary color
    };
    const textContainerStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
        color: '#ffffff', // White text
        padding: '1.5rem',
        textAlign: 'center',
        borderRadius: '0.375rem', // md
    };
    const buttonStyle = {
        backgroundColor: primaryColor || '#007bff',
        color: primaryColor ? getContrastYIQ(primaryColor) : '#ffffff',
        borderColor: secondaryColor || 'transparent',
        borderWidth: '1px',
    };
     const headlineStyle = {
        color: secondaryColor || '#ffffff', // Use secondary color for headline, fallback to white
     };

  return (
    <div id="template-container" ref={templateRef}>
        <Card className="w-full overflow-hidden shadow-lg relative aspect-square group" style={cardStyle}>
            {backgroundImage && (
                <Image
                    src={backgroundImage}
                    alt="Ad background"
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105 z-0"
                />
            )}
            {/* Centered Text Box */}
            <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                <div style={textContainerStyle} className="space-y-3 max-w-md">
                    <h2 className="text-2xl md:text-3xl font-bold" style={headlineStyle}>{headline}</h2>
                    <p className="text-base md:text-lg">{subheadline}</p>
                    <Button style={buttonStyle} className="mt-4 px-6 py-2">
                        {cta}
                    </Button>
                </div>
            </div>
        </Card>
        <div className='mt-2 flex justify-center'>
            <Button className="primary" onClick={handleDownload}>Download</Button>
        </div>
      </div>    
  );
}

// Helper function (same as Template 1)
function getContrastYIQ(hexcolor){
    if (!hexcolor) return '#ffffff';
	hexcolor = hexcolor.replace("#", "");
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? '#000000' : '#ffffff';
}
