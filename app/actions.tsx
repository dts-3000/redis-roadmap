'use server'

import { Redis } from "@upstash/redis";
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: "https://smiling-vervet-44012.upstash.io",
  token: "AavsAAIncDFsZjkxODhjYzA1NTc0NDk0OTUwODc1MjA1NWVmMmY1Y3AxNDQwMTI",
});

export async function getMusicLibrary() {
  try {
    const data = await redis.get("music_library");
    
    // Debug: This will show up in your Vercel 'Logs' tab
    console.log("Raw Data Type:", typeof data);

    if (!data) return {};

    // SAFETY: If Upstash returns a string (text), we must parse it into JSON
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("JSON Parsing failed. Data might be corrupted:", data);
        return {};
      }
    }

    // If it's already an object, just return it
    return data;
  } catch (error) {
    console.error("REDIS CONNECTION ERROR:", error);
    return null; // This triggers your 'Database Connection Failed' UI
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