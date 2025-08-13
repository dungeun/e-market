import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  toggleItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id)
          
          if (exists) {
            return {
              items: state.items.filter((i) => i.id !== item.id),
            }
          }
          
          return { items: [...state.items, item] }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      
      clearWishlist: () => set({ items: [] }),
      
      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id)
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)