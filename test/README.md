Testing structure for RecipeWise
================================

Directories
-----------
- `test/manual/`: Manual test cases
  - `unit/`
  - `integration/`
  - `system/`
  - `uat/` (User Acceptance Testing)
- `test/automated/`: Automated tests
  - `selenium/`: Selenium + Pytest tests
  - `reports/`: Generated HTML reports (pytest-html)
  - `screenshots/`: Screenshots captured during test execution

Manual Test Case Naming
-----------------------
- Markdown test cases follow this pattern:
  - `TC01_{name}.md`
  - `TC02_{name}.md`
  - Variants like `TC-02_{name}.md` are also acceptable if you prefer the dash.

Automated Test Naming
---------------------
- Python Selenium tests follow this pattern:
  - `TC01_{name}.py`
  - `TC02_{name}.py`

Run Automated Tests (Windows/PowerShell)
----------------------------------------
From the repository root:
1) Navigate and install requirements:
   - `cd test/automated`
   - `python -m pip install -r requirements.txt`
2) Run all tests and generate report:
   - `./run_tests.ps1`
3) View report:
   - Open `test/automated/reports/report.html` in your browser

Run Individual Automated Tests
------------------------------
To run specific test files:
- `python -m pytest selenium/TC501_homepage_loads.py -v`
- `python -m pytest selenium/TC502_search_recipe.py -v`

To run tests in headless mode (browser not visible):
- `$env:HEADLESS="1"; python -m pytest selenium/TC501_homepage_loads.py -v`
- `$env:HEADLESS="1"; python -m pytest selenium/ -v` (to run all tests in headless mode)

Run Tests with Custom Configuration
-----------------------------------
To run tests with custom delay between steps:
- `$env:STEP_DELAY_MS="1000"; python -m pytest selenium/TC501_homepage_loads.py -v`

To run tests with custom authentication credentials:
- `$env:TEST_EMAIL="your@email.com"; $env:TEST_PASSWORD="yourpassword"; python -m pytest selenium/TC508_favorites_authenticated.py -v`

Automated Test Features
-----------------------
- Tests automatically capture screenshots at key execution points
- Screenshots are saved in `test/automated/screenshots/` with timestamped filenames
- HTML reports include detailed test results and execution logs
- Authentication is handled automatically for tests requiring login

Configuration Notes
-------------------
- Tests are configured to run against `https://recipe-wise.vercel.app`.
  - Update `base_url` fixture in `test/automated/selenium/conftest.py` if needed.
- Chrome runs with visible browser by default; `webdriver-manager` automatically manages the driver.
- To run in headless mode, set `HEADLESS=1`
- Authentication uses environment variables `TEST_EMAIL` and `TEST_PASSWORD`
  - Defaults are provided but can be overridden by setting these environment variables

Test Environment Variables
--------------------------
- `HEADLESS`: Set to `1` to run tests in headless mode (default is `0` for visible browser)
- `STEP_DELAY_MS`: Milliseconds to pause between test steps (default is `500`)
- `TEST_EMAIL`: Email for authentication tests (default provided)
- `TEST_PASSWORD`: Password for authentication tests (default provided)
- `CLEAR_CACHE`: Set to `1` to clear webdriver-manager cache before running tests (useful if you get driver compatibility errors)

Troubleshooting
---------------
If you encounter `OSError: [WinError 193] %1 is not a valid Win32 application`:
1. The test framework will automatically attempt to clear the cache and retry when this error is detected
2. You can manually clear the cache by setting `CLEAR_CACHE=1`: `$env:CLEAR_CACHE="1"; python -m pytest selenium/TC501_homepage_loads.py -v`
3. Or manually delete the cache folder: `Remove-Item -Recurse -Force $env:USERPROFILE\.wdm`
4. Make sure you have the latest version of Chrome installed
5. Ensure your Python installation matches your system architecture (64-bit Python on 64-bit Windows)