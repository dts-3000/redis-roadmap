'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// We use a fallback check to ensure the app doesn't crash if variables are missing
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function getMusicLibrary() {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      console.error("CRITICAL: UPSTASH_REDIS_REST_URL is missing from environment variables");
      return {};
    }
    
    const library = await redis.get('music_library');
    // If Redis returns a string (sometimes happens with JSON), we parse it
    if (typeof library === 'string') {
      return JSON.parse(library);
    }
    return (library as Record<string, string[]>) || {};
  } catch (error) {
    console.error("Redis Fetch Error:", error);
    return {};
  }
}

export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return
  try {
    const pipeline = redis.pipeline()
    songs.forEach(song => {
      pipeline.zincrby('aus_leaderboard', 1, song)
    })
    await pipeline.exec()
    revalidatePath('/')
  } catch (e) {
    console.error("Submission error:", e);
  }
}

export async function getLeaderboard() {
  try {
    const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    const results = [];
    if (!leaderboardRaw) return [];
    
    for (let i = 0; i < leaderboardRaw.length; i += 2) {
      results.push({ 
        name: leaderboardRaw[i] as string, 
        votes: parseInt(leaderboardRaw[i + 1] as string) || 0 
      });
    }
    return results;
  } catch (error) {
    return [];
  }
}