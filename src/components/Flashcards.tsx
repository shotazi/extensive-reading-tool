import React, { useState, useEffect } from 'react';
import { WordFrequency } from '../types';
import {
  createDeck,
  saveFlashcard,
  generateDefinition,
  getDeckHistory,
  getFlashcardsForDeck,
} from '../utils/supabaseClient';

interface FlashcardsProps {
  wordFrequencies: WordFrequency[];
  text: string;
}

interface Flashcard {
  id?: string;
  front: string;
  back: string;
  sentence: string;
}

interface Deck {
  id: string;
  name: string;
  created_at: string;
}

const Flashcards: React.FC<FlashcardsProps> = ({ wordFrequencies, text }) => {
  const [minOccurrence, setMinOccurrence] = useState(1);
  const [maxOccurrence, setMaxOccurrence] = useState(
    Math.max(...wordFrequencies.map((wf) => wf.count))
  );
  const [deckSize, setDeckSize] = useState(10);
  const [sentencesPerCard, setSentencesPerCard] = useState(1);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [deckHistory, setDeckHistory] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDeckHistory();
  }, []);

  const loadDeckHistory = async () => {
    const history = await getDeckHistory();
    setDeckHistory(history);
  };

  const generateDeck = async (selectedWords: string[] = []) => {
    setIsLoading(true);
    let wordsToUse: WordFrequency[];
    
    if (selectedWords.length > 0) {
      wordsToUse = wordFrequencies.filter((wf) => selectedWords.includes(wf.word));
    } else {
      wordsToUse = wordFrequencies.filter(
        (wf) => wf.count >= minOccurrence && wf.count <= maxOccurrence
      ).slice(0, deckSize);
    }

    const newDeck: Flashcard[] = [];
    const deckName = `Deck_${new Date().toISOString()}`;
    const deckId = await createDeck(deckName);

    if (!deckId) {
      setIsLoading(false);
      return;
    }

    for (const wf of wordsToUse) {
      const sentences = getExampleSentences(wf.word, sentencesPerCard);
      const sentence = sentences[0];
      const definition = await generateDefinition(wf.word, sentence);
      const flashcard: Flashcard = {
        front: wf.word,
        back: definition,
        sentence: sentence,
      };
      newDeck.push(flashcard);
      await saveFlashcard(
        deckId,
        flashcard.front,
        flashcard.back,
        flashcard.sentence
      );
    }

    setDeck(newDeck);
    setCurrentCardIndex(0);
    setShowBack(false);
    setShowFilters(false);
    setIsLoading(false);
    loadDeckHistory();
  };

  const getExampleSentences = (word: string, count: number): string[] => {
    const sentences = text.split(/[.!?]+/).filter((sentence) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(sentence);
    });
    return sentences.slice(0, count).map((s) => s.trim());
  };

  const handleKnow = () => {
    const newDeck = [...deck];
    newDeck.splice(currentCardIndex, 1);
    setDeck(newDeck);
    if (currentCardIndex >= newDeck.length) {
      setCurrentCardIndex(0);
    }
    setShowBack(false);
  };

  const handleDontKnow = () => {
    setCurrentCardIndex((currentCardIndex + 1) % deck.length);
    setShowBack(false);
  };

  const loadDeck = async (deckId: string) => {
    setIsLoading(true);
    const flashcards = await getFlashcardsForDeck(deckId);
    setDeck(flashcards);
    setCurrentCardIndex(0);
    setShowBack(false);
    setShowFilters(false);
    setSelectedDeckId(deckId);
    setIsLoading(false);
  };

  const handleCreateNewDeck = (words: string[]) => {
    generateDeck(words);
  };

  const handleAddToExistingDeck = async (words: string[]) => {
    if (!selectedDeckId) {
      console.error("No deck selected");
      return;
    }

    setIsLoading(true);
    const newFlashcards: Flashcard[] = [];

    for (const word of words) {
      const wf = wordFrequencies.find((w) => w.word === word);
      if (wf) {
        const sentences = getExampleSentences(wf.word, sentencesPerCard);
        const sentence = sentences[0];
        const definition = await generateDefinition(wf.word, sentence);
        const flashcard: Flashcard = {
          front: wf.word,
          back: definition,
          sentence: sentence,
        };
        newFlashcards.push(flashcard);
        await saveFlashcard(
          selectedDeckId,
          flashcard.front,
          flashcard.back,
          flashcard.sentence
        );
      }
    }

    setDeck([...deck, ...newFlashcards]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {showFilters ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Occurrence
              </label>
              <input
                type="number"
                value={minOccurrence}
                onChange={(e) => setMinOccurrence(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Occurrence
              </label>
              <input
                type="number"
                value={maxOccurrence}
                onChange={(e) => setMaxOccurrence(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deck Size
              </label>
              <input
                type="number"
                value={deckSize}
                onChange={(e) => setDeckSize(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sentences per Card
              </label>
              <input
                type="number"
                value={sentencesPerCard}
                onChange={(e) =>
                  setSentencesPerCard(
                    Math.min(3, Math.max(1, parseInt(e.target.value)))
                  )
                }
                min="1"
                max="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <button
            onClick={() => generateDeck()}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Deck'}
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowFilters(true)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Deck
        </button>
      )}
      {deckHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Deck History</h3>
          <ul className="space-y-2">
            {deckHistory.map((deck) => (
              <li key={deck.id}>
                <button
                  onClick={() => loadDeck(deck.id)}
                  className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {deck.name} - {new Date(deck.created_at).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {deck.length > 0 && !showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              Card {currentCardIndex + 1} of {deck.length}
            </p>
          </div>
          <div className="min-h-48 flex flex-col items-center justify-center border-2 border-gray-300 rounded-lg mb-4 p-4">
            <h2 className="text-3xl font-bold mb-4">
              {deck[currentCardIndex].front}
            </h2>
            <div>
              <p className="mb-2 italic text-center">
                {deck[currentCardIndex].sentence}
              </p>
            </div>
            {showBack && (
              <div>
                <hr className="py-2" />
                <p className="font-semibold text-center">
                  {deck[currentCardIndex].back}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center space-y-4">
            {!showBack && (
              <button
                onClick={() => setShowBack(!showBack)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                {showBack ? 'Hide Definition' : 'Show Definition'}
              </button>
            )}
            {showBack && (
              <div className="flex justify-center w-full gap-4">
                <button
                  onClick={handleKnow}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  I know
                </button>
                <button
                  onClick={handleDontKnow}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  I don't know
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;