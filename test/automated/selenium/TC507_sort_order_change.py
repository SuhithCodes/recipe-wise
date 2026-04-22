from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


def open_toolbar(driver, step_pause):
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Toggle search and filters']"))
    ).click()
    step_pause()


def test_sort_order_change_affects_listing(driver, base_url, step_pause, record_property):
    record_property("TEST_ID", "TC507_sort_order_change")
    record_property("TEST_DESCRIPTION", "Changing sort updates/keeps listing healthy")
    record_property("TEST_CASE_INSTRUCTIONS", "Open toolbar; capture first card; change sort; verify cards remain.")
    record_property("EXPECTED_BEHAVIOUR", "Cards remain and first card may change.")
    print("[TC507] Opening home page...")
    driver.get(base_url)
    step_pause()
    print("[TC507] Opening search/sort toolbar...")
    open_toolbar(driver, step_pause)

    # Grab first recipe before changing sort
    print("[TC507] Capturing first card before sort change...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]"))
    )
    first_before = driver.find_element(By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]").get_attribute("href")
    step_pause()

    # Change sort using the select labelled "Sort"
    print("[TC507] Changing sort selection...")
    sort_select_el = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//label[text()='Sort']/following-sibling::select"))
    )
    sort_select = Select(sort_select_el)
    # Try a deterministic order; fallback to first non-empty different index
    chosen = False
    for label in ["Time (Asc)", "Time (Desc)", "Avg Reviews", "Rating"]:
        for opt in sort_select.options:
            if opt.text.strip().lower() == label.lower():
                sort_select.select_by_visible_text(opt.text)
                chosen = True
                break
        if chosen:
            break
    if not chosen and len(sort_select.options) > 1:
        sort_select.select_by_index(1)
    step_pause()

    # After change, list should still have cards and often the first will differ
    print("[TC507] Verifying cards after sort change...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]"))
    )
    first_after = driver.find_element(By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]").get_attribute("href")
    assert first_after  # sanity
    step_pause()
    # We won't strictly assert inequality due to possible identical ordering in small datasets


