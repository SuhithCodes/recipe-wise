ID: TC301_navigation
Title: Primary navigation routes between main pages
Type: System (end-to-end)
Preconditions:
- Application is running
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page
2. Click "Meal Planner" from navigation (if authenticated)
3. Click "Shopping List" from navigation (if authenticated)
4. Click the logo to return home

Expected Result:
- Each navigation item routes to its respective page without full reloads
- Header remains visible and interactive
- Returning home restores the recipes listing

Actual Result:
- Navigation to each page succeeded without full reloads.
- Header persisted and remained interactive. Returning home restored recipe listing.

Status:
- Pass



