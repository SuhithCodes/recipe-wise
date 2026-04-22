import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time
from py.xml import html
import pytest
import datetime
import re
import shutil
from pathlib import Path


@pytest.fixture(scope="session")
def base_url() -> str:
    # Change this if your app runs elsewhere
    return "https://recipe-wise.vercel.app"


def _clear_webdriver_cache():
    """Clear webdriver-manager cache to fix compatibility issues"""
    cache_dir = Path.home() / ".wdm"
    if cache_dir.exists():
        print(f"[SETUP] Clearing webdriver-manager cache at {cache_dir}...")
        try:
            shutil.rmtree(cache_dir)
            print("[SETUP] Cache cleared successfully.")
        except Exception as e:
            print(f"[SETUP] Warning: Could not clear cache: {e}")


@pytest.fixture
def driver():
    # Clear cache if requested
    if os.getenv("CLEAR_CACHE", "0") == "1":
        _clear_webdriver_cache()
    
    options = Options()
    # Run in visible browser by default (set HEADLESS=1 to run headless)
    headless_env = os.getenv("HEADLESS", "0")
    if headless_env != "0":
        options.add_argument("--headless=new")
        print("[SETUP] Running in headless mode (set HEADLESS=0 to see browser).")
    else:
        print("[SETUP] Running with visible browser window (HEADLESS=0).")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,800")
    
    # Try to install ChromeDriver, with retry logic if it fails
    try:
        driver_path = ChromeDriverManager().install()
        service = Service(driver_path)
    except (OSError, Exception) as e:
        if "WinError 193" in str(e) or "not a valid Win32 application" in str(e):
            print("[SETUP] ChromeDriver compatibility error detected. Clearing cache and retrying...")
            _clear_webdriver_cache()
            driver_path = ChromeDriverManager().install()
            service = Service(driver_path)
        else:
            raise
    
    browser = webdriver.Chrome(service=service, options=options)
    try:
        yield browser
    finally:
        browser.quit()


def perform_login(driver, base_url: str, email: str, password: str):
    print("[AUTH] Navigating to sign-in page...")
    driver.get(f"{base_url}/signin")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='user@example.com']"))
    ).send_keys(email)
    print("[AUTH] Entered email.")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='********']"))
    ).send_keys(password)
    print("[AUTH] Entered password.")
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Sign In']"))
    ).click()
    print("[AUTH] Submitted sign-in form, waiting for redirect...")
    # Wait until redirected back home (or at least away from /signin)
    WebDriverWait(driver, 10).until(EC.url_contains("/"))
    # Best-effort check for brand text on home
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'RecipeWise')]"))
    )
    print("[AUTH] Sign-in appears successful.")


@pytest.fixture
def ensure_logged_in(driver, base_url):
    email = os.getenv("TEST_EMAIL", "suhithghanathay100@gmail.com")
    password = os.getenv("TEST_PASSWORD", "Rocketdock@10")
    print(f"[AUTH] ensure_logged_in using TEST_EMAIL={email}")
    perform_login(driver, base_url, email, password)
    return True


@pytest.fixture(scope="session")
def step_delay_ms() -> int:
    try:
        return int(os.getenv("STEP_DELAY_MS", "500"))
    except Exception:
        return 500


@pytest.fixture
def step_pause(step_delay_ms):
    def _pause():
        time.sleep(step_delay_ms / 1000.0)
    return _pause


@pytest.fixture
def take_screenshot(driver):
    """Fixture to take and save screenshots during tests"""
    def _take_screenshot(name="screenshot"):
        # Create screenshots directory if it doesn't exist
        screenshots_dir = os.path.join(os.path.dirname(__file__), "..", "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        
        # Generate a unique filename with timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        # Remove any invalid characters from the name
        clean_name = re.sub(r'[^\w\-_\. ]', '_', name)
        filename = f"{clean_name}_{timestamp}.png"
        filepath = os.path.join(screenshots_dir, filename)
        
        # Take and save the screenshot
        driver.save_screenshot(filepath)
        print(f"[SCREENSHOT] Saved screenshot: {filename}")
        return filepath
    return _take_screenshot

# -------------------------
# pytest-html customization
# -------------------------
def _props_to_dict(props):
    try:
        return dict(props)
    except Exception:
        d = {}
        for k, v in props:
            d[k] = v
        return d


def pytest_html_results_table_header(cells):
    cells.clear()
    cells.append(html.th('TEST_ID'))
    cells.append(html.th('TEST_DESCRIPTION'))
    cells.append(html.th('TEST_CASE_INSTRUCTIONS'))
    cells.append(html.th('EXPECTED_BEHAVIOUR'))
    cells.append(html.th('ACTUAL_BEHAVIOUR'))
    cells.append(html.th('RESULT'))


def pytest_html_results_table_row(report, cells):
    props = _props_to_dict(getattr(report, 'user_properties', []))
    test_id = props.get('TEST_ID') or report.nodeid.split("::")[0].split("/")[-1]
    description = props.get('TEST_DESCRIPTION') or report.nodeid
    instructions = props.get('TEST_CASE_INSTRUCTIONS') or 'See test body for steps'
    expected = props.get('EXPECTED_BEHAVIOUR') or 'Assertions should pass'
    if 'ACTUAL_BEHAVIOUR' in props:
        actual = props['ACTUAL_BEHAVIOUR']
    else:
        if report.failed:
            actual = str(getattr(report, 'longreprtext', 'Failed'))
        else:
            actual = 'Executed steps successfully'
    result = 'Pass' if report.passed else ('Fail' if report.failed else 'Skipped')

    cells.clear()
    cells.append(html.td(test_id))
    cells.append(html.td(description))
    cells.append(html.td(instructions))
    cells.append(html.td(expected))
    cells.append(html.td(actual))
    cells.append(html.td(result))


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    # Ensure user_properties propagate; also default ACTUAL on success
    outcome = yield
    rep = outcome.get_result()
    # Attach any user_properties set during the test to the report
    rep.user_properties = getattr(item, 'user_properties', [])
    # If test passed and ACTUAL not set, add a default
    props = _props_to_dict(rep.user_properties)
    if call.when == 'call' and rep.passed and 'ACTUAL_BEHAVIOUR' not in props:
        rep.user_properties.append(('ACTUAL_BEHAVIOUR', 'Executed steps successfully'))


