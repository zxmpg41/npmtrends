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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChartViewProps {
  packages: string[]
  timeRange: string
  setTimeRange: (range: string) => void
}

interface NpmDownloadData {
  downloads: number
  day: string
}

const TIME_RANGE_LABELS: Record<string, string> = {
  "last-month": "Last Month",
  "last-3-months": "Last 3 Months",
  "last-year": "Last Year",
}

export function ChartView({ packages, timeRange, setTimeRange }: ChartViewProps) {
  const [data, setData] = useState<Record<string, string | number>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (packages.length === 0 && data.length > 0) {
    setData([])
    setError(null)
  }

  useEffect(() => {
    if (packages.length === 0) {
      return
    }

    let isMounted = true

    // Parse specific time periods that npmjs API understands:
    // last-day, last-week, last-month, last-year
    // Or a range: YYYY-MM-DD:YYYY-MM-DD
    let apiRange = timeRange
    if (timeRange === "last-3-months") {
      const today = new Date()
      const end = today.toISOString().split("T")[0]
      today.setMonth(today.getMonth() - 3)
      const start = today.toISOString().split("T")[0]
      apiRange = `${start}:${end}`
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const todayStr = new Date().toISOString().split("T")[0]

        const fetchPromises = packages.map((pkg) =>
          fetch(`https://api.npmjs.org/downloads/range/${apiRange}/${pkg}`)
            .then((res) => {
              if (!res.ok) throw new Error(`Failed to fetch ${pkg}`)
              return res.json()
            })
            .then((data) => ({ pkg, downloads: data.downloads as NpmDownloadData[] }))
        )

        const results = await Promise.allSettled(fetchPromises)
        
        if (!isMounted) return

        const daysMap = new Map<string, Record<string, string | number>>()

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            result.value.downloads?.forEach((d) => {
              // Exclude today's data points because they are incomplete (often 0)
              if (d.day === todayStr) return;

              const existing = daysMap.get(d.day) || { date: d.day }
              existing[result.value.pkg] = d.downloads
              daysMap.set(d.day, existing)
            })
          } else {
            console.error(result.reason)
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
  }, [packages, timeRange])

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
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Downloads</CardTitle>
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
        </div>
        <Select value={timeRange} onValueChange={(val) => val && setTimeRange(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a time range">
              {TIME_RANGE_LABELS[timeRange]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="last-year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-4">
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