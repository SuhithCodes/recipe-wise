from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


def test_favorite_toggle_authenticated(driver, base_url, ensure_logged_in, step_pause, record_property, take_screenshot):
    record_property("TEST_ID", "TC508_favorites_authenticated")
    record_property("TEST_DESCRIPTION", "Authenticated user can toggle favorites on a card")
    record_property("TEST_CASE_INSTRUCTIONS", "Login; go directly to Tarte Tatin recipe page; click heart button; verify on favorites page.")
    record_property("EXPECTED_BEHAVIOUR", "Favorite control adds recipe and shows on favorites page.")
    
    # Ensure authentication is completed before proceeding
    print("[TC508] Waiting for authentication to complete...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'RecipeWise')]"))
    )
    step_pause()
    take_screenshot("authentication_complete")
    
    # Go directly to the Tarte Tatin recipe page
    print("[TC508] Going directly to Tarte Tatin recipe page...")
    driver.get(f"{base_url}/recipes/52909")
    step_pause()
    step_pause()
    take_screenshot("recipe_page_loaded")

    # Get the recipe name from the page
    print("[TC508] Getting recipe name...")
    dish_name_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(@class, 'font-headline') and contains(@class, 'text-4xl') and contains(@class, 'font-bold')]"))
    )
    dish_name = dish_name_element.text.strip()
    print(f"[TC508] Recipe name: '{dish_name}'")
    take_screenshot("recipe_name_identified")

    # Click the favorite button
    print("[TC508] Clicking favorite button...")
    favorite_button_xpath = "/html/body/div[1]/main/div/div[1]/div[1]/button"
    favorite_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, favorite_button_xpath))
    )
    favorite_button.click()
    step_pause()
    step_pause()
    take_screenshot("favorite_button_clicked")

    # Wait for the favorite to be processed
    print("[TC508] Waiting for favorite to be processed...")
    step_pause()
    step_pause()
    step_pause()
    take_screenshot("favorite_processed")

    # Navigate to favorites page
    print("[TC508] Navigating to favorites page...")
    driver.get(f"{base_url}/favorites")
    step_pause()
    step_pause()
    step_pause()
    take_screenshot("favorites_page_loaded")

    # Check if the recipe is present in favorites
    print("[TC508] Checking if recipe is present in favorites...")
    try:
        # Look for the recipe in the favorites list using a more general XPath
        favorite_recipe_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//a[contains(@href, '/recipes/')]/div/h3"))
        )
        favorite_recipe_name = favorite_recipe_element.text.strip()
        print(f"[TC508] Found recipe in favorites: '{favorite_recipe_name}'")
        take_screenshot("recipe_found_in_favorites")
        
        # Verify it matches our dish
        assert dish_name.lower() == favorite_recipe_name.lower(), f"Expected '{dish_name}', but found '{favorite_recipe_name}'"
        print("[TC508] Recipe successfully found in favorites!")
    except TimeoutException:
        # Try to find the recipe by iterating through favorites using a more general approach
        found_match = False
        # Look for all recipe cards
        recipe_cards = driver.find_elements(By.XPATH, "//div[contains(@class, 'grid')]//div[contains(@class, 'flex-col')]")
        print(f"[TC508] Found {len(recipe_cards)} recipe cards")
        take_screenshot("favorites_cards_counted")
        
        for i, card in enumerate(recipe_cards):
            try:
                # Try to find the recipe name in each card
                name_element = card.find_element(By.XPATH, ".//h3[contains(@class, 'font-headline')] | .//div[contains(@class, 'font-headline')]")
                name = name_element.text.strip()
                print(f"[TC508] Card {i+1} title: '{name}'")
                if name and dish_name and name.lower() == dish_name.lower():
                    found_match = True
                    break
            except:
                # If we can't find the name element, skip this card
                continue
        
        if not found_match:
            # Fallback: check page source
            print("[TC508] Fallback check: searching dish name in page source...")
            found_match = dish_name in driver.page_source
            
        assert found_match, f"Dish '{dish_name}' not found in favorites list"
    
    step_pause()