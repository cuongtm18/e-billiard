<script setup lang="ts">
const emit = defineEmits<{
  share: []
  import: []
  reset: []
}>()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  open.value = !open.value
}

function closeMenu() {
  open.value = false
}

function onShare() {
  closeMenu()
  emit('share')
}

function onImport() {
  closeMenu()
  emit('import')
}

function onReset() {
  closeMenu()
  emit('reset')
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !menuRef.value) return
  if (!menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="menuRef" class="game-menu">
    <button
      type="button"
      class="game-menu__trigger"
      title="Menu"
      aria-label="Menu"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click.stop="toggleMenu"
    >
      <svg class="game-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5" r="1.8" fill="currentColor" />
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        <circle cx="12" cy="19" r="1.8" fill="currentColor" />
      </svg>
    </button>

    <div v-if="open" class="game-menu__dropdown" role="menu">
      <button type="button" class="game-menu__item" role="menuitem" @click="onShare">
        Share game
      </button>
      <button type="button" class="game-menu__item" role="menuitem" @click="onImport">
        Import game
      </button>
      <button type="button" class="game-menu__item game-menu__item--danger" role="menuitem" @click="onReset">
        Reset game
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-menu {
  position: relative;
  display: flex;
  justify-content: center;
}

.game-menu__trigger {
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
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.game-menu__trigger:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
  color: white;
}

.game-menu__icon {
  width: 100%;
  height: 100%;
  display: block;
}

.game-menu__dropdown {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 50%;
  transform: translateX(-50%);
  min-width: 11rem;
  padding: 0.35rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: #142414;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  z-index: 30;
}

.game-menu__item {
  width: 100%;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  text-align: left;
  padding: 0.65rem 0.85rem;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.game-menu__item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.game-menu__item--danger {
  color: #f87171;
}

.game-menu__item--danger:hover {
  background: rgba(248, 113, 113, 0.12);
  color: #fca5a5;
}

@media (max-width: 640px) {
  .game-menu__trigger {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.4rem;
    border-radius: 8px;
  }
}
</style>
