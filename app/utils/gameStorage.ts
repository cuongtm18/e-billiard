import type { PlayerBlock } from '~/types/game'
import { MAX_PLAYERS, MIN_PLAYERS } from '~/types/game'

const STORAGE_KEY = 'e-billiard-game'
const NAMES_KEY = 'e-billiard-player-names'

export interface SavedPlayerSetup {
  names: string[]
  playerCount: number
}

export interface GamePersistedState {
  isPlaying: boolean
  blocks: PlayerBlock[]
  selectedBlockIds: string[]
}

function isValidBlock(value: unknown): value is PlayerBlock {
  if (!value || typeof value !== 'object') return false
  const block = value as Record<string, unknown>
  return (
    typeof block.id === 'string'
    && typeof block.title === 'string'
    && typeof block.score === 'number'
    && typeof block.color === 'string'
    && typeof block.doublePoints === 'boolean'
  )
}

function isValidState(value: unknown): value is GamePersistedState {
  if (!value || typeof value !== 'object') return false
  const state = value as Record<string, unknown>
  const legacySelectedId = state.selectedBlockId
  const selectedIds = state.selectedBlockIds
  const blockIds = new Set(state.blocks.map(b => b.id))

  const legacyValid = legacySelectedId === undefined
    || legacySelectedId === null
    || (typeof legacySelectedId === 'string' && blockIds.has(legacySelectedId))

  const selectedValid = selectedIds === undefined
    || (Array.isArray(selectedIds)
      && selectedIds.every((id): id is string => typeof id === 'string' && blockIds.has(id)))

  return (
    typeof state.isPlaying === 'boolean'
    && Array.isArray(state.blocks)
    && state.blocks.length >= MIN_PLAYERS
    && state.blocks.length <= MAX_PLAYERS
    && state.blocks.every(isValidBlock)
    && legacyValid
    && selectedValid
  )
}

function normalizeSelectedBlockIds(state: GamePersistedState & { selectedBlockId?: string | null }): string[] {
  if (Array.isArray(state.selectedBlockIds)) {
    const blockIds = new Set(state.blocks.map(b => b.id))
    return state.selectedBlockIds.filter(id => blockIds.has(id))
  }

  if (typeof state.selectedBlockId === 'string' && state.blocks.some(b => b.id === state.selectedBlockId)) {
    return [state.selectedBlockId]
  }

  return []
}

function isValidPlayerSetup(value: unknown): value is SavedPlayerSetup {
  if (!value || typeof value !== 'object') return false
  const setup = value as Record<string, unknown>
  return (
    Array.isArray(setup.names)
    && setup.names.every((name): name is string => typeof name === 'string')
    && typeof setup.playerCount === 'number'
    && setup.playerCount >= MIN_PLAYERS
    && setup.playerCount <= MAX_PLAYERS
    && setup.names.length >= setup.playerCount
  )
}

export function loadGameState(): GamePersistedState | null {
  if (!import.meta.client) return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isValidState(parsed)) {
      clearGameState()
      return null
    }

    return {
      isPlaying: parsed.isPlaying,
      blocks: parsed.blocks,
      selectedBlockIds: normalizeSelectedBlockIds(parsed),
    }
  }
  catch {
    clearGameState()
    return null
  }
}

export function saveGameState(state: GamePersistedState): void {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearGameState(): void {
  if (!import.meta.client) return
  localStorage.removeItem(STORAGE_KEY)
}

export function loadPlayerSetup(): SavedPlayerSetup | null {
  if (!import.meta.client) return null

  try {
    const raw = localStorage.getItem(NAMES_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isValidPlayerSetup(parsed)) {
      localStorage.removeItem(NAMES_KEY)
      return null
    }

    return parsed
  }
  catch {
    localStorage.removeItem(NAMES_KEY)
    return null
  }
}

export function savePlayerSetup(names: string[], playerCount: number): void {
  if (!import.meta.client) return

  const setup: SavedPlayerSetup = {
    names: names.slice(0, MAX_PLAYERS),
    playerCount: Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, playerCount)),
  }

  localStorage.setItem(NAMES_KEY, JSON.stringify(setup))
}
