// 事件記憶體來源：以 events.json 為種子，供未接後端時使用。
// 與 mock adapter 共用同一份狀態，讓「新增後可查」在兩條路徑一致。
import seed from '../mocks/events.json'
import { createEvent } from './eventRules'

function clone(event) {
  return {
    ...event,
    coordinates: event.coordinates ? { ...event.coordinates } : null,
  }
}

let events = seed.map(clone)
let counter = seed.length

export function reset() {
  events = seed.map(clone)
  counter = seed.length
}

export function all() {
  return events
}

export function find(id) {
  return events.find((event) => event.id === id) || null
}

export function add(draft) {
  counter += 1
  const id = `e-${String(counter).padStart(3, '0')}`
  const event = createEvent(draft, { id })
  events = [event, ...events]
  return event
}

export default { reset, all, find, add }
