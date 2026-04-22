
'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where, limit, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, updateDoc, setDoc } from 'firebase/firestore';
import type { Recipe } from '@/types';
import { adaptMealToRecipe } from './data-adapter';
import type { Meal } from '@/types';

async function docToRecipe(doc: any): Promise<Recipe> {
    const data = doc.data() as Meal;
    return await adaptMealToRecipe(data);
}


export async function getRecipes(options: { 
    cuisine?: string | null,
    category?: string | null,
    diet?: string | null,
    searchTerm?: string,
    limit?: number 
} = {}): Promise<Recipe[]> {
    const recipesCol = collection(db, 'recipes');
    let q = query(recipesCol);

    if (options.cuisine) {
        // Filter by cuisine area
        q = query(q, where('strArea', '==', options.cuisine));
    }

    if (options.category) {
        // Filter by category
        q = query(q, where('strCategory', '==', options.category));
    }

    if (options.diet) {
        // Filter by diet/alternate
        q = query(q, where('strMealAlternate', '==', options.diet));
    }

    // Note: Firestore doesn't support general substring contains. We'll filter by name in-memory below.

    if(options.limit) {
        q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    let results = await Promise.all(snapshot.docs.map(docToRecipe));
    // Client-side substring match on recipe name
    if (options.searchTerm && options.searchTerm.trim() !== '') {
        const t = options.searchTerm.trim().toLowerCase();
        results = results.filter(r => r.name.toLowerCase().includes(t));
    }
    return results;
}

export async function getRecipesPaginated(options: { 
    cuisine?: string | null,
    category?: string | null,
    diet?: string | null,
    searchTerm?: string,
    limit?: number,
    page?: number,
    sortByRating?: boolean,
    sort?: 'avgReviews' | 'timeAsc' | 'timeDesc' | 'rating',
    maxRecipes?: number
} = {}): Promise<{ recipes: Recipe[], hasMore: boolean, totalRecipes: number, totalPages: number }> {
    const recipesCol = collection(db, 'recipes');
    const pageSize = options.limit || 10;
    const currentPage = options.page || 1;
    const maxRecipes = options.maxRecipes || 100; // Limit total recipes to 100 by default
    
    let q = query(recipesCol);

    if (options.cuisine) {
        // Filter by cuisine area
        q = query(q, where('strArea', '==', options.cuisine));
    }

    if (options.category) {
        // Filter by category
        q = query(q, where('strCategory', '==', options.category));
    }

    if (options.diet) {
        // Filter by diet/alternate
        q = query(q, where('strMealAlternate', '==', options.diet));
    }

    // Note: We'll apply substring search in-memory after fetching

    // Get all recipes first, then sort and paginate in memory
    // This approach works well for moderate-sized datasets
    const allSnapshot = await getDocs(q);
    let allRecipes = await Promise.all(allSnapshot.docs.map(docToRecipe));
    
    // Apply substring filter by recipe name
    if (options.searchTerm && options.searchTerm.trim() !== '') {
        const t = options.searchTerm.trim().toLowerCase();
        allRecipes = allRecipes.filter(r => r.name.toLowerCase().includes(t));
    }
    
    if (options.sort === 'rating' || options.sortByRating) {
        // Sort by rating in descending order (highest rated first)
        allRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
        // For random-like behavior, shuffle the array
        for (let i = allRecipes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allRecipes[i], allRecipes[j]] = [allRecipes[j], allRecipes[i]];
        }
    }

    // Extra sorts
    if (options.sort === 'timeAsc') {
        allRecipes.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
    } else if (options.sort === 'timeDesc') {
        allRecipes.sort((a, b) => (b.prepTime + b.cookTime) - (a.prepTime + a.cookTime));
    } else if (options.sort === 'avgReviews') {
        // Approximate avg customer reviews with rating, tie-breaker by total time asc
        allRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
    }
    
    // Limit total recipes to prevent infinite pagination
    const limitedRecipes = allRecipes.slice(0, maxRecipes);
    const totalRecipes = limitedRecipes.length;
    const totalPages = Math.ceil(totalRecipes / pageSize);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRecipes = limitedRecipes.slice(startIndex, endIndex);
    
    return {
        recipes: paginatedRecipes,
        hasMore: currentPage < totalPages,
        totalRecipes,
        totalPages
    };
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
    const docRef = doc(db, 'recipes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return await docToRecipe(docSnap);
    } else {
        // Fallback for numeric IDs that might have been used before
        const q = query(collection(db, 'recipes'), where('idMeal', '==', id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return await docToRecipe(querySnapshot.docs[0]);
        }
        return null;
    }
}

// Fetch up to `maxRecipes` recipes (adapted) without pagination for client-side processing.
export async function getAllRecipes(maxRecipes: number = 300): Promise<Recipe[]> {
    const recipesCol = collection(db, 'recipes');
    const q = query(recipesCol);
    const allSnapshot = await getDocs(q);
    const allRecipes = await Promise.all(allSnapshot.docs.map(docToRecipe));
    return allRecipes.slice(0, maxRecipes);
}

export async function getRecipesByIds(ids: string[]): Promise<Recipe[]> {
    if (ids.length === 0) {
        return [];
    }
    
    // Firestore 'in' queries are limited to 30 items in the array.
    // For a production app with many favorites, you might need to batch these queries.
    // Split the ids into chunks of 30
    const chunkSize = 30;
    const chunks = [];
    for (let i = 0; i < ids.length; i += chunkSize) {
        chunks.push(ids.slice(i, i + chunkSize));
    }
    
    // Process all chunks and combine results
    const allResults: Recipe[] = [];
    for (const chunk of chunks) {
        const recipesCol = collection(db, 'recipes');
        const q = query(recipesCol, where('idMeal', 'in', chunk));
        const snapshot = await getDocs(q);
        const chunkResults = await Promise.all(snapshot.docs.map(docToRecipe));
        allResults.push(...chunkResults);
    }
    
    return allResults;
}

export async function getCategories() {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => doc.data());
}

export async function getAreas() {
    const snapshot = await getDocs(collection(db, 'areas'));
    return snapshot.docs.map(doc => doc.data());
}

export async function getIngredients() {
    const snapshot = await getDocs(collection(db, 'ingredients'));
    return snapshot.docs.map(doc => doc.data());
}

export async function getAlternates() {
    const snapshot = await getDocs(collection(db, 'alternates'));
    return snapshot.docs.map(doc => doc.data());
}

// Function to get ingredient details by name
export async function getIngredientByName(ingredientName: string) {
    try {
        const ingredientsCol = collection(db, 'ingredients');
        // Search for ingredient by name (case insensitive)
        const q = query(
            ingredientsCol, 
            where('strIngredient', '>=', ingredientName.toLowerCase()),
            where('strIngredient', '<=', ingredientName.toLowerCase() + '\uf8ff'),
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const ingredientData = snapshot.docs[0].data();
            return {
                id: ingredientData.idIngredient,
                name: ingredientData.strIngredient,
                description: ingredientData.strDescription,
                image: ingredientData.strImage,
                type: ingredientData.strType || null
            };
        }
        
        // If exact match not found, try partial match
        const partialQuery = query(ingredientsCol);
        const allSnapshot = await getDocs(partialQuery);
        
        const partialMatch = allSnapshot.docs.find(doc => {
            const data = doc.data();
            return data.strIngredient && 
                   data.strIngredient.toLowerCase().includes(ingredientName.toLowerCase());
        });
        
        if (partialMatch) {
            const ingredientData = partialMatch.data();
            return {
                id: ingredientData.idIngredient,
                name: ingredientData.strIngredient,
                description: ingredientData.strDescription,
                image: ingredientData.strImage,
                type: ingredientData.strType || null
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching ingredient details:', error);
        return null;
    }
}

// Function to save calculated macros to Firebase
export async function saveMacrosToFirebase(recipeId: string, macros: any, confidence?: string, notes?: string) {
    try {
        const recipeRef = doc(db, 'recipes', recipeId);
        
        // Clean the macros object to avoid undefined values
        const cleanMacros: any = {
            protein: macros.protein || 0,
            fats: macros.fats || 0,
            carbs: macros.carbs || 0,
            confidence: confidence || 'medium',
            notes: notes || 'AI calculated',
            calculatedAt: new Date().toISOString(),
            version: '1.0' // For future schema changes
        };
        
        // Only add optional fields if they have valid values
        if (macros.calories !== undefined && macros.calories !== null) {
            cleanMacros.calories = macros.calories;
        }
        if (macros.fiber !== undefined && macros.fiber !== null) {
            cleanMacros.fiber = macros.fiber;
        }
        
        await updateDoc(recipeRef, {
            calculatedMacros: cleanMacros
        });
        console.log(`Saved macros for recipe ${recipeId}`);
    } catch (error) {
        console.error(`Failed to save macros for recipe ${recipeId}:`, error);
        // Don't throw error - caching failure shouldn't break the flow
    }
}

// Function to get cached macros from Firebase
export async function getCachedMacros(recipeId: string) {
    try {
        const recipeRef = doc(db, 'recipes', recipeId);
        const recipeDoc = await getDoc(recipeRef);
        
        if (recipeDoc.exists()) {
            const data = recipeDoc.data();
            if (data.calculatedMacros) {
                console.log(`Found cached macros for recipe ${recipeId}`);
                return {
                    macros: {
                        protein: data.calculatedMacros.protein || 0,
                        fats: data.calculatedMacros.fats || 0,
                        carbs: data.calculatedMacros.carbs || 0,
                        calories: data.calculatedMacros.calories,
                        fiber: data.calculatedMacros.fiber,
                    },
                    confidence: data.calculatedMacros.confidence || 'medium',
                    notes: data.calculatedMacros.notes || 'Cached AI calculation',
                    calculatedAt: data.calculatedMacros.calculatedAt,
                    isCached: true
                };
            }
        }
        return null;
    } catch (error) {
        console.error(`Failed to get cached macros for recipe ${recipeId}:`, error);
        return null;
    }
}

