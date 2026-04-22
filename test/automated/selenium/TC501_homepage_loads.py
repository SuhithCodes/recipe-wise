from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_homepage_loads(driver, base_url, step_pause, record_property, take_screenshot):
    record_property("TEST_ID", "TC501_homepage_loads")
    record_property("TEST_DESCRIPTION", "Homepage loads and shows brand")
    record_property("TEST_CASE_INSTRUCTIONS", "Open home page; wait for brand text; verify present.")
    record_property("EXPECTED_BEHAVIOUR", "Brand 'RecipeWise' is present on the page.")
    print("[TC501] Opening home page...")
    driver.get(base_url)
    step_pause()
    take_screenshot("homepage_loaded")

    # Wait for header brand to appear
    print("[TC501] Waiting for brand text...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'RecipeWise')]"))
    )
    step_pause()
    take_screenshot("brand_text_visible")

    # Basic smoke: ensure page contains the app name
    print("[TC501] Verifying page contains brand text...")
    assert "RecipeWise" in driver.page_source
    step_pause()
    take_screenshot("verification_complete")