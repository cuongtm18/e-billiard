<script setup lang="ts">
import QRCode from 'qrcode'

const {
  modalOpen,
  modalMode,
  exportCode,
  transferMessage,
  transferError,
  closeTransferModal,
  importFromScan,
} = useGameTransfer()

const qrDataUrl = ref('')
const scannerActive = ref(false)
const scannerContainerId = 'game-transfer-scanner'
let scanner: import('html5-qrcode').Html5Qrcode | null = null

watch([modalOpen, modalMode, exportCode], async ([open, mode, code]) => {
  if (!open || mode !== 'share' || !code) {
    qrDataUrl.value = ''
    return
  }

  try {
    qrDataUrl.value = await QRCode.toDataURL(code, {
      margin: 1,
      width: 260,
      color: {
        dark: '#0f1f0f',
        light: '#ffffff',
      },
    })
  }
  catch {
    qrDataUrl.value = ''
  }
}, { immediate: true })

watch([modalOpen, modalMode], async ([open, mode]) => {
  if (!open || mode !== 'import') {
    await stopScanner()
    return
  }

  await startScanner()
})

async function startScanner() {
  if (!import.meta.client || scannerActive.value) return

  transferError.value = null
  scannerActive.value = true

  await nextTick()

  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    scanner = new Html5Qrcode(scannerContainerId)
    await scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
      },
      (decoded) => {
        const imported = importFromScan(decoded)
        if (imported) {
          void stopScanner()
        }
      },
      () => {},
    )
  }
  catch {
    scannerActive.value = false
    transferError.value = 'Cannot open camera.'
    await stopScanner()
  }
}

async function stopScanner() {
  scannerActive.value = false

  if (!scanner) return

  try {
    if (scanner.isScanning) {
      await scanner.stop()
    }
    scanner.clear()
  }
  catch {
    // Ignore cleanup errors.
  }
  finally {
    scanner = null
  }
}

onUnmounted(() => {
  void stopScanner()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modalOpen"
      class="transfer-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="modalMode === 'share' ? 'Share game' : 'Import game'"
      @click.self="closeTransferModal"
    >
      <div class="transfer-modal__panel">
        <header class="transfer-modal__header">
          <h2 class="transfer-modal__title">
            {{ modalMode === 'share' ? 'Share game' : 'Import game' }}
          </h2>
          <button
            type="button"
            class="transfer-modal__close"
            aria-label="Close"
            @click="closeTransferModal"
          >
            ×
          </button>
        </header>

        <div v-if="modalMode === 'share'" class="transfer-modal__body">
          <div v-if="qrDataUrl" class="transfer-modal__qr-wrap">
            <img :src="qrDataUrl" alt="QR code game" class="transfer-modal__qr">
          </div>
        </div>

        <div v-else class="transfer-modal__body">
          <div
            :id="scannerContainerId"
            class="transfer-modal__scanner"
            :class="{ 'transfer-modal__scanner--active': scannerActive }"
          />

          <button
            v-if="!scannerActive"
            type="button"
            class="transfer-modal__btn transfer-modal__btn--primary transfer-modal__btn--full"
            @click="startScanner"
          >
            Turn on camera
          </button>
        </div>

        <p v-if="transferMessage" class="transfer-modal__message transfer-modal__message--success">
          {{ transferMessage }}
        </p>
        <p v-if="transferError" class="transfer-modal__message transfer-modal__message--error">
          {{ transferError }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.transfer-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.62);
}

.transfer-modal__panel {
  width: min(100%, 26rem);
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(160deg, #1a2e1a, #0f1f0f);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45);
}

.transfer-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0.5rem;
}

.transfer-modal__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
}

.transfer-modal__close {
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

.transfer-modal__close:hover {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}

.transfer-modal__body {
  padding: 0.5rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transfer-modal__hint {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.45;
  text-align: center;
}

.transfer-modal__qr-wrap {
  display: flex;
  justify-content: center;
}

.transfer-modal__qr {
  width: 260px;
  height: 260px;
  border-radius: 12px;
  background: white;
}

.transfer-modal__btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.55rem 0.85rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.transfer-modal__btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.32);
  color: white;
}

.transfer-modal__btn--primary {
  background: rgba(56, 189, 248, 0.18);
  border-color: rgba(125, 211, 252, 0.55);
  color: #dff4ff;
}

.transfer-modal__btn--primary:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.28);
}

.transfer-modal__btn--full {
  width: 100%;
}

.transfer-modal__scanner {
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  min-height: 0;
}

.transfer-modal__scanner--active {
  min-height: 260px;
}

.transfer-modal__message {
  margin: 0;
  padding: 0 1rem 1rem;
  font-size: 0.86rem;
  font-weight: 600;
  text-align: center;
}

.transfer-modal__message--success {
  color: #7dd3fc;
}

.transfer-modal__message--error {
  color: #ff8a7a;
}
</style>
