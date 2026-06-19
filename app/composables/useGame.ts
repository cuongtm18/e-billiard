import type { BallValue, PlayerBlock } from '~/types/game'
import { BALL_POINTS, DEFAULT_PLAYER_COUNT, defaultPlayerTitle, formatPlayerTitle, LAG_SCORE_GAIN, LAG_SCORE_LOSS, MIN_PLAYERS } from '~/types/game'
import { DEFAULT_BLOCK_COLOR } from '~/utils/colors'
import { savePlayerSetup } from '~/utils/gameStorage'
import type { GameTransferImport } from '~/utils/gameTransfer'

function createBlock(index: number, title?: string): PlayerBlock {
  return {
    id: crypto.randomUUID(),
    title: title?.trim() ? formatPlayerTitle(title) : defaultPlayerTitle(index),
    score: 0,
    color: DEFAULT_BLOCK_COLOR,
    doublePoints: false,
  }
}

function buildFreshBlocks(): PlayerBlock[] {
  return Array.from({ length: DEFAULT_PLAYER_COUNT }, (_, i) => createBlock(i))
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
      block.score = snapshot.scores[block.id] as any
    }
    if (block.id in snapshot.doublePoints) {
      block.doublePoints = snapshot.doublePoints[block.id] as any
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
  const canResumeGame = computed(() => !isPlaying.value && blocks.value.length >= MIN_PLAYERS)

  function startNewGame() {
    blocks.value = buildFreshBlocks()
    selectedBlockIds.value = []
    scoreHistory.value = []
    isPlaying.value = true
    savePlayerSetup(
      blocks.value.map(b => b.title),
      blocks.value.length,
    )
  }

  function goHome() {
    if (blocks.value.length > 0) {
      savePlayerSetup(
        blocks.value.map(b => b.title),
        blocks.value.length,
      )
    }

    isPlaying.value = false
    selectedBlockIds.value = []
  }

  function resumeGame() {
    if (blocks.value.length < MIN_PLAYERS) return

    selectedBlockIds.value = []
    isPlaying.value = true
  }

  function removeBlock(id: string) {
    if (blocks.value.length <= MIN_PLAYERS) return
    const index = blocks.value.findIndex(b => b.id === id)
    if (index === -1) return
    const removedId = blocks.value?.[index]?.id
    blocks.value.splice(index, 1)
    selectedBlockIds.value = selectedBlockIds.value.filter(id => id !== removedId)
  }

  function updateTitle(id: string, title: string) {
    const block = blocks.value.find(b => b.id === id)
    if (block) {
      const formatted = formatPlayerTitle(title)
      block.title = formatted || block.title
    }
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

    for (const block of blocks.value) {
      block.doublePoints = false
    }

    clearBlockSelection()
  }

  function scoreLag(blockIndex: number) {
    const current = blocks.value[blockIndex]
    if (!current) return

    const confirmed = window.confirm(
      `Apply Run Out Score for ${current.title}? (+${LAG_SCORE_GAIN} / −${LAG_SCORE_LOSS} for each other player)`,
    )
    if (!confirmed) return

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

  function resetGame() {
    if (blocks.value.length < MIN_PLAYERS) return

    const confirmed = window.confirm(
      'Reset all player scores to 0? This cannot be undone.',
    )
    if (!confirmed) return

    for (const block of blocks.value) {
      block.score = 0
      block.doublePoints = false
    }

    selectedBlockIds.value = []
    scoreHistory.value = []
  }

  function applyImportedGame(data: GameTransferImport) {
    blocks.value = data.blocks
    isPlaying.value = data.isPlaying
    selectedBlockIds.value = []
    scoreHistory.value = []
    savePlayerSetup(
      blocks.value.map(b => b.title),
      blocks.value.length,
    )
  }

  function shouldConfirmImportOverwrite() {
    if (blocks.value.length < MIN_PLAYERS) return false

    return (
      isPlaying.value
      || blocks.value.some((block, index) =>
        block.score !== 0
        || block.doublePoints
        || block.title !== defaultPlayerTitle(index),
      )
    )
  }

  return {
    isPlaying,
    blocks,
    selectedBlockIds,
    canScoreBalls,
    canResumeGame,
    startNewGame,
    goHome,
    resumeGame,
    removeBlock,
    updateTitle,
    toggleDouble,
    toggleBlockSelection,
    clearBlockSelection,
    scoreBall,
    scoreLag,
    canUndo,
    undoLastScore,
    resetGame,
    applyImportedGame,
    shouldConfirmImportOverwrite,
  }
}
