import { normalizeBlockColor } from '~/utils/colors'
import { loadGameState, saveGameState, savePlayerSetup } from '~/utils/gameStorage'

export default defineNuxtPlugin(() => {
  const { isPlaying, blocks, selectedBlockIds } = useGame()
  const saved = loadGameState()

  if (saved) {
    isPlaying.value = saved.isPlaying
    blocks.value = saved.blocks.map(block => ({
      ...block,
      color: normalizeBlockColor(block.color),
    }))
    selectedBlockIds.value = saved.selectedBlockIds
  }

  watch(
    [isPlaying, blocks, selectedBlockIds],
    () => {
      saveGameState({
        isPlaying: isPlaying.value,
        blocks: blocks.value,
        selectedBlockIds: selectedBlockIds.value,
      })

      if (blocks.value.length > 0) {
        savePlayerSetup(
          blocks.value.map(b => b.title),
          blocks.value.length,
        )
      }
    },
    { deep: true },
  )
})
