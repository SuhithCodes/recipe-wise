ID: TC105_diet_filter_select
Title: Diet filter select appears and updates selection value
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page
2. Click the header Search icon to reveal the toolbar
3. Locate the "Diet" select
4. Open the dropdown and choose any option (e.g., "Pescatarian", "Vegetarian")

Expected Result:
- Diet select is visible with label "Diet"
- Selecting a diet updates the current value shown in the select
- Recipe results update to reflect the selected diet (if matching data exists)

Actual Result:
- Diet select visible with label "Diet".
- Selection updates value and recipe results reflect the chosen diet.

Status:
- Pass



