from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_pagination_next_keeps_cards_visible(driver, base_url, step_pause, record_property):
    record_property("TEST_ID", "TC505_pagination_next")
    record_property("TEST_DESCRIPTION", "Pagination Next keeps cards visible")
    record_property("TEST_CASE_INSTRUCTIONS", "Open home; click Next if present; verify cards remain.")
    record_property("EXPECTED_BEHAVIOUR", "Cards remain visible after pagination.")
    print("[TC505] Opening home page...")
    driver.get(base_url)
    step_pause()

    # Ensure cards are visible
    print("[TC505] Waiting for first recipe card...")
    first_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]"))
    )
    first_before = first_card.get_attribute("href")
    step_pause()

    # Click Next if present
    next_btns = driver.find_elements(By.XPATH, "//button[normalize-space()='Next']")
    if not next_btns:
        # If toolbar required to show pagination, open it
        try:
            print("[TC505] Opening toolbar to reveal pagination...")
            driver.find_element(By.XPATH, "//button[@aria-label='Toggle search and filters']").click()
        except Exception:
            pass
        next_btns = driver.find_elements(By.XPATH, "//button[normalize-space()='Next']")

    if next_btns:
        print("[TC505] Clicking Next...")
        next_btns[0].click()
        step_pause()

        # After click, ensure cards still visible and possibly different
        print("[TC505] Waiting for cards on new page...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.XPATH, "//a[starts-with(@href, '/recipes/')]"))
        )
        first_after = driver.find_element(By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]").get_attribute("href")
        assert first_after  # still present
        step_pause()
    else:
        # If Next not present, at least confirm cards visible
        print("[TC505] No Next button available; verifying cards still visible...")
        assert first_before
        step_pause()


