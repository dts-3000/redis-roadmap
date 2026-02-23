'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// We initialize inside the function to ensure process.env is ready
const getClient = () => {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  if (!url || !token) throw new Error("MISSING_KEYS");
  
  return new Redis({ url, token });
}

export async function getMusicLibrary() {
  try {
    const redis = getClient();
    // Fetch data directly from the 'music_library' key shown in your screenshot
    const data = await redis.get('music_library');
    
    if (!data) return {};

    // Upstash usually returns JSON as an object, but we handle strings just in case
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error: any) {
    console.error("Library Fetch Error:", error.message);
    return null; // Return null so the UI knows it was an error, not just empty
  }
}

export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return
  try {
    const redis = getClient();
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
    const redis = getClient();
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