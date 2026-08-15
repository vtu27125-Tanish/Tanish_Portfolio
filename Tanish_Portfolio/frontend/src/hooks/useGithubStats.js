import { useEffect, useState } from 'react'

const cache = new Map()

function parseRepo(url) {
  if (!url) return null
  const match = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

/**
 * Fetches public GitHub repo stats (stars, last push date) client-side via
 * the unauthenticated GitHub REST API. Fails silently — no key, no server
 * round-trip, and a rate-limit or network error just means the badge
 * doesn't render rather than breaking the page.
 */
export function useGithubStats(repoUrl) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const parsed = parseRepo(repoUrl)
    if (!parsed) return

    const key = `${parsed.owner}/${parsed.repo}`
    if (cache.has(key)) {
      setStats(cache.get(key))
      return
    }

    let cancelled = false
    fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || cancelled) return
        const result = {
          stars: data.stargazers_count,
          forks: data.forks_count,
          updatedAt: data.pushed_at,
        }
        cache.set(key, result)
        setStats(result)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [repoUrl])

  return stats
}
