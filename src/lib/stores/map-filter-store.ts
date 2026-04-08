import { create } from "zustand";
import type { Building } from "@/types";

interface MapFilterState {
  selectedCityIds: string[];
  selectedTagSlugs: string[];
  highlightedArchitectId: string | null;
  toggleCity: (cityId: string) => void;
  toggleTag: (tagSlug: string) => void;
  toggleHighlightArchitect: (architectId: string) => void;
  clearFilters: () => void;
  hasFilters: () => boolean;
  getFilteredBuildings: (buildings: Building[]) => Building[];
  syncFromUrl: (params: URLSearchParams) => void;
  toSearchParams: () => URLSearchParams;
}

export const useMapFilterStore = create<MapFilterState>((set, get) => ({
  selectedCityIds: [],
  selectedTagSlugs: [],
  highlightedArchitectId: null,

  toggleCity: (cityId) =>
    set((state) => ({
      selectedCityIds: state.selectedCityIds.includes(cityId)
        ? state.selectedCityIds.filter((id) => id !== cityId)
        : [...state.selectedCityIds, cityId],
    })),

  toggleTag: (tagSlug) =>
    set((state) => ({
      selectedTagSlugs: state.selectedTagSlugs.includes(tagSlug)
        ? state.selectedTagSlugs.filter((s) => s !== tagSlug)
        : [...state.selectedTagSlugs, tagSlug],
    })),

  toggleHighlightArchitect: (architectId) =>
    set((state) => ({
      highlightedArchitectId:
        state.highlightedArchitectId === architectId ? null : architectId,
    })),

  clearFilters: () =>
    set({ selectedCityIds: [], selectedTagSlugs: [], highlightedArchitectId: null }),

  hasFilters: () => {
    const { selectedCityIds, selectedTagSlugs } = get();
    return selectedCityIds.length > 0 || selectedTagSlugs.length > 0;
  },

  getFilteredBuildings: (buildings) => {
    const { selectedCityIds, selectedTagSlugs } = get();
    return buildings.filter((b) => {
      const cityMatch =
        selectedCityIds.length === 0 || selectedCityIds.includes(b.cityId);
      const tagMatch =
        selectedTagSlugs.length === 0 ||
        b.tags.some((t) => selectedTagSlugs.includes(t.slug));
      return cityMatch && tagMatch;
    });
  },

  syncFromUrl: (params) => {
    const city = params.get("city");
    const tag = params.get("tag");
    set({
      selectedCityIds: city ? city.split(",").filter(Boolean) : [],
      selectedTagSlugs: tag ? tag.split(",").filter(Boolean) : [],
    });
  },

  toSearchParams: () => {
    const { selectedCityIds, selectedTagSlugs } = get();
    const params = new URLSearchParams();
    if (selectedCityIds.length > 0) {
      params.set("city", selectedCityIds.join(","));
    }
    if (selectedTagSlugs.length > 0) {
      params.set("tag", selectedTagSlugs.join(","));
    }
    return params;
  },
}));
