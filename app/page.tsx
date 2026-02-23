'use client'

import { useState, useEffect } from 'react'
import { submitFinalVotes, getLeaderboard, getMusicLibrary } from './actions'

export default function Page() {
  const [musicData, setMusicData] = useState<Record<string, string[]>>({});
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  const [votingSlip, setVotingSlip] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{name: string, votes: number}[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshData() {
    const [lib, board] = await Promise.all([
      getMusicLibrary(),
      getLeaderboard()
    ]);
    setMusicData(lib || {});
    setLeaderboard(board || []);
  }

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const addSong = (song: string) => {
    const fullTitle = `${selectedBand} - ${song}`;
    if (votingSlip.length < 5 && !votingSlip.includes(fullTitle)) {
      setVotingSlip([...votingSlip, fullTitle]);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <header className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter">
          True Blue <span className="text-yellow-500">Tally</span> 🇦🇺
        </h1>
      </header>

      {/* LEADERBOARD */}
      <div className="max-w-7xl mx-auto mb-10 flex gap-4 overflow-x-auto pb-4">
        {leaderboard.map((item, i) => (
          <div key={item.name} className="bg-white p-4 rounded-2xl border shadow-sm min-w-[200px] flex justify-between items-center">
            <span className="font-black text-yellow-500 mr-2">#{i+1}</span>
            <span className="font-bold text-sm truncate flex-1">{item.name}</span>
            <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-black ml-2">{item.votes}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ARTISTS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[600px] flex flex-col">
          <h2 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">1. Artist</h2>
          <div className="overflow-y-auto space-y-1">
            {Object.keys(musicData).map(band => (
              <button 
                key={band} 
                onClick={() => setSelectedBand(band)}
                className={`w-full p-4 rounded-xl text-left font-bold transition-all ${selectedBand === band ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>

        {/* TRACKS */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm h-[600px] flex flex-col">
          <h2 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">2. Tracks</h2>
          <div className="overflow-y-auto space-y-1">
            {selectedBand && musicData[selectedBand]?.map(song => (
              <button 
                key={song} 
                disabled={votingSlip.includes(`${selectedBand} - ${song}`) || votingSlip.length >= 5}
                onClick={() => addSong(song)}
                className="w-full p-4 rounded-xl text-left font-bold border hover:border-yellow-400 disabled:opacity-30"
              >
                {song}
              </button>
            ))}
          </div>
        </div>

        {/* SLIP */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 h-[600px] text-white flex flex-col">
          <h2 className="text-xs font-black uppercase text-slate-500 mb-6 border-b border-slate-800 pb-2">Voting Slip</h2>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {votingSlip.map(song => (
              <div key={song} className="bg-slate-800 p-4 rounded-xl text-xs font-bold flex justify-between">
                {song}
                <button onClick={() => setVotingSlip(votingSlip.filter(s => s !== song))} className="text-slate-500">✕</button>
              </div>
            ))}
          </div>
          <button 
            disabled={votingSlip.length === 0}
            onClick={async () => {
              await submitFinalVotes(votingSlip);
              setVotingSlip([]);
              await refreshData();
              alert("Votes In!");
            }}
            className="w-full bg-yellow-400 text-slate-900 p-5 rounded-2xl font-black uppercase mt-6 hover:bg-yellow-300 disabled:opacity-20"
          >
            Submit Votes
          </button>
        </div>
      </div>
    </main>
  );
}