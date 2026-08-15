import { useEffect, useState } from 'react'

/**
 * Cycles through a list of phrases with a typewriter effect —
 * types out, pauses, deletes, moves to the next phrase.
 */
export function useTypedText(phrases, { typeSpeed = 55, deleteSpeed = 30, pause = 1400 } = {}) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length]
    let timeout

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed)
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed)
    } else if (deleting && text.length === 0) {
      setDeleting(false)
      setPhraseIndex((i) => (i + 1) % phrases.length)
    }

    return () => clearTimeout(timeout)
  }, [text, deleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pause])

  return text
}
