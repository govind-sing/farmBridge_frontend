import React, { useState } from 'react';
import { getFoodInfo } from '../apiAxios';

function FoodPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when request starts
    try {
      const res = await getFoodInfo(query);
      setResult(res.data.response);
    } catch (err) {
      setResult('Error fetching food info');
    } finally {
      setIsLoading(false); // Set loading to false when request completes (success or error)
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Food Information</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Tell me about apple"
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading} // Disable input while loading
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Loading...' : 'Get Info'}
          </button>
        </div>
      </form>
      <pre className="mt-6 bg-white w-full h-[70vh] p-4 rounded-lg shadow-md overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : (
          result
        )}
      </pre>
    </div>
  );
}

export default FoodPage;