import React, { useState, type PropsWithChildren } from "react";
import { Menu } from "./Menu";
import { Breadcrumb } from "./Breadcrumb";
import { UserInfo } from "../UserInfo";
import { MenuContext } from "./MenuContext";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const [sidebarState, setSidebarState] = useState(true);

  return (
    <>
      <MenuContext value={{ sidebarState, setSidebarState }}>
        <div className="flex gap-6 w-full min-h-dvh h-auto bg-[#EEEEEE]">
          <div className="fixed z-9999">
            <Menu />
          </div>
          <div
            className={`content w-full h-full p-8 flex flex-col gap-8 ml-0 duration-300 transition-all ${
              sidebarState !== false
                ? "ml-0 sm:ml-[220px]"
                : "ml-0 sm:ml-[75px]"
            } `}
          >
            <div className="flex justify-between w-full items-center">
              <Breadcrumb />
              <UserInfo />
            </div>
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </MenuContext>
    </>
  );
};
