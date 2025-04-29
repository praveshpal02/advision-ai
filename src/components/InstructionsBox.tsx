
"use client";

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

interface InstructionsBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function InstructionsBox({ value, onChange }: InstructionsBoxProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Optional Instructions</CardTitle>
        <CardDescription>Provide any specific tweaks or directions for the AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="prompt-tweaks" className="flex items-center gap-2 sr-only">
            <Edit className="h-4 w-4" />
            Prompt Tweaks
          </Label>
          <Textarea
            id="prompt-tweaks"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Make the headline shorter, Use a more formal tone, Focus on the discount..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
