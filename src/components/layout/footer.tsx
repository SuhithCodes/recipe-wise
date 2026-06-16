import Link from 'next/link';
import { Github, Linkedin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="font-headline text-lg font-bold">RecipeWise</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find, share, and manage your favorite recipes.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/SuhithCodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            
            <Link
              href="https://www.linkedin.com/in/gsuhith"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            
            <Link
              href="https://suhithghanathay.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Globe className="h-5 w-5" />
              <span className="sr-only">Portfolio</span>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Suhith Ghanathay. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
