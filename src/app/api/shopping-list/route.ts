import { NextResponse } from 'next/server';
import { getShoppingList, addToShoppingList, removeFromShoppingList, clearShoppingList } from '@/lib/shopping-list';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request: Request) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
  }

  try {
    const list = await getShoppingList(userId);
    return NextResponse.json({ items: list });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json({ error: 'Failed to fetch shopping list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { userId, recipeId } = body;

    if (!userId || !recipeId) {
      return NextResponse.json({ error: 'userId and recipeId are required' }, { status: 400 });
    }

    const count = await addToShoppingList(userId, recipeId);
    return NextResponse.json({ success: true, itemsAdded: count });
  } catch (error) {
    console.error('Error adding to shopping list:', error);
    return NextResponse.json({ error: 'Failed to add to shopping list', details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!validateApiKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const itemId = searchParams.get('itemId');
  const clearAll = searchParams.get('clearAll') === 'true';

  if (!userId) {
    return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
  }

  try {
    if (clearAll) {
      await clearShoppingList(userId);
      return NextResponse.json({ success: true, message: 'Shopping list cleared' });
    } else if (itemId) {
      await removeFromShoppingList(userId, itemId);
      return NextResponse.json({ success: true, message: 'Item removed' });
    } else {
      return NextResponse.json({ error: 'itemId or clearAll parameter is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error modifying shopping list:', error);
    return NextResponse.json({ error: 'Failed to modify shopping list' }, { status: 500 });
  }
}
