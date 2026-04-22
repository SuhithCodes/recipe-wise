ID: TC107_macros_values_render
Title: Macros panel renders Protein, Fats, Carbs labels and values
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
- A recipe details page is available (e.g., open any recipe)
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000/recipes/{id}

Steps:
1. Open a recipe details page
2. Locate the Macros section/panel
3. Inspect the displayed macros

Expected Result:
- Labels for Protein, Fats, and Carbs are visible
- Numeric values are shown for each label (even if approximate or cached)
- Values use consistent units (e.g., grams)

Actual Result:
- Labels and numeric values for Protein, Fats, and Carbs are visible with gram units.

Status:
- Pass



