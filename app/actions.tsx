'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// We are using the "KV_" names because that is what Vercel has in your settings
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export async function getMusicLibrary() {
  try {
    // LOG FOR DEBUGGING: This will show in your Vercel Logs
    if (!process.env.KV_REST_API_URL) {
      console.error("DATA ERROR: KV_REST_API_URL is undefined in the environment.");
      return {};
    }

    const library = await redis.get('music_library');
    
    if (!library) {
      console.warn("DATA WARNING: Key 'music_library' not found in Redis.");
      return {};
    }

    return library as Record<string, string[]>;
  } catch (error) {
    console.error("REDIS FETCH ERROR:", error);
    return {};
  }
}

export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return
  const pipeline = redis.pipeline()
  songs.forEach(song => {
    pipeline.zincrby('aus_leaderboard', 1, song)
  })
  await pipeline.exec()
  revalidatePath('/')
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