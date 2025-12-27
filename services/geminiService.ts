
import { GoogleGenAI } from "@google/genai";
import { Movie, Profile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPersonalizedRecommendations = async (profile: Profile, allMovies: Movie[]): Promise<string[]> => {
  try {
    const historyTitles = allMovies.filter(m => profile.history.includes(m.id)).map(m => m.title);
    const watchlistTitles = allMovies.filter(m => profile.watchlist.includes(m.id)).map(m => m.title);

    const prompt = `Based on this user's profile on a Liberian streaming platform:
    Profile Name: ${profile.name}
    Watch History: ${historyTitles.join(', ')}
    Watchlist: ${watchlistTitles.join(', ')}
    Parental Controls (Max Rating): ${profile.maxRating}
    
    Current available movies: ${allMovies.map(m => m.title).join(', ')}

    Identify 3 movies from the current list that would be best recommendations. Return ONLY the movie IDs as a comma-separated list.
    Ensure recommendations respect the rating limit: ${profile.maxRating}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "";
    const recommendedIds = text.split(',').map(id => id.trim()).filter(id => allMovies.some(m => m.id === id));
    return recommendedIds;
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return [];
  }
};

export const searchAIContent = async (query: string, allMovies: Movie[]): Promise<string[]> => {
  try {
    const prompt = `A user is searching for: "${query}" on a Liberian streaming app.
    Here is the library: ${allMovies.map(m => `${m.id}: ${m.title} (${m.category})`).join(', ')}
    
    Match the query to the most relevant movie IDs. Return ONLY a comma-separated list of IDs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "";
    return text.split(',').map(id => id.trim()).filter(id => allMovies.some(m => m.id === id));
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};
