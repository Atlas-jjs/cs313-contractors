import { createContext } from "react";

interface MenuContextType {
  sidebarState: boolean;
  setSidebarState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MenuContext = createContext<MenuContextType>({
  sidebarState: false,
  setSidebarState: () => {},
});
