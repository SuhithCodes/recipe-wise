'use client';

import { useState, useEffect } from 'react';
import { getCachedMacros, saveMacrosToFirebase } from '@/lib/firestore';
import { calculateRecipeMacros } from '@/app/actions';
import { isMacrosCacheFresh } from '@/lib/utils';
import type { Recipe, Macro } from '@/types';

type MacroCalculationState = {
  macros: Macro | null;
  loading: boolean;
  error: string | null;
  confidence?: string;
  notes?: string;
  isCached?: boolean;
};

export function useRecipeMacros(recipe: Recipe | null) {
  const [state, setState] = useState<MacroCalculationState>({
    macros: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!recipe) return;

    const calculateMacros = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // First, check if we have fresh cached macros
        const cachedMacros = await getCachedMacros(recipe.id);
        
        if (cachedMacros && isMacrosCacheFresh(cachedMacros.calculatedAt)) {
          console.log(`Using cached macros for ${recipe.name}`);
          setState({
            macros: {
              protein: cachedMacros.macros.protein,
              fats: cachedMacros.macros.fats,
              carbs: cachedMacros.macros.carbs,
              calories: cachedMacros.macros.calories,
              fiber: cachedMacros.macros.fiber
            },
            loading: false,
            error: null,
            confidence: cachedMacros.confidence,
            notes: cachedMacros.notes,
            isCached: true
          });
          return;
        }

        // No cache or stale cache - calculate fresh macros with AI
        console.log(`Calculating fresh macros for ${recipe.name}`);
        const macroResult = await calculateRecipeMacros({
          ingredients: recipe.ingredients,
          servings: recipe.servings,
          recipeName: recipe.name
        });
        
        const newMacros = {
          protein: macroResult.macros.protein,
          fats: macroResult.macros.fats,
          carbs: macroResult.macros.carbs,
          calories: macroResult.macros.calories,
          fiber: macroResult.macros.fiber
        };
        
        setState({
          macros: newMacros,
          loading: false,
          error: null,
          confidence: macroResult.confidence,
          notes: macroResult.notes,
          isCached: false
        });
        
        // Save the fresh calculation to Firebase for future use
        await saveMacrosToFirebase(
          recipe.id, 
          macroResult.macros, 
          macroResult.confidence, 
          macroResult.notes
        );
        
      } catch (error) {
        console.error('Failed to calculate macros for', recipe.name, error);
        
        // If we have old cached macros, use them even if stale
        const cachedMacros = await getCachedMacros(recipe.id);
        if (cachedMacros) {
          console.log(`Using stale cached macros for ${recipe.name}`);
          setState({
            macros: {
              protein: cachedMacros.macros.protein,
              fats: cachedMacros.macros.fats,
              carbs: cachedMacros.macros.carbs,
              calories: cachedMacros.macros.calories,
              fiber: cachedMacros.macros.fiber
            },
            loading: false,
            error: null,
            confidence: cachedMacros.confidence,
            notes: `${cachedMacros.notes} (stale cache)`,
            isCached: true
          });
        } else {
          // Use the recipe's existing mock macros as final fallback
          setState({
            macros: {
              protein: recipe.macros.protein,
              fats: recipe.macros.fats,
              carbs: recipe.macros.carbs,
              calories: recipe.macros.calories,
              fiber: recipe.macros.fiber
            },
            loading: false,
            error: 'Failed to calculate accurate macros. Showing estimated values.',
            confidence: 'low',
            notes: 'Fallback estimation used',
            isCached: false
          });
        }
      }
    };

    calculateMacros();
  }, [recipe?.id]);

  const recalculate = async () => {
    if (!recipe) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log(`Force recalculating macros for ${recipe.name}`);
      const macroResult = await calculateRecipeMacros({
        ingredients: recipe.ingredients,
        servings: recipe.servings,
        recipeName: recipe.name
      });
      
      const newMacros = {
        protein: macroResult.macros.protein,
        fats: macroResult.macros.fats,
        carbs: macroResult.macros.carbs,
        calories: macroResult.macros.calories,
        fiber: macroResult.macros.fiber
      };
      
      setState({
        macros: newMacros,
        loading: false,
        error: null,
        confidence: macroResult.confidence,
        notes: macroResult.notes,
        isCached: false
      });
      
      // Save the fresh calculation
      await saveMacrosToFirebase(
        recipe.id, 
        macroResult.macros, 
        macroResult.confidence, 
        macroResult.notes
      );
      
    } catch (error) {
      console.error('Failed to recalculate macros:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to recalculate macros. Please try again later.'
      }));
    }
  };

  return {
    ...state,
    recalculate
  };
}
