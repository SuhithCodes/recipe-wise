ID: TC102_search_toggle
Title: Header Search button toggles search toolbar visibility
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page
2. Click the header Search icon button (aria-label "Toggle search and filters")
3. Observe the search toolbar (input and filter selects)
4. Click the header Search icon button again

Expected Result:
- After first click, the search toolbar is visible and URL contains `?showSearch=1`
- After second click, the toolbar is hidden and `showSearch` is removed from the URL

Actual Result:
- Toolbar shown on first click with `?showSearch=1` in the URL.
- Toolbar hidden on second click; `showSearch` removed from the URL.

Status:
- Pass



