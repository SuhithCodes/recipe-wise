import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to check if macros are fresh (calculated within last 30 days)
export function isMacrosCacheFresh(calculatedAt: string): boolean {
    if (!calculatedAt) return false;
    
    const calculatedDate = new Date(calculatedAt);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    return calculatedDate > thirtyDaysAgo;
}
