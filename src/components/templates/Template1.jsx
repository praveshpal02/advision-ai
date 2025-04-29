
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Template1({
  backgroundImage,
  headline,
  subheadline,
  cta,
  primaryColor,
  secondaryColor,
}) {
  // Basic styling, can be enhanced significantly
  const cardStyle = {
    backgroundColor: secondaryColor || '#f0f0f0', // Use secondary color for background
    color: primaryColor ? getContrastYIQ(primaryColor) : '#000000', // Text color based on primary contrast
  };
   const buttonStyle = {
       backgroundColor: primaryColor || '#007bff', // Use primary color for button
       color: primaryColor ? getContrastYIQ(primaryColor) : '#ffffff', // Text color based on primary contrast
   };
   const headlineStyle = {
    color: primaryColor || '#000000', // Use primary color for headline text
   };


  return (
    <Card className="w-full overflow-hidden shadow-lg relative aspect-square group">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Ad background"
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      )}
       {/* Overlay */}
       <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-opacity duration-300"></div>

      <CardContent className="absolute inset-0 flex flex-col justify-between p-6 text-white"> {/* Ensure text is white or contrast */}
        {/* Top section - empty in this template */}
        <div></div>

        {/* Bottom Section */}
        <div className="space-y-2 bg-black bg-opacity-60 p-4 rounded-md">
           <h2 className="text-xl md:text-2xl font-bold drop-shadow-md" style={headlineStyle}>{headline}</h2>
           <p className="text-sm md:text-base drop-shadow-sm">{subheadline}</p>
          <Button className="mt-2 w-full sm:w-auto" style={buttonStyle}>
            {cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to determine text color based on background brightness
function getContrastYIQ(hexcolor){
    if (!hexcolor) return '#ffffff'; // Default to white if no color provided
	hexcolor = hexcolor.replace("#", "");
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? '#000000' : '#ffffff';
}
