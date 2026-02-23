'use client'

import { useState, useEffect } from 'react'
import { submitFinalVotes, getLeaderboard } from './actions'

const MUSIC_DATA: Record<string, string[]> = {
  "AC/DC": ["Thunderstruck", "Back in Black", "Highway to Hell"],
  "Midnight Oil": ["Beds Are Burning", "Blue Sky Mine", "The Dead Heart"],
  "Cold Chisel": ["Khe Sanh", "Flame Trees", "Bow River"],
  "Tame Impala": ["The Less I Know The Better", "Let It Happen"],
  "Silverchair": ["Tomorrow", "Straight Lines"],
  "Powderfinger": ["My Happiness", "These Days"]
}

export default function Page() {
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  const [votingSlip, setVotingSlip] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{name: string, votes: number}[]>([]);

  // Fetch leaderboard on load
  useEffect(() => {
    async function fetchBoard() {
      const data = await getLeaderboard();
      setLeaderboard(data);
    }
    fetchBoard();
  }, []);

  const addSong = (song: string) => {
    if (votingSlip.length < 5 && !votingSlip.includes(`${selectedBand} - ${song}`)) {
      setVotingSlip([...votingSlip, `${selectedBand} - ${song}`]);
    }
  };

  const removeSong = (songToRemove: string) => {
    setVotingSlip(votingSlip.filter(s => s !== songToRemove));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* 1. RESTORED HEADER */}
      <header className="max-w-7xl mx-auto text-center mb-8">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">
          True Blue <span className="text-yellow-500">Tally</span> 🇦🇺
        </h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mt-2">Select 5 songs for the ultimate playlist</p>
      </header>

      {/* 2. NEW HORIZONTAL LEADERBOARD */}
      <section className="max-w-7xl mx-auto mb-10 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {leaderboard.map((item, index) => (
            <div key={item.name} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <span className="text-2xl font-black text-yellow-400">#{index + 1}</span>
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">Current Rank</div>
                <div className="font-bold text-slate-900">{item.name}</div>
              </div>
              <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-sm">
                {item.votes}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE 3-COLUMN VOTING GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COL 1: BANDS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[550px] overflow-y-auto">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Select Artist</h2>
          <div className="flex flex-col gap-1">
            {Object.keys(MUSIC_DATA).map(band => (
              <button 
                key={band} 
                onClick={() => setSelectedBand(band)}
                className={`p-4 rounded-xl text-left font-bold transition-all ${selectedBand === band ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50'}`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>

        {/* COL 2: SONGS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[550px] overflow-y-auto">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Pick Tracks ({votingSlip.length}/5)</h2>
          {selectedBand ? (
            <div className="flex flex-col gap-1">
              {MUSIC_DATA[selectedBand].map(song => {
                const isSelected = votingSlip.includes(`${selectedBand} - ${song}`);
                return (
                  <button 
                    key={song} 
                    disabled={isSelected || votingSlip.length >= 5}
                    onClick={() => addSong(song)}
                    className={`p-4 rounded-xl text-left font-bold border-2 transition-all ${isSelected ? 'opacity-30 bg-slate-50 border-transparent' : 'border-slate-50 hover:border-yellow-400'}`}
                  >
                    {song}
                  </button>
                );
              })}
            </div>
          ) : <div className="h-full flex items-center justify-center text-slate-300 italic">Select a legend...</div>}
        </div>

        {/* COL 3: VOTING SLIP */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 h-[550px] text-white flex flex-col shadow-2xl">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 text-center">Your Voting Slip</h2>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {votingSlip.map(song => (
              <div key={song} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <span className="text-xs font-bold leading-tight">{song}</span>
                <button onClick={() => removeSong(song)} className="text-slate-500 hover:text-red-400 transition-colors">✕</button>
              </div>
            ))}
          </div>

          <button 
            disabled={votingSlip.length === 0}
            onClick={async () => {
                await submitFinalVotes(votingSlip);
                setVotingSlip([]);
                const updated = await getLeaderboard();
                setLeaderboard(updated);
                alert("Cheers! Your votes are in.");
            }}
            className="w-full bg-yellow-400 text-slate-900 p-5 rounded-2xl font-black uppercase text-sm tracking-widest disabled:opacity-20 hover:bg-yellow-300 transition-all mt-6"
          >
            Submit {votingSlip.length} {votingSlip.length === 1 ? 'Vote' : 'Votes'}
          </button>
        </div>
      </div>
    </main>
  );
}