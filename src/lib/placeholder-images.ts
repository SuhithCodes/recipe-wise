
import type { Recipe } from '@/types';
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// This function now acts as a fallback. 
// In a real app, you'd want to use the strmealThumb directly.
export function getPlaceholderImage(recipe: Recipe): ImagePlaceholder {
    const existing = data.placeholderImages.find(img => img.id === recipe.id);
    if (existing) {
        return existing;
    }
    
    // If we have a real image URL from the adapted data, use it.
    if (recipe.image && (recipe.image.startsWith('http'))) {
        return {
            id: recipe.id,
            description: recipe.description,
            imageUrl: recipe.image,
            imageHint: recipe.tags.slice(0, 2).join(' ')
        }
    }

    // Fallback to a completely random image if no match
    const fallbackImage = data.placeholderImages.find(img => img.id === 'hero');
    return fallbackImage || {
        id: 'fallback',
        description: 'A placeholder image',
        imageUrl: 'https://picsum.photos/seed/fallback/600/400',
        imageHint: 'food'
    };
}


export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;
