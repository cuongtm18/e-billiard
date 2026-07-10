<script setup lang="ts">
const {
  entries,
  modalOpen,
  selectedEntry,
  closeHistoryModal,
  openHistoryEntry,
  closeHistoryEntry,
  formatEntryDate,
  formatEntryWeekday,
} = useGameHistory()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modalOpen"
      class="history-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Game history"
      @click.self="closeHistoryModal"
    >
      <div class="history-modal__panel">
        <template v-if="selectedEntry">
          <div class="history-modal__detail">
            <GameHistoryBoard
              :entry="selectedEntry"
              @back="closeHistoryEntry"
            />
          </div>
        </template>

        <template v-else>
          <header class="history-modal__header">
            <h2 class="history-modal__title">History</h2>
            <button
              type="button"
              class="history-modal__close"
              aria-label="Close"
              @click="closeHistoryModal"
            >
              ×
            </button>
          </header>

          <div class="history-modal__body">
            <p v-if="entries.length === 0" class="history-modal__empty">
              No history yet. Reset game on a weekday to save scores.
            </p>

            <ul v-else class="history-modal__list">
              <li v-for="entry in [...entries].reverse()" :key="entry.dateKey">
                <button
                  type="button"
                  class="history-modal__item"
                  @click="openHistoryEntry(entry)"
                >
                  <div class="history-modal__item-date-wrap">
                    <span class="history-modal__item-weekday">{{ formatEntryWeekday(entry) }}</span>
                    <span class="history-modal__item-date">{{ formatEntryDate(entry) }}</span>
                  </div>
                  <div class="history-modal__players">
                    <div
                      v-for="block in entry.blocks"
                      :key="block.title"
                      class="history-modal__player"
                    >
                      <span class="history-modal__player-name">{{ block.title }}</span>
                      <span
                        class="history-modal__player-score"
                        :class="{ 'history-modal__player-score--negative': block.score < 0 }"
                      >
                        {{ block.score }}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.history-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.62);
}

.history-modal__panel {
  width: min(100%, 1200px);
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(160deg, #1a2e1a, #0f1f0f);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.history-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.history-modal__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
}

.history-modal__close {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.history-modal__close:hover {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}

.history-modal__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-modal__detail {
  display: flex;
  flex: 1;
  min-height: 0;
}

.history-modal__empty {
  margin: 0;
  padding: 1rem 0.25rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.92rem;
  line-height: 1.5;
}

.history-modal__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-modal__item {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  text-align: center;
  padding: 0.95rem 1rem 1rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.history-modal__item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.24);
}

.history-modal__item-date-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
}

.history-modal__item-weekday {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.68);
  letter-spacing: 0.02em;
}

.history-modal__item-date {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.history-modal__players {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1rem;
}

.history-modal__player {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-align: center;
}

.history-modal__player-name {
  width: 100%;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.58);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-modal__player-score {
  font-size: 1.35rem;
  font-weight: 800;
  color: white;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.history-modal__player-score--negative {
  color: #e74c3c;
}

@media (max-width: 640px) {
  .history-modal {
    padding: 0.35rem 0.5rem;
    padding-top: max(0.35rem, env(safe-area-inset-top));
    padding-bottom: max(0.35rem, env(safe-area-inset-bottom));
  }

  .history-modal__panel {
    width: 100%;
    max-height: 100dvh;
    height: 100%;
    border-radius: 12px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
  }

  .history-modal__detail {
    flex: 1;
    min-height: 0;
  }

  .history-modal__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .history-modal__players {
    gap: 0.35rem;
    margin-top: 0.85rem;
  }

  .history-modal__player-name {
    font-size: 0.72rem;
  }

  .history-modal__player-score {
    font-size: 1.15rem;
  }
}
</style>
