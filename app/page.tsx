import { Redis } from '@upstash/redis'
import { submitVote } from './actions'

const redis = new Redis({
  URL: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export default async function Page() {
  // Fetch the current top 10 from the database
  const leaderboardRaw = await redis.zrevrange('aus_leaderboard', 0, 9, { withScores: true })

  // Clean up the data for display
  const results = []
  for (let i = 0; i < leaderboardRaw.length; i += 2) {
    results.push({ name: leaderboardRaw[i], votes: leaderboardRaw[i + 1] })
  }

  return (
    <main className="max-w-xl mx-auto py-20 px-4 font-sans text-slate-900">
      <h1 className="text-5xl font-black mb-2 text-center">🇦🇺</h1>
      <h2 className="text-3xl font-bold mb-8 text-center uppercase tracking-tighter">The True Blue Top 10</h2>
      
      {/* Voting Input */}
      <form action={submitVote} className="flex flex-col gap-3 mb-12">
        <label className="text-sm font-bold text-slate-500 uppercase">Vote for a song</label>
        <div className="flex gap-2">
          <input 
            name="song"
            placeholder="e.g. Midnight Oil - Beds Are Burning"
            className="flex-1 p-4 border-2 border-slate-200 rounded-xl focus:border-yellow-400 outline-none transition-all"
            required
          />
          <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all">
            VOTE
          </button>
        </div>
      </form>

      {/* Leaderboard UI */}
      <div className="space-y-3">
        {results.length === 0 ? (
          <p className="text-center text-slate-400 italic">No votes yet. Start the tally!</p>
        ) : (
          results.map((item, index) => (
            <div key={item.name as string} className="flex items-center justify-between bg-white border-2 border-slate-100 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-slate-300">#{(index + 1)}</span>
                <span className="font-bold text-lg">{item.name as string}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase">Votes</span>
                <span className="text-xl font-black text-yellow-500">{item.votes as number}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="mt-20 text-center text-slate-400 text-xs">
        Powered by Upstash & Vercel
      </footer>
    </main>
  )
}