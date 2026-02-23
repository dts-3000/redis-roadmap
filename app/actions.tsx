'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// 1. CRITICAL CHECK: This ensures Vercel is actually providing your keys.
// If these are missing, the app will throw a visible error in your logs.
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.error("CRITICAL ERROR: Vercel Environment Variables (KV_REST_API_URL/TOKEN) are missing.");
}

// 2. INITIALIZE CLIENT: Using the Upstash-specific variables from your screenshot.
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

/**
 * Fetches the music library from Upstash.
 * Handles both standard JSON and String-to-JSON conversion.
 */
export async function getMusicLibrary() {
  try {
    const data = await redis.get('music_library');
    
    // This log will appear in your Vercel "Logs" tab when you refresh the page.
    console.log("REDIS DATA FETCHED:", data);

    if (!data) {
      console.warn("Database connected, but key 'music_library' returned no data.");
      return {};
    }

    // Upstash usually returns the object directly if stored as JSON.
    if (typeof data === 'object') {
      return data as Record<string, string[]>;
    }

    // Fallback: If it's a string, we parse it.
    if (typeof data === 'string') {
      return JSON.parse(data);
    }

    return {};
  } catch (error) {
    console.error("REDIS FETCH ERROR:", error);
    return {};
  }
}

/**
 * Submits votes to a Sorted Set (ZSET) in Redis.
 */
export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return;
  
  try {
    const pipeline = redis.pipeline();
    songs.forEach(song => {
      // zincrby increments the score of the song by 1
      pipeline.zincrby('aus_leaderboard', 1, song);
    });
    await pipeline.exec();
    
    // Clears the cache so the leaderboard updates immediately.
    revalidatePath('/');
  } catch (error) {
    console.error("VOTE SUBMISSION ERROR:", error);
  }
}

/**
 * Retrieves the Top 10 songs from the leaderboard.
 */
export async function getLeaderboard() {
  try {
    // Fetches top 10 results from the Sorted Set 'aus_leaderboard'
    const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });

    if (!leaderboardRaw || leaderboardRaw.length === 0) return [];

    const results = [];
    // Upstash returns zrange with scores as a flat array: [item1, score1, item2, score2...]
    for (let i = 0; i < leaderboardRaw.length; i += 2) {
      results.push({ 
        name: leaderboardRaw[i] as string, 
        votes: parseInt(leaderboardRaw[i + 1] as string) || 0 
      });
    }
    return results;
  } catch (error) {
    console.error("LEADERBOARD FETCH ERROR:", error);
    return [];
  }
}