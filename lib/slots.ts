/**
 * Turns a mentor's recurring weekly windows into concrete bookable slots.
 *
 * Windows are wall-clock times in the mentor's own timezone, so "Tuesday 18:00"
 * stays at 18:00 for them across a daylight-saving change. Slots come back as
 * absolute instants; the browser renders them in the student's local time.
 */

export interface Window { day_of_week: number; start_minute: number; end_minute: number }
export interface Busy { start: Date; minutes: number }

const MINUTE = 60_000

function partsInZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const map: Record<string, string> = {}
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = part.value
  }
  return {
    year: Number(map.year), month: Number(map.month), day: Number(map.day),
    // Intl renders midnight as 24 in some locales.
    hour: Number(map.hour) % 24, minute: Number(map.minute), second: Number(map.second),
  }
}

/** How far the zone is from UTC at this instant, accounting for DST. */
function offsetMs(date: Date, timeZone: string): number {
  const p = partsInZone(date, timeZone)
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asIfUtc - (date.getTime() - date.getMilliseconds())
}

/** Converts a wall-clock time in `timeZone` to the absolute instant it refers to. */
export function zonedToUtc(
  year: number, month: number, day: number, minutesFromMidnight: number, timeZone: string
): Date {
  const hour = Math.floor(minutesFromMidnight / 60)
  const minute = minutesFromMidnight % 60
  const guess = Date.UTC(year, month - 1, day, hour, minute)

  // The offset depends on the instant, which is what we are solving for, so
  // apply it twice. The second pass settles the hour either side of a DST shift.
  let instant = guess - offsetMs(new Date(guess), timeZone)
  instant = guess - offsetMs(new Date(instant), timeZone)
  return new Date(instant)
}

function overlaps(start: Date, minutes: number, busy: Busy): boolean {
  const end = start.getTime() + minutes * MINUTE
  const busyEnd = busy.start.getTime() + busy.minutes * MINUTE
  return start.getTime() < busyEnd && busy.start.getTime() < end
}

export function generateSlots(options: {
  windows: Window[]
  timeZone: string
  durationMinutes: number
  busy?: Busy[]
  daysAhead?: number
  leadTimeHours?: number
  now?: Date
}): Date[] {
  const {
    windows, timeZone, durationMinutes,
    busy = [], daysAhead = 21, leadTimeHours = 12, now = new Date(),
  } = options

  if (!windows.length) return []

  const earliest = now.getTime() + leadTimeHours * 60 * MINUTE
  const today = partsInZone(now, timeZone)
  const slots: Date[] = []

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    // Date-only arithmetic, so UTC is safe here regardless of the zone.
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + dayOffset))
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const weekday = date.getUTCDay()

    for (const window of windows) {
      if (window.day_of_week !== weekday) continue

      for (
        let minute = window.start_minute;
        minute + durationMinutes <= window.end_minute;
        minute += durationMinutes
      ) {
        const slot = zonedToUtc(year, month, day, minute, timeZone)
        if (slot.getTime() < earliest) continue
        if (busy.some(b => overlaps(slot, durationMinutes, b))) continue
        slots.push(slot)
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime())
}
