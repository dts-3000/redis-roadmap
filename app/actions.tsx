'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// Initialize the Redis client using your Vercel variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

/**
 * Fetches the library from the 'music_library' key in Upstash
 */
export async function getMusicLibrary() {
  try {
    const data = await redis.get('music_library');
    
    if (!data) {
      console.log("No data found for key: music_library");
      return {};
    }

    // If data is a string (manual paste error), we parse it to JSON
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        return {};
      }
    }

    return data as Record<string, string[]>;
  } catch (error) {
    console.error("Redis Library Fetch Error:", error);
    return {};
  }
}

/**
 * Increases the vote count for selected songs in a Sorted Set
 */
export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return
  try {
    const pipeline = redis.pipeline()
    songs.forEach(song => {
      pipeline.zincrby('aus_leaderboard', 1, song)
    })
    await pipeline.exec()
    revalidatePath('/')
  } catch (error) {
    console.error("Vote Submission Error:", error);
  }
}

/**
 * Fetches the top 10 songs from the 'aus_leaderboard' Sorted Set
 */
export async function getLeaderboard() {
  try {
    const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });

    if (!leaderboardRaw || leaderboardRaw.length === 0) return [];

    const results = [];
    for (let i = 0; i < leaderboardRaw.length; i += 2) {
      results.push({ 
        name: leaderboardRaw[i] as string, 
        votes: parseInt(leaderboardRaw[i + 1] as string) || 0 
      });
    }
    return results;
  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return [];
  }
}