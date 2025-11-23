import { useGetIdentity, useLogout } from "@refinedev/core";
import { NavLink } from "react-router";
import { useEffect, useState } from "react";

// React Icons
import { RxExit } from "react-icons/rx";
import { BsLayoutSidebar, BsLayoutSidebarReverse } from "react-icons/bs";

// Styles
import { tw } from "../../utils/styles/styles";
import { getMenuItems } from "../../utils/styles/menuItems";
import sluLogo from "../../assets/images/slu-logo.png";

export const Menu = () => {
  const [type, setType] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  // Refine dev
  const { data, isLoading } = useGetIdentity();
  const { mutate: logout, isPending } = useLogout();

  // Set user type
  useEffect(() => {
    if (isLoading) return;

    if (!data.user?.id) {
      console.log("No user found, redirecting...");
      return;
    }

    setType(data.type);
  }, [data, isLoading]);

  // Fetch menu items base from user type
  const menuItems = getMenuItems(type);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-40 flex flex-col bg-white h-dvh p-4 justify-between shadow-md duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        sm:static sm:translate-x-0 sm:shadow-none
        ${isOpen ? tw.sidebar : tw.sidebarOpen}`}
      >
        <div className="flex flex-col gap-4 justify-between">
          {/* Desktop Toggle */}
          <div
            className="hidden sm:flex justify-end text-[var(--primary)] cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <BsLayoutSidebarReverse /> : <BsLayoutSidebar />}
          </div>

          {/* Logo & Title */}
          <div
            className={`flex items-center transition-all duration-300 ${
              isOpen ? "gap-2" : "gap-0"
            }`}
          >
            <img
              src={sluLogo}
              alt="Saint Louis University Logo"
              className="w-12 flex-shrink-0"
            />
            <h2
              className={`transition-all duration-150 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              Campus Reservation System
            </h2>
          </div>

          <hr className="text-[var(--ui-border)]" />

          {/* Menu Items */}
          <ul className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to ?? ""}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-md cursor-pointer flex items-center leading-0 transition-all duration-300
                    ${isOpen ? "gap-x-2" : "gap-x-0"}  
                    ${isActive ? tw.isActiveTab : tw.isNotActiveTab}`
                  }
                >
                  <div className="flex-shrink-0">
                    {item.icon && <item.icon size={"1.25rem"} />}
                  </div>
                  <span
                    className={`transition-all duration-150 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <button
          disabled={isPending}
          onClick={() => logout()}
          className={`cursor-pointer flex items-center px-3.5 bg-[var(--dark-primary)] py-2 rounded text-white hover:bg-[#333333] transition-all duration-200 ${
            isOpen ? "gap-2" : "gap-0"
          }`}
        >
          <div className="flex-shrink-0">
            <RxExit size={"1.25rem"} />
          </div>
          <span
            className={`transition-all duration-200 leading-0 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Logout
          </span>
        </button>
      </nav>

      {/* Attached Mobile Toggle */}
      <button
        className={`
          fixed top-4 z-50 bg-[var(--primary)] p-2 rounded-r-xl
          transition-all duration-300 ease-in-out
          sm:hidden
          ${isOpen ? "left-54" : "left-0"}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <BsLayoutSidebarReverse size={20} color="var(--primary-white)" />
        ) : (
          <BsLayoutSidebar size={20} color="var(--primary-white)" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};
