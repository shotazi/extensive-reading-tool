import React from 'react'

interface ExampleModalProps {
  word: string
  text: string
  onClose: () => void
}

const ExampleModal: React.FC<ExampleModalProps> = ({ word, text, onClose }) => {
  const sentences = text.split(/[.!?]+/).filter(sentence => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(sentence)
  })
  const exampleSentences = sentences.slice(0, 5)

  const highlightWord = (sentence: string) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    return sentence.replace(regex, match => `<b>${match}</b>`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Examples of "{word}"</h2>
        <ul className="list-disc pl-5 mb-4">
          {exampleSentences.map((sentence, index) => (
            <li key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: highlightWord(sentence.trim()) }} />
          ))}
        </ul>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ExampleModal