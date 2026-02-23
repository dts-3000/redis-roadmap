'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export async function getMusicLibrary() {
  try {
    // We add a random query param to the fetch to bypass any Vercel caching
    const data = await redis.get('music_library');
    
    if (!data) return {};

    // Upstash SDK usually returns JSON as an object automatically
    if (typeof data === 'object') {
      return data as Record<string, string[]>;
    }

    // Fallback if it comes through as a string
    if (typeof data === 'string') {
      return JSON.parse(data);
    }

    return {};
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
  } catch (error) {
    console.error("Vote Submission Error:", error);
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