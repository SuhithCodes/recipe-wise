'use client';

import { useShoppingList } from '@/hooks/use-shopping-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ShoppingCart, Trash2 } from 'lucide-react';

export default function ShoppingListPage() {
  const { items, removeIngredient, clearList } = useShoppingList();

  const groupedItems = Array.from(items.values()).reduce((acc, { ingredient, recipeName }) => {
    if (!acc[recipeName]) {
      acc[recipeName] = [];
    }
    acc[recipeName].push(ingredient);
    return acc;
  }, {} as Record<string, typeof items extends Map<any, {ingredient: infer I, recipeName: any}> ? I[] : never >);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-4xl font-bold flex items-center">
          <ShoppingCart className="mr-3 h-8 w-8 text-primary" />
          Shopping List
        </h1>
        {items.size > 0 && (
          <Button variant="destructive" onClick={clearList}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {items.size === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Your shopping list is empty.</p>
            <p className="text-muted-foreground">Add ingredients from a recipe page to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([recipeName, ingredients]) => (
            <Card key={recipeName}>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{recipeName}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ingredients.map((ing) => (
                    <li key={ing.name} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                      <span>
                        <span className="font-semibold">{ing.quantity} {ing.unit}</span> {ing.name}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeIngredient(ing.name)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove {ing.name}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
