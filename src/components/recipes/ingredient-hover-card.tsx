'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getIngredientByName } from '@/lib/firestore';

interface IngredientData {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string | null;
}

interface IngredientHoverCardProps {
  ingredientName: string;
  children: React.ReactNode;
}

export function IngredientHoverCard({ ingredientName, children }: IngredientHoverCardProps) {
  const [ingredientData, setIngredientData] = useState<IngredientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const handleHover = async () => {
    if (hasAttempted) return; // Don't fetch again if already attempted
    
    setLoading(true);
    setHasAttempted(true);
    
    try {
      const data = await getIngredientByName(ingredientName);
      if (data) {
        setIngredientData(data);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching ingredient:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="w-80">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error || !ingredientData) {
      return (
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium capitalize">{ingredientName}</p>
              <p className="mt-1">No additional information available</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-4">
            {ingredientData.image && (
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                <Image
                  src={ingredientData.image}
                  alt={ingredientData.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div>
              <CardTitle className="text-base font-semibold capitalize">
                {ingredientData.name}
              </CardTitle>
              {ingredientData.type && (
                <p className="text-xs text-muted-foreground capitalize">
                  {ingredientData.type}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {ingredientData.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ingredientData.description.length > 200 
                ? `${ingredientData.description.substring(0, 200)}...` 
                : ingredientData.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description available
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger 
        asChild 
        onMouseEnter={handleHover}
        className="cursor-pointer"
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="p-0">
        {renderContent()}
      </HoverCardContent>
    </HoverCard>
  );
}
