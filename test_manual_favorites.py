from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# Setup Chrome options
options = Options()
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1280,800")

# Setup driver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

try:
    base_url = "http://localhost:3000"
    
    # First authenticate the user
    print("Navigating to sign-in page...")
    driver.get(f"{base_url}/signin")
    time.sleep(3)
    
    # Fill in email using the label to find the input
    print("Looking for email input...")
    email_label = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//label[text()='Email']"))
    )
    email_input = email_label.find_element(By.XPATH, "./following-sibling::input")
    email_input.clear()
    email_input.send_keys("suhithghanathay100@gmail.com")
    print("Entered email")
    
    # Fill in password using the label to find the input
    print("Looking for password input...")
    password_label = driver.find_element(By.XPATH, "//label[text()='Password']")
    password_input = password_label.find_element(By.XPATH, "./following-sibling::input")
    password_input.clear()
    password_input.send_keys("Rocketdock@10")
    print("Entered password")
    
    # Submit the form
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_button.click()
    print("Submitted sign-in form")
    
    # Wait for redirect
    time.sleep(5)
    
    # Verify we're logged in by checking if we can access the profile or favorites page
    print("Checking if login was successful...")
    driver.get(f"{base_url}/favorites")
    time.sleep(3)
    
    # Go directly to the Tarte Tatin recipe page
    print("Going directly to Tarte Tatin recipe page...")
    driver.get(f"{base_url}/recipes/52909")
    time.sleep(3)
    
    # Get the recipe name from the page
    print("Getting recipe name...")
    dish_name_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(@class, 'font-headline') and contains(@class, 'text-4xl') and contains(@class, 'font-bold')]"))
    )
    dish_name = dish_name_element.text.strip()
    print(f"Recipe name: '{dish_name}'")
    
    # Click the favorite button
    print("Clicking favorite button...")
    favorite_button_xpath = "/html/body/div[1]/main/div/div[1]/div[1]/button"
    favorite_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, favorite_button_xpath))
    )
    favorite_button.click()
    time.sleep(2)
    
    # Wait for the favorite to be processed
    print("Waiting for favorite to be processed...")
    time.sleep(3)
    
    # Navigate to favorites page
    print("Navigating to favorites page...")
    driver.get(f"{base_url}/favorites")
    time.sleep(3)
    
    # Check the page source to see what's there
    print("Page source contains 'Tarte Tatin':", "Tarte Tatin" in driver.page_source)
    print("Page title:", driver.title)
    
    # Try to find any recipe cards
    recipe_cards = driver.find_elements(By.XPATH, "//div[contains(@class, 'grid')]//div[contains(@class, 'flex-col')]")
    print(f"Found {len(recipe_cards)} recipe cards")
    
    # Print the entire page source for debugging
    print("Page source (first 2000 chars):")
    print(driver.page_source[:2000])
    
finally:
    driver.quit()