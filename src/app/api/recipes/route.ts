import { NextResponse } from 'next/server';
import { getRecipes, addRecipe } from '@/lib/firestore';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { parseRecipe } from '@/ai/flows/add-recipe';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cuisine = searchParams.get('cuisine');
  const category = searchParams.get('category');
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 10;
  const searchTerm = searchParams.get('search') || undefined;

  try {
    const recipes = await getRecipes({ cuisine, category, limit, searchTerm });
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    // Check content length to prevent abuse (limit to ~10KB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 10000) {
      return NextResponse.json({ error: 'Payload too large. Limit is 10KB.' }, { status: 413 });
    }

    const body = await request.json();

    if (body.text) {
      // Parse using Gemini
      const parsedRecipe = await parseRecipe(body.text);
      const saved = await addRecipe(parsedRecipe);
      return NextResponse.json({ recipe: saved }, { status: 201 });
    } else if (body.name && body.ingredients) {
      // Direct insertion if they already have structured data (would need validation in a real app)
      const saved = await addRecipe(body);
      return NextResponse.json({ recipe: saved }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Invalid payload. Provide "text" for AI parsing, or structured recipe data.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error adding recipe:', error);
    return NextResponse.json({ error: 'Failed to add recipe', details: (error as Error).message }, { status: 500 });
  }
}
