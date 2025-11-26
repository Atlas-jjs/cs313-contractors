import React, { useEffect, useState, type PropsWithChildren } from "react";
import { Menu } from "./Menu";
import { Breadcrumb } from "./Breadcrumb";
import { UserInfo } from "../UserInfo";
import { MenuContext } from "./MenuContext";
import { useGetIdentity, useUpdate } from "@refinedev/core";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const [sidebarState, setSidebarState] = useState(true);

  // SWITCH TO ADMIN (FOR TESTING)
  const { data, isLoading } = useGetIdentity();
  const [userType, setUserType] = useState<string>();
  useEffect(() => {
    if (data) setUserType(data.type);
  }, [data]);
  const { mutateAsync } = useUpdate();
  const switchType = async () => {
    if (!userType) return;

    const newType =
      userType === "Student" || userType === "Instructor" ? "Admin" : "Student";

    await mutateAsync({
      resource: "user",
      id: data.user.id,
      values: { type: newType },
    });

    window.location.reload();
  };

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
              {/* FOR TESTING */}
              {!isLoading && (
                <button
                  className="px-4 py-2 bg-red-400 text-white rounded cursor-pointer hover:bg-red-500 transition-all duration-300"
                  onClick={switchType}
                  disabled={isLoading}
                >
                  Switch to
                  {data?.type === "Student" || data?.type === "Instructor"
                    ? " Admin"
                    : " Student"}
                </button>
              )}
              <UserInfo />
            </div>
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </MenuContext>
    </>
  );
};
