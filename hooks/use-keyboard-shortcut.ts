import * as React from "react"

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrlKey?: boolean
    metaKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  } = {}
) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === key &&
        (!options.ctrlKey || event.ctrlKey) &&
        (!options.metaKey || event.metaKey) &&
        (!options.shiftKey || event.shiftKey) &&
        (!options.altKey || event.altKey)
      ) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [key, callback, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey])
} 