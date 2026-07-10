export type BallGesturePhase = 'idle' | 'pressing' | 'charging' | 'x2-ready'

const TAP_MAX_MS = 220
const TAP_MAX_MOVE = 12
const SWIPE_UP_THRESHOLD = 38
const CHARGE_DELAY_MS = 140

export function useBallScoreGesture(options: {
  disabled: MaybeRefOrGetter<boolean>
  onScore: (doubled: boolean) => void
}) {
  const phase = ref<BallGesturePhase>('idle')
  const progress = ref(0)
  const dragOffset = ref(0)

  let startX = 0
  let startY = 0
  let startTime = 0
  let pointerId: number | null = null
  let chargeTimer: ReturnType<typeof setTimeout> | null = null
  let scored = false

  function clearChargeTimer() {
    if (!chargeTimer) return
    clearTimeout(chargeTimer)
    chargeTimer = null
  }

  function reset() {
    phase.value = 'idle'
    progress.value = 0
    dragOffset.value = 0
    pointerId = null
    scored = false
    clearChargeTimer()
  }

  function onPointerDown(event: PointerEvent) {
    if (toValue(options.disabled) || event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)

    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    startTime = performance.now()
    phase.value = 'pressing'

    clearChargeTimer()
    chargeTimer = setTimeout(() => {
      if (phase.value === 'pressing') {
        phase.value = 'charging'
      }
    }, CHARGE_DELAY_MS)
  }

  function onPointerMove(event: PointerEvent) {
    if (pointerId !== event.pointerId) return

    const dy = startY - event.clientY
    const dx = event.clientX - startX
    const distance = Math.hypot(dx, dy)

    if (distance > 4 && phase.value === 'pressing') {
      clearChargeTimer()
      phase.value = 'charging'
    }

    if (phase.value !== 'charging' && phase.value !== 'x2-ready') return

    dragOffset.value = Math.max(-52, Math.min(6, -dy * 0.5))
    progress.value = Math.min(1, Math.max(0, dy / SWIPE_UP_THRESHOLD))

    if (dy >= SWIPE_UP_THRESHOLD) {
      if (phase.value !== 'x2-ready') {
        phase.value = 'x2-ready'
        if (navigator.vibrate) navigator.vibrate(12)
      }
    }
    else {
      phase.value = 'charging'
    }
  }

  function finalizeScore(event: PointerEvent) {
    if (toValue(options.disabled) || scored) {
      reset()
      return
    }

    const duration = performance.now() - startTime
    const dy = startY - event.clientY
    const dx = event.clientX - startX
    const distance = Math.hypot(dx, dy)

    let doubled = false
    if (duration <= TAP_MAX_MS && distance <= TAP_MAX_MOVE) {
      doubled = false
    }
    else {
      doubled = dy >= SWIPE_UP_THRESHOLD || phase.value === 'x2-ready'
    }

    options.onScore(doubled)
    scored = true

    try {
      ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
    }
    catch {
      // Ignore release errors.
    }

    reset()
  }

  function onPointerUp(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    finalizeScore(event)
  }

  function onPointerCancel(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    reset()
  }

  onUnmounted(() => {
    reset()
  })

  return {
    phase,
    progress,
    dragOffset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}
