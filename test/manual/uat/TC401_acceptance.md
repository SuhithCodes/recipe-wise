ID: TC401_acceptance
Title: User Acceptance - Discover and view a recipe
Type: UAT
Preconditions:
- Application is running
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

User Story:
As a user, I want to discover a recipe and view its details so that I can decide to cook it.

Acceptance Criteria:
- I can see a grid of recipes on the home page
- I can click a recipe card to open its details
- The details page shows image, ingredients, instructions, and macros section

Steps:
1. Open the home page
2. Scroll through recipe cards
3. Click on any recipe
4. Confirm details are shown

Expected Result:
- Details page matches acceptance criteria above

Actual Result:
- From the home grid, opening a recipe showed image, ingredients, instructions,
  and macros section as expected.

Status:
- Pass



