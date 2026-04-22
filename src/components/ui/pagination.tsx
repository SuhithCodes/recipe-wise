import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  totalPages?: number;
  totalRecipes?: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage?: (page: number) => void;
  loading?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  hasMore,
  totalPages,
  totalRecipes,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  loading = false,
  className = ''
}: PaginationProps) {
  const renderPageNumbers = () => {
    if (!totalPages || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onGoToPage?.(i)}
          disabled={loading}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage <= 1 || loading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {renderPageNumbers()}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasMore || loading}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Page Info */}
      <div className="text-sm text-muted-foreground text-center">
        {totalPages && totalRecipes ? (
          <span>
            Page {currentPage} of {totalPages} • {totalRecipes} recipes total
          </span>
        ) : (
          <span>
            Page {currentPage} • {hasMore ? 'More available' : 'End of results'}
          </span>
        )}
      </div>
    </div>
  );
}

export default Pagination;
