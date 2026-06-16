import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { Recipe } from '@/types';

// Initialize DOMPurify for Node.js environment
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Strips HTML tags, script blocks, and event handlers from a string.
 */
export function sanitizeString(str: string | undefined | null): string {
  if (!str) return '';
  return purify.sanitize(str, {
    ALLOWED_TAGS: [], // No tags allowed, pure text
    ALLOWED_ATTR: [], // No attributes allowed
  });
}

/**
 * Sanitizes all string fields in a Recipe object to prevent XSS.
 */
export function sanitizeRecipe(recipe: Partial<Recipe>): Partial<Recipe> {
  const sanitized: Partial<Recipe> = { ...recipe };

  if (sanitized.name) sanitized.name = sanitizeString(sanitized.name);
  if (sanitized.description) sanitized.description = sanitizeString(sanitized.description);
  if (sanitized.cuisine) sanitized.cuisine = sanitizeString(sanitized.cuisine);
  if (sanitized.youtubeUrl) sanitized.youtubeUrl = sanitizeString(sanitized.youtubeUrl);
  if (sanitized.mealType) sanitized.mealType = sanitizeString(sanitized.mealType);
  if (sanitized.image) sanitized.image = sanitizeString(sanitized.image);
  if (sanitized.id) sanitized.id = sanitizeString(sanitized.id);

  if (sanitized.dietary) {
    sanitized.dietary = sanitized.dietary.map(sanitizeString);
  }

  if (sanitized.tags) {
    sanitized.tags = sanitized.tags.map(sanitizeString);
  }

  if (sanitized.ingredients) {
    sanitized.ingredients = sanitized.ingredients.map(ing => ({
      ...ing,
      name: sanitizeString(ing.name),
      quantity: sanitizeString(ing.quantity),
      unit: sanitizeString(ing.unit),
    }));
  }

  if (sanitized.instructions) {
    sanitized.instructions = sanitized.instructions.map(inst => ({
      ...inst,
      text: sanitizeString(inst.text),
    }));
  }

  return sanitized;
}
