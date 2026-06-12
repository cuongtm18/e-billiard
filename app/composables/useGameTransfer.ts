import {
  decodeGameTransfer,
  encodeGameTransfer,
  extractTransferCode,
} from '~/utils/gameTransfer'

export type GameTransferMode = 'share' | 'import'

export function useGameTransfer() {
  const { blocks, isPlaying, applyImportedGame, shouldConfirmImportOverwrite } = useGame()

  const modalOpen = useState('game-transfer-modal-open', () => false)
  const modalMode = useState<GameTransferMode>('game-transfer-modal-mode', () => 'share')
  const transferMessage = useState<string | null>('game-transfer-message', () => null)
  const transferError = useState<string | null>('game-transfer-error', () => null)

  const exportCode = computed(() => {
    if (blocks.value.length === 0) return ''
    return encodeGameTransfer(blocks.value, isPlaying.value)
  })

  function openShareModal() {
    transferMessage.value = null
    transferError.value = null
    modalMode.value = 'share'
    modalOpen.value = true
  }

  function openImportModal() {
    transferMessage.value = null
    transferError.value = null
    modalMode.value = 'import'
    modalOpen.value = true
  }

  function closeTransferModal() {
    modalOpen.value = false
    transferError.value = null
  }

  function confirmImport(code: string): boolean {
    const parsed = decodeGameTransfer(code)
    if (!parsed) {
      transferError.value = 'Invalid QR code.'
      return false
    }

    if (shouldConfirmImportOverwrite()) {
      const confirmed = window.confirm(
        'Import will replace the current game (names and scores). Continue?',
      )
      if (!confirmed) return false
    }

    applyImportedGame(parsed)
    transferMessage.value = 'Game imported successfully.'
    transferError.value = null
    modalOpen.value = false
    return true
  }

  function importFromScan(raw: string): boolean {
    const code = extractTransferCode(raw)
    if (!code) {
      transferError.value = 'Invalid QR code.'
      return false
    }

    return confirmImport(code)
  }

  return {
    modalOpen,
    modalMode,
    exportCode,
    transferMessage,
    transferError,
    openShareModal,
    openImportModal,
    closeTransferModal,
    importFromScan,
  }
}
