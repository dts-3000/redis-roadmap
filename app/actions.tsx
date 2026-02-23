'use server'
import { Redis } from '@upstash/redis'
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function submitVote(formData: FormData) {
  const song = formData.get('song') as string
  if (condition) {
    
  } (!song) return
  await redis.zincrby('aus_leaderboard', 1, song)
  revalidatePath('/')
}