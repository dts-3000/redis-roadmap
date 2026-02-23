'use client'

import { useState, useEffect } from 'react'
import { submitFinalVotes, getLeaderboard, getMusicLibrary } from './actions'

export default function Page() {
  const [musicData, setMusicData] = useState<Record<string, string[]>>({});
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  const [votingSlip, setVotingSlip] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{name: string, votes: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const init = async () => {
    try {
      const lib = await getMusicLibrary();
      const board = await getLeaderboard();
      
      if (lib === null) {
        setError("Database Connection Failed");
      } else if (Object.keys(lib).length === 0) {
        setError("Connected, but 'music_library' key is empty in Upstash");
      } else {
        setMusicData(lib);
        setError(null);
      }
      setLeaderboard(board);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { init() }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">CONNECTING...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <header className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter">
          True Blue <span className="text-yellow-500">Tally</span> 🇦🇺
        </h1>
        {error && (
          <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase inline-block">
            ⚠️ {error}
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 1. ARTIST SELECTION */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[600px] flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">1. Artist</h2>
          <div className="overflow-y-auto space-y-1 pr-2">
            {Object.keys(musicData).sort().map(band => (
              <button 
                key={band} 
                onClick={() => setSelectedBand(band)}
                className={`w-full p-4 rounded-xl text-left font-bold transition-all ${selectedBand === band ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50'}`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>

        {/* 2. TRACK SELECTION */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[600px] flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">2. Track</h2>
          <div className="overflow-y-auto space-y-1">
            {selectedBand ? musicData[selectedBand].map(song => (
              <button 
                key={song} 
                disabled={votingSlip.includes(`${selectedBand} - ${song}`) || votingSlip.length >= 5}
                onClick={() => setVotingSlip([...votingSlip, `${selectedBand} - ${song}`])}
                className="w-full p-4 rounded-xl text-left font-bold border-2 border-transparent hover:border-yellow-400 transition-all disabled:opacity-20"
              >
                {song}
              </button>
            )) : <div className="h-full flex items-center justify-center text-slate-300 italic text-sm text-center px-6">Pick an artist to see their tracks</div>}
          </div>
        </div>

        {/* 3. VOTING SLIP */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 h-[600px] text-white flex flex-col shadow-2xl">
          <h2 className="text-[10px] font-black text-slate-500 uppercase mb-6 border-b border-slate-800 pb-2 tracking-widest">Your Slip</h2>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {votingSlip.map(song => (
              <div key={song} className="bg-slate-800/40 p-4 rounded-2xl text-xs font-bold flex justify-between items-center group">
                <span className="flex-1 pr-2">{song}</span>
                <button 
                  onClick={() => setVotingSlip(votingSlip.filter(s => s !== song))} 
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button 
            disabled={votingSlip.length === 0}
            onClick={async () => {
              await submitFinalVotes(votingSlip);
              setVotingSlip([]);
              await init();
              alert("Good on ya! Votes submitted.");
            }}
            className="w-full bg-yellow-400 text-slate-900 p-5 rounded-2xl font-black uppercase mt-6 hover:bg-yellow-300 transition-all disabled:opacity-10"
          >
            Submit {votingSlip.length} Votes
          </button>
        </div>
      </div>
    </main>
  );
}