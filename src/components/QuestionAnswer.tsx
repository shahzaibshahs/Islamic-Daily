import React, { useState } from 'react';
import { getIslamicAnswer } from '../services/geminiService';
import Card from './common/Card';
import Spinner from './common/Spinner';

const QuestionAnswer: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const result = await getIslamicAnswer(question);
      setAnswer(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-teal-800 mb-4">Ask a Question</h2>
      <p className="text-gray-600 mb-6">
        Have a question about Islam? Ask the AI for a clear and concise answer based on authentic sources.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What is the significance of Ramadan?"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
          rows={4}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition duration-200 flex items-center justify-center disabled:bg-teal-400 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : 'Get Answer'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {answer && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-teal-800 mb-3">Answer:</h3>
          <div className="bg-teal-50/50 p-4 rounded-lg prose max-w-none text-gray-700 whitespace-pre-wrap">
            {answer}
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuestionAnswer;
