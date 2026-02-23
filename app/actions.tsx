'use server'

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

// This automatically uses your KV_REST_API_URL and TOKEN
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function submitVote(formData: FormData) {
  const song = formData.get('song') as string
  if (!song || song.length < 2) return

  // We use ZINCRBY to add 1 vote to the song's score in the leaderboard
  await redis.zincrby('aus_leaderboard', 1, song)
  
  // This tells Vercel to refresh the page so the leaderboard updates
  revalidatePath('/')
}