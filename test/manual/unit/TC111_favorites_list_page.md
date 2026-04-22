ID: TC111_favorites_list_page
Title: Favorites page lists favorited recipes for current user
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
- User is authenticated
- At least one recipe has been favorited
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000/favorites

Steps:
1. Favorite at least one recipe from the home or detail page
2. Navigate to `/favorites`
3. Observe the list/grid of favorited recipes

Expected Result:
- Page loads without errors
- Favorited recipes are displayed with their cards or minimal representation
- Unfavoriting from this page removes the item from the list (if supported)

Actual Result:
- Page loaded list of favorited recipes for the user without errors.
- Unfavoriting from this page removed the item from the list.

Status:
- Pass



