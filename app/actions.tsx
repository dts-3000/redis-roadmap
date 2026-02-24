'use server'

import { Redis } from "@upstash/redis";
import { revalidatePath } from 'next/cache'

/**
 * Using the HTTP-based client recommended for Serverless/Next.js.
 * We are using the exact strings from your previous screenshots.
 */
const redis = new Redis({
  url: "https://smiling-vervet-44012.upstash.io",
  token: "AavsAAIncDFsZjkxODhjYzA1NTc0NDk0OTUwODc1MjA1NWVmMmY1Y3AxNDQwMTI",
});

export async function getMusicLibrary() {
  try {
    // Fetches the 'music_library' key from Upstash
    const data = await redis.get("music_library");
    
    if (!data) return {};

    // If it's a string from the DB, we parse it; otherwise, return the object
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Database Connection Error:", error);
    return null; 
  }
}

export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return;
  try {
    const pipeline = redis.pipeline();
    songs.forEach(song => {
      pipeline.zincrby('aus_leaderboard', 1, song);
    });
    await pipeline.exec();
    revalidatePath('/');
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