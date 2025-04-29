
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Palette, Type, Users } from 'lucide-react';
import { useBrandContext } from '@/context/BrandContext';

export default function BrandInputSection() {
  const { state, dispatch } = useBrandContext();
  const [colorInput, setColorInput] = useState('#');
  const [styleWordInput, setStyleWordInput] = useState('');

  const handleColorChange = (e) => {
    let value = e.target.value;
    // Ensure '#' is always present and allow only hex chars
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    value = '#' + value.substring(1).replace(/[^0-9a-fA-F]/g, '');
    setColorInput(value);
  };

  const handleAddColor = () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
    if (hexColorRegex.test(colorInput) && !state.brandColors.includes(colorInput)) {
      dispatch({ type: 'ADD_BRAND_COLOR', payload: colorInput });
      setColorInput('#'); // Reset input
    } else if (!hexColorRegex.test(colorInput)) {
        // Optionally add toast notification for invalid format
        console.warn("Invalid hex color format. Please use #RRGGBB.");
    }
  };

  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddColor();
    }
  };

  const handleRemoveColor = (color) => {
    dispatch({ type: 'REMOVE_BRAND_COLOR', payload: color });
  };


  const handleAddStyleWord = () => {
    const word = styleWordInput.trim();
    if (word && !state.brandStyleWords.includes(word)) {
        dispatch({ type: 'ADD_STYLE_WORD', payload: word });
        setStyleWordInput(''); // Reset input
    }
  };

    const handleStyleWordKeyDown = (e) => {
        if (e.key === 'Enter') {
        e.preventDefault();
        handleAddStyleWord();
        }
    };

    const handleRemoveStyleWord = (word) => {
        dispatch({ type: 'REMOVE_STYLE_WORD', payload: word });
    };


  const handleTargetAudienceChange = (e) => {
    dispatch({ type: 'SET_TARGET_AUDIENCE', payload: e.target.value });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Brand Guidelines</CardTitle>
        <CardDescription>Provide details about your brand identity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Palette */}
        <div className="space-y-2">
          <Label htmlFor="brand-color" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand Colors (Hex)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="brand-color"
              type="text"
              value={colorInput}
              onChange={handleColorChange}
              onKeyDown={handleColorKeyDown}
              placeholder="#RRGGBB"
              maxLength={7}
              className="flex-grow"
            />
            <Button onClick={handleAddColor} type="button" size="sm" variant="outline">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {state.brandColors.map((color) => (
              <Badge key={color} variant="secondary" className="flex items-center gap-1 pr-1">
                <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: color }} />
                {color}
                <button
                  onClick={() => handleRemoveColor(color)}
                  className="rounded-full hover:bg-muted p-0.5"
                  aria-label={`Remove color ${color}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Style Words */}
        <div className="space-y-2">
            <Label htmlFor="style-word" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Style Words
            </Label>
            <div className="flex items-center gap-2">
                <Input
                    id="style-word"
                    type="text"
                    value={styleWordInput}
                    onChange={(e) => setStyleWordInput(e.target.value)}
                    onKeyDown={handleStyleWordKeyDown}
                    placeholder="e.g., playful, luxury"
                    className="flex-grow"
                />
                <Button onClick={handleAddStyleWord} type="button" size="sm" variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {state.brandStyleWords.map((word) => (
                <Badge key={word} variant="secondary" className="flex items-center gap-1 pr-1">
                    {word}
                    <button
                        onClick={() => handleRemoveStyleWord(word)}
                        className="rounded-full hover:bg-muted p-0.5"
                        aria-label={`Remove style word ${word}`}
                    >
                    <X className="h-3 w-3" />
                    </button>
                </Badge>
                ))}
            </div>
        </div>


        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="target-audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Target Audience
          </Label>
          <Textarea
            id="target-audience"
            value={state.targetAudience}
            onChange={handleTargetAudienceChange}
            placeholder="Describe your target audience (e.g., age, interests, location)"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
