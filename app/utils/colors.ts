export const BLOCK_COLORS = ['#16c75a', '#f5c518', '#e63946'] as const

export const BLOCK_TITLE_TEXT: Record<(typeof BLOCK_COLORS)[number], string> = {
  '#16c75a': '#ffffff',
  '#f5c518': '#1a2e1a',
  '#e63946': '#ffffff',
}

const usedColors = new Set<string>()

export function randomBlockColor(): string {
  const available = BLOCK_COLORS.filter(color => !usedColors.has(color))
  const pool = available.length > 0 ? available : [...BLOCK_COLORS]
  const color = pool[Math.floor(Math.random() * pool.length)]
  usedColors.add(color)
  return color
}

export function titleTextForBlock(color: string): string {
  return BLOCK_TITLE_TEXT[color as (typeof BLOCK_COLORS)[number]] ?? '#ffffff'
}

export function releaseBlockColor(color: string): void {
  if ((BLOCK_COLORS as readonly string[]).includes(color)) {
    usedColors.delete(color)
  }
}

export function resetColorPool(): void {
  usedColors.clear()
}

export function syncColorPoolFromBlocks(blocks: { color: string }[]): void {
  usedColors.clear()
  for (const block of blocks) {
    if ((BLOCK_COLORS as readonly string[]).includes(block.color)) {
      usedColors.add(block.color)
    }
  }
}
