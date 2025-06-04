// api/generate-recipe.js  (o recipe-generator.js)
import fetch from 'node-fetch'; // Vercel environment supports node-fetch, no need to install it with npm for basic usage

// Function to fetch a random recipe from Spoonacular
async function getRandomRecipe(diet, mealType) {
    // THIS IS CRUCIAL: The API Key is retrieved from Vercel Environment Variables, NOT hardcoded here.
    const apiKey = process.env.SPOONACULAR_API_KEY; 
    if (!apiKey) {
        console.error('SPOONACULAR_API_KEY is not set in Vercel Environment Variables.');
        return { error: 'API key not configured on the server. Please contact the administrator.' };
    }

    // Base URL for Spoonacular random recipe endpoint
    // We request 'number=1' for a single random recipe.
    let url = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${apiKey}`;

    // Add filters based on user request parameters from the frontend
    if (diet) {
        url += `&diet=${encodeURIComponent(diet)}`; // Ensure proper URL encoding for diet
    }
    if (mealType) {
        url += `&type=${encodeURIComponent(mealType)}`; // 'type' is used for meal type in Spoonacular API
    }

    try {
        const response = await fetch(url);
        
        // Handle non-OK HTTP responses (e.g., 401, 402, 404, 500)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No JSON error response.' }));
            console.error(`Spoonacular API error: ${response.status} - ${response.statusText}`, errorData);
            
            // Provide more specific error messages for common Spoonacular errors
            if (response.status === 401) {
                return { error: 'Unauthorized: Invalid API Key or missing API Key. Please check Vercel environment variables.' };
            } else if (response.status === 402) {
                return { error: 'Payment Required: Spoonacular API daily/monthly quota exceeded. Please try again later.' };
            } else if (response.status === 404) {
                return { error: 'No recipes found for the selected criteria. Try broader filters.' };
            } else {
                return { error: `Failed to fetch recipe from Spoonacular: ${response.status} - ${response.statusText}. Details: ${JSON.stringify(errorData)}` };
            }
        }
        
        const data = await response.json();
        
        // Spoonacular returns an array of recipes under 'recipes' key
        if (data.recipes && data.recipes.length > 0) {
            return data.recipes[0]; // Return the first (and only) recipe
        } else {
            // This case might happen if the API returns 200 OK but no recipes for the filters
            return { error: 'No recipes found for the given criteria. Try adjusting your selections.' };
        }
    } catch (error) {
        // Handle network errors or other unexpected issues
        console.error('Error fetching recipe from Spoonacular API:', error);
        return { error: 'An unexpected error occurred while processing your request. Please check your network connection.' };
    }
}

// Vercel Serverless Function handler: This is the entry point for Vercel.
export default async function handler(request, response) {
    // --- CORS (Cross-Origin Resource Sharing) Headers ---
    // These headers are essential to allow your frontend (recipe.reav.space) to call this function (on reav.space)
    // without being blocked by browser security policies.
    const origin = request.headers.origin;
    // Allow specific origins (your main domain, your tool subdomains, and localhost for development)
    if (origin && (origin.endsWith('.reav.space') || origin === 'https://reav.space' || origin.includes('localhost'))) {
        response.setHeader('Access-Control-Allow-Origin', origin);
        // Allow GET and OPTIONS methods for this API
        response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        // Allow Content-Type header in requests
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // Handle preflight OPTIONS request (sent by browsers before actual GET/POST requests)
    if (request.method === 'OPTIONS') {
        return response.status(200).send('OK'); // Respond with 200 OK for preflight
    }

    // Ensure only GET requests are allowed for recipe generation
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed. This endpoint only supports GET requests.' });
    }

    // Extract query parameters sent from the frontend
    const { diet, mealType } = request.query;

    // Call the function to get a random recipe
    const recipe = await getRandomRecipe(diet, mealType);

    // Send the response back to the frontend
    if (recipe.error) {
        // If there was an error fetching the recipe, send an appropriate HTTP status code (e.g., 500 for server error, 400 for bad request)
        // For API key or quota issues, 500 is appropriate as it's a server-side problem.
        // For 'no recipes found', 404 or 400 could be used. Let's stick to 500 for simplicity here.
        return response.status(500).json(recipe); 
    } else {
        // If successful, send the recipe data with 200 OK status
        return response.status(200).json(recipe); 
    }
}