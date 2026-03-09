import { create } from 'zustand'
import { ListaCompra } from '../../domain/entities/ListaCompra'

interface AppState {
  listas: ListaCompra[]
  listaActual: ListaCompra | null
  setListas: (listas: ListaCompra[]) => void
  setListaActual: (lista: ListaCompra | null) => void
  actualizarListaEnStore: (lista: ListaCompra) => void
  eliminarListaDelStore: (id: number) => void
  agregarListaAlStore: (lista: ListaCompra) => void
}

export const useAppStore = create<AppState>((set) => ({
  listas: [],
  listaActual: null,

  setListas: (listas) => set({ listas }),
  setListaActual: (lista) => set({ listaActual: lista }),

  actualizarListaEnStore: (lista) =>
    set((state) => ({
      listas: state.listas.map((l) => (l.id === lista.id ? lista : l)),
      listaActual: state.listaActual?.id === lista.id ? lista : state.listaActual,
    })),

  eliminarListaDelStore: (id) =>
    set((state) => ({
      listas: state.listas.filter((l) => l.id !== id),
    })),

  agregarListaAlStore: (lista) =>
    set((state) => ({
      listas: [lista, ...state.listas],
    })),
}))
