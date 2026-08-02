export interface Wine {
  id: string
  name: string
  category: string
  vintage: string
  volume: string
  price: number
  stock: number
  available: boolean
  order: number
}

export type WineInput = Omit<Wine, 'id'>
