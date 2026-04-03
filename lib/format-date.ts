export function formatMessageTime(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()

  const isToday =
    date.toDateString() === now.toDateString()

  const isSameYear =
    date.getFullYear() === now.getFullYear()

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }

  if (isToday) {
    // Example: 2:34 PM
    return date.toLocaleTimeString(undefined, timeOptions)
  }

  if (isSameYear) {
    // Example: Feb 15, 2:34 PM
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }) + ", " + date.toLocaleTimeString(undefined, timeOptions)
  }

  // Example: Feb 15, 2023, 2:34 PM
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString(undefined, timeOptions)
}

/** Format date header for message grouping */
export function formatMessageDateHeader(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return "Today"
  if (isYesterday) return "Yesterday"

  const isThisWeek = date > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (isThisWeek) {
    return date.toLocaleDateString(undefined, { weekday: "long" })
  }

  const isSameYear = date.getFullYear() === now.getFullYear()
  if (isSameYear) {
    return date.toLocaleDateString(undefined, { month: "long", day: "numeric" })
  }

  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
}