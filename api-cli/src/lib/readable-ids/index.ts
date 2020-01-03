import * as shuffle from 'knuth-shuffle-seeded'

import {ANIMALS, ADJECTIVES} from './dictionary'

const sample = (arr: string[]): string => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const randomInt = (min = 2, max = 100): number => {
  return Math.floor(Math.random() * (max - min)) + min
}

const shuffledAnimals = shuffle(ANIMALS)
const shuffledAdjectives = shuffle(ADJECTIVES)

export const random = (): string => {
  return `${sample(shuffledAdjectives)}-${sample(shuffledAnimals)}-${randomInt()}`
}
