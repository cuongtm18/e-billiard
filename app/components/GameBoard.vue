<script setup lang="ts">
import type { BallValue } from '~/types/game'

const {
  blocks,
  selectedBlockIds,
  updateTitle,
  toggleDouble,
  toggleBlockSelection,
  canScoreBalls,
  scoreBall,
  scoreLag,
  canUndo,
  undoLastScore,
  goHome,
} = useGame()
</script>

<template>
  <div class="game-board">
    <header class="game-board__toolbar">
      <button type="button" class="btn btn--ghost" @click="goHome">
        ← Home
      </button>

      <div class="game-board__toolbar-center">
        <p v-if="!canScoreBalls" class="game-board__hint">Select at least 2 players</p>
      </div>

      <button
        type="button"
        class="game-board__undo"
        :disabled="!canUndo"
        title="Hoàn tác"
        aria-label="Hoàn tác điểm vừa tính"
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

    <div class="game-board__blocks">
      <ScoreBlock
        v-for="(block, index) in blocks"
        :key="block.id"
        :block="block"
        :is-selected="selectedBlockIds.includes(block.id)"
        :can-click-balls="canScoreBalls && selectedBlockIds.includes(block.id)"
        :can-toggle-double="canScoreBalls"
        :selected-count="selectedBlockIds.length"
        :show-minus-hint="canScoreBalls"
        @toggle-select="toggleBlockSelection(block.id)"
        @score="(ball: BallValue) => scoreBall(index, ball)"
        @lag="scoreLag(index)"
        @toggle-double="toggleDouble(block.id)"
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

.game-board__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  flex: 1;
  text-align: center;
}

.game-board__blocks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
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

  .game-board__title {
    font-size: 0.95rem;
  }

  .game-board__hint {
    font-size: 1.1rem;
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
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    grid-template-columns: unset;
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

.game-board__hint {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ff6b35;
  text-align: center;
  animation: game-board-hint-flicker 1.1s ease-in-out infinite;
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

@keyframes game-board-hint-flicker {
  0%, 100% {
    color: #ff6b35;
    opacity: 1;
    text-shadow:
      0 0 8px rgba(255, 107, 53, 0.75),
      0 0 18px rgba(255, 107, 53, 0.35);
  }

  50% {
    color: #fff3c4;
    opacity: 0.45;
    text-shadow:
      0 0 14px rgba(255, 107, 53, 1),
      0 0 28px rgba(255, 160, 90, 0.65);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-board__hint {
    animation: none;
    opacity: 1;
    color: #ff6b35;
    text-shadow: 0 0 10px rgba(255, 107, 53, 0.8);
  }
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
