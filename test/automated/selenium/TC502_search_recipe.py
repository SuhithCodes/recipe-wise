from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_search_toolbar_filters_results(driver, base_url, step_pause, record_property, take_screenshot):
    record_property("TEST_ID", "TC502_search_recipe")
    record_property("TEST_DESCRIPTION", "Search toolbar filters recipes by keyword")
    record_property("TEST_CASE_INSTRUCTIONS", "Open home; open toolbar; search 'chicken'; expect results title.")
    record_property("EXPECTED_BEHAVIOUR", "Page shows 'Search Results' and filtered cards.")
    print("[TC502] Opening home page...")
    driver.get(base_url)
    step_pause()
    take_screenshot("home_page")

    # Toggle search toolbar via header search button (aria-label = "Toggle search and filters")
    print("[TC502] Opening search toolbar...")
    toggle_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Toggle search and filters']"))
    )
    toggle_btn.click()
    step_pause()
    take_screenshot("search_toolbar_opened")

    # Find the search input by placeholder
    input_el = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Search recipes...']"))
    )
    print("[TC502] Typing query 'chicken'...")
    input_el.clear()
    input_el.send_keys("chicken")
    input_el.send_keys(Keys.ENTER)
    step_pause()
    take_screenshot("search_executed")

    # Expect the title to switch to "Search Results"
    print("[TC502] Waiting for Search Results title...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Search Results')]"))
    )
    print("[TC502] Verifying Search Results displayed...")
    assert "Search Results" in driver.page_source
    step_pause()
    take_screenshot("search_results_displayed")