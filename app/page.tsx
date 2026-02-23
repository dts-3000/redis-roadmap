'use client'

import { useState, useEffect } from 'react'
import { submitFinalVotes, getLeaderboard, getMusicLibrary } from './actions'

export default function Page() {
  const [musicData, setMusicData] = useState<Record<string, string[]>>({});
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  const [votingSlip, setVotingSlip] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{name: string, votes: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'ok' | 'error' | 'empty'>('ok');

  const loadData = async () => {
    const lib = await getMusicLibrary();
    const board = await getLeaderboard();
    
    if (lib === null) {
      setStatus('error');
    } else if (Object.keys(lib).length === 0) {
      setStatus('empty');
    } else {
      setMusicData(lib);
      setStatus('ok');
    }
    setLeaderboard(board);
    setLoading(false);
  };

  useEffect(() => { loadData() }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase">Connecting...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <header className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter">
          True Blue <span className="text-yellow-500">Tally</span> 🇦🇺
        </h1>
        
        {status === 'error' && (
          <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase animate-pulse">
            ⚠️ Connection Error: Check Vercel Env Variables
          </div>
        )}
        {status === 'empty' && (
          <div className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase">
            ⚠️ Database found but library is empty
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ARTISTS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[600px] flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">1. Artist</h2>
          <div className="overflow-y-auto space-y-1">
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

        {/* TRACKS */}
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
            )) : <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">Pick an artist</div>}
          </div>
        </div>

        {/* VOTING SLIP */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 h-[600px] text-white flex flex-col shadow-2xl">
          <h2 className="text-[10px] font-black text-slate-500 uppercase mb-6 border-b border-slate-800 pb-2 tracking-widest">Voting Slip</h2>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {votingSlip.map(song => (
              <div key={song} className="bg-slate-800/40 p-4 rounded-2xl text-xs font-bold flex justify-between items-center group">
                <span className="flex-1 pr-2">{song}</span>
                <button onClick={() => setVotingSlip(votingSlip.filter(s => s !== song))} className="text-slate-600 hover:text-red-400 transition-colors">✕</button>
              </div>
            ))}
          </div>
          <button 
            disabled={votingSlip.length === 0}
            onClick={async () => {
              await submitFinalVotes(votingSlip);
              setVotingSlip([]);
              await loadData();
              alert("Ripper! Your votes are in.");
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