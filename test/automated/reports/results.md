# Test Results Report

**Generated on:** 10-Nov-2025 at 16:34:05  
**Total tests:** 10  
**Total time:** 00:02:17

## Summary

| Result | Count |
|--------|-------|
| Passed | 9     |
| Failed | 1     |
| Skipped | 0    |
| Errors | 0     |

## Test Results

| Test ID | Description | Instructions | Expected Behavior | Actual Behavior | Result |
|---------|-------------|--------------|-------------------|-----------------|--------|
| TC501_homepage_loads | Homepage loads and shows brand | Open home page; wait for brand text; verify present. | Brand 'RecipeWise' is present on the page. | Executed steps successfully | Pass |
| TC502_search_recipe | Search toolbar filters recipes by keyword | Open home; open toolbar; search 'chicken'; expect results title. | Page shows 'Search Results' and filtered cards. | Executed steps successfully | Pass |
| TC503_filters_and_diet | Apply cuisine, category, and diet filters | Open toolbar; select first cuisine, category, and a diet; verify cards remain. | Recipe cards render for the chosen filters. | Executed steps successfully | Pass |
| TC504_open_recipe_and_back | Open a recipe and navigate back to home | Open home; click first recipe; verify details; go back; verify cards. | Recipe detail shows Ingredients; returning home shows cards. | Executed steps successfully | Pass |
| TC505_pagination_next | Pagination Next keeps cards visible | Open home; click Next if present; verify cards remain. | Cards remain visible after pagination. | Executed steps successfully | Pass |
| TC506_macros_calculation_detail | Macros calculation shows labels/values on detail page | Open home; open first recipe; click Calculate (if present); verify labels. | Protein/Carbs/Fats labels appear with values. | Executed steps successfully | Pass |
| TC507_sort_order_change | Changing sort updates/keeps listing healthy | Open toolbar; capture first card; change sort; verify cards remain. | Cards remain and first card may change. | Executed steps successfully | Pass |
| TC508_favorites_authenticated | Authenticated user can toggle favorites on a card | Login; go directly to Tarte Tatin recipe page; click heart button; verify on favorites page. | Favorite control adds recipe and shows on favorites page. | AssertionError: Dish 'Tarte Tatin' not found in favorites list. The test failed to locate the recipe element on the favorites page using the specified XPath, and fallback methods couldn't find the recipe name in the page source. | Fail |
| TC509_shopping_add_authenticated | Authenticated user can add ingredients to shopping list | Login; open recipe 52791; click 'Add to Shopping List'; verify toast message; wait 2 seconds; navigate to shopping list page; verify ingredients; click 'Clear All'. | Toast message confirms ingredients added; shopping list shows items; 'Clear All' removes all items. | Executed steps successfully | Pass |
| TC510_meal_planner_authenticated | Authenticated meal planner shows at least one meal slot | Login; navigate to /meal-planner; verify title and at least one slot. | At least one of Breakfast/Lunch/Dinner is visible. | Executed steps successfully | Pass |