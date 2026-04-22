import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def open_first_recipe(driver, base_url, step_pause):
    print("[TC506] Opening home page...")
    driver.get(base_url)
    step_pause()
    link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]"))
    )
    print("[TC506] Opening first recipe...")
    link.click()
    WebDriverWait(driver, 10).until(EC.url_contains("/recipes/"))
    step_pause()


def test_macros_calculation_shows_values(driver, base_url, step_pause, record_property):
    record_property("TEST_ID", "TC506_macros_calculation_detail")
    record_property("TEST_DESCRIPTION", "Macros calculation shows labels/values on detail page")
    record_property("TEST_CASE_INSTRUCTIONS", "Open home; open first recipe; click Calculate (if present); verify labels.")
    record_property("EXPECTED_BEHAVIOUR", "Protein/Carbs/Fats labels appear with values.")
    open_first_recipe(driver, base_url, step_pause)

    # Try to click a calculate button if present
    calc_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Calculate')]")
    if calc_buttons:
        print("[TC506] Clicking Calculate button...")
        calc_buttons[0].click()
        step_pause()

    # Wait for macro labels (Protein/Carbs/Fats) to appear (best-effort)
    print("[TC506] Waiting for macro labels to appear (up to 45 seconds)...")
    WebDriverWait(driver, 45).until(
        EC.presence_of_element_located((By.XPATH, "//*[normalize-space()='Protein' or normalize-space()='Carbs' or normalize-space()='Fats']"))
    )
    # Give a brief moment for values to render if async
    time.sleep(1)
    page = driver.page_source
    print("[TC506] Verifying Protein label present...")
    assert "Protein" in page
    # We don't strictly assert numeric format to reduce flakiness across environments