export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 3
export const DEFAULT_PLAYER_COUNT = 3

export type BallValue = 3 | 6 | 9

export const BALL_POINTS: Record<BallValue, number> = {
  3: 1,
  6: 2,
  9: 3,
}

export const LAG_SCORE_GAIN = 24
export const LAG_SCORE_LOSS = 12

export const BALL_IMAGES: Record<BallValue, string> = {
  3: '/ball3.jpg',
  6: '/ball6.jpg',
  9: '/ball9.jpg',
}

export interface PlayerBlock {
  id: string
  title: string
  score: number
  color: string
  doublePoints: boolean
}
