import type { GameHistoryEntry } from '~/utils/gameHistory'
import {
  formatHistoryDate,
  formatHistoryWeekday,
  loadGameHistory,
  saveGameHistoryOnReset,
} from '~/utils/gameHistory'

export function useGameHistory() {
  const entries = useState<GameHistoryEntry[]>('game-history-entries', () => [])
  const modalOpen = useState('game-history-modal-open', () => false)
  const selectedEntry = useState<GameHistoryEntry | null>('game-history-selected-entry', () => null)

  const hasHistory = computed(() => entries.value.length > 0)

  function refreshHistory() {
    entries.value = loadGameHistory()
  }

  function recordReset(blocks: Parameters<typeof saveGameHistoryOnReset>[0]) {
    const saved = saveGameHistoryOnReset(blocks)
    if (saved) refreshHistory()
    return saved
  }

  function openHistoryModal() {
    refreshHistory()
    selectedEntry.value = null
    modalOpen.value = true
  }

  function closeHistoryModal() {
    modalOpen.value = false
    selectedEntry.value = null
  }

  function openHistoryEntry(entry: GameHistoryEntry) {
    selectedEntry.value = entry
  }

  function closeHistoryEntry() {
    selectedEntry.value = null
  }

  function formatEntryDate(entry: GameHistoryEntry): string {
    return formatHistoryDate(entry.dateKey)
  }

  function formatEntryWeekday(entry: GameHistoryEntry): string {
    return formatHistoryWeekday(entry.dateKey)
  }

  if (import.meta.client) {
    onMounted(() => {
      refreshHistory()
    })
  }

  return {
    entries,
    hasHistory,
    modalOpen,
    selectedEntry,
    refreshHistory,
    recordReset,
    openHistoryModal,
    closeHistoryModal,
    openHistoryEntry,
    closeHistoryEntry,
    formatEntryDate,
    formatEntryWeekday,
  }
}
