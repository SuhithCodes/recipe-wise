import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { getRecipes, getRecipeById, addRecipe } from '@/lib/firestore';
import { getShoppingList, addToShoppingList, clearShoppingList } from '@/lib/shopping-list';
import { parseRecipe } from '@/ai/flows/add-recipe';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

const handler = createMcpHandler(async (server) => {
  // @ts-ignore: TypeScript complains about deep Zod inference here
  server.tool(
    'list_recipes',
    'List or search recipes',
    {
      cuisine: z.string().optional(),
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().optional(),
    },
    async ({ cuisine, category, search, limit }) => {
      const recipes = await getRecipes({ cuisine, category, searchTerm: search, limit });
      return { content: [{ type: 'text', text: JSON.stringify(recipes) }] };
    }
  );

  server.tool(
    'get_recipe',
    'Get a specific recipe by ID',
    { id: z.string() },
    async ({ id }) => {
      const recipe = await getRecipeById(id);
      return { content: [{ type: 'text', text: JSON.stringify(recipe || { error: 'Not found' }) }] };
    }
  );

  server.tool(
    'add_recipe',
    'Parse raw text into a structured recipe and add it to the database',
    { text: z.string() },
    async ({ text }) => {
      const parsedRecipe = await parseRecipe(text);
      const saved = await addRecipe(parsedRecipe);
      return { content: [{ type: 'text', text: JSON.stringify(saved) }] };
    }
  );

  server.tool(
    'get_shopping_list',
    'Get a users shopping list',
    { userId: z.string() },
    async ({ userId }) => {
      const list = await getShoppingList(userId);
      return { content: [{ type: 'text', text: JSON.stringify(list) }] };
    }
  );

  server.tool(
    'add_to_shopping_list',
    'Add all ingredients from a recipe to a users shopping list',
    { userId: z.string(), recipeId: z.string() },
    async ({ userId, recipeId }) => {
      const count = await addToShoppingList(userId, recipeId);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, itemsAdded: count }) }] };
    }
  );

  server.tool(
    'clear_shopping_list',
    'Clear a users shopping list',
    { userId: z.string() },
    async ({ userId }) => {
      await clearShoppingList(userId);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Cleared' }) }] };
    }
  );
}, undefined, { basePath: '/api/mcp' });

export async function POST(req: Request) {
  if (!validateApiKey(req)) return unauthorizedResponse();
  return handler(req);
}

export async function GET(req: Request) {
  if (!validateApiKey(req)) return unauthorizedResponse();
  return handler(req);
}
