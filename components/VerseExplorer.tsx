
import React, { useState } from 'react';
import { explainVerse } from '../services/geminiService';
import Card from './common/Card';
import Spinner from './common/Spinner';

const VerseExplorer: React.FC = () => {
  const [surah, setSurah] = useState<string>('');
  const [ayah, setAyah] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surah.trim() || !ayah.trim()) {
      setError('Please enter both Surah and Ayah.');
      return;
    }
    setIsLoading(true);
    setError('');
    setExplanation('');

    try {
      const result = await explainVerse(surah, ayah);
      setExplanation(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-teal-800 mb-4">Quran Verse Explorer</h2>
      <p className="text-gray-600 mb-6">
        Enter a Surah (chapter) and Ayah (verse) to receive a simple explanation of its meaning and context.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={surah}
          onChange={(e) => setSurah(e.target.value)}
          placeholder="Surah (e.g., Al-Fatihah or 1)"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
          disabled={isLoading}
        />
        <input
          type="text"
          value={ayah}
          onChange={(e) => setAyah(e.target.value)}
          placeholder="Ayah (e.g., 1)"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="sm:w-auto bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition duration-200 flex items-center justify-center disabled:bg-teal-400 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : 'Explain'}
        </button>
      </form>
      
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {explanation && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-teal-800 mb-3">Explanation of {surah}:{ayah}</h3>
          <div className="bg-teal-50/50 p-4 rounded-lg prose max-w-none text-gray-700 whitespace-pre-wrap">
            {explanation}
          </div>
        </div>
      )}
    </Card>
  );
};

export default VerseExplorer;
