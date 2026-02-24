'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

function redisClient() {
  // This looks for every name we've seen in your screenshots
  const url = process.env.KV_REST_API_URL || 
              process.env.UPSTASH_REDIS_REST_URL || 
              process.env.REDIS_URL ||
              process.env.KV_URL;

  const token = process.env.KV_REST_API_TOKEN || 
                process.env.UPSTASH_REDIS_REST_TOKEN || 
                process.env.KV_REST_API_READ_ONLY_TOKEN;

  if (!url || !token) {
    console.error("DEBUG: URL found:", !!url, "Token found:", !!token);
    return null;
  }

  return new Redis({ url, token });
}

// ... the rest of your functions (getMusicLibrary, etc.) stay the same

export async function getMusicLibrary() {
  try {
    const redis = redisClient();
    if (!redis) return null;

    // Fetches the key from your Upstash dashboard
    const data = await redis.get('music_library');
    if (!data) return {};

    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Upstash Connection Error:", error);
    return null; 
  }
}

export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return
  try {
    const redis = redisClient();
    if (!redis) return;
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
    const redis = redisClient();
    if (!redis) return [];
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