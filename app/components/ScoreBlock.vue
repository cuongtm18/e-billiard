<script setup lang="ts">
import type { BallValue, PlayerBlock } from '~/types/game'
import { BALL_POINTS } from '~/types/game'
import { titleTextForBlock } from '~/utils/colors'

const props = defineProps<{
  block: PlayerBlock
  isSelected: boolean
  canClickBalls: boolean
  canToggleDouble: boolean
  selectedCount: number
  showMinusHint: boolean
}>()

const emit = defineEmits<{
  'score': [ball: BallValue]
  'toggle-select': []
  'toggle-double': []
  'lag': []
  'update-title': [title: string]
}>()

function onBallClick(ball: BallValue) {
  if (!props.canClickBalls) return
  emit('score', ball)
}

function onToggleDouble() {
  if (!props.canToggleDouble) return
  emit('toggle-double')
}

function ballPoints(ball: BallValue) {
  const base = BALL_POINTS[ball]
  return props.block.doublePoints ? base * 2 : base
}

function ballGain(ball: BallValue) {
  return ballPoints(ball) * Math.max(0, props.selectedCount - 1)
}

const balls: BallValue[] = [3, 6, 9]
const isEditingTitle = ref(false)
const titleInput = ref(props.block.title)

watch(() => props.block.title, (val) => {
  if (!isEditingTitle.value) titleInput.value = val
})

function startEditTitle() {
  isEditingTitle.value = true
  titleInput.value = props.block.title
  nextTick(() => {
    const el = document.getElementById(`title-${props.block.id}`) as HTMLInputElement | null
    el?.focus()
    el?.select()
  })
}

function commitTitle() {
  isEditingTitle.value = false
  emit('update-title', titleInput.value)
}

function onBlockSelect() {
  if (isEditingTitle.value) return
  emit('toggle-select')
}

function onBallsAreaClick(event: MouseEvent) {
  if (props.canClickBalls) {
    event.stopPropagation()
  }
}
</script>

<template>
  <article
    class="score-block"
    :class="{ 'score-block--selected': isSelected }"
    :style="{
      '--block-color': block.color,
      '--block-title-text': titleTextForBlock(block.color),
    }"
    @click="onBlockSelect"
  >
    <span v-if="isSelected" class="score-block__ring" aria-hidden="true" />

    <header class="score-block__header">
      <div class="score-block__header-start">
        <div class="score-block__title-wrap">
          <input
            v-if="isEditingTitle"
            :id="`title-${block.id}`"
            v-model="titleInput"
            class="score-block__title-input"
            maxlength="24"
            @click.stop
            @blur="commitTitle"
            @keydown.enter="commitTitle"
          >
          <span v-else class="score-block__title-badge">
            {{ block.title }}
          </span>
          <button
            v-if="!isEditingTitle"
            type="button"
            class="score-block__edit-btn"
            title="Edit"
            aria-label="Edit"
            @click.stop="startEditTitle"
          >
            ✎
          </button>
        </div>
      </div>

      <div class="score-block__header-center">
        <button
          type="button"
          class="score-block__lag"
          title="Đi chấm (+24 / mỗi người khác −12)"
          aria-label="Đi chấm"
          @click.stop="emit('lag')"
        >
          <svg class="score-block__lag-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              class="score-block__lag-star"
              d="M12 2.2 14.1 9h6.9l-5.6 4.1 2.1 6.7L12 17.6 6.5 19.8l2.1-6.7L3 9h6.9L12 2.2z"
              fill="currentColor"
            />
            <circle class="score-block__lag-runner-head" cx="12" cy="10.2" r="1.35" />
            <path
              class="score-block__lag-runner-body"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.2 11.6h1.6l.7 1.9M10.4 14.8l2-.7 1.8 1.2M13.6 14.1l-1.4 2.1M10.1 14.3l-.9 2.2"
            />
          </svg>
        </button>
      </div>

      <div class="score-block__header-end">
        <button
          type="button"
          class="score-block__double"
          :class="{ 'score-block__double--active': block.doublePoints }"
          :disabled="!canToggleDouble"
          :title="canToggleDouble
            ? (block.doublePoints ? 'Tắt nhân đôi điểm' : 'Bật nhân đôi điểm')
            : 'Chọn ít nhất 2 người chơi trước'"
          :aria-label="canToggleDouble
            ? (block.doublePoints ? 'Tắt nhân đôi điểm' : 'Bật nhân đôi điểm')
            : 'Chọn ít nhất 2 người chơi trước'"
          :aria-pressed="block.doublePoints"
          @click.stop="onToggleDouble"
        >
          x2
        </button>
      </div>
    </header>

    <div
      class="score-block__score"
      :class="{ 'score-block__score--negative': block.score < 0 }"
    >
      {{ block.score }}
    </div>

    <div
      class="score-block__balls"
      :class="{ 'score-block__balls--locked': !canClickBalls }"
      @click="onBallsAreaClick"
    >
      <div v-for="ball in balls" :key="ball" class="score-block__ball-group">
        <BilliardBall
          :value="ball"
          :doubled="block.doublePoints"
          :disabled="!canClickBalls"
          @click="onBallClick(ball)"
        />
        <span class="score-block__ball-points">
          +{{ ballGain(ball) }}
          <template v-if="canClickBalls && showMinusHint"> / −{{ ballPoints(ball) }}</template>
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.score-block {
  position: relative;
  background: linear-gradient(145deg, color-mix(in srgb, var(--block-color) 25%, #1a2e1a), #0f1f0f);
  border: 2px solid var(--block-color);
  border-radius: 16px;
  padding: 1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.score-block--selected {
  border-width: 3px;
  border-color: color-mix(in srgb, var(--block-color) 80%, white);
  box-shadow:
    0 0 28px color-mix(in srgb, var(--block-color) 55%, transparent),
    0 4px 20px rgba(0, 0, 0, 0.35);
}

.score-block__ring {
  position: absolute;
  inset: -5px;
  border-radius: inherit;
  border: 3px solid var(--block-color);
  pointer-events: none;
  z-index: 2;
  animation: score-block-border-flicker 1.1s ease-in-out infinite;
}

@keyframes score-block-border-flicker {
  0%, 100% {
    border-color: var(--block-color);
    opacity: 1;
    box-shadow:
      0 0 10px color-mix(in srgb, var(--block-color) 70%, transparent),
      inset 0 0 6px color-mix(in srgb, var(--block-color) 40%, transparent);
  }

  50% {
    border-color: color-mix(in srgb, var(--block-color) 35%, white);
    opacity: 0.45;
    box-shadow:
      0 0 22px color-mix(in srgb, var(--block-color) 90%, white),
      inset 0 0 12px color-mix(in srgb, var(--block-color) 55%, white);
  }
}

@media (prefers-reduced-motion: reduce) {
  .score-block__ring {
    animation: none;
    opacity: 1;
    border-color: var(--block-color);
    box-shadow: 0 0 12px color-mix(in srgb, var(--block-color) 65%, transparent);
  }
}

.score-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

.score-block__header-start,
.score-block__header-end {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.score-block__header-start {
  justify-content: flex-start;
}

.score-block__header-center {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.score-block__header-end {
  justify-content: flex-end;
}

.score-block__title-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  max-width: 100%;
}

.score-block__edit-btn {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.score-block__edit-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.35);
  color: white;
}

.score-block__title-badge {
  background: var(--block-color);
  color: var(--block-title-text, #ffffff);
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-block__title-input {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid var(--block-color);
  border-radius: 10px;
  color: white;
  padding: 0.6rem 1.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  width: 100%;
  max-width: 260px;
  outline: none;
}

.score-block__score {
  font-size: 4.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  user-select: none;
}

.score-block__score--negative {
  color: #e74c3c;
}

.score-block__balls--locked {
  opacity: 0.55;
}

.score-block__balls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.score-block__ball-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.score-block__ball-points {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}

.score-block__lag {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 2px solid #f5c518;
  border-radius: 50%;
  background: rgba(245, 197, 24, 0.12);
  color: #f5c518;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 10px rgba(245, 197, 24, 0.65),
    inset 0 0 8px rgba(245, 197, 24, 0.18);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.score-block__lag:hover {
  background: rgba(245, 197, 24, 0.28);
  border-color: #ffdf5e;
  box-shadow:
    0 0 14px rgba(245, 197, 24, 0.85),
    inset 0 0 10px rgba(245, 197, 24, 0.28);
}

.score-block__lag-icon {
  width: 1.65rem;
  height: 1.65rem;
}

.score-block__lag-runner-head,
.score-block__lag-runner-body {
  color: #1a2e1a;
}

.score-block__lag-runner-head {
  fill: #1a2e1a;
}

.score-block__double {
  flex-shrink: 0;
  min-width: 2.75rem;
  height: 2.75rem;
  padding: 0 0.7rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.75);
  border-radius: 22px;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
  letter-spacing: 0.02em;
}

.score-block__double:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
  color: white;
}

.score-block__double:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.score-block__double--active {
  background: #ff6b35;
  border-color: #ff8c5a;
  color: white;
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.45);
}

@media (max-width: 640px) {
  .score-block {
    --block-ball-size: 3.1rem;
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 4rem 1fr;
    grid-template-rows: auto 1fr;
    gap: 0.2rem 0.45rem;
    padding: 0.45rem 0.55rem 0.45rem;
    border-radius: 10px;
    border-width: 1.5px;
    align-content: center;
  }

  .score-block__header {
    grid-column: 1 / -1;
    gap: 0.4rem;
  }

  .score-block--selected {
    border-width: 2.5px;
  }

  .score-block__ring {
    inset: -4px;
    border-width: 2.5px;
  }

  .score-block__title-badge,
  .score-block__title-input {
    padding: 0.4rem 0.9rem;
    font-size: 1.15rem;
    border-radius: 10px;
  }

  .score-block__title-input {
    max-width: 180px;
  }

  .score-block__edit-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  .score-block__score {
    grid-column: 1;
    grid-row: 2;
    align-self: center;
    justify-self: center;
    font-size: 2.6rem;
  }

  .score-block__balls {
    grid-column: 2;
    grid-row: 2;
    align-self: center;
    gap: 0.4rem;
    flex-wrap: nowrap;
    justify-content: space-evenly;
    width: 100%;
  }

  .score-block__ball-group {
    gap: 0.15rem;
  }

  .score-block__ball-points {
    font-size: 0.8rem;
  }

  .score-block__lag {
    width: 2.5rem;
    height: 2.5rem;
    border-width: 2px;
  }

  .score-block__lag-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .score-block__double {
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0 0.55rem;
    font-size: 0.92rem;
    border-radius: 16px;
    border-width: 2px;
  }
}
</style>
