import { WordFrequency } from '../types'

export function analyzeText(text: string): WordFrequency[] {
  const words = text.toLowerCase().match(/\p{L}+/gu) || []
  const wordCounts: { [key: string]: number } = {}
  
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })

  const totalWords = words.length
  const frequencies: WordFrequency[] = Object.entries(wordCounts).map(([word, count]) => ({
    word,
    count,
    percentage: (count / totalWords) * 100
  }))

  return frequencies.sort((a, b) => b.count - a.count)
}