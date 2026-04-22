'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useFavorites } from '@/hooks/use-favorites';
import { getRecipesByIds } from '@/lib/firestore';
import type { Recipe } from '@/types';
import RecipeCard from '@/components/recipes/recipe-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateProfile } from 'firebase/auth';
import { getUserProfile, updateUserProfile, type UserProfileData } from '@/lib/user-profile';
import { recommendByFavorites } from '@/lib/recommendations';
import type { Meal } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading, logOut } = useAuth();
  const { favoriteIds, isLoading: favsLoading } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [profileForm, setProfileForm] = useState<{ displayName: string; bio: string; dietaryPreferences: string; preferredCuisines: string[] } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [topTags, setTopTags] = useState<string[]>([]);
  const [topCuisines, setTopCuisines] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<Recipe[]>([]);
  const [allCuisines, setAllCuisines] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/signin');
    }
  }, [authLoading, isLoggedIn]);

  useEffect(() => {
    async function loadFavorites() {
      setLoadingFavorites(true);
      try {
        const ids = Array.from(favoriteIds);
        const recipes = await getRecipesByIds(ids);
        setFavoriteRecipes(recipes);
      } finally {
        setLoadingFavorites(false);
      }
    }
    if (favoriteIds.size > 0) {
      loadFavorites();
    } else {
      setFavoriteRecipes([]);
      setLoadingFavorites(false);
    }
  }, [favoriteIds]);

  // Load user profile extended fields
  useEffect(() => {
    async function loadProfileExtras() {
      if (!user) return;
      const prof = await getUserProfile(user.uid);
      setProfileForm({
        displayName: user.displayName || '',
        bio: prof.bio || '',
        dietaryPreferences: (prof.dietaryPreferences || []).join(', '),
        preferredCuisines: prof.preferredCuisines || [],
      });
    }
    loadProfileExtras();
  }, [user]);

  // Load cuisines list (areas collection) if available
  useEffect(() => {
    async function loadCuisines() {
      try {
        const { getAreas } = await import('@/lib/firestore');
        const areas = await getAreas();
        // areas documents are raw; try common fields: strArea or name
        const names = areas.map((a: any) => a.strArea || a.name).filter(Boolean);
        setAllCuisines(Array.from(new Set(names)));
      } catch {
        setAllCuisines([]);
      }
    }
    loadCuisines();
  }, []);

  // Derive top cuisines and tags from favorites; generate small recommendations sample
  useEffect(() => {
    if (favoriteRecipes.length === 0) {
      setTopCuisines([]);
      setTopTags([]);
      setRecommended([]);
      return;
    }
    const cuisineCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    for (const r of favoriteRecipes) {
      if (r.cuisine) cuisineCounts[r.cuisine] = (cuisineCounts[r.cuisine] || 0) + 1;
      for (const t of r.tags || []) tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
    const topC = Object.entries(cuisineCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    const topT = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k);
    setTopCuisines(topC);
    setTopTags(topT);

    // Lightweight self-recommendation from favorites only (no global fetch here)
    // Map Recipe -> minimal Meal and recommend among favorites to highlight variety
    const toMeal = (r: Recipe): Meal => ({
      idMeal: r.id,
      strMeal: r.name,
      strDrinkAlternate: null,
      strCategory: r.mealType,
      strArea: r.cuisine,
      strInstructions: '',
      strMealThumb: r.image,
      strTags: r.tags?.join(',') || null,
      strYoutube: r.youtubeUrl || '',
      strIngredient1: r.ingredients[0]?.name || null,
      strIngredient2: r.ingredients[1]?.name || null,
      strIngredient3: r.ingredients[2]?.name || null,
      strIngredient4: r.ingredients[3]?.name || null,
      strIngredient5: r.ingredients[4]?.name || null,
      strIngredient6: null,
      strIngredient7: null,
      strIngredient8: null,
      strIngredient9: null,
      strIngredient10: null,
      strIngredient11: null,
      strIngredient12: null,
      strIngredient13: null,
      strIngredient14: null,
      strIngredient15: null,
      strIngredient16: null,
      strIngredient17: null,
      strIngredient18: null,
      strIngredient19: null,
      strIngredient20: null,
      strMeasure1: null,
      strMeasure2: null,
      strMeasure3: null,
      strMeasure4: null,
      strMeasure5: null,
      strMeasure6: null,
      strMeasure7: null,
      strMeasure8: null,
      strMeasure9: null,
      strMeasure10: null,
      strMeasure11: null,
      strMeasure12: null,
      strMeasure13: null,
      strMeasure14: null,
      strMeasure15: null,
      strMeasure16: null,
      strMeasure17: null,
      strMeasure18: null,
      strMeasure19: null,
      strMeasure20: null,
      strSource: null,
      strImageSource: null,
      strCreativeCommonsConfirmed: null,
      dateModified: null,
    });
    const meals = favoriteRecipes.map(toMeal);
    const ranked = recommendByFavorites(meals, meals, 3);
    const ids = new Set(ranked.map(r => r.meal.idMeal));
    setRecommended(favoriteRecipes.filter(r => ids.has(r.id)));
  }, [favoriteRecipes]);

  if (authLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.displayName?.split(' ').map(n => n[0]?.toUpperCase()).slice(0, 2).join('') || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <section className="mb-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.photoURL ?? `https://i.pravatar.cc/100?u=${user.uid}`} alt={user.displayName || user.email || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.displayName || 'Your Profile'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex gap-3">
              <Button variant="secondary" onClick={() => router.push('/favorites')}>View Favorites</Button>
              <Button variant="outline" onClick={() => router.push('/meal-planner')}>Meal Planner</Button>
              <Button variant="outline" onClick={() => router.push('/shopping-list')}>Shopping List</Button>
              <Button variant="ghost" onClick={async () => { await logOut(); router.push('/'); }}>Log out</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-headline text-xl font-semibold mb-4">Profile</h2>
        {profileForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm">Display name</label>
              <Input
                value={profileForm.displayName}
                onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                placeholder="Your name"
              />
              <label className="text-sm">Dietary preferences (comma separated)</label>
              <Input
                value={profileForm.dietaryPreferences}
                onChange={(e) => setProfileForm({...profileForm, dietaryPreferences: e.target.value})}
                placeholder="vegetarian, gluten-free"
              />
              <label className="text-sm">Bio</label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                placeholder="Tell us about your cooking style..."
              />
              <div className="flex gap-2">
                <Button
                  disabled={savingProfile}
                  onClick={async () => {
                    if (!user || !profileForm) return;
                    setSavingProfile(true);
                    try {
                      // Update Firebase Auth displayName
                      if (profileForm.displayName !== (user.displayName || '')) {
                        await updateProfile(user, { displayName: profileForm.displayName });
                      }
                      // Update Firestore profile fields
                      const updates: UserProfileData = {
                        bio: profileForm.bio || undefined,
                        dietaryPreferences: profileForm.dietaryPreferences
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean),
                        preferredCuisines: profileForm.preferredCuisines,
                      };
                      await updateUserProfile(user.uid, updates);
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                >Save changes</Button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Preferred cuisines</p>
                <div className="flex flex-wrap gap-2">
                  {allCuisines.slice(0, 24).map((c) => {
                    const checked = !!profileForm?.preferredCuisines.includes(c);
                    return (
                      <button
                        key={c}
                        className={`rounded-full border px-3 py-1 text-sm ${checked ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                        onClick={() => {
                          if (!profileForm) return;
                          const set = new Set(profileForm.preferredCuisines);
                          if (set.has(c)) set.delete(c); else set.add(c);
                          setProfileForm({ ...profileForm, preferredCuisines: Array.from(set) });
                        }}
                      >{c}</button>
                    );
                  })}
                  {allCuisines.length === 0 && <span className="text-sm text-muted-foreground">No cuisines loaded</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top cuisines from your favorites</p>
                <div className="flex flex-wrap gap-2">
                  {topCuisines.map(c => (
                    <span key={c} className="rounded-full border px-3 py-1 text-sm">{c}</span>
                  ))}
                  {topCuisines.length === 0 && <span className="text-sm text-muted-foreground">No data yet</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top tags from your favorites</p>
                <div className="flex flex-wrap gap-2">
                  {topTags.map(t => (
                    <span key={t} className="rounded-full border px-3 py-1 text-sm">{t}</span>
                  ))}
                  {topTags.length === 0 && <span className="text-sm text-muted-foreground">No data yet</span>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Skeleton className="h-48 w-full" />
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-headline text-xl font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Favorites</p>
            <p className="text-2xl font-bold">{favoriteIds.size}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Planned Meals</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Reviews</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="text-2xl font-bold">{new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-xl font-semibold mb-4">Favorite Recipes</h2>
        {loadingFavorites ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">You don't have any favorite recipes yet.</p>
        )}
      </section>

      {recommended.length > 0 && (
        <section className="mt-10">
          <h2 className="font-headline text-xl font-semibold mb-4">Recommended For You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


