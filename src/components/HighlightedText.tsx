import React from 'react'
import { WordFrequency } from '../types'

interface HighlightedTextProps {
  text: string
  wordFrequencies: WordFrequency[]
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, wordFrequencies }) => {
  const maxFrequency = Math.max(...wordFrequencies.map(wf => wf.count))

  const getColor = (count: number) => {
    const opacity = 0.1 + (count / maxFrequency) * 0.4 // Opacity range from 0.1 to 0.5
    return `rgba(0, 0, 255, ${opacity})` // Blue color with varying opacity
  }

  const highlightText = () => {
    let highlightedText = text

    // Sort word frequencies by word length (longest first) to avoid partial word matches
    const sortedFrequencies = [...wordFrequencies].sort((a, b) => b.word.length - a.word.length)

    sortedFrequencies.forEach(({ word, count }) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      highlightedText = highlightedText.replace(regex, match => 
        `<span style="background-color: ${getColor(count)};">${match}</span>`
      )
    })

    return highlightedText
  }

  return (
    <div 
      className="bg-white p-4 rounded shadow"
      dangerouslySetInnerHTML={{ __html: highlightText() }}
    />
  )
}

export default HighlightedText