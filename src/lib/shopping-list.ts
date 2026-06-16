'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getRecipeById } from './firestore';

export type ShoppingListItem = {
    id: string;
    ingredientName: string;
    quantity: string;
    unit: string;
    recipeName: string;
    recipeId: string;
    addedAt: string;
};

const getShoppingListCol = (uid: string) => collection(db, 'users', uid, 'shopping-list');

export async function getShoppingList(uid: string): Promise<ShoppingListItem[]> {
    const colRef = getShoppingListCol(uid);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingListItem));
}

export async function addToShoppingList(uid: string, recipeId: string): Promise<number> {
    const recipe = await getRecipeById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const colRef = getShoppingListCol(uid);
    let count = 0;

    for (const ingredient of recipe.ingredients) {
        if (!ingredient.name) continue;
        
        const docRef = doc(colRef); // Auto ID
        const item: Omit<ShoppingListItem, 'id'> = {
            ingredientName: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            recipeName: recipe.name,
            recipeId: recipe.id,
            addedAt: new Date().toISOString()
        };
        await setDoc(docRef, item);
        count++;
    }

    return count;
}

export async function addItemToShoppingList(uid: string, item: Omit<ShoppingListItem, 'id'>): Promise<string> {
    const colRef = getShoppingListCol(uid);
    const docRef = doc(colRef);
    await setDoc(docRef, item);
    return docRef.id;
}

export async function removeFromShoppingList(uid: string, itemId: string): Promise<void> {
    const docRef = doc(db, 'users', uid, 'shopping-list', itemId);
    await deleteDoc(docRef);
}

export async function clearShoppingList(uid: string): Promise<void> {
    const colRef = getShoppingListCol(uid);
    const snapshot = await getDocs(colRef);
    
    // In production, batching is recommended for deleting many docs.
    const deletePromises = snapshot.docs.map(document => deleteDoc(document.ref));
    await Promise.all(deletePromises);
}
