
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChefHat, LogIn, LogOut, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '../ui/skeleton';

const allNavLinks = [
  { href: '/', label: 'Recipes', auth: false },
  { href: '/meal-planner', label: 'Meal Planner', auth: true },
  { href: '/shopping-list', label: 'Shopping List', auth: true },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoading, logOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logOut();
    router.push('/');
  };

  const navLinks = allNavLinks.filter(link => !link.auth || (link.auth && isLoggedIn));

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn('flex items-center gap-6 text-sm font-medium', className)}>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'transition-colors hover:text-primary',
            pathname === href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  const handleSearchClick = () => {
    // If we're not on the home page, always navigate to home with the search toolbar open
    if (pathname !== '/') {
      router.push('/?showSearch=1');
      return;
    }
    // On the home page, toggle the toolbar on/off
    const current = new URLSearchParams(window.location.search);
    const isShown = current.get('showSearch') === '1';
    if (isShown) {
      current.delete('showSearch');
    } else {
      current.set('showSearch', '1');
    }
    const query = current.toString();
    const nextUrl = `${pathname}?${query}`.replace(/\?$/, '');
    router.push(nextUrl);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="hidden font-headline text-lg font-bold sm:inline-block">
              RecipeWise
            </span>
          </Link>
          <NavLinks />
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
                <SheetTitle>
                    <Link href="/" className="flex items-center space-x-2">
                    <ChefHat className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg font-bold">RecipeWise</span>
                    </Link>
                </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <NavLinks className="flex-col items-start gap-4" />
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <Link href="/" className="md:hidden ml-2 flex items-center" aria-label="RecipeWise home">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="sr-only">RecipeWise</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" onClick={handleSearchClick} aria-label="Toggle search and filters">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? `https://i.pravatar.cc/40?u=${user.uid}`} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback>{user.displayName?.[0].toUpperCase() || user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Welcome'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/favorites')}>Favorites</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button asChild>
              <Link href="/signin">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
