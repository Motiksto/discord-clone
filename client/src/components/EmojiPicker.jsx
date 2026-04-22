import { useState } from 'react'

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏']

export default function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="absolute bottom-full mb-2 bg-bg-panel border-2 border-accent-purple rounded-lg p-2 shadow-lg glow-purple-sm z-50">
      <div className="grid grid-cols-4 gap-1">
        {EMOJI_LIST.map(emoji => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-accent-purple hover:bg-opacity-20 rounded transition-all"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
