import { useState, useEffect } from "react"

interface NpmSearchResult {
  package: {
    name: string
    description: string
    version: string
  }
}

export function useNpmSearch(query: string) {
  const [results, setResults] = useState<NpmSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      // Intentionally avoiding immediate state update when query is empty
      // so it doesn't cause a layout jump while typing
      return
    }

    const delay = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.objects || [])
        }
      } catch (err) {
        console.error("Search error", err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delay)
  }, [query])

  // Explicitly clear results when query becomes empty
  if (!query && results.length > 0) {
    setResults([])
  }

  return { results, isLoading }
}