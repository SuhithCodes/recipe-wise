ID: TC104_recipe_card_render
Title: RecipeCard renders name, image, cuisine, and meal type
Type: Unit (UI component-level behavior)
Preconditions:
- At least one recipe exists in the listing
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page
2. Inspect the first visible recipe card

Expected Result:
- Card displays recipe name text
- Card shows an image thumbnail
- Card displays cuisine and category/meal type metadata
- Clicking the card routes to `/recipes/{id}`

Actual Result:
- Card displayed name, image, cuisine, and meal type metadata.
- Clicking the card navigated to the recipe details page.

Status:
- Pass



