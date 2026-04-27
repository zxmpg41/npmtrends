import { useState, useEffect, useMemo } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface ChartViewProps {
  packages: string[]
}

interface NpmDownloadData {
  downloads: number
  day: string
}

export function ChartView({ packages }: ChartViewProps) {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (packages.length === 0) {
      setData([])
      setError(null)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const fetchPromises = packages.map((pkg) =>
          fetch(`https://api.npmjs.org/downloads/range/last-year/${pkg}`)
            .then((res) => {
              if (!res.ok) throw new Error(`Failed to fetch ${pkg}`)
              return res.json()
            })
            .then((data) => ({ pkg, downloads: data.downloads as NpmDownloadData[] }))
        )

        const results = await Promise.allSettled(fetchPromises)
        
        if (!isMounted) return

        const daysMap = new Map<string, any>()

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            result.value.downloads?.forEach((d) => {
              const existing = daysMap.get(d.day) || { date: d.day }
              existing[result.value.pkg] = d.downloads
              daysMap.set(d.day, existing)
            })
          } else {
            console.error(result.reason)
            // If one fails, we can either ignore it or show an error.
            // The plan says "If an API call fails or package doesn't exist, the chip is still added but no line will render."
            // So we just log the error and ignore.
          }
        })

        // Sort by date just in case
        setData(Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date)))
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load data")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [packages])

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    packages.forEach((pkg, index) => {
      config[pkg] = {
        label: pkg,
        color: `hsl(var(--chart-${(index % 5) + 1}))`, // shadcn uses hex or oklch, but we modified css
      }
    })
    return config
  }, [packages])

  if (packages.length === 0) {
    return null
  }

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Downloads (Last Year)</CardTitle>
        <CardDescription>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading data...
            </span>
          ) : error ? (
            <span className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" /> {error}
            </span>
          ) : (
            "Showing daily downloads for selected packages"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {!isLoading && data.length > 0 && (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
                }}
                minTickGap={30}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
                  return value
                }}
                width={60}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    }}
                  />
                } 
              />
              {packages.map((pkg, index) => (
                <Line
                  key={pkg}
                  type="monotone"
                  dataKey={pkg}
                  stroke={`var(--chart-${(index % 5) + 1})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}