'use server'

import { Redis } from "@upstash/redis";
import { revalidatePath } from 'next/cache';

// Force the server to fetch fresh data every time (bypasses Vercel's static cache)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * MANUAL OVERRIDE: Using the exact credentials from your screenshots
 * to ensure Vercel's environment variables aren't the bottleneck.
 */
const redis = new Redis({
  url: "https://smiling-vervet-44012.upstash.io",
  token: "AavsAAIncDFsZjkxODhjYzA1NTc0NDk0OTUwODc1MjA1NWVmMmY1Y3AxNDQwMTI",
});

export async function getMusicLibrary() {
  console.log("--- REDIS DEBUG START ---");
  try {
    // 1. Test the "Handshake"
    const ping = await redis.ping();
    console.log("Connection Status:", ping); // Should print 'PONG' in Vercel Logs

    // 2. Fetch the data
    const data = await redis.get("music_library");
    
    if (!data) {
      console.error("DATA ERROR: Key 'music_library' not found or empty in Upstash.");
      return {};
    }

    // 3. Robust Parsing (Handles both stringified and raw JSON)
    const library = typeof data === 'string' ? JSON.parse(data) : data;
    console.log("Library loaded successfully!");
    return library;

  } catch (error: any) {
    console.error("CONNECTION FAILED:", error.message);
    return null; // Triggers the "Database Connection Failed" UI
  } finally {
    console.log("--- REDIS DEBUG END ---");
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
    console.error("VOTE ERROR:", error);
  }
}

export async function getLeaderboard() {
  try {
    const raw = await redis.zrange('aus_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    
    if (!raw) return [];
    
    const results = [];
    for (let i = 0; i < raw.length; i += 2) {
      results.push({ 
        name: raw[i] as string, 
        votes: parseInt(raw[i + 1] as string) || 0 
      });
    }
    return results;
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);
    return [];
  }
}