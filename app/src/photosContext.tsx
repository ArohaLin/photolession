import { createContext, useContext } from 'react'
import type { Photo } from './types'

export const PhotosContext = createContext<Record<string, Photo>>({})

export function usePhoto(pid: string): Photo | undefined {
  return useContext(PhotosContext)[pid]
}
