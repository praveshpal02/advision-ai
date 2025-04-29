
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Template4({
  backgroundImage,
  headline,
  subheadline,
  cta,
  primaryColor,
  secondaryColor,
}) {
    const bandStyle = {
        backgroundColor: primaryColor || '#007bff', // Primary color band
        color: primaryColor ? getContrastYIQ(primaryColor) : '#ffffff',
    };
    const buttonStyle = {
        backgroundColor: secondaryColor || '#6c757d', // Secondary color for button
        color: secondaryColor ? getContrastYIQ(secondaryColor) : '#ffffff',
    };

  return (
    <Card className="w-full overflow-hidden shadow-lg relative aspect-square group">
      {/* Background Image */}
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Ad background"
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      )}
      {/* Color Band at the Bottom */}
       <div className="absolute bottom-0 left-0 right-0 p-4 z-10" style={bandStyle}>
         <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
                 <h2 className="text-lg md:text-xl font-semibold">{headline}</h2>
                 <p className="text-xs md:text-sm">{subheadline}</p>
            </div>
            <Button style={buttonStyle} className="shrink-0">
                {cta}
            </Button>
         </div>
       </div>
    </Card>
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
