import type { PlayerBlock } from '~/types/game'
import { MAX_PLAYERS, MIN_PLAYERS, defaultPlayerTitle, formatPlayerTitle } from '~/types/game'
import { DEFAULT_BLOCK_COLOR } from '~/utils/colors'

export const TRANSFER_PREFIX = 'eb1.'
export const TRANSFER_QUERY_KEY = 'game'

interface TransferBlock {
  t: string
  s: number
  d?: boolean
}

export interface GameTransferData {
  v: 1
  p: boolean
  b: TransferBlock[]
}

export interface GameTransferImport {
  isPlaying: boolean
  blocks: PlayerBlock[]
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function isTransferBlock(value: unknown): value is TransferBlock {
  if (!value || typeof value !== 'object') return false
  const block = value as Record<string, unknown>
  return (
    typeof block.t === 'string'
    && typeof block.s === 'number'
    && Number.isFinite(block.s)
    && (block.d === undefined || typeof block.d === 'boolean')
  )
}

function isTransferData(value: unknown): value is GameTransferData {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return (
    data.v === 1
    && typeof data.p === 'boolean'
    && Array.isArray(data.b)
    && data.b.length >= MIN_PLAYERS
    && data.b.length <= MAX_PLAYERS
    && data.b.every(isTransferBlock)
  )
}

export function extractTransferCode(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith(TRANSFER_PREFIX)) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)
    const fromQuery = url.searchParams.get(TRANSFER_QUERY_KEY)
    if (fromQuery) return extractTransferCode(fromQuery)
  }
  catch {
    // Not a URL — treat as raw code below.
  }

  const queryMatch = trimmed.match(/[?&]game=([^&]+)/i)
  if (queryMatch?.[1]) {
    return extractTransferCode(decodeURIComponent(queryMatch[1]))
  }

  return trimmed.startsWith('eb1') ? `${TRANSFER_PREFIX}${trimmed.slice(3)}` : trimmed
}

export function encodeGameTransfer(blocks: PlayerBlock[], isPlaying: boolean): string {
  const payload: GameTransferData = {
    v: 1,
    p: isPlaying,
    b: blocks.map(block => ({
      t: block.title,
      s: block.score,
      ...(block.doublePoints ? { d: true } : {}),
    })),
  }

  return `${TRANSFER_PREFIX}${toBase64Url(JSON.stringify(payload))}`
}

export function decodeGameTransfer(code: string): GameTransferImport | null {
  const normalized = extractTransferCode(code)
  if (!normalized.startsWith(TRANSFER_PREFIX)) return null

  try {
    const json = fromBase64Url(normalized.slice(TRANSFER_PREFIX.length))
    const parsed: unknown = JSON.parse(json)
    if (!isTransferData(parsed)) return null

    return {
      isPlaying: parsed.p,
      blocks: parsed.b.map((block, index) => ({
        id: crypto.randomUUID(),
        title: block.t.trim() ? formatPlayerTitle(block.t) : defaultPlayerTitle(index),
        score: block.s,
        color: DEFAULT_BLOCK_COLOR,
        doublePoints: block.d === true,
      })),
    }
  }
  catch {
    return null
  }
}

export function buildShareUrl(code: string): string {
  if (!import.meta.client) return ''

  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(TRANSFER_QUERY_KEY, code)
  return url.toString()
}
