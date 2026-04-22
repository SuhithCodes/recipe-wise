ID: TC201_search
Title: Search toolbar filters recipes with keyword
Type: Integration (UI + data fetching)
Preconditions:
- Application is running
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page
2. Click the header "Search" icon to reveal the search toolbar
3. Type "chicken" into the search input
4. Press Enter or click the Search button

Expected Result:
- The page title switches to "Search Results"
- Recipe cards update to show results relevant to "chicken"
- Pagination reflects the filtered result count

Actual Result:
- Title switched to "Search Results". Recipe grid updated with chicken-related recipes.
- Pagination updated to reflect filtered total.

Status:
- Pass



