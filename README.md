# RecipeWise: Your Intelligent Meal Planning Assistant

RecipeWise is a modern, AI-powered web application designed to simplify meal planning and recipe discovery. It helps users find recipes tailored to their dietary needs, plan their meals, create shopping lists, and even get AI-driven suggestions for ingredient substitutions and recipe recommendations.

## Key Features

- **Recipe Discovery**: Browse a vast collection of recipes. Filter by category, cuisine, or dietary restrictions (e.g., vegan, gluten-free). Sort recipes by name, rating, or creation date.
- **AI-Powered Recommendations**: Get personalized recipe suggestions based on your preferences.
- **Ingredient Substitution**: Found a recipe but missing an ingredient? The AI can suggest suitable alternatives.
- **Macro Calculation**: View detailed macronutrient information for recipes.
- **Meal Planner**: Organize your meals for the week with a simple drag-and-drop interface.
- **Shopping List**: Automatically generate a shopping list from your meal plan or add ingredients manually.
- **User Authentication**: Sign up and log in to save your favorite recipes and manage your meal plans.
- **Favorites**: Save your favorite recipes for quick access.
- **Responsive Design**: A clean and intuitive interface that works seamlessly on desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with Turbopack
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), Radix UI
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **AI/ML**: [Google AI Gemini](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Testing**: [Selenium](https://www.selenium.dev/) & [Pytest](https://pytest.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (for running automated tests)

### Installation

1.  Navigate to the project directory:
    ```bash
    cd recipewise
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Testing

The project includes a suite of automated tests using Selenium and Pytest.

1.  Navigate to the automated test directory:
    ```bash
    cd test/automated
    ```
2.  Install the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the tests (from the `test/automated` directory):
    ```powershell
    # For PowerShell
    ./run_tests.ps1
    ```
4.  The test report will be generated at `test/automated/reports/report.html`.

## Contributors

This project was developed by a team of dedicated students:

-   **Charmi Shah** - [Project Manager & Backend Lead]
    -   Oversee project timeline and facilitate Scrum events.
    -   Develop backend APIs for recipes, users, and ratings.
    -   Integrate the LLM for ingredient substitutions.
-   **Saakshi Jignesh Bhatt** - [Frontend Lead]
    -   Develop the user interface for all features based on Figma designs.
    -   Implement the Meal Planner and Shopping List UI.
    -   Ensure the application is fully responsive.
-   **Apurva Sharad Pingale** - [UI/UX Designer & QA Engineer]
    -   Design intuitive user flows and mock-ups.
    -   Create and execute test cases for all user stories.
    -   Conduct UAT and gather user feedback.
-   **Hrishitha Sai Kakarla** - [Database Admin & AI Specialist]
    -   Design and manage the database schema.
    -   Implement the logic for the AI recipe recommendation engine.
    -   Manage project documentation and API specifications for the development team.
