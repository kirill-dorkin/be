import { useState, useEffect } from 'react'

export default function useGeoCountry() {
  const [country, setCountry] = useState<string | undefined>()

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (res.ok) {
          const data = await res.json()
          if (data?.country) {
            setCountry(data.country)
            return
          }
        }
      } catch {
        // ignore errors
      }
      if (typeof navigator !== 'undefined') {
        const locale = navigator.language || ''
        const fallback = locale.split('-')[1]
        if (fallback) setCountry(fallback.toUpperCase())
      }
    }
    detectCountry()
  }, [])

  return country
}
