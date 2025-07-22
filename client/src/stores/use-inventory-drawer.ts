import { create } from "zustand";

type DrawerType = "view" | "adjust" | "reorder" | null;

interface InventoryDrawerState {
    drawerType: DrawerType;
    selectedItem: InventoryItemResponseDto | null;
    lastClosedDrawer: DrawerType;
    openDrawer: (type: DrawerType, item: InventoryItemResponseDto) => void;
    closeDrawer: () => void;
  }

  export const useInventoryDrawerStore = create<InventoryDrawerState>((set) => ({
    drawerType: null,
    selectedItem: null,
    lastClosedDrawer: null,
    openDrawer: (type, item) => set({
      drawerType: type,
      selectedItem: item,
      lastClosedDrawer: null
    }),
    closeDrawer: () => set((state) => ({
      drawerType: null,
      selectedItem: null,
      lastClosedDrawer: state.drawerType 
    })),
  }));
