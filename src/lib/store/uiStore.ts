import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UIState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  isLeadDetailOpen: boolean;
  setLeadDetailOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      selectedLeadId: null,
      setSelectedLeadId: (id) => set({ selectedLeadId: id }),
      isLeadDetailOpen: false,
      setLeadDetailOpen: (open) => set({ isLeadDetailOpen: open }),
    }),
    {
      name: 'linkbird-ui-storage',
    }
  )
);