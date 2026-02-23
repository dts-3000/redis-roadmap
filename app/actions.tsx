'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// This connects to the Upstash variables you showed in your screenshot
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export async function getMusicLibrary() {
  try {
    const data = await redis.get('music_library');
    if (!data) return {};
    // Upstash returns JSON as an object; if it's a string, we parse it
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Upstash Error:", error);
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