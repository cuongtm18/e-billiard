import type { PlayerBlock } from '~/types/game'
import { MIN_PLAYERS } from '~/types/game'

const HISTORY_KEY = 'e-billiard-game-history'
export const MAX_WEEKDAY_HISTORY = 5

export interface GameHistoryBlock {
  title: string
  score: number
}

export interface GameHistoryEntry {
  dateKey: string
  blocks: GameHistoryBlock[]
  savedAt: string
}

function isValidHistoryBlock(value: unknown): value is GameHistoryBlock {
  if (!value || typeof value !== 'object') return false
  const block = value as Record<string, unknown>
  return typeof block.title === 'string' && typeof block.score === 'number'
}

function isValidHistoryEntry(value: unknown): value is GameHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.dateKey === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(entry.dateKey)
    && typeof entry.savedAt === 'string'
    && Array.isArray(entry.blocks)
    && entry.blocks.length >= MIN_PLAYERS
    && entry.blocks.every(isValidHistoryBlock)
  )
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

export function getDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatHistoryDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-')
  if (!year || !month || !day) return dateKey
  return `${day}-${month}-${year}`
}

export function formatHistoryWeekday(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return ''

  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export function loadGameHistory(): GameHistoryEntry[] {
  if (!import.meta.client) return []

  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isValidHistoryEntry)) {
      clearGameHistory()
      return []
    }

    return parsed
      .slice()
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  }
  catch {
    clearGameHistory()
    return []
  }
}

export function saveGameHistory(entries: GameHistoryEntry[]): void {
  if (!import.meta.client) return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
}

export function clearGameHistory(): void {
  if (!import.meta.client) return
  localStorage.removeItem(HISTORY_KEY)
}

export function saveGameHistoryOnReset(blocks: PlayerBlock[], date = new Date()): boolean {
  if (!isWeekday(date) || blocks.length < MIN_PLAYERS) return false

  const dateKey = getDateKey(date)
  const entry: GameHistoryEntry = {
    dateKey,
    blocks: blocks.map(block => ({
      title: block.title,
      score: block.score,
    })),
    savedAt: date.toISOString(),
  }

  let entries = loadGameHistory()
  const existingIndex = entries.findIndex(item => item.dateKey === dateKey)

  if (existingIndex >= 0) {
    entries[existingIndex] = entry
  }
  else {
    if (entries.length >= MAX_WEEKDAY_HISTORY) {
      entries = []
    }
    entries.push(entry)
    entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  }

  saveGameHistory(entries)
  return true
}
