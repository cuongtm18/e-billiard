<script setup lang="ts">
import type { BallValue } from '~/types/game'
import { BALL_IMAGES } from '~/types/game'

const props = defineProps<{
  value: BallValue
  disabled?: boolean
}>()

const emit = defineEmits<{
  score: [doubled: boolean]
}>()

const {
  phase,
  progress,
  dragOffset,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
} = useBallScoreGesture({
  disabled: () => props.disabled === true,
  onScore: doubled => emit('score', doubled),
})

const isCharging = computed(() => phase.value === 'charging' || phase.value === 'x2-ready')
const isX2Ready = computed(() => phase.value === 'x2-ready')

const frameStyle = computed(() => {
  const transforms: string[] = []

  if (dragOffset.value) {
    transforms.push(`translateY(${dragOffset.value}px)`)
  }

  if (phase.value === 'pressing') {
    transforms.push('scale(0.96)')
  }
  else if (isX2Ready.value) {
    transforms.push('scale(1.05)')
  }

  return transforms.length > 0 ? { transform: transforms.join(' ') } : undefined
})
</script>

<template>
  <button
    type="button"
    class="ball"
    :class="{
      'ball--disabled': disabled,
      'ball--pressing': phase === 'pressing',
      'ball--charging': isCharging,
      'ball--x2-ready': isX2Ready,
    }"
    :aria-label="`Ball ${value}`"
    :aria-disabled="disabled"
    :disabled="disabled"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @contextmenu.prevent
  >
    <span
      v-if="isCharging"
      class="ball__swipe-track"
      aria-hidden="true"
    >
      <span
        class="ball__swipe-fill"
        :style="{ height: `${Math.round(progress * 100)}%` }"
      />
      <span class="ball__swipe-label">×2</span>
    </span>

    <span
      class="ball-frame ball-frame--md ball-frame--interactive"
      :class="{ 'ball-frame--doubled': isX2Ready }"
      :style="frameStyle"
    >
      <span v-if="isX2Ready" class="ball-frame__ring" aria-hidden="true" />
      <img
        :src="BALL_IMAGES[value]"
        :alt="`Ball ${value}`"
        class="ball-frame__img"
        width="40"
        height="40"
        draggable="false"
      >
    </span>

    <span v-if="isX2Ready" class="ball__badge">×2</span>
    <span v-else-if="isCharging" class="ball__hint">↑</span>
  </button>
</template>

<style scoped>
.ball {
  position: relative;
  padding: 0.35rem 0 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 50%;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.ball--disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.ball--charging .ball-frame--interactive,
.ball--x2-ready .ball-frame--interactive {
  transition: transform 0.08s linear, box-shadow 0.12s ease;
}

.ball--x2-ready .ball-frame--interactive {
  box-shadow:
    0 0 0 2px rgba(255, 107, 53, 0.45),
    0 8px 22px rgba(255, 107, 53, 0.35);
}

.ball__swipe-track {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0.42rem;
  height: 1.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.ball__swipe-fill {
  width: 100%;
  background: linear-gradient(180deg, #ffb347, #ff6b35);
  border-radius: inherit;
  transition: height 0.06s linear;
}

.ball__swipe-label {
  position: absolute;
  top: -0.95rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.58rem;
  font-weight: 800;
  color: rgba(255, 180, 120, 0.9);
  letter-spacing: 0.02em;
}

.ball__badge {
  position: absolute;
  top: 0.15rem;
  right: -0.2rem;
  background: #ff6b35;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 8px;
  line-height: 1;
  z-index: 4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  animation: ball-badge-pop 0.18s ease-out;
}

.ball__hint {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.72rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1;
  pointer-events: none;
  animation: ball-hint-bounce 0.9s ease-in-out infinite;
}

@keyframes ball-badge-pop {
  from {
    transform: scale(0.7);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ball-hint-bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
    opacity: 0.55;
  }

  50% {
    transform: translateX(-50%) translateY(-2px);
    opacity: 0.95;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ball__hint {
    animation: none;
  }

  .ball__badge {
    animation: none;
  }
}

@media (max-width: 640px) {
  .ball {
    padding-top: 0.3rem;
  }

  .ball__badge {
    font-size: 0.62rem;
    padding: 2px 4px;
    top: 0.1rem;
    right: -0.15rem;
    border-radius: 7px;
  }

  .ball__swipe-track {
    width: 0.38rem;
    height: 1.15rem;
  }
}
</style>
