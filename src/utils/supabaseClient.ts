import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = 'https://siadmiaedvscibnfxrmm.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYWRtaWFlZHZzY2libmZ4cm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjk1OTEsImV4cCI6MjA0MzkwNTU5MX0.7zfz4FPXe01lnXaQaM4iNx7g_LcTTTqpPAu9hQShmuI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_KEY = 'AIzaSyBd562lnDOg-xQAWwQwS3AGWQidAQY_Xe0';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateDefinition(
  word: string,
  sentence: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Define the word "${word}" in the context of the following sentence: "${sentence}". Provide a concise definition of a word and then define it in sentence.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text;
}

export async function createDeck(name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('decks')
    .insert({ name })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating deck:', error);
    return null;
  }

  return data.id;
}

export async function saveFlashcard(
  deckId: string,
  front: string,
  back: string,
  sentence: string
): Promise<void> {
  const { error } = await supabase
    .from('flashcards')
    .insert({ deck_id: deckId, front, back, sentence });

  if (error) {
    console.error('Error saving flashcard:', error);
  }
}

export async function getDeckHistory(): Promise<any[]> {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deck history:', error);
    return [];
  }

  return data;
}

export async function getFlashcardsForDeck(deckId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching flashcards:', error);
    return [];
  }

  return data;
}
