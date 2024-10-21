-- Create the deck table
CREATE TABLE decks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the flashcard table
CREATE TABLE flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  sentence TEXT NOT NULL,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the deck_id column for faster queries
CREATE INDEX flashcards_deck_id_idx ON flashcards(deck_id);