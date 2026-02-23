'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Fetches the Artist/Song library from Redis
export async function getMusicLibrary() {
  try {
    const library = await redis.get<Record<string, string[]>>('music_library');
    return library || {};
  } catch (error) {
    console.error("Library Fetch Error:", error);
    return {};
  }
}

// Submits the 5 votes in one go
export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return
  
  const pipeline = redis.pipeline()
  songs.forEach(song => {
    pipeline.zincrby('aus_leaderboard', 1, song)
  })
  
  await pipeline.exec()
  revalidatePath('/')
}

// Fetches the top 10 rankings
export async function getLeaderboard() {
  try {
    const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    
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