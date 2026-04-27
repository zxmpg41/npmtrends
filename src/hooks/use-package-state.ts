import { useState } from "react"

export function usePackageState() {
  const [packages, setPackages] = useState<string[]>(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const pkgParam = params.get("packages")
    return pkgParam ? pkgParam.split(",").filter(Boolean) : []
  })

  // Update URL whenever packages change
  const setPackagesWithUrl = (newPackages: string[] | ((prev: string[]) => string[])) => {
    setPackages((prev) => {
      const updated = typeof newPackages === "function" ? newPackages(prev) : newPackages
      const params = new URLSearchParams(window.location.search)
      
      if (updated.length > 0) {
        params.set("packages", updated.join(","))
      } else {
        params.delete("packages")
      }
      
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
      window.history.replaceState({}, "", newUrl)
      
      return updated
    })
  }

  return [packages, setPackagesWithUrl] as const
}