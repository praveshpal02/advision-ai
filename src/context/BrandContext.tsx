
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useReducer, useCallback } from 'react';
import type { AdCopySchema } from '@/types';

// --- State Definition ---

interface BrandState {
  referenceImage: string | null; // Base64 data URL
  referenceText: string;
  brandColors: string[];
  brandStyleWords: string[];
  targetAudience: string;
  outputFormat: string;
  generatedVariations: { image: string; copy: AdCopySchema }[];
  isLoading: boolean;
  error: string | null;
  currentStep: number;
}

const initialState: BrandState = {
  referenceImage: null,
  referenceText: '',
  brandColors: [],
  brandStyleWords: [],
  targetAudience: '',
  outputFormat: 'Instagram Post', // Default format
  generatedVariations: [],
  isLoading: false,
  error: null,
  currentStep: 1,
};

// --- Action Definitions ---

type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_REFERENCE_IMAGE'; payload: string | null }
  | { type: 'SET_REFERENCE_TEXT'; payload: string }
  | { type: 'ADD_BRAND_COLOR'; payload: string }
  | { type: 'REMOVE_BRAND_COLOR'; payload: string }
  | { type: 'ADD_STYLE_WORD'; payload: string }
  | { type: 'REMOVE_STYLE_WORD'; payload: string }
  | { type: 'SET_TARGET_AUDIENCE'; payload: string }
  | { type: 'SET_OUTPUT_FORMAT'; payload: string }
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: { image: string; copy: AdCopySchema }[] }
  | { type: 'GENERATION_ERROR'; payload: string };

// --- Reducer ---

const brandReducer = (state: BrandState, action: Action): BrandState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) };
    case 'SET_REFERENCE_IMAGE':
      return { ...state, referenceImage: action.payload, error: null }; // Clear error on new image
    case 'SET_REFERENCE_TEXT':
      return { ...state, referenceText: action.payload };
    case 'ADD_BRAND_COLOR':
      if (!state.brandColors.includes(action.payload)) {
        return { ...state, brandColors: [...state.brandColors, action.payload] };
      }
      return state;
    case 'REMOVE_BRAND_COLOR':
      return {
        ...state,
        brandColors: state.brandColors.filter((color) => color !== action.payload),
      };
    case 'ADD_STYLE_WORD':
        if (!state.brandStyleWords.includes(action.payload)) {
            return { ...state, brandStyleWords: [...state.brandStyleWords, action.payload] };
          }
          return state;
    case 'REMOVE_STYLE_WORD':
        return {
            ...state,
            brandStyleWords: state.brandStyleWords.filter((word) => word !== action.payload),
          };
    case 'SET_TARGET_AUDIENCE':
      return { ...state, targetAudience: action.payload };
    case 'SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.payload };
    case 'GENERATION_START':
      return { ...state, isLoading: true, error: null, generatedVariations: [] };
    case 'GENERATION_SUCCESS':
      return { ...state, isLoading: false, generatedVariations: action.payload, currentStep: 5 }; // Move to preview step
    case 'GENERATION_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

// --- Context ---

interface BrandContextProps {
  state: BrandState;
  dispatch: React.Dispatch<Action>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const BrandContext = createContext<BrandContextProps | undefined>(undefined);

// --- Provider ---

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(brandReducer, initialState);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);


  return (
    <BrandContext.Provider value={{ state, dispatch, goToStep, nextStep, prevStep }}>
      {children}
    </BrandContext.Provider>
  );
};

// --- Hook ---

export const useBrandContext = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrandContext must be used within a BrandProvider');
  }
  return context;
};
