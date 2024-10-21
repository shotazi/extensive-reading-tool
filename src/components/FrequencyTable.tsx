import React, { useState, useMemo } from 'react';
import { WordFrequency } from '../types';
import ExampleModal from './ExampleModal';
import { ChevronUp, ChevronDown, Plus, FolderPlus } from 'lucide-react';
import { englishWords } from '../data/englishWords';
import { germanWords } from '../data/germanWords';
import { russianWords } from '../data/russianWords';
import { frenchWords } from '../data/frenchWords';
import { spanishWords } from '../data/spanishWords';
import { italianWords } from '../data/italianWords';

interface FrequencyTableProps {
  wordFrequencies: WordFrequency[];
  text: string;
  onCreateNewDeck: (words: string[]) => void;
  onAddToExistingDeck: (words: string[]) => void;
}

type Language =
  | 'English'
  | 'German'
  | 'Russian'
  | 'French'
  | 'Spanish'
  | 'Italian';

const FrequencyTable: React.FC<FrequencyTableProps> = ({
  wordFrequencies,
  text,
  onCreateNewDeck,
  onAddToExistingDeck,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [wordsPerPage, setWordsPerPage] = useState(50);
  const [sortBy, setSortBy] = useState<'count' | 'word' | 'frequency'>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  const totalWords = text.split(/\s+/).length;
  const uniqueWords = wordFrequencies.length;

  const topWords: Record<Language, string[]> = {
    English: englishWords,
    German: germanWords,
    Russian: russianWords,
    French: frenchWords,
    Spanish: spanishWords,
    Italian: italianWords,
  };

  const getFrequencyRank = (word: string): number => {
    const wordList = topWords[selectedLanguage];
    const index = wordList.indexOf(word.toLowerCase());
    return index !== -1 ? index + 1 : 0;
  };

  const sortedFrequencies = useMemo(() => {
    return [...wordFrequencies].sort((a, b) => {
      if (sortBy === 'count') {
        return sortOrder === 'asc' ? a.count - b.count : b.count - a.count;
      } else if (sortBy === 'word') {
        return sortOrder === 'asc'
          ? a.word.localeCompare(b.word)
          : b.word.localeCompare(a.word);
      } else {
        const rankA = getFrequencyRank(a.word);
        const rankB = getFrequencyRank(b.word);
        return sortOrder === 'asc' ? rankA - rankB : rankB - rankA;
      }
    });
  }, [wordFrequencies, sortBy, sortOrder, selectedLanguage]);

  const paginatedFrequencies = useMemo(() => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    return sortedFrequencies.slice(startIndex, startIndex + wordsPerPage);
  }, [sortedFrequencies, currentPage, wordsPerPage]);

  const totalPages = Math.ceil(wordFrequencies.length / wordsPerPage);

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  const closeModal = () => {
    setSelectedWord(null);
  };

  const handleSort = (column: 'count' | 'word' | 'frequency') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleRowClick = (word: string) => {
    setSelectedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  const handleCreateNewDeck = () => {
    onCreateNewDeck(Array.from(selectedWords));
    setSelectedWords(new Set());
  };

  const handleAddToExistingDeck = () => {
    onAddToExistingDeck(Array.from(selectedWords));
    setSelectedWords(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-lg font-semibold">Total Words: {totalWords}</p>
        <p className="text-lg font-semibold">Unique Words: {uniqueWords}</p>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <label htmlFor="wordsPerPage" className="mr-2">
            Words per page:
          </label>
          <select
            id="wordsPerPage"
            value={wordsPerPage}
            onChange={(e) => {
              setWordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded p-1"
          >
            {[50, 100, 250, 500, 1000].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="language" className="mr-2">
            Language:
          </label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            className="border rounded p-1"
          >
            {Object.keys(topWords).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-gray-200 rounded mr-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-gray-200 rounded ml-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={handleCreateNewDeck}
          disabled={selectedWords.size === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Create New Deck
        </button>
        <button
          onClick={handleAddToExistingDeck}
          disabled={selectedWords.size === 0}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
        >
          <FolderPlus className="mr-2" size={16} />
          Add to Existing Deck
        </button>
      </div>
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Select</th>
            <th className="px-4 py-2">#</th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort('word')}
            >
              Word
              {sortBy === 'word' &&
                (sortOrder === 'asc' ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort('count')}
            >
              Occurrences
              {sortBy === 'count' &&
                (sortOrder === 'asc' ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </th>
            <th className="px-4 py-2">Percentage</th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort('frequency')}
            >
              Frequency Rank ({selectedLanguage})
              {sortBy === 'frequency' &&
                (sortOrder === 'asc' ? (
                  <ChevronUp className="inline ml-1" />
                ) : (
                  <ChevronDown className="inline ml-1" />
                ))}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedFrequencies.map((item, index) => (
            <tr
              key={item.word}
              className={`hover:bg-gray-100 cursor-pointer ${
                selectedWords.has(item.word) ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleRowClick(item.word)}
            >
              <td className="border px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedWords.has(item.word)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="border px-4 py-2">
                {(currentPage - 1) * wordsPerPage + index + 1}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWordClick(item.word);
                  }}
                  className="text-blue-500 hover:underline"
                >
                  {item.word}
                </button>
              </td>
              <td className="border px-4 py-2">{item.count}</td>
              <td className="border px-4 py-2">
                {item.percentage.toFixed(2)}%
              </td>
              <td className="border px-4 py-2">
                {getFrequencyRank(item.word) || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedWord && (
        <ExampleModal word={selectedWord} text={text} onClose={closeModal} />
      )}
    </div>
  );
};

export default FrequencyTable;