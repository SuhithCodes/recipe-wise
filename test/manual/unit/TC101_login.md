ID: TC101_login
Title: User can open Sign In and view the form
Type: Unit (UI component-level behavior)
Preconditions:
- Application is running
- Test user exists or anonymous state is acceptable
Environment:
- Browser: Chrome (latest)
- URL: http://localhost:3000

Steps:
1. Open the home page
2. Click the "Sign In" button in the header
3. Observe the Sign In page contents

Expected Result:
- User is navigated to `/signin`
- Form elements for email and password are visible
- Primary submit button is enabled when both fields are non-empty

Actual Result:
- Navigated to `/signin`. Email and password inputs visible.
- Submit button enabled only after both fields were populated.

Status:
- Pass



