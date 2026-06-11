import type { BallValue, PlayerBlock } from '~/types/game'
import { BALL_POINTS, DEFAULT_PLAYER_COUNT, LAG_SCORE_GAIN, LAG_SCORE_LOSS, MIN_PLAYERS } from '~/types/game'
import { randomBlockColor, releaseBlockColor, resetColorPool } from '~/utils/colors'
import { clearGameState, loadPlayerSetup, savePlayerSetup } from '~/utils/gameStorage'

function createBlock(index: number, title?: string): PlayerBlock {
  return {
    id: crypto.randomUUID(),
    title: title?.trim() || `Người chơi ${index + 1}`,
    score: 0,
    color: randomBlockColor(),
    doublePoints: false,
  }
}

function buildBlocksFromSetup(): PlayerBlock[] {
  const saved = loadPlayerSetup()
  const count = saved?.playerCount ?? DEFAULT_PLAYER_COUNT
  const names = saved?.names ?? []

  return Array.from({ length: count }, (_, i) => createBlock(i, names[i]))
}

interface ScoreSnapshot {
  scores: Record<string, number>
  doublePoints: Record<string, boolean>
}

const MAX_SCORE_HISTORY = 50
const MIN_SELECTED_BLOCKS = 2

function captureSnapshot(blocks: PlayerBlock[]): ScoreSnapshot {
  return {
    scores: Object.fromEntries(blocks.map(b => [b.id, b.score])),
    doublePoints: Object.fromEntries(blocks.map(b => [b.id, b.doublePoints])),
  }
}

function applySnapshot(blocks: PlayerBlock[], snapshot: ScoreSnapshot) {
  for (const block of blocks) {
    if (block.id in snapshot.scores) {
      block.score = snapshot.scores[block.id]
    }
    if (block.id in snapshot.doublePoints) {
      block.doublePoints = snapshot.doublePoints[block.id]
    }
  }
}

export function useGame() {
  const isPlaying = useState('game-isPlaying', () => false)
  const blocks = useState<PlayerBlock[]>('game-blocks', () => [])
  const selectedBlockIds = useState<string[]>('game-selectedBlockIds', () => [])
  const scoreHistory = useState<ScoreSnapshot[]>('game-scoreHistory', () => [])

  const canUndo = computed(() => scoreHistory.value.length > 0)
  const canScoreBalls = computed(() => selectedBlockIds.value.length >= MIN_SELECTED_BLOCKS)

  function startNewGame() {
    resetColorPool()
    blocks.value = buildBlocksFromSetup()
    selectedBlockIds.value = []
    scoreHistory.value = []
    isPlaying.value = true
    savePlayerSetup(
      blocks.value.map(b => b.title),
      blocks.value.length,
    )
  }

  function endGame() {
    if (blocks.value.length > 0) {
      savePlayerSetup(
        blocks.value.map(b => b.title),
        blocks.value.length,
      )
    }

    isPlaying.value = false
    selectedBlockIds.value = []
    scoreHistory.value = []
    blocks.value.forEach(b => releaseBlockColor(b.color))
    blocks.value = []
    resetColorPool()
    clearGameState()
  }

  function removeBlock(id: string) {
    if (blocks.value.length <= MIN_PLAYERS) return
    const index = blocks.value.findIndex(b => b.id === id)
    if (index === -1) return
    releaseBlockColor(blocks.value[index].color)
    const removedId = blocks.value[index].id
    blocks.value.splice(index, 1)
    selectedBlockIds.value = selectedBlockIds.value.filter(id => id !== removedId)
  }

  function updateTitle(id: string, title: string) {
    const block = blocks.value.find(b => b.id === id)
    if (block) block.title = title.trim() || block.title
  }

  function toggleDouble(id: string) {
    if (selectedBlockIds.value.length < MIN_SELECTED_BLOCKS) return

    const block = blocks.value.find(b => b.id === id)
    if (block) block.doublePoints = !block.doublePoints
  }

  function toggleBlockSelection(id: string) {
    if (!blocks.value.some(b => b.id === id)) return

    const selected = selectedBlockIds.value
    if (selected.includes(id)) {
      selectedBlockIds.value = selected.filter(blockId => blockId !== id)
    }
    else {
      selectedBlockIds.value = [...selected, id]
    }
  }

  function clearBlockSelection() {
    selectedBlockIds.value = []
  }

  function scoreBall(blockIndex: number, ball: BallValue) {
    if (selectedBlockIds.value.length < MIN_SELECTED_BLOCKS) return

    const current = blocks.value[blockIndex]
    if (!current || !selectedBlockIds.value.includes(current.id)) return

    const history = [...scoreHistory.value, captureSnapshot(blocks.value)]
    scoreHistory.value = history.length > MAX_SCORE_HISTORY
      ? history.slice(-MAX_SCORE_HISTORY)
      : history

    const wasDoubled = current.doublePoints
    let points = BALL_POINTS[ball]
    if (wasDoubled) points *= 2

    const selectedIds = new Set(selectedBlockIds.value)
    const otherSelectedCount = selectedBlockIds.value.length - 1

    current.score += points * otherSelectedCount

    for (const block of blocks.value) {
      if (block.id !== current.id && selectedIds.has(block.id)) {
        block.score -= points
      }
    }

    if (wasDoubled) {
      current.doublePoints = false
    }

    clearBlockSelection()
  }

  function scoreLag(blockIndex: number) {
    const current = blocks.value[blockIndex]
    if (!current) return

    const history = [...scoreHistory.value, captureSnapshot(blocks.value)]
    scoreHistory.value = history.length > MAX_SCORE_HISTORY
      ? history.slice(-MAX_SCORE_HISTORY)
      : history

    current.score += LAG_SCORE_GAIN

    for (const block of blocks.value) {
      if (block.id !== current.id) {
        block.score -= LAG_SCORE_LOSS
      }
    }

    clearBlockSelection()
  }

  function undoLastScore() {
    const snapshot = scoreHistory.value.pop()
    if (!snapshot) return

    applySnapshot(blocks.value, snapshot)
    clearBlockSelection()
  }

  return {
    isPlaying,
    blocks,
    selectedBlockIds,
    canScoreBalls,
    startNewGame,
    endGame,
    removeBlock,
    updateTitle,
    toggleDouble,
    toggleBlockSelection,
    clearBlockSelection,
    scoreBall,
    scoreLag,
    canUndo,
    undoLastScore,
  }
}
