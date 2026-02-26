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