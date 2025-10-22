import React, { useState, useEffect } from 'react';
import { getDailyDua } from '../services/geminiService';
import { Dua } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { SourceIcon, TipIcon } from './common/IconComponents';

const RECENT_DUA_HISTORY_KEY = 'islamic_ai_dua_history';

const DailyDua: React.FC = () => {
  const [dua, setDua] = useState<Dua | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [recentHistory, setRecentHistory] = useState<string[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(RECENT_DUA_HISTORY_KEY);
      if (storedHistory) {
        setRecentHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse dua history from localStorage", e);
      // Clear corrupted data
      localStorage.removeItem(RECENT_DUA_HISTORY_KEY);
    }
  }, []);

  const handleFetchDua = async () => {
    setIsLoading(true);
    setError('');
    setDua(null);

    try {
      const result = await getDailyDua(recentHistory);
      setDua(result);

      // Update and save history
      const newHistory = [...recentHistory, result.id];
      setRecentHistory(newHistory);
      localStorage.setItem(RECENT_DUA_HISTORY_KEY, JSON.stringify(newHistory));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-teal-800 mb-4">Daily Dua</h2>
      <p className="text-gray-600 mb-6">
        Receive a beautiful and authentic supplication for your day. Click the button below to get a new dua.
      </p>
      
      <button
        onClick={handleFetchDua}
        disabled={isLoading}
        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition duration-200 flex items-center justify-center disabled:bg-teal-400 disabled:cursor-not-allowed"
      >
        {isLoading ? <Spinner /> : 'Get a Daily Dua'}
      </button>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {dua && !isLoading && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center animate-fade-in">
          <p className="font-amiri text-3xl md:text-4xl text-right leading-relaxed text-teal-900 mb-4 dir-rtl">{dua.arabic}</p>
          <p className="text-lg text-gray-500 italic mb-4">{dua.transliteration}</p>
          <p className="text-md text-gray-700 mb-6">"{dua.translation}"</p>

          <div className="space-y-4 text-left">
            <div className="flex items-center text-sm text-gray-600">
              <SourceIcon />
              <span className="font-semibold mr-2">Source:</span>
              <span className="italic">{dua.source}</span>
            </div>
            <div className="bg-teal-50/70 p-3 rounded-lg flex items-start text-sm text-teal-800">
              <TipIcon />
              <div>
                <span className="font-semibold mr-2">Tip:</span>
                <span>{dua.tip}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DailyDua;
