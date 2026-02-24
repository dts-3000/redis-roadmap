'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

/**
 * We are manually defining the URL and Token here to bypass 
 * the 'locked' Vercel KV variables.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function getMusicLibrary() {
  try {
    // This fetches the 'music_library' key from your smiling-vervet database
    const data = await redis.get('music_library');
    
    if (!data) return {};

    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    // If this still fails, it means the URL/Token in Vercel are wrong
    console.error("Connection Error:", error);
    return null; 
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
  } catch (error) {
    console.error("Vote Error:", error);
  }
}

export async function getLeaderboard() {
  try {
    const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    if (!leaderboardRaw) return [];
    const results = [];
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