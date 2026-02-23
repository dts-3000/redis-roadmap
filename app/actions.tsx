'use server'
/// <reference types="node" />

import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function submitVote(formData: FormData) {
  const song = formData.get('song') as string
  
  if (!song) return

  // This adds 1 to the song's score in your Upstash database
  await redis.zincrby('aus_leaderboard', 1, song)
  
  // This refreshes the leaderboard instantly
  revalidatePath('/')
} // <--- This was the missing bracket!
}