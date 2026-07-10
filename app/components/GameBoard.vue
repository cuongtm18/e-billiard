<script setup lang="ts">
import type { BallValue } from '~/types/game'

const boardRef = ref<HTMLElement | null>(null)

const {
  blocks,
  selectedBlockIds,
  updateTitle,
  toggleBlockSelection,
  canScoreBalls,
  scoreBall,
  scoreLag,
  canUndo,
  undoLastScore,
  resetGame,
  goHome,
} = useGame()

const { openExportModal, openImportModal } = useGameTransfer()
const { openHistoryModal } = useGameHistory()
const { isSharing, shareError, shareBoardScreenshot } = useGameShare()

async function handleShareScreenshot() {
  await shareBoardScreenshot(boardRef.value)
}
</script>

<template>
  <div ref="boardRef" class="game-board">
    <header class="game-board__toolbar">
      <button type="button" class="btn btn--ghost" @click="goHome">
        ← Home
      </button>

      <div class="game-board__toolbar-center">
        <GameMenuDropdown
          :sharing="isSharing"
          @share="handleShareScreenshot"
          @export="openExportModal"
          @import="openImportModal"
          @history="openHistoryModal"
          @reset="resetGame"
        />
      </div>

      <button
        type="button"
        class="game-board__undo"
        :disabled="!canUndo"
        title="Undo"
        aria-label="Undo last score"
        @click="undoLastScore"
      >
        <svg class="game-board__undo-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62C8.19 11.03 10.21 10 12.5 10c2.48 0 4.5 2.02 4.5 4.5S15 19 12.5 19H10v2h2.5c3.59 0 6.5-2.91 6.5-6.5S16.09 8 12.5 8z"
          />
        </svg>
      </button>
    </header>

    <p v-if="shareError" class="game-board__share-error">
      {{ shareError }}
    </p>

    <div class="game-board__blocks">
      <ScoreBlock
        v-for="(block, index) in blocks"
        :key="block.id"
        :block="block"
        :is-selected="selectedBlockIds.includes(block.id)"
        :can-click-balls="canScoreBalls && selectedBlockIds.includes(block.id)"
        @toggle-select="toggleBlockSelection(block.id)"
        @score="(ball: BallValue, doubled: boolean) => scoreBall(index, ball, doubled)"
        @lag="scoreLag(index)"
        @update-title="(title: string) => updateTitle(block.id, title)"
      />
    </div>
  </div>
</template>

<style scoped>
.game-board {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.game-board__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.game-board__share-error {
  margin: -1.25rem 0 1rem;
  text-align: center;
  color: #ff8a7a;
  font-size: 0.86rem;
  font-weight: 600;
}

.game-board__blocks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .game-board {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: none;
  }

  .game-board__toolbar {
    margin-bottom: 0.35rem;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .game-board__share-error {
    margin: 0 0 0.35rem;
    flex-shrink: 0;
  }

  .game-board__undo {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.4rem;
    border-radius: 8px;
  }

  .btn {
    padding: 0.5rem 0.9rem;
    font-size: 0.9rem;
    border-radius: 10px;
    min-height: 2.5rem;
  }

  .game-board__blocks {
    flex: 1;
    min-height: 0;
    gap: 0.35rem;
  }
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.game-board__toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 0 0.5rem;
}

.game-board__undo {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0.45rem;
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
}

.game-board__undo:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
  color: white;
}

.game-board__undo:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.game-board__undo-icon {
  width: 100%;
  height: 100%;
  display: block;
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.14);
}
</style>
