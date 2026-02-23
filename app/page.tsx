'use client'

import { useState } from 'react'
import { submitFinalVotes } from './actions'

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

  const addSong = (song: string) => {
    if (votingSlip.length < 5 && !votingSlip.includes(song)) {
      setVotingSlip([...votingSlip, `${selectedBand} - ${song}`]);
    }
  };

  const removeSong = (songToRemove: string) => {
    setVotingSlip(votingSlip.filter(s => s !== songToRemove));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COL 1: BANDS */}
        <div className="bg-white rounded-2xl p-6 border h-[600px] overflow-y-auto">
          <h2 className="text-xs font-black text-slate-400 uppercase mb-4">1. Select Band</h2>
          <div className="flex flex-col gap-2">
            {Object.keys(MUSIC_DATA).map(band => (
              <button 
                key={band} 
                onClick={() => setSelectedBand(band)}
                className={`p-4 rounded-xl text-left font-bold transition-all ${selectedBand === band ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>

        {/* COL 2: SONGS */}
        <div className="bg-white rounded-2xl p-6 border h-[600px] overflow-y-auto">
          <h2 className="text-xs font-black text-slate-400 uppercase mb-4">2. Pick Songs ({votingSlip.length}/5)</h2>
          {selectedBand ? (
            <div className="flex flex-col gap-2">
              {MUSIC_DATA[selectedBand].map(song => {
                const isSelected = votingSlip.includes(`${selectedBand} - ${song}`);
                return (
                  <button 
                    key={song} 
                    disabled={isSelected || votingSlip.length >= 5}
                    onClick={() => addSong(song)}
                    className={`p-4 rounded-xl text-left font-bold border-2 transition-all ${isSelected ? 'opacity-50 bg-slate-100 border-transparent' : 'border-slate-100 hover:border-yellow-400'}`}
                  >
                    {song} {isSelected && '✅'}
                  </button>
                );
              })}
            </div>
          ) : <p className="text-slate-300 italic text-center mt-20">Select a band</p>}
        </div>

        {/* COL 3: VOTING SLIP */}
        <div className="bg-slate-900 rounded-2xl p-6 h-[600px] text-white flex flex-col">
          <h2 className="text-xs font-black text-slate-500 uppercase mb-4 border-b border-slate-800 pb-2">Your Voting Slip</h2>
          <div className="flex-1 space-y-3">
            {votingSlip.map(song => (
              <div key={song} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg group">
                <span className="text-sm font-bold truncate pr-2">{song}</span>
                <button onClick={() => removeSong(song)} className="text-red-400 hover:text-red-200 font-bold px-2">✕</button>
              </div>
            ))}
            {votingSlip.length === 0 && <p className="text-slate-600 italic text-center mt-20">Your slip is empty</p>}
          </div>

          <button 
            disabled={votingSlip.length === 0}
            onClick={async () => {
                await submitFinalVotes(votingSlip);
                setVotingSlip([]); // Clear slip after voting
                alert("Votes Cast! Cheers mate.");
            }}
            className="w-full bg-yellow-400 text-slate-900 p-4 rounded-xl font-black uppercase disabled:opacity-30 transition-all hover:scale-[1.02]"
          >
            Submit All {votingSlip.length} Votes
          </button>
        </div>

      </div>
    </main>
  );
}