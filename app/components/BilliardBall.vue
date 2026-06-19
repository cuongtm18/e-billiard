<script setup lang="ts">
import type { BallValue } from '~/types/game'
import { BALL_IMAGES } from '~/types/game'

defineProps<{
  value: BallValue
  doubled?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

function onClick(event: MouseEvent) {
  event.stopPropagation()
  emit('click')
}
</script>

<template>
  <button
    type="button"
    class="ball"
    :class="{ 'ball--doubled': doubled, 'ball--disabled': disabled }"
    :aria-label="`Ball ${value}`"
    :disabled="disabled"
    @click="onClick"
  >
    <span
      class="ball-frame ball-frame--md ball-frame--interactive"
      :class="{ 'ball-frame--doubled': doubled }"
    >
      <span v-if="doubled" class="ball-frame__ring" aria-hidden="true" />
      <img
        :src="BALL_IMAGES[value]"
        :alt="`Ball ${value}`"
        class="ball-frame__img"
        width="40"
        height="40"
        draggable="false"
      >
    </span>
    <span v-if="doubled" class="ball__badge">×2</span>
  </button>
</template>

<style scoped>
.ball {
  position: relative;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 50%;
}

.ball--disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.ball--disabled:active {
  transform: none;
}

.ball__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff6b35;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 8px;
  line-height: 1;
  z-index: 4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

@media (max-width: 640px) {
  .ball__badge {
    font-size: 0.62rem;
    padding: 2px 4px;
    top: -4px;
    right: -4px;
    border-radius: 7px;
  }
}
</style>
