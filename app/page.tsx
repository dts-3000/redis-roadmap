'use client'

import { useState, useEffect } from 'react'
import { submitFinalVotes, getLeaderboard, getMusicLibrary } from './actions'

export const dynamic = 'force-dynamic';

export default function Page() {
  const [musicData, setMusicData] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState("Waiting for data...");

  useEffect(() => {
    async function init() {
      try {
        const lib = await getMusicLibrary();
        if (!lib || Object.keys(lib).length === 0) {
          setDebug("CONNECTED BUT NO DATA FOUND. CHECK KEY NAME: music_library");
        } else {
          setMusicData(lib);
          setDebug("SUCCESS: DATA LOADED");
        }
      } catch (err) {
        setDebug("CRITICAL ERROR: COULD NOT CONNECT TO DATABASE");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <main className="p-10 text-center">
      <h1 className="text-4xl font-black mb-4">Status: {debug}</h1>
      <div className="bg-slate-100 p-4 rounded text-xs font-mono">
        {Object.keys(musicData).length > 0 ? (
          JSON.stringify(musicData)
        ) : (
          "The artist list is currently empty. If you see 'SUCCESS' above, there's a UI error. If you see 'CONNECTED BUT NO DATA', Upstash is empty."
        )}
      </div>
    </main>
  );
}