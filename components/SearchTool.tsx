import React, { useState } from 'react';
import { Search, ExternalLink, Loader2 } from 'lucide-react';
import { searchForWorksheets } from '../services/geminiService';
import { SearchResult } from '../types';

interface SearchToolProps {
  onImageFound: (url: string) => void;
}

export const SearchTool: React.FC<SearchToolProps> = ({ onImageFound }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    const data = await searchForWorksheets(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <Search className="w-5 h-5 mr-2 text-primary" />
        Find Inspiration
      </h3>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input 
          type="text" 
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="e.g. 'Photosynthesis worksheet grade 5'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase">Resources Found:</p>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {results.map((res, i) => (
              <li key={i} className="flex items-start justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 group">
                <a href={res.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate flex-grow mr-2">
                  {res.title}
                </a>
                <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 mt-1" />
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-2">
            * Click a link to find an image. Right-click the image to "Copy Image Address", then paste it in the "Load URL" box above.
          </p>
        </div>
      )}
    </div>
  );
};
