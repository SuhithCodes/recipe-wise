import asyncio
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Import the favorites functions
from lib.user_favorites import getUserFavoriteIds, addFavoriteRecipeId, removeFavoriteRecipeId

async def debug_favorites():
    # Test user ID (replace with a real user ID from your database)
    user_id = "test_user_id"
    
    print("Testing favorites functionality...")
    
    # Get current favorites
    print("Getting current favorites...")
    current_favorites = await getUserFavoriteIds(user_id)
    print(f"Current favorites: {list(current_favorites)}")
    
    # Add a favorite
    recipe_id = "52909"  # Tarte Tatin
    print(f"Adding recipe {recipe_id} to favorites...")
    await addFavoriteRecipeId(user_id, recipe_id)
    
    # Get updated favorites
    print("Getting updated favorites...")
    updated_favorites = await getUserFavoriteIds(user_id)
    print(f"Updated favorites: {list(updated_favorites)}")
    
    # Check if the recipe was added
    if recipe_id in updated_favorites:
        print("SUCCESS: Recipe was added to favorites!")
    else:
        print("ERROR: Recipe was not added to favorites!")
    
    # Remove the favorite
    print(f"Removing recipe {recipe_id} from favorites...")
    await removeFavoriteRecipeId(user_id, recipe_id)
    
    # Get final favorites
    print("Getting final favorites...")
    final_favorites = await getUserFavoriteIds(user_id)
    print(f"Final favorites: {list(final_favorites)}")
    
    # Check if the recipe was removed
    if recipe_id not in final_favorites:
        print("SUCCESS: Recipe was removed from favorites!")
    else:
        print("ERROR: Recipe was not removed from favorites!")

if __name__ == "__main__":
    asyncio.run(debug_favorites())