ID: TC109_shopping_add_remove
Title: Add/Remove to Shopping List button toggles state
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
- User is authenticated (shopping list requires login)
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page and locate a recipe card with an "Add to shopping list" control
2. Click the control to add the recipe's ingredients to the shopping list
3. Observe any success feedback/toast
4. Click again to remove (if toggle is supported) OR navigate to the shopping list page and remove an item

Expected Result:
- Initial state shows "Add to shopping list"
- After click, the control reflects added state (e.g., "Added" or different style)
- A toast or confirmation appears
- Removing returns the control to initial state and item disappears from shopping list

Actual Result:
- Initial "Add to shopping list" changed to added state with confirmation toast.
- Removing reverted to initial state and item disappeared from shopping list.

Status:
- Pass



