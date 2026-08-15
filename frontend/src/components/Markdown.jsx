import React from 'react'

/**
 * Minimal markdown renderer for LLM chat output.
 * Supports: **bold**, *italics*, `inline code`, [links](url), bullet lists (- or *),
 * numbered lists, and paragraph breaks. Intentionally lightweight — no external deps.
 */

function renderInline(text, keyPrefix) {
  // Split on markdown tokens while keeping the delimiters, in priority order:
  // links, bold, code, italics
  const tokens = []
  let remaining = text
  let idx = 0

  const pattern = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index))
    }
    if (match[1]) {
      // link
      tokens.push(
        <a
          key={`${keyPrefix}-${idx++}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="msg-link"
        >
          {match[2]}
        </a>
      )
    } else if (match[4]) {
      // bold
      tokens.push(<strong key={`${keyPrefix}-${idx++}`}>{match[5]}</strong>)
    } else if (match[6]) {
      // inline code
      tokens.push(
        <code key={`${keyPrefix}-${idx++}`} className="msg-code">
          {match[7]}
        </code>
      )
    } else if (match[8]) {
      // italics
      tokens.push(<em key={`${keyPrefix}-${idx++}`}>{match[9]}</em>)
    }
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex))
  }
  return tokens.length ? tokens : [text]
}

export default function Markdown({ text }) {
  if (!text) return null

  const lines = text.split('\n')
  const blocks = []
  let listBuffer = []
  let listType = null // 'ul' | 'ol'

  function flushList() {
    if (listBuffer.length === 0) return
    const Tag = listType === 'ol' ? 'ol' : 'ul'
    blocks.push(
      <Tag key={`list-${blocks.length}`} className="msg-list">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
        ))}
      </Tag>
    )
    listBuffer = []
    listType = null
  }

  lines.forEach((line, i) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/)
    const numberedMatch = line.match(/^\s*\d+\.\s+(.*)/)

    if (bulletMatch) {
      if (listType !== 'ul') flushList()
      listType = 'ul'
      listBuffer.push(bulletMatch[1])
    } else if (numberedMatch) {
      if (listType !== 'ol') flushList()
      listType = 'ol'
      listBuffer.push(numberedMatch[1])
    } else {
      flushList()
      if (line.trim() === '') {
        blocks.push(<div key={`sp-${i}`} className="msg-space" />)
      } else {
        blocks.push(<p key={`p-${i}`}>{renderInline(line, `p-${i}`)}</p>)
      }
    }
  })
  flushList()

  return <>{blocks}</>
}
