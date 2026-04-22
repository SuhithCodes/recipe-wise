from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_meal_planner_authenticated_shows_slots(driver, base_url, ensure_logged_in, step_pause, record_property):
    record_property("TEST_ID", "TC510_meal_planner_authenticated")
    record_property("TEST_DESCRIPTION", "Authenticated meal planner shows at least one meal slot")
    record_property("TEST_CASE_INSTRUCTIONS", "Login; navigate to /meal-planner; verify title and at least one slot.")
    record_property("EXPECTED_BEHAVIOUR", "At least one of Breakfast/Lunch/Dinner is visible.")
    print("[TC510] Navigating to /meal-planner ...")
    driver.get(f"{base_url}/meal-planner")
    step_pause()

    # Verify header and at least one of the slots exists
    print("[TC510] Waiting for meal planner title...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Your Daily Meal Plan')]"))
    )
    # Expect at least one of Breakfast/Lunch/Dinner headings
    print("[TC510] Checking for meal slots...")
    slots = driver.find_elements(By.XPATH, "//*[text()='Breakfast' or text()='Lunch' or text()='Dinner']")
    assert len(slots) >= 1
    step_pause()


