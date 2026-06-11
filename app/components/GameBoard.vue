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
  canUndo,
  undoLastScore,
  endGame,
} = useGame()
</script>

<template>
  <div class="game-board">
    <header class="game-board__toolbar">
      <button type="button" class="btn btn--ghost" @click="endGame">
        ← Home
      </button>
      <p v-if="!canScoreBalls" class="game-board__hint">Select at least 2 players</p>
      <div v-else class="game-board__toolbar-spacer" aria-hidden="true" />
    </header>

    <div class="game-board__blocks">
      <ScoreBlock
        v-for="(block, index) in blocks"
        :key="block.id"
        :block="block"
        :is-selected="selectedBlockIds.includes(block.id)"
        :can-click-balls="canScoreBalls && selectedBlockIds.includes(block.id)"
        :can-toggle-double="canScoreBalls"
        :can-undo="canUndo"
        :show-minus-hint="canScoreBalls"
        @toggle-select="toggleBlockSelection(block.id)"
        @score="(ball: BallValue) => scoreBall(index, ball)"
        @toggle-double="toggleDouble(block.id)"
        @update-title="(title: string) => updateTitle(block.id, title)"
        @undo="undoLastScore"
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

  .game-board__toolbar-spacer {
    width: 3.75rem;
  }

  .game-board__hint {
    font-size: 1.1rem;
    flex: 1;
  }

  .btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
    border-radius: 8px;
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

.game-board__toolbar-spacer {
  width: 5.5rem;
}

.game-board__hint {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ff6b35;
  text-align: center;
  flex: 1;
  animation: game-board-hint-flicker 1.1s ease-in-out infinite;
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
