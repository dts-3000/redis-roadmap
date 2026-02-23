'use client'

import { useState, useEffect } from 'react'
import { submitFinalVotes, getLeaderboard } from './actions'

const MUSIC_DATA: Record<string, string[]> = {
  "AC/DC": ["Thunderstruck", "Back in Black", "Highway to Hell", "TNT"],
  "Midnight Oil": ["Beds Are Burning", "Blue Sky Mine", "The Dead Heart", "Forgotten Years"],
  "Cold Chisel": ["Khe Sanh", "Flame Trees", "Bow River", "Cheap Wine"],
  "Tame Impala": ["The Less I Know The Better", "Let It Happen", "Elephant"],
  "Silverchair": ["Tomorrow", "Straight Lines", "Freak", "Ana's Song"],
  "Powderfinger": ["My Happiness", "These Days", "Sunsets", "(Baby I've Got You) On My Mind"],
  "The Living End": ["Prisoner of Society", "White Noise", "All Torn Down"],
  "INXS": ["Never Tear Us Apart", "Need You Tonight", "Kick"]
}

export default function Page() {
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  const [votingSlip, setVotingSlip] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{name: string, votes: number}[]>([]);

  // Initial load of the leaderboard
  useEffect(() => {
    async function fetchBoard() {
      const data = await getLeaderboard();
      setLeaderboard(data);
    }
    fetchBoard();
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

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto text-center mb-8">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          True Blue <span className="text-yellow-500">Tally</span> 🇦🇺
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">
          The People&apos;s Playlist: Pick 5 Anthems
        </p>
      </header>

      {/* HORIZONTAL LEADERBOARD */}
      <section className="max-w-7xl mx-auto mb-12">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {leaderboard.length > 0 ? (
            leaderboard.map((item, index) => (
              <div key={item.name} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm min-w-[240px]">
                <span className="text-3xl font-black text-yellow-400">#{index + 1}</span>
                <div className="flex-1 truncate">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Current Rank</div>
                  <div className="font-bold text-sm truncate">{item.name}</div>
                </div>
                <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-xs">
                  {item.votes}
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-300 italic py-4">No votes yet. Be the first!</div>
          )}
        </div>
      </section>

      {/* VOTING INTERFACE */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: BANDS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[580px] flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Select Artist</h2>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {Object.keys(MUSIC_DATA).map(band => (
              <button 
                key={band} 
                onClick={() => setSelectedBand(band)}
                className={`w-full p-4 rounded-xl text-left font-bold transition-all ${selectedBand === band ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 2: SONGS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[580px] flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Pick Tracks ({votingSlip.length}/5)</h2>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {selectedBand ? (
              MUSIC_DATA[selectedBand].map(song => {
                const fullTitle = `${selectedBand} - ${song}`;
                const isSelected = votingSlip.includes(fullTitle);
                return (
                  <button 
                    key={song} 
                    disabled={isSelected || votingSlip.length >= 5}
                    onClick={() => addSong(song)}
                    className={`w-full p-4 rounded-xl text-left font-bold border-2 transition-all ${isSelected ? 'opacity-20 bg-slate-50 border-transparent' : 'border-slate-50 hover:border-yellow-400'}`}
                  >
                    {song}
                  </button>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 text-center">
                <span className="text-3xl">🎸</span>
                <p className="italic text-sm">Select a band to see tracks</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: VOTING SLIP */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 h-[580px] text-white flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Voting Slip</h2>
            {votingSlip.length > 0 && (
              <button onClick={() => setVotingSlip([])} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase">
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {votingSlip.map(song => (
              <div key={song} className="flex justify-between items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 group">
                <span className="text-xs font-bold leading-tight flex-1 pr-2">{song}</span>
                <button onClick={() => removeSong(song)} className="text-slate-600 group-hover:text-red-400 transition-colors">✕</button>
              </div>
            ))}
            {votingSlip.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                <span className="text-4xl opacity-20">🎫</span>
                <p className="italic text-sm text-center">Your slip is empty</p>
              </div>
            )}
          </div>

          <button 
            disabled={votingSlip.length === 0}
            onClick={async () => {
                await submitFinalVotes(votingSlip);
                setVotingSlip([]);
                const updated = await getLeaderboard();
                setLeaderboard(updated);
                alert("Ripper! Your votes have been counted.");
            }}
            className="w-full bg-yellow-400 text-slate-900 p-5 rounded-2xl font-black uppercase text-sm tracking-widest disabled:opacity-10 hover:bg-yellow-300 transition-all mt-6 shadow-xl shadow-yellow-400/5"
          >
            Submit {votingSlip.length} {votingSlip.length === 1 ? 'Vote' : 'Votes'}
          </button>
        </div>
      </div>
    </main>
  );
}