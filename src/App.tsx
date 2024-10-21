import React, { useState } from 'react';
import TextInput from './components/TextInput';
import FrequencyTable from './components/FrequencyTable';
import HighlightedText from './components/HighlightedText';
import Flashcards from './components/Flashcards';
import { analyzeText } from './utils/textAnalysis';
import { WordFrequency } from './types';
import { BarChart2, Book, Highlighter } from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [wordFrequencies, setWordFrequencies] = useState<WordFrequency[]>([]);
  const [activeTab, setActiveTab] = useState<
    'table' | 'highlighted' | 'flashcards'
  >('table');

  const handleTextSubmit = (submittedText: string) => {
    setText(submittedText);
    const frequencies = analyzeText(submittedText);
    setWordFrequencies(frequencies);
  };

  const handleCreateNewDeck = (words: string[]) => {
    setActiveTab('flashcards');
  };

  const handleAddToExistingDeck = (words: string[]) => {
    setActiveTab('flashcards');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Word Frequency Analyzer
      </h1>
      <TextInput onSubmit={handleTextSubmit} />
      {wordFrequencies.length > 0 && (
        <div className="mt-8">
          <div className="flex mb-4">
            <button
              className={`mr-2 px-4 py-2 rounded flex items-center ${
                activeTab === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('table')}
            >
              <BarChart2 className="mr-2" size={20} />
              Frequency Table
            </button>
            <button
              className={`mr-2 px-4 py-2 rounded flex items-center ${
                activeTab === 'highlighted'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('highlighted')}
            >
              <Highlighter className="mr-2" size={20} />
              Highlighted Text
            </button>
            <button
              className={`px-4 py-2 rounded flex items-center ${
                activeTab === 'flashcards'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('flashcards')}
            >
              <Book className="mr-2" size={20} />
              Flashcards
            </button>
          </div>
          {activeTab === 'table' && (
            <FrequencyTable
              wordFrequencies={wordFrequencies}
              text={text}
              onCreateNewDeck={handleCreateNewDeck}
              onAddToExistingDeck={handleAddToExistingDeck}
            />
          )}
          {activeTab === 'highlighted' && (
            <HighlightedText text={text} wordFrequencies={wordFrequencies} />
          )}
          {activeTab === 'flashcards' && (
            <Flashcards wordFrequencies={wordFrequencies} text={text} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;