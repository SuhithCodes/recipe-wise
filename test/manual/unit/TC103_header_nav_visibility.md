ID: TC103_header_nav_visibility
Title: Header navigation shows/hides auth-only links based on login state
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps (Logged Out):
1. Ensure user is logged out
2. Open the home page
3. Observe navigation links

Expected (Logged Out):
- "Recipes" link is visible
- "Meal Planner" and "Shopping List" are hidden
- "Sign In" button is visible

Steps (Logged In):
4. Sign in with a valid user
5. Return to the home page
6. Observe navigation links

Expected (Logged In):
- "Recipes", "Meal Planner", and "Shopping List" are visible
- "Sign In" is hidden, avatar menu present

Actual Result:
- Logged out: "Recipes" visible, "Meal Planner" and "Shopping List" hidden, "Sign In" visible.
- Logged in: "Recipes", "Meal Planner", "Shopping List" visible, avatar menu shown, "Sign In" hidden.

Status:
- Pass



