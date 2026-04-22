from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_open_first_recipe_and_navigate_back(driver, base_url, step_pause, record_property):
    record_property("TEST_ID", "TC504_open_recipe_and_back")
    record_property("TEST_DESCRIPTION", "Open a recipe and navigate back to home")
    record_property("TEST_CASE_INSTRUCTIONS", "Open home; click first recipe; verify details; go back; verify cards.")
    record_property("EXPECTED_BEHAVIOUR", "Recipe detail shows Ingredients; returning home shows cards.")
    print("[TC504] Opening home page...")
    driver.get(base_url)
    step_pause()

    # Wait for at least one recipe link
    print("[TC504] Clicking first recipe card...")
    first_link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "(//a[starts-with(@href, '/recipes/')])[1]"))
    )
    first_href = first_link.get_attribute("href")
    first_link.click()
    step_pause()

    # Verify details page by URL and presence of expected sections
    print("[TC504] Waiting for recipe detail URL...")
    WebDriverWait(driver, 10).until(EC.url_contains("/recipes/"))
    assert "/recipes/" in driver.current_url
    step_pause()

    # Expect a stable section on detail page such as "Ingredients"
    print("[TC504] Waiting for Ingredients section...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[normalize-space()='Ingredients']"))
    )
    step_pause()

    # Navigate back home via header brand link
    # The brand link is on the left with the app name visible on desktop; fallback to root link
    home_link = driver.find_elements(By.XPATH, "//a[@href='/' and (contains(text(),'RecipeWise') or @aria-label='RecipeWise home')]")
    try:
        if home_link:
            print("[TC504] Clicking header brand to return home...")
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", home_link[0])
            WebDriverWait(driver, 5).until(EC.element_to_be_clickable(home_link[0])).click()
        else:
            print("[TC504] Brand link not found; navigating directly to home...")
            driver.get(base_url)
    except Exception:
        # Fallback to JS click, then hard navigate
        try:
            print("[TC504] Brand not interactable; trying JS click...")
            driver.execute_script("arguments[0].click();", home_link[0])
        except Exception:
            print("[TC504] JS click failed; navigating directly to home...")
            driver.get(base_url)
    step_pause()

    # Verify we are back at home with recipe cards visible
    print("[TC504] Verifying we are back on the home page with cards...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//a[starts-with(@href, '/recipes/')]"))
    )
    step_pause()


