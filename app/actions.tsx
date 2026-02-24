'use server'

import { Redis } from "@upstash/redis";
import { revalidatePath } from 'next/cache';

const redis = new Redis({
  url: "https://smiling-vervet-44012.upstash.io",
  token: "AavsAAIncDFsZjkxODhjYzA1NTc0NDk0OTUwODc1MjA1NWVmMmY1Y3AxNDQwMTI",
});

export async function getMusicLibrary() {
  try {
    const data = await redis.get("music_library");
    if (!data) return {};
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error("REDIS ERROR:", error);
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
    return [];
  }
}