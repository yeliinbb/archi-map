import { create } from "zustand";

const MAX_SELECTION = 10;

interface SelectionState {
  selectedBuildingIds: string[];
  addBuilding: (id: string) => void;
  removeBuilding: (id: string) => void;
  toggleBuilding: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedBuildingIds: [],

  addBuilding: (id) =>
    set((state) => {
      if (
        state.selectedBuildingIds.includes(id) ||
        state.selectedBuildingIds.length >= MAX_SELECTION
      )
        return state;
      return { selectedBuildingIds: [...state.selectedBuildingIds, id] };
    }),

  removeBuilding: (id) =>
    set((state) => ({
      selectedBuildingIds: state.selectedBuildingIds.filter((bid) => bid !== id),
    })),

  toggleBuilding: (id) => {
    const { selectedBuildingIds, addBuilding, removeBuilding } = get();
    if (selectedBuildingIds.includes(id)) {
      removeBuilding(id);
    } else {
      addBuilding(id);
    }
  },

  clearSelection: () => set({ selectedBuildingIds: [] }),

  isSelected: (id) => get().selectedBuildingIds.includes(id),
}));
