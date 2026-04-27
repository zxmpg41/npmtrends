import { ThemeToggle } from "./components/theme-toggle"
import { PackageSearch } from "./components/package-search"
import { ChartView } from "./components/chart-view"
import { usePackageState } from "./hooks/use-package-state"

function App() {
  const { packages, setPackages, timeRange, setTimeRange } = usePackageState()

  const subtitle =
    packages.length > 0
      ? packages.join(" vs ")
      : "compare package download counts over time"

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4">
          <div className="flex gap-2 items-center">
            <div className="h-8 w-8 flex items-center justify-center">
              <img src="/logo.png" alt="npm trends logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-xl font-bold">npm trends</h1>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {subtitle}
          </h2>
          <PackageSearch packages={packages} setPackages={setPackages} />
        </div>

        <ChartView packages={packages} timeRange={timeRange} setTimeRange={setTimeRange} />
      </main>
    </div>
  )
}

export default App
