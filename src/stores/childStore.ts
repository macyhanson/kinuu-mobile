import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChildProfile } from '@/types';

interface ChildState {
  children: ChildProfile[];
  activeChild: ChildProfile | null;

  setChildren: (children: ChildProfile[]) => Promise<void>;
  addChild: (child: ChildProfile) => Promise<void>;
  updateChild: (id: string, updates: Partial<ChildProfile>) => Promise<void>;
  setActiveChild: (id: string) => void;
  loadFromStorage: () => Promise<void>;
}

const CHILDREN_KEY = '@brainyact:children';
const ACTIVE_CHILD_KEY = '@brainyact:activeChild';

export const useChildStore = create<ChildState>((set, get) => ({
  children: [],
  activeChild: null,

  setChildren: async (children) => {
    await AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
    set({ children });
  },

  addChild: async (child) => {
    const children = [...get().children, child];
    await AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
    set({ children });
  },

  updateChild: async (id, updates) => {
    const children = get().children.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    await AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
    const activeChild = get().activeChild;
    set({
      children,
      activeChild: activeChild?.id === id ? { ...activeChild, ...updates } : activeChild,
    });
  },

  setActiveChild: (id) => {
    const child = get().children.find((c) => c.id === id) ?? null;
    AsyncStorage.setItem(ACTIVE_CHILD_KEY, id);
    set({ activeChild: child });
  },

  loadFromStorage: async () => {
    const [childrenRaw, activeId] = await Promise.all([
      AsyncStorage.getItem(CHILDREN_KEY),
      AsyncStorage.getItem(ACTIVE_CHILD_KEY),
    ]);
    const children: ChildProfile[] = childrenRaw ? JSON.parse(childrenRaw) : [];
    const activeChild = activeId ? (children.find((c) => c.id === activeId) ?? null) : null;
    set({ children, activeChild });
  },
}));
