ID: TC106_macros_calculate_button
Title: Macros panel shows Calculate button and renders results
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
- A recipe detail page is available (e.g., open any recipe)
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000/recipes/{id}

Steps:
1. Open a recipe details page
2. Locate the Macros section/panel
3. If a "Calculate Macros" or similar button is present, click it
4. Observe loading/processing state
5. Wait for results to render

Expected Result:
- Macros section is visible on the recipe page
- Clicking the button shows a progress/working indicator
- After completion, Protein, Fats, and Carbs values are displayed (numbers)
- No console errors appear

Actual Result:
- Macros section visible. Clicking calculate showed a loading state and then displayed Protein, Fats, and Carbs values.

Status:
- Pass



