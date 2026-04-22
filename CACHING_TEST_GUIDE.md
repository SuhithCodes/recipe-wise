# Macro Caching Test Guide

## Testing the Caching System

### 1. Initial Setup
1. Set up your Google AI API key in `.env`:
   ```
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```
2. Start the development server: `npm run dev`

### 2. Test Cache Miss (First Calculation)
1. Visit a recipe page: `http://localhost:3000/recipes/[recipe-id]`
2. Check browser console for logs:
   ```
   "Calculating fresh macros for [Recipe Name]"
   "Saved macros for recipe [recipe-id]"
   ```
3. Note the loading time (should be 2-5 seconds for AI calculation)

### 3. Test Cache Hit (Subsequent Requests)
1. Refresh the same recipe page
2. Check browser console for logs:
   ```
   "Using cached macros for [Recipe Name]"
   ```
3. Note the loading time (should be <100ms)

### 4. Test Different Recipes
1. Visit multiple recipe pages
2. First visit = cache miss (AI calculation)
3. Subsequent visits = cache hit (fast loading)

### 5. Verify Firebase Storage
1. Check your Firebase console
2. Navigate to Firestore > recipes collection
3. Look for documents with `calculatedMacros` field:
   ```json
   {
     "calculatedMacros": {
       "protein": 32,
       "fats": 8,
       "carbs": 45,
       "calories": 365,
       "fiber": 3,
       "confidence": "high",
       "notes": "AI calculated using Gemini",
       "calculatedAt": "2024-01-15T10:30:00.000Z",
       "version": "1.0"
     }
   }
   ```

### 6. Test Cache Expiry (Manual)
1. Manually modify `calculatedAt` in Firebase to 31 days ago
2. Visit the recipe page
3. Should see fresh calculation (cache miss due to expiry)

### 7. Test Fallback Behavior
1. Temporarily remove API key or disable internet
2. Visit a recipe with cached macros
3. Should use cached values even if stale
4. Visit a recipe without cache
5. Should fall back to random mock values

## Console Log Examples

### Fresh Calculation:
```
Calculating fresh macros for Chicken Rice Bowl
Saved macros for recipe 52916
```

### Cache Hit:
```
Using cached macros for Chicken Rice Bowl
```

### Stale Cache Usage:
```
Failed to calculate macros for Chicken Rice Bowl: [Error]
Using stale cached macros for Chicken Rice Bowl
```

### Fallback to Mock:
```
Failed to calculate macros for New Recipe: [Error]
Using fallback random macros for New Recipe
```

## Performance Monitoring

### Metrics to Watch:
- **First load time**: 2-5 seconds (AI calculation)
- **Cached load time**: <100ms
- **API calls**: Only on first visit per recipe
- **Firebase reads**: On every visit (fast)
- **Firebase writes**: Only on fresh calculations

### Expected Behavior:
1. ✅ First recipe visit = slow (AI calculation + cache save)
2. ✅ Subsequent visits = fast (cache read)
3. ✅ Different recipes = slow first time, fast after
4. ✅ Cache persists across browser sessions
5. ✅ Graceful fallback if AI fails
6. ✅ Fresh calculation after 30 days

## Troubleshooting

### Issue: No caching happening
- Check Firebase permissions
- Verify recipe ID format
- Check console for errors

### Issue: Always calculating fresh
- Check `isMacrosCacheFresh` logic
- Verify date comparison
- Check cache retrieval function

### Issue: AI calculations failing
- Verify API key is set
- Check network connectivity
- Monitor Gemini API quota

## Cache Management

### Clear specific recipe cache:
```javascript
import { clearMacroCache } from '@/app/actions';
await clearMacroCache('recipe-id');
```

### Monitor cache status:
- Use the `MacroCacheStatus` component
- Check Firebase console
- Monitor console logs
