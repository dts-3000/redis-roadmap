'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// We initialize inside the function to ensure we get the latest Env Vars
const getRedis = () => {
  return new Redis({
    url: process.env.KV_REST_API_URL || '',
    token: process.env.KV_REST_API_TOKEN || '',
  })
}

export async function getMusicLibrary() {
  try {
    const redis = getRedis();
    // This looks for the JSON key visible in your Upstash screenshot
    const data = await redis.get('music_library');
    
    if (!data) return {};
    
    // If Upstash returns a string, parse it; otherwise return the object
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error("REDIS ERROR:", error);
    return null; // This triggers the "Database Connection Failed" UI
  }
}

export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return;
  try {
    const redis = getRedis();
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
    const redis = getRedis();
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