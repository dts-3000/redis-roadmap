import { Redis } from '@upstash/redis'
import { submitVote } from './actions'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const MUSIC_DATA: Record<string, string[]> = {
  "AC/DC": ["Thunderstruck", "Back in Black", "Highway to Hell"],
  "Midnight Oil": ["Beds Are Burning", "Blue Sky Mine", "The Dead Heart"],
  "Cold Chisel": ["Khe Sanh", "Flame Trees", "Cheap Wine"],
  "Tame Impala": ["The Less I Know The Better", "Let It Happen"],
  "Silverchair": ["Tomorrow", "Straight Lines", "Freak"],
  "Powderfinger": ["My Happiness", "These Days", "Sunsets"]
}

export default async function Page(props: { searchParams: Promise<{ band?: string, song?: string }> }) {
  const searchParams = await props.searchParams;
  const selectedBand = searchParams.band;
  const currentSelection = searchParams.song;

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans">
      <h1 className="text-3xl font-black text-center mb-10 uppercase tracking-tighter">Music Voter 🇦🇺</h1>
      
      {/* 3-Column Layout matching your drawing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* COLUMN 1: BAND NAMES */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[600px] overflow-y-auto">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b">Band Names</h2>
          <div className="flex flex-col gap-2">
            {Object.keys(MUSIC_DATA).map((band) => (
              <a 
                key={band}
                href={`?band=${encodeURIComponent(band)}`}
                className={`p-4 rounded-xl font-bold transition-all border-2 ${selectedBand === band ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-transparent hover:border-slate-200'}`}
              >
                {band}
              </a>
            ))}
          </div>
        </div>

        {/* COLUMN 2: SONG NAMES */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[600px] overflow-y-auto">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b">Song Names</h2>
          {selectedBand ? (
            <div className="flex flex-col gap-2">
              {MUSIC_DATA[selectedBand].map((song) => (
                <a 
                  key={song}
                  href={`?band=${encodeURIComponent(selectedBand)}&song=${encodeURIComponent(song)}`}
                  className={`p-4 rounded-xl font-bold transition-all border-2 ${currentSelection === song ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                >
                  {song}
                </a>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 italic text-sm text-center">
              Select a band to see songs
            </div>
          )}
        </div>

        {/* COLUMN 3: VOTING SLIP */}
        <div className="bg-slate-900 rounded-2xl shadow-xl p-6 h-[600px] text-white flex flex-col">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 pb-2 border-b border-slate-800">Voting Slip</h2>
          
          {currentSelection ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-yellow-400 text-xs font-bold uppercase mb-1">Confirming Vote for:</div>
                <div className="text-2xl font-black leading-tight mb-2">{currentSelection}</div>
                <div className="text-slate-400 font-medium italic">by {selectedBand}</div>
              </div>

              <form action={submitVote as any}>
                <input type="hidden" name="song" value={`${selectedBand} - ${currentSelection}`} />
                <button 
                  type="submit"
                  className="w-full bg-yellow-400 text-slate-900 p-5 rounded-xl font-black text-lg uppercase hover:bg-yellow-300 transition-all active:scale-95"
                >
                  Confirm & Cast Vote
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-4 uppercase font-bold tracking-tighter">
                  Votes are recorded live to Upstash Redis
                </p>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 italic text-sm text-center">
              Pick a song to populate your slip
            </div>
          )}
        </div>

      </div>
    </main>
  );
}