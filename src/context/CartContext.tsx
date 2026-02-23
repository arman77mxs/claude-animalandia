'use client'

import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react'
import { CartItem, Producto } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; producto: Producto }
  | { type: 'REMOVE_ITEM'; productoId: string }
  | { type: 'UPDATE_QUANTITY'; productoId: string; cantidad: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.producto.id === action.producto.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.producto.id === action.producto.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, { producto: action.producto, cantidad: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.producto.id !== action.productoId) }
    case 'UPDATE_QUANTITY':
      if (action.cantidad <= 0) {
        return { ...state, items: state.items.filter(i => i.producto.id !== action.productoId) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.producto.id === action.productoId ? { ...i, cantidad: action.cantidad } : i
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  cartLoaded: boolean
  addItem: (producto: Producto) => void
  removeItem: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })
  const [cartLoaded, setCartLoaded] = useState(false)

  // Load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem('animalandia-cart')
    if (saved) {
      try {
        const { items } = JSON.parse(saved)
        if (Array.isArray(items)) {
          items.forEach((item: CartItem) => {
            for (let i = 0; i < item.cantidad; i++) {
              dispatch({ type: 'ADD_ITEM', producto: item.producto })
            }
          })
        }
      } catch { /* ignore parse errors */ }
    }
    setCartLoaded(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('animalandia-cart', JSON.stringify({ items: state.items }))
  }, [state.items])

  const totalItems = state.items.reduce((sum, item) => sum + item.cantidad, 0)
  const totalPrice = state.items.reduce((sum, item) => {
    const price = item.producto.descuento_pct
      ? item.producto.precio_mxn * (1 - item.producto.descuento_pct / 100)
      : item.producto.precio_mxn
    return sum + price * item.cantidad
  }, 0)

  return (
    <CartContext.Provider
      value={{
        state,
        cartLoaded,
        addItem: (producto) => dispatch({ type: 'ADD_ITEM', producto }),
        removeItem: (productoId) => dispatch({ type: 'REMOVE_ITEM', productoId }),
        updateQuantity: (productoId, cantidad) => dispatch({ type: 'UPDATE_QUANTITY', productoId, cantidad }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
        toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
        openCart: () => dispatch({ type: 'OPEN_CART' }),
        closeCart: () => dispatch({ type: 'CLOSE_CART' }),
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
