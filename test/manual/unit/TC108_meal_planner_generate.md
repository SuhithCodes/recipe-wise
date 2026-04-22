ID: TC108_meal_planner_generate
Title: Meal Planner page generates plan with breakfast/lunch/dinner slots
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
- User is authenticated (meal planner requires login)
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000/meal-planner

Steps:
1. Sign in and navigate to the Meal Planner page
2. Click the button to generate or refresh the plan (if available)
3. Observe the displayed plan

Expected Result:
- UI shows three slots: breakfast, lunch, dinner
- Each slot renders a recipe card or summary
- No console errors during generation
- If a refresh/regenerate action exists, it replaces all three slots

Actual Result:
- Three slots (breakfast, lunch, dinner) displayed with recipes.
- Regenerate action replaced all three slots without errors.

Status:
- Pass



