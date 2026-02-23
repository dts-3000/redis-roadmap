'use client'

import { useState, useEffect } from 'react'
import { submitFinalVotes, getLeaderboard, getMusicLibrary } from './actions'

export default function Page() {
  const [musicData, setMusicData] = useState<Record<string, string[]>>({});
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  const [votingSlip, setVotingSlip] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{name: string, votes: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initApp() {
      try {
        const [lib, board] = await Promise.all([
          getMusicLibrary(),
          getLeaderboard()
        ]);
        setMusicData(lib || {});
        setLeaderboard(board || []);
      } catch (err) {
        console.error("App load error:", err);
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, []);

  const addSong = (song: string) => {
    const fullTitle = `${selectedBand} - ${song}`;
    if (votingSlip.length < 5 && !votingSlip.includes(fullTitle)) {
      setVotingSlip([...votingSlip, fullTitle]);
    }
  };

  const removeSong = (songToRemove: string) => {
    setVotingSlip(votingSlip.filter(s => s !== songToRemove));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black uppercase text-slate-400">
      Loading Anthems...
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto text-center mb-8">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          True Blue <span className="text-yellow-500">Tally</span> 🇦🇺
        </h1>
      </header>

      {/* HORIZONTAL LEADERBOARD */}
      <section className="max-w-7xl mx-auto mb-12 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {leaderboard.length > 0 ? (
          leaderboard.map((item, index) => (
            <div key={item.name} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm min-w-[240px]">
              <span className="text-3xl font-black text-yellow-400">#{index + 1}</span>
              <div className="flex-1 truncate font-bold text-sm">{item.name}</div>
              <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-xs">{item.votes}</div>
            </div>
          ))
        ) : (
          <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 italic w-full text-center text-sm">
            Waiting for the first votes...
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMN 1: BANDS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[580px] flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">1. Artist</h2>
          <div className="flex-1 overflow-y-auto space-y-1">
            {Object.keys(musicData).length > 0 ? (
              Object.keys(musicData).sort().map(band => (
                <button 
                  key={band} 
                  onClick={() => setSelectedBand(band)}
                  className={`w-full p-4 rounded-xl text-left font-bold transition-all ${selectedBand === band ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50'}`}
                >
                  {band}
                </button>
              ))
            ) : (
              <div className="text-center mt-20 p-6 border-2 border-slate-100 rounded-2xl bg-slate-50">
                <p className="text-slate-400 font-bold text-xs uppercase">No Artists Found</p>
                <p className="text-[10px] text-slate-400 mt-2 italic">Add the 'music_library' key in Upstash.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: SONGS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[580px] flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">2. Track ({votingSlip.length}/5)</h2>
          <div className="flex-1 overflow-y-auto space-y-1">
            {selectedBand && musicData[selectedBand] ? (
              musicData[selectedBand].sort().map(song => (
                <button 
                  key={song} 
                  disabled={votingSlip.includes(`${selectedBand} - ${song}`) || votingSlip.length >= 5}
                  onClick={() => addSong(song)}
                  className="w-full p-4 rounded-xl text-left font-bold border-2 border-slate-50 hover:border-yellow-400 disabled:opacity-20 transition-all"
                >
                  {song}
                </button>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic text-sm text-center px-10">
                Select an artist
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: SLIP */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 h-[580px] text-white flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Voting Slip</h2>
            <button onClick={() => setVotingSlip([])} className="text-[10px] font-black text-red-500 hover:text-red-400">Clear</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {votingSlip.map(song => (
              <div key={song} className="flex justify-between items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 group animate-in fade-in slide-in-from-right-2">
                <span className="text-xs font-bold leading-tight flex-1 pr-2">{song}</span>
                <button onClick={() => removeSong(song)} className="text-slate-600 group-hover:text-red-400">✕</button>
              </div>
            ))}
          </div>
          <button 
            disabled={votingSlip.length === 0}
            onClick={async () => {
              await submitFinalVotes(votingSlip);
              setVotingSlip([]);
              setLeaderboard(await getLeaderboard());
              alert("Cheers! Votes recorded.");
            }}
            className="w-full bg-yellow-400 text-slate-900 p-5 rounded-2xl font-black uppercase text-sm mt-6 hover:bg-yellow-300 transition-all disabled:opacity-10"
          >
            Submit {votingSlip.length} Votes
          </button>
        </div>
      </div>
    </main>
  );
}