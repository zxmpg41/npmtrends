import { useState, useRef, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNpmSearch } from "@/hooks/use-npm-search"
import { cn } from "@/lib/utils"

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
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { results, isLoading } = useNpmSearch(query)

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

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
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query) {
        handleAddPackage(query)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleAddPackage(results[selectedIndex].package.name)
      } else if (query) {
        handleAddPackage(query)
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
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
          {results.map((res, index) => (
            <div
              key={res.package.name}
              className={cn(
                "px-4 py-2 cursor-pointer flex flex-col items-start text-left transition-colors",
                index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
              )}
              onMouseEnter={() => setSelectedIndex(index)}
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
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {packages.map((pkg, idx) => (
            <Badge
              key={pkg}
              className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:opacity-80 hover:line-through hover:shadow-md"
              style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              onClick={() => handleRemove(pkg)}
              title={`Remove ${pkg}`}
            >
              {pkg}
            </Badge>
          ))}
          <div className="h-6 w-px bg-border mr-1 ml-4" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPackages([])} 
            className="text-muted-foreground hover:text-foreground h-9 text-xs px-3"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}