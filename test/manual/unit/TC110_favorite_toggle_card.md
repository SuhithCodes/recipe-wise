ID: TC110_favorite_toggle_card
Title: Favorite button on RecipeCard toggles saved state
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
- User is authenticated (favorites requires login)
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page and locate a recipe card with a Favorite/heart control
2. Click the heart to favorite the recipe
3. Observe state change (icon fill, style, or toast)
4. Click again to unfavorite the recipe

Expected Result:
- Initial state shows non-favorited icon
- Clicking favorites the recipe and updates icon/state with a confirmation toast
- Clicking again returns to non-favorited state
- No console errors appear

Actual Result:
- Favoriting updated the icon/state with a toast. Unfavoriting returned to non-favorited state.

Status:
- Pass



