
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutTemplate } from 'lucide-react';
import { useBrandContext } from '@/context/BrandContext';

const availableFormats = [
  'Instagram Post',
  'Instagram Story',
  'Facebook Post',
  'Twitter Post',
  'LinkedIn Post',
  'Email Banner',
  'Website Banner (Wide)',
  'Website Banner (Skyscraper)',
  'JS', // Added JS format
];

export default function FormatSelector() {
  const { state, dispatch } = useBrandContext();

  const handleFormatChange = (value) => {
    dispatch({ type: 'SET_OUTPUT_FORMAT', payload: value });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Output Format</CardTitle>
        <CardDescription>Choose the desired format for your generated ads.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
          <Select value={state.outputFormat} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a format" />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
