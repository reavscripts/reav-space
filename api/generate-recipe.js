// api/generate-recipe.js
import fetch from 'node-fetch';

// Fetch a random recipe from Spoonacular
async function getRandomRecipe(diet, mealType) {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
        console.error('SPOONACULAR_API_KEY is not set in Vercel Environment Variables.');
        return { error: 'API key not configured on the server. Please contact the administrator.' };
    }

    let url = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${apiKey}`;
    if (diet) url += `&diet=${encodeURIComponent(diet)}`;
    if (mealType) url += `&type=${encodeURIComponent(mealType)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No JSON error response.' }));
            console.error(`Spoonacular API error: ${response.status} - ${response.statusText}`, errorData);

            if (response.status === 401) {
                return { error: 'Unauthorized: Invalid API Key or missing API Key. Please check Vercel environment variables.' };
            } else if (response.status === 402) {
                return { error: 'Payment Required: API quota exceeded. Try again later.' };
            } else if (response.status === 404) {
                return { error: 'No recipes found. Try broader filters.' };
            } else {
                return { error: `Failed to fetch recipe: ${response.status} - ${response.statusText}. Details: ${JSON.stringify(errorData)}` };
            }
        }

        const data = await response.json();
        if (data.recipes && data.recipes.length > 0) {
            return data.recipes[0];
        } else {
            return { error: 'No recipes found for the given criteria. Try adjusting your selections.' };
        }
    } catch (error) {
        console.error('Error fetching recipe from Spoonacular API:', error);
        return { error: 'An unexpected error occurred. Please check your network connection.' };
    }
}

// Vercel Serverless Function handler
export default async function handler(request, response) {
    const origin = request.headers.origin;

    // --- Set CORS headers ---
    if (origin && (origin.endsWith('.reav.space') || origin === 'https://reav.space' || origin.includes('localhost'))) {
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        response.setHeader('Vary', 'Origin'); // Important for CDN caching
    }

    // --- Preflight OPTIONS request ---
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // --- Only allow GET ---
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed. This endpoint only supports GET requests.' });
    }

    // --- Get diet and mealType from query ---
    const { diet, mealType } = request.query;

    // --- Fetch recipe ---
    const recipe = await getRandomRecipe(diet, mealType);

    // --- Return result ---
    if (recipe.error) {
        return response.status(500).json(recipe);
    } else {
        return response.status(200).json(recipe);
    }
}
