'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function submitFinalVotes(songs: string[]) {
  if (!songs || songs.length === 0) return

  // Loop through the 5 songs and increment each one
  const pipeline = redis.pipeline()
  songs.forEach(song => {
    pipeline.zincrby('aus_leaderboard', 1, song)
  })
  
  await pipeline.exec()
  revalidatePath('/')
}