'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

/** * UPDATED: Using your specific environment variable names 
 * to ensure the connection to Upstash is successful.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getMusicLibrary() {
  try {
    const library = await redis.get('music_library');
    console.log("Redis Connection Success. Data:", library);
    return library as Record<string, string[]> || {};
  } catch (error) {
    console.error("Redis Connection Failed:", error);
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