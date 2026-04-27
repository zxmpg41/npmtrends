import { useState, useRef, useEffect } from "react"
import { X, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useNpmSearch } from "@/hooks/use-npm-search"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface PackageSearchProps {
  packages: string[]
  setPackages: (packages: string[] | ((prev: string[]) => string[])) => void
}

export function PackageSearch({ packages, setPackages }: PackageSearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { results, isLoading } = useNpmSearch(query)

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAddPackage = (pkg: string) => {
    if (!pkg) return
    const normalizedPkg = pkg.trim().toLowerCase()
    
    if (packages.length >= 5) {
      // maybe add a toast here for maximum packages
      setQuery("")
      setIsOpen(false)
      return
    }

    if (!packages.includes(normalizedPkg)) {
      setPackages((prev) => [...prev, normalizedPkg])
    }

    setQuery("")
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query) {
      handleAddPackage(query)
    }
  }

  const handleRemove = (pkg: string) => {
    setPackages((prev) => prev.filter((p) => p !== pkg))
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 relative" ref={containerRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter an npm package ..."
          className="pl-10 h-12 text-lg shadow-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 w-5 h-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && query && results.length > 0 && (
        <div className="absolute top-12 left-0 right-0 z-50 mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-auto">
          {results.map((res) => (
            <div
              key={res.package.name}
              className="px-4 py-2 hover:bg-muted cursor-pointer flex flex-col items-start text-left"
              onMouseDown={(e) => {
                e.preventDefault() // prevent input blur
                handleAddPackage(res.package.name)
              }}
            >
              <div className="font-semibold">{res.package.name}</div>
              {res.package.description && (
                <div className="text-xs text-muted-foreground truncate w-full">
                  {res.package.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {packages.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {packages.map((pkg, idx) => (
            <Badge
              key={pkg}
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-background"
              style={{ borderColor: CHART_COLORS[idx % CHART_COLORS.length] }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              />
              {pkg}
              <button
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                onClick={() => handleRemove(pkg)}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}