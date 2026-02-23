'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

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
  const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { withScores: true });
  const results = [];
  for (let i = 0; i < leaderboardRaw.length; i += 2) {
    results.push({ 
      name: leaderboardRaw[i] as string, 
      votes: parseInt(leaderboardRaw[i + 1] as string) || 0 
    });
  }
  return results;
}