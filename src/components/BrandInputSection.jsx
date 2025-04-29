
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
  const [styleWordInput, setStyleWordInput] = useState('');


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
        {/* Primary Color */}
        <div className="space-y-2">
            <Label htmlFor="primary-color" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Primary Brand Color
            </Label>
            <Input
            id="primary-color"
            type="color"
            value={state.primaryColor}
            onChange={(e) => dispatch({ type: 'SET_PRIMARY_COLOR', payload: e.target.value })}
            className="w-20 h-10 p-1 rounded-md border cursor-pointer"
            />
        </div>

        {/* Secondary Color */}
        <div className="space-y-2">
            <Label htmlFor="secondary-color" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Secondary Brand Color
            </Label>
            <Input
            id="secondary-color"
            type="color"
            value={state.secondaryColor}
            onChange={(e) => dispatch({ type: 'SET_SECONDARY_COLOR', payload: e.target.value })}
            className="w-20 h-10 p-1 rounded-md border cursor-pointer"
            />
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
