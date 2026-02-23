import { Redis } from '@upstash/redis'
import { submitVote } from './actions'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const MUSIC_DATA: Record<string, string[]> = {
  "AC/DC": ["Thunderstruck", "It's a Long Way to the Top", "Back in Black"],
  "Midnight Oil": ["Beds Are Burning", "The Dead Heart", "Blue Sky Mine"],
  "Cold Chisel": ["Khe Sanh", "Flame Trees", "Bow River"],
  "Tame Impala": ["The Less I Know The Better", "Let It Happen", "Elephant"],
  "The Living End": ["Prisoner of Society", "All Torn Down"]
}

export default async function Page(props: { searchParams: Promise<{ band?: string }> }) {
  const searchParams = await props.searchParams;
  const selectedBand = searchParams.band;
  
  // Fetch leaderboard data
  const leaderboardRaw = await redis.zrange('aus_leaderboard', 0, 9, { withScores: true });
  const results = [];
  for (let i = 0; i < leaderboardRaw.length; i += 2) {
    if (leaderboardRaw[i]) {
      results.push({ 
        name: leaderboardRaw[i] as string, 
        votes: parseInt(leaderboardRaw[i + 1] as string) || 0 
      });
    }
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 font-sans text-slate-900 bg-white">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">True Blue Top 10</h1>
        <p className="text-slate-500 font-bold mt-2">The Ultimate Aussie Music Tally</p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">1. Select an Artist</h2>
          <div className="flex flex-wrap gap-2 mb-10">
            {Object.keys(MUSIC_DATA).map((band) => (
              <a 
                key={band}
                href={`?band=${encodeURIComponent(band)}`}
                className={`px-4 py-2 rounded-full border-2 font-bold transition-all ${selectedBand === band ? 'bg-yellow-400 border-yellow-400 text-slate-900' : 'bg-white border-slate-100 hover:border-yellow-200'}`}
              >
                {band}
              </a>
            ))}
          </div>

          {selectedBand && (
            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">2. Cast Your Vote</h2>
              {MUSIC_DATA[selectedBand].map((song) => (
                <form key={song} action={submitVote as any}>
                  <input type="hidden" name="song" value={`${selectedBand} - ${song}`} />
                  <button 
                    type="submit"
                    className="w-full group p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left font-black hover:bg-slate-900 hover:text-white transition-all flex justify-between items-center"
                  >
                    {song}
                    <span className="text-yellow-500 opacity-0 group-hover:opacity-100 text-xs tracking-widest">+ VOTE NOW</span>
                  </button>
                </form>
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl shadow-yellow-200/20">
          <h2 className="text-2xl font-black mb-8 italic border-b border-slate-800 pb-4">Live Standings</h2>
          <div className="space-y-4">
            {results.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Rank {index + 1}</span>
                  <span className="font-bold text-lg group-hover:text-yellow-400 transition-colors">{item.name}</span>
                </div>
                <div className="text-2xl font-black text-yellow-400">{item.votes}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}