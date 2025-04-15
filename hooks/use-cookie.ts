import * as React from "react"

export function useCookie<T>(
  key: string,
  defaultValue: T,
  options: {
    maxAge?: number
    path?: string
  } = {}
) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return defaultValue

    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`))

    if (!cookie) return defaultValue

    return JSON.parse(cookie.split("=")[1])
  })

  const setCookie = React.useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)

      const cookieOptions = [
        `path=${options.path ?? "/"}`,
        options.maxAge ? `max-age=${options.maxAge}` : "",
      ]
        .filter(Boolean)
        .join("; ")

      document.cookie = `${key}=${JSON.stringify(valueToStore)}; ${cookieOptions}`
    },
    [key, options.maxAge, options.path, value]
  )

  return [value, setCookie] as const
} 