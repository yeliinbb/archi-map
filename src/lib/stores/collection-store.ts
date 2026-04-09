import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Collection {
  id: string;
  name: string;
  buildingIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface CollectionState {
  collections: Collection[];
  saveCollection: (name: string, buildingIds: string[]) => string;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collections: [],

      saveCollection: (name, buildingIds) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        set((state) => ({
          collections: [
            { id, name, buildingIds, createdAt: now, updatedAt: now },
            ...state.collections,
          ],
        }));
        return id;
      },

      deleteCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),

      renameCollection: (id, name) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, name, updatedAt: Date.now() } : c,
          ),
        })),
    }),
    {
      name: "archi-collections",
      version: 1,
    },
  ),
);
