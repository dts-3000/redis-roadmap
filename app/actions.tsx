'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

/**
 * INITIALIZE REDIS
 * Uses the exact environment variables from your Vercel screenshot.
 */
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

/**
 * FETCH MUSIC LIBRARY
 * This pulls the JSON object you created in the Upstash Data Browser.
 */
export async function getMusicLibrary() {
  try {
    // We fetch the key 'music_library'
    const data = await redis.get('music_library');
    
    // This log helps you debug in the Vercel 'Logs' tab
    console.log("Database Response for music_library:", data ? "Data Found" : "Empty");

    if (!data) return {};

    // Upstash returns JSON as an object. If it's a string, we parse it.
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Redis Fetch Error:", error);
    return {};
  }
}

/**
 * SUBMIT VOTES
 * Increments the score of songs in a Sorted Set named 'aus_leaderboard'.
 */
export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return;
  
  try {
    const pipeline = redis.pipeline();
    songs.forEach(song => {
      pipeline.zincrby('aus_leaderboard', 1, song);
    });
    await pipeline.exec();
    
    // Tells Next.js to refresh the page data
    revalidatePath('/');
  } catch (error) {
    console.error("Vote Submission Error:", error);
  }
}

/**
 * GET LEADERBOARD
 * Retrieves the top 10 most voted songs.
 */
export async function getLeaderboard() {
  try {
    const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });

    if (!leaderboardRaw || leaderboardRaw.length === 0) return [];

    const results = [];
    // Formats the flat array [name, score, name, score] into objects
    for (let i = 0; i < leaderboardRaw.length; i += 2) {
      results.push({ 
        name: leaderboardRaw[i] as string, 
        votes: parseInt(leaderboardRaw[i + 1] as string) || 0 
      });
    }
    return results;
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return [];
  }
}