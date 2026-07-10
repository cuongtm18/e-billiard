export function useGameShare() {
  const isSharing = ref(false)
  const shareError = useState<string | null>('game-share-error', () => null)

  async function captureBoardElement(element: HTMLElement): Promise<Blob> {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a1a0a',
      scale: Math.min(2, window.devicePixelRatio || 1),
      useCORS: true,
      logging: false,
    })

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image.'))
          return
        }
        resolve(blob)
      }, 'image/png')
    })
  }

  async function downloadImage(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  async function shareBoardScreenshot(element: HTMLElement | null) {
    if (!import.meta.client || !element) {
      shareError.value = 'Cannot capture game screen.'
      return false
    }

    isSharing.value = true
    shareError.value = null

    try {
      const blob = await captureBoardElement(element)
      const filename = `e-billiard-${new Date().toISOString().slice(0, 10)}.png`
      const file = new File([blob], filename, { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'E-Billiard scores',
          text: 'E-Billiard scores',
        })
        return true
      }

      await downloadImage(blob, filename)
      return true
    }
    catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false
      }

      shareError.value = 'Cannot share screenshot.'
      return false
    }
    finally {
      isSharing.value = false
    }
  }

  return {
    isSharing,
    shareError,
    shareBoardScreenshot,
  }
}
