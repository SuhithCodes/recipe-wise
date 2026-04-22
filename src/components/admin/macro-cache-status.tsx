'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Clock } from 'lucide-react';
import { clearMacroCache } from '@/app/actions';

interface MacroCacheStatusProps {
  recipeId: string;
  recipeName: string;
  hasCachedMacros?: boolean;
  calculatedAt?: string;
  confidence?: string;
}

export function MacroCacheStatus({ 
  recipeId, 
  recipeName, 
  hasCachedMacros = false, 
  calculatedAt, 
  confidence 
}: MacroCacheStatusProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const result = await clearMacroCache(recipeId);
      if (result.success) {
        setClearSuccess(true);
        setTimeout(() => setClearSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getCacheStatus = () => {
    if (!hasCachedMacros) return { status: 'No Cache', color: 'destructive' };
    if (!calculatedAt) return { status: 'Unknown', color: 'secondary' };
    
    const calculatedDate = new Date(calculatedAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - calculatedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) return { status: 'Fresh', color: 'default' };
    if (daysDiff <= 30) return { status: 'Valid', color: 'secondary' };
    return { status: 'Stale', color: 'destructive' };
  };

  const cacheStatus = getCacheStatus();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          Macro Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Recipe:</span>
          <span className="text-sm text-muted-foreground">{recipeName}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Cache Status:</span>
          <Badge variant={cacheStatus.color as any}>
            {cacheStatus.status}
          </Badge>
        </div>
        
        {calculatedAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Calculated:</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(calculatedAt)}
            </span>
          </div>
        )}
        
        {confidence && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence:</span>
            <Badge variant="outline">{confidence}</Badge>
          </div>
        )}
        
        {clearSuccess && (
          <div className="p-2 bg-green-50 text-green-700 text-sm rounded-md">
            Cache cleared successfully! Macros will be recalculated on next request.
          </div>
        )}
        
        <Button 
          onClick={handleClearCache}
          disabled={isClearing || !hasCachedMacros}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
          {isClearing ? 'Clearing...' : 'Force Recalculate Macros'}
        </Button>
      </CardContent>
    </Card>
  );
}
