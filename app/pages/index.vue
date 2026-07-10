<script setup lang="ts">
import { BALL_IMAGES } from '~/types/game'

const { isPlaying, canResumeGame, startNewGame, resumeGame } = useGame()
const { hasHistory, openHistoryModal } = useGameHistory()

function handleNewGame() {
  if (canResumeGame.value) {
    const confirmed = window.confirm(
      'Starting a new game will delete all current scores and reset player names. Continue?',
    )
    if (!confirmed) return
  }

  startNewGame()
}

const welcomeBalls = [
  { value: 3 as const, src: BALL_IMAGES[3] },
  { value: 6 as const, src: BALL_IMAGES[6] },
  { value: 9 as const, src: BALL_IMAGES[9] },
]
</script>

<template>
  <div class="page" :class="{ 'page--game': isPlaying }">
    <GameBoard v-if="isPlaying" />

    <main v-else class="welcome">
      <div class="welcome__balls" aria-hidden="true">
        <span
          v-for="ball in welcomeBalls"
          :key="ball.value"
          class="ball-frame ball-frame--sm"
        >
          <img
            :src="ball.src"
            :alt="`Ball ${ball.value}`"
            class="ball-frame__img"
            width="56"
            height="56"
            draggable="false"
          >
        </span>
      </div>

      <h1 class="welcome__title">E-Billiard</h1>
      <p class="welcome__subtitle">Application to calculate billiard points</p>

      <div class="welcome__actions">
        <button
          v-if="canResumeGame"
          type="button"
          class="welcome__cta welcome__cta--resume"
          @click="resumeGame"
        >
          Continue Game
        </button>

        <button
          v-if="hasHistory"
          type="button"
          class="welcome__cta welcome__cta--history"
          @click="openHistoryModal"
        >
          History
        </button>

        <button type="button" class="welcome__cta" @click="handleNewGame">
          New Game
        </button>
      </div>

      <p class="welcome__note">
        Ball 3 = 1 point · Ball 6 = 2 points · Ball 9 = 3 points
      </p>
    </main>

    <GameTransferModal />
    <GameHistoryModal />
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  padding: 1.5rem;
}

@media (max-width: 640px) {
  .page--game {
    padding: 0.35rem 0.5rem;
    padding-top: max(0.35rem, env(safe-area-inset-top));
    padding-bottom: max(0.35rem, env(safe-area-inset-bottom));
    height: 100dvh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .page--game > * {
    flex: 1;
    min-height: 0;
  }
}

.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 3rem);
  text-align: center;
  gap: 0.5rem;
}

.welcome__balls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.welcome__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
}

.welcome__subtitle {
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 2rem;
  font-size: 1rem;
}

.welcome__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 280px;
}

.welcome__cta {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: #0a1a0a;
  border: none;
  border-radius: 14px;
  padding: 1rem 3rem;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(46, 204, 113, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
  width: 100%;
}

.welcome__cta--resume {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 2px solid rgba(46, 204, 113, 0.55);
  box-shadow: 0 4px 18px rgba(46, 204, 113, 0.2);
}

.welcome__cta--history {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 2px solid rgba(125, 211, 252, 0.45);
  box-shadow: 0 4px 18px rgba(56, 189, 248, 0.18);
}

.welcome__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(46, 204, 113, 0.45);
}

.welcome__cta--resume:hover {
  background: rgba(46, 204, 113, 0.15);
  box-shadow: 0 8px 24px rgba(46, 204, 113, 0.3);
}

.welcome__cta--history:hover {
  background: rgba(56, 189, 248, 0.15);
  box-shadow: 0 8px 24px rgba(56, 189, 248, 0.24);
}

.welcome__cta:active {
  transform: scale(0.98);
}

.welcome__note {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
}
</style>
