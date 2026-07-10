<script setup lang="ts">
import type { GameHistoryEntry } from '~/utils/gameHistory'
import { DEFAULT_BLOCK_COLOR } from '~/utils/colors'
import type { PlayerBlock } from '~/types/game'

const props = defineProps<{
  entry: GameHistoryEntry
}>()

const emit = defineEmits<{
  back: []
}>()

const historyBlocks = computed<PlayerBlock[]>(() =>
  props.entry.blocks.map((block, index) => ({
    id: `history-${props.entry.dateKey}-${index}`,
    title: block.title,
    score: block.score,
    color: DEFAULT_BLOCK_COLOR,
    doublePoints: false,
  })),
)

const { formatEntryDate, formatEntryWeekday } = useGameHistory()
</script>

<template>
  <div class="history-board">
    <header class="history-board__toolbar">
      <button type="button" class="btn btn--ghost" @click="emit('back')">
        ← Back
      </button>

      <div class="history-board__date">
        <span class="history-board__weekday">{{ formatEntryWeekday(entry) }}</span>
        <span class="history-board__date-text">{{ formatEntryDate(entry) }}</span>
      </div>

      <div class="history-board__spacer" aria-hidden="true" />
    </header>

    <div class="history-board__blocks">
      <ScoreBlock
        v-for="block in historyBlocks"
        :key="block.id"
        :block="block"
        readonly
      />
    </div>
  </div>
</template>

<style scoped>
.history-board {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.history-board__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.history-board__date {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  text-align: center;
}

.history-board__weekday {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.68);
  letter-spacing: 0.02em;
}

.history-board__date-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.02em;
}

.history-board__spacer {
  width: 5.5rem;
  flex-shrink: 0;
}

.history-board__blocks {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
  margin-top: 0.5rem;
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

.btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.14);
}

@media (max-width: 640px) {
  .history-board {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: none;
  }

  .history-board__toolbar {
    margin-bottom: 1.25rem;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .history-board__weekday {
    font-size: 0.88rem;
  }

  .history-board__date-text {
    font-size: 1.05rem;
  }

  .history-board__spacer {
    width: 4.5rem;
  }

  .history-board__blocks {
    flex: 1;
    min-height: 0;
    gap: 0.35rem;
    justify-content: space-between;
    margin-top: 0.35rem;
  }

  .btn {
    padding: 0.5rem 0.9rem;
    font-size: 0.9rem;
    border-radius: 10px;
    min-height: 2.5rem;
  }
}
</style>
