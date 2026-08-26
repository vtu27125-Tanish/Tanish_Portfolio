import React, { useEffect, useState, useCallback } from 'react'
import SplashScreen from './components/SplashScreen.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import SkillsOrbit from './components/SkillsOrbit.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import TerminalConsole from './components/TerminalConsole.jsx'
import ChatSection from './components/ChatSection.jsx'
import ScheduleCard from './components/ScheduleCard.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import fallbackProfile from './candidate_profile.json'
import { fetchProfile, streamChat } from './api.js'
import './App.css'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(fallbackProfile)
  const [connected, setConnected] = useState(true)

  // Hydrate chat messages from sessionStorage for session persistence
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tanish_chat_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [chatMode, setChatMode] = useState('chat')

  // The .page div stays in normal document flow even at opacity:0 while the
  // splash plays, so a browser restoring your previous scroll position on
  // refresh can leave the real page scrolled to the middle *underneath* the
  // splash. Force scroll-to-top and lock scrolling for the duration of the
  // boot sequence so it always opens at the hero, not wherever you left off.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : ''
    if (!isLoading) {
      window.scrollTo(0, 0)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isLoading])

  // Save chat messages to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem('tanish_chat_history', JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data)
        setConnected(true)
      })
      .catch(() => setConnected(false))
  }, [])

  const handleSend = useCallback(
    async (text) => {
      setError(null)
      const nextMessages = [...messages, { role: 'user', content: text }]
      setMessages([...nextMessages, { role: 'assistant', content: '' }])
      setIsStreaming(true)

      try {
        let acc = ''
        await streamChat(
          nextMessages,
          (chunk) => {
            acc += chunk
            setMessages((prev) => {
              const copy = [...prev]
              copy[copy.length - 1] = { role: 'assistant', content: acc }
              return copy
            })
          },
          undefined,
          chatMode
        )
      } catch (err) {
        setError(err.message || 'Connection interrupted. Please verify backend API status and try again.')
        setMessages((prev) => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last.role === 'assistant' && !last.content) {
            // Remove the empty assistant message if no chunks were received
            return copy.slice(0, -1)
          } else if (last.role === 'assistant') {
            // Append error to whatever was streamed so far
            last.content += '\n\n[Connection interrupted]'
          }
          return copy
        })
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, chatMode]
  )

  function handleClear() {
    setMessages([])
    setError(null)
    try {
      sessionStorage.removeItem('tanish_chat_history')
    } catch {}
  }

  const streamingIndex = isStreaming ? messages.length - 1 : -1

  return (
    <>
      {isLoading && <SplashScreen onComplete={() => setIsLoading(false)} />}
      <div className={`page ${isLoading ? 'page--loading' : 'page--loaded'}`}>
        <ScrollProgress />
        <Nav name={profile?.name} />

        <Hero profile={profile} />
        <SkillsOrbit profile={profile} />
        <About profile={profile} />
        <Projects profile={profile} />
        <TerminalConsole profile={profile} />

        <ChatSection
          profile={profile}
          connected={connected}
          messages={messages}
          streamingIndex={streamingIndex}
          isStreaming={isStreaming}
          onSend={handleSend}
          onClear={handleClear}
          mode={chatMode}
          onModeChange={setChatMode}
        />
        {error && <div className="error-banner error-banner--floating">{error}</div>}

        <ScheduleCard profile={profile} />
        <Contact profile={profile} />
        <Footer name={profile?.name} />
      </div>
    </>
  )
}
