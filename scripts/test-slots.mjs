const { generateSlots, zonedToUtc } = await import('../.slots-test/slots.mjs')

let pass = 0, fail = 0
const check = (name, actual, expected) => {
  const ok = actual === expected
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n         got ${actual}\n         want ${expected}`}`)
  ok ? pass++ : fail++
}

// London is UTC+1 in summer, UTC+0 in winter.
check('summer: 18:00 London -> 17:00 UTC',
  zonedToUtc(2026, 7, 14, 18*60, 'Europe/London').toISOString(), '2026-07-14T17:00:00.000Z')
check('winter: 18:00 London -> 18:00 UTC',
  zonedToUtc(2026, 1, 14, 18*60, 'Europe/London').toISOString(), '2026-01-14T18:00:00.000Z')
check('New York 09:00 in summer -> 13:00 UTC',
  zonedToUtc(2026, 7, 14, 9*60, 'America/New_York').toISOString(), '2026-07-14T13:00:00.000Z')

// 2026-10-25 is the UK clock change; a Sunday window should stay at local 18:00.
const dstSlots = generateSlots({
  windows: [{ day_of_week: 0, start_minute: 18*60, end_minute: 19*60 }],
  timeZone: 'Europe/London', durationMinutes: 30,
  now: new Date('2026-10-20T00:00:00Z'), daysAhead: 10, leadTimeHours: 0,
})
check('across the DST change, local time holds at 18:00',
  new Date(dstSlots[0]).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }),
  '18:00')

// Tuesday 18:00-20:00 at 45 minutes fits two calls, not three (last would overrun).
const fit = generateSlots({
  windows: [{ day_of_week: 2, start_minute: 18*60, end_minute: 20*60 }],
  timeZone: 'Europe/London', durationMinutes: 45,
  now: new Date('2026-07-06T00:00:00Z'), daysAhead: 7, leadTimeHours: 0,
})
check('45-min calls do not overrun the window', fit.length, 2)

// An existing booking removes the overlapping slot.
const busy = generateSlots({
  windows: [{ day_of_week: 2, start_minute: 18*60, end_minute: 20*60 }],
  timeZone: 'Europe/London', durationMinutes: 30,
  busy: [{ start: new Date('2026-07-07T17:00:00Z'), minutes: 30 }], // 18:00 London
  now: new Date('2026-07-06T00:00:00Z'), daysAhead: 2, leadTimeHours: 0,
})
check('a booked slot is excluded', busy.length, 3)
check('and it is the 18:00 one that went',
  busy.some(s => new Date(s).toISOString() === '2026-07-07T17:00:00.000Z'), false)

// Lead time hides imminent slots.
const lead = generateSlots({
  windows: [{ day_of_week: 2, start_minute: 18*60, end_minute: 20*60 }],
  timeZone: 'Europe/London', durationMinutes: 30,
  now: new Date('2026-07-07T12:00:00Z'), daysAhead: 1, leadTimeHours: 12,
})
check('slots inside the 12-hour lead time are hidden', lead.length, 0)

check('no windows means no slots',
  generateSlots({ windows: [], timeZone: 'Europe/London', durationMinutes: 30 }).length, 0)

console.log(`\n  ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
