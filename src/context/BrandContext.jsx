'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
// Removed 'type' keyword as it's invalid in JSX
import { AnalyzeImageOutput } from '@/ai/flows/analyze-image'; // Import the type

// --- State Definition ---

const initialState = {
  referenceImage: null,
  referenceText: '',
  // openaiApiKey: '', // SKIPPED: Removed OpenAI API Key field
  analysisResult: null, // Added field to store analysis results
  analysisError: null, // Added field for analysis errors
  isAnalyzing: false, // Added field to track analysis status
  primaryColor: '#3498db', // Default Muted Blue
  secondaryColor: '#008080', // Default Teal Accent
  brandStyleWords: [],
  targetAudience: '',
  outputFormat: 'Instagram Post', // Default format
  numberOfVariations: 3, // Default number of variations
  generatedVariations: [],
  isLoading: false, // For generation loading state
  error: null, // For generation errors
  currentStep: 1,
};

// --- Action Definitions ---
/**
 * @typedef {object} AnalyzeImageOutputFormat Placeholder for type from analyze-image flow
 * @property {object} [colors]
 * @property {string} [colors.primary]
 * @property {string} [colors.secondary]
 * @property {string} [colors.background]
 * @property {string[]} colors.palette
 * @property {string[]} styleKeywords
 * @property {string} [fontStyle]
 * @property {string} [layoutStyle]
 * @property {object} [textElements]
 * @property {string} [textElements.headline]
 * @property {string} [textElements.subheadline]
 * @property {string} [textElements.cta]
 */

/**
 * @typedef {
 *   { type: 'SET_STEP'; payload: number } |
 *   { type: 'NEXT_STEP' } |
 *   { type: 'PREV_STEP' } |
 *   { type: 'SET_REFERENCE_IMAGE'; payload: string | null } |
 *   { type: 'SET_REFERENCE_TEXT'; payload: string } |
 *   // { type: 'SET_OPENAI_API_KEY'; payload: string } | // SKIPPED
 *   { type: 'ANALYSIS_START' } |
 *   { type: 'SET_ANALYSIS_RESULT'; payload: AnalyzeImageOutputFormat | null } |
 *   { type: 'ANALYSIS_ERROR'; payload: string | null } |
 *   { type: 'SET_PRIMARY_COLOR'; payload: string } |
 *   { type: 'SET_SECONDARY_COLOR'; payload: string } |
 *   { type: 'SET_STYLE_WORDS'; payload: string[] } |
 *   { type: 'ADD_STYLE_WORD'; payload: string } |
 *   { type: 'REMOVE_STYLE_WORD'; payload: string } |
 *   { type: 'SET_TARGET_AUDIENCE'; payload: string } |
 *   { type: 'SET_OUTPUT_FORMAT'; payload: string } |
 *   { type: 'SET_NUMBER_OF_VARIATIONS'; payload: number } |
 *   { type: 'GENERATION_START' } |
 *   { type: 'GENERATION_SUCCESS'; payload: any[] } | // Define variation type later
 *   { type: 'GENERATION_ERROR'; payload: string | null }
 * } Action
 */


// --- Reducer ---

/**
 * @param {typeof initialState} state
 * @param {Action} action
 * @returns {typeof initialState}
 */
const brandReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEP':
      // Ensure step is within bounds
      const newStep = Math.max(1, Math.min(5, action.payload));
      // Prevent going to preview if no variations generated (unless loading/error)
      if (
        newStep === 5 &&
        state.generatedVariations.length === 0 &&
        !state.isLoading &&
        !state.error
      ) {
        return state;
      }
       // Prevent moving from step 1 if analyzing
       if (state.currentStep === 1 && state.isAnalyzing) {
           return state;
       }
      return { ...state, currentStep: newStep };
    case 'NEXT_STEP':
      const next = Math.min(5, state.currentStep + 1);
       // Prevent moving from step 1 if analyzing
       if (state.currentStep === 1 && state.isAnalyzing) {
           return state;
       }
       // Prevent moving from step 1 if image is uploaded but analysis hasn't finished (or failed)
       if (state.currentStep === 1 && state.referenceImage && !state.analysisResult && !state.analysisError) {
           return state;
       }
      // Prevent going to preview if no variations generated (unless loading/error)
      if (
        next === 5 &&
        state.generatedVariations.length === 0 &&
        !state.isLoading &&
        !state.error
      ) {
        return state;
      }
      return { ...state, currentStep: next };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) };
    case 'SET_REFERENCE_IMAGE':
      return { ...state, referenceImage: action.payload, error: null, analysisResult: null, analysisError: null, isAnalyzing: false }; // Clear errors/analysis on new image
    case 'SET_REFERENCE_TEXT':
      return { ...state, referenceText: action.payload };
    // case 'SET_OPENAI_API_KEY': // SKIPPED: Removed action type
    //   return { ...state, openaiApiKey: action.payload };
    case 'ANALYSIS_START':
        return { ...state, isAnalyzing: true, analysisResult: null, analysisError: null };
    case 'SET_ANALYSIS_RESULT':
        return { ...state, analysisResult: action.payload, isAnalyzing: false, analysisError: null };
    case 'ANALYSIS_ERROR':
        return { ...state, analysisError: action.payload, isAnalyzing: false, analysisResult: null };
    case 'SET_PRIMARY_COLOR':
      return { ...state, primaryColor: action.payload };
    case 'SET_SECONDARY_COLOR':
      return { ...state, secondaryColor: action.payload };
    case 'SET_STYLE_WORDS': // Handle setting all words
        return { ...state, brandStyleWords: action.payload };
    case 'ADD_STYLE_WORD':
      if (!state.brandStyleWords.includes(action.payload)) {
        return {
          ...state,
          brandStyleWords: [...state.brandStyleWords, action.payload],
        };
      }
      return state;
    case 'REMOVE_STYLE_WORD':
      return {
        ...state,
        brandStyleWords: state.brandStyleWords.filter(
          (word) => word !== action.payload
        ),
      };
    case 'SET_TARGET_AUDIENCE':
      return { ...state, targetAudience: action.payload };
    case 'SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.payload };
    case 'SET_NUMBER_OF_VARIATIONS':
      const variations = Math.max(1, Math.min(10, action.payload)); // Clamp between 1 and 10
      return { ...state, numberOfVariations: variations };
    case 'GENERATION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        generatedVariations: [], // Clear previous variations
      };
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        isLoading: false,
        generatedVariations: action.payload,
        currentStep: 5, // Move to preview step
      };
    case 'GENERATION_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      // Ensure exhaustive check in TypeScript, not directly applicable here but good practice
      // const exhaustiveCheck: never = action;
      return state;
  }
};

// --- Context ---

/**
 * @typedef {object} BrandContextValue
 * @property {typeof initialState} state
 * @property {React.Dispatch<Action>} dispatch
 * @property {(step: number) => void} goToStep
 * @property {() => void} nextStep
 * @property {() => void} prevStep
 */

/** @type {React.Context<BrandContextValue | undefined>} */
const BrandContext = createContext(undefined);


// --- Provider ---

export const BrandProvider = ({ children }) => {
  const [state, dispatch] = useReducer(brandReducer, initialState);

  const goToStep = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const value = { state, dispatch, goToStep, nextStep, prevStep };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

// --- Hook ---

/**
 * @returns {BrandContextValue}
 */
export const useBrandContext = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrandContext must be used within a BrandProvider');
  }
  return context;
};
