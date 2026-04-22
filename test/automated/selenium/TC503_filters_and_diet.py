from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


def open_toolbar(driver, step_pause):
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Toggle search and filters']"))
    ).click()
    step_pause()


def test_filters_category_cuisine_diet(driver, base_url, step_pause, record_property):
    record_property("TEST_ID", "TC503_filters_and_diet")
    record_property("TEST_DESCRIPTION", "Apply cuisine, category, and diet filters")
    record_property("TEST_CASE_INSTRUCTIONS", "Open toolbar; select first cuisine, category, and a diet; verify cards remain.")
    record_property("EXPECTED_BEHAVIOUR", "Recipe cards render for the chosen filters.")
    print("[TC503] Opening home page...")
    driver.get(base_url)
    step_pause()
    print("[TC503] Opening search toolbar...")
    open_toolbar(driver, step_pause)

    # Ensure selects are present
    cuisine_select_el = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//label[text()='Cuisine']/following-sibling::select"))
    )
    category_select_el = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//label[text()='Category']/following-sibling::select"))
    )
    diet_select_el = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//label[text()='Diet']/following-sibling::select"))
    )
    step_pause()

    # Select first non-empty options where possible
    cuisine_select = Select(cuisine_select_el)
    if len(cuisine_select.options) > 1:
        print("[TC503] Selecting cuisine option index 1...")
        cuisine_select.select_by_index(1)
        step_pause()

    category_select = Select(category_select_el)
    if len(category_select.options) > 1:
        print("[TC503] Selecting category option index 1...")
        category_select.select_by_index(1)
        step_pause()

    diet_select = Select(diet_select_el)
    # Prefer a known value if present; fallback to first non-empty
    desired_diets = ["Pescatarian", "Vegetarian", "Vegan", "Non-Vegetarian"]
    picked = False
    for label in desired_diets:
        for opt in diet_select.options:
            if opt.text.strip().lower() == label.lower():
                print(f"[TC503] Selecting diet '{opt.text}'...")
                diet_select.select_by_visible_text(opt.text)
                picked = True
                break
        if picked:
            break
    if not picked and len(diet_select.options) > 1:
        print("[TC503] Selecting first non-empty diet option...")
        diet_select.select_by_index(1)
    step_pause()

    # Expect at least one recipe card to be visible after filter interaction
    print("[TC503] Waiting for recipe cards after filters...")
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//a[starts-with(@href, '/recipes/')]"))
    )
    # And confirm the selects hold a non-empty value (i.e., a filter is applied)
    print("[TC503] Verifying applied select values...")
    assert cuisine_select.first_selected_option.get_attribute("value") != ""
    assert category_select.first_selected_option.get_attribute("value") != ""
    # Diet can be optional based on data availability
    step_pause()


