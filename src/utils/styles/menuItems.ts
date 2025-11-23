import { FaRegCalendar } from "react-icons/fa";
import { GrCheckboxSelected } from "react-icons/gr";
import { FaRegClock } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdOutlineSensorDoor } from "react-icons/md";
import { AiOutlineSound } from "react-icons/ai";
import { LuMail } from "react-icons/lu";
import { MdOutlineDashboard } from "react-icons/md";

import type { IconType } from "react-icons/lib";

export interface MenuItem {
  label: string;
  to: string;
  icon?: IconType;
}

export const getMenuItems = (type: string): MenuItem[] => {
  switch (type) {
    case "Admin":
      return [
        {
          label: "Dashboard",
          to: "/manage",
          icon: MdOutlineDashboard,
        },
        {
          label: "Calendar",
          to: "/calendar",
          icon: FaRegCalendar,
        },
        {
          label: "Reservation",
          to: "/reservation",
          icon: GrCheckboxSelected,
        },
        {
          label: "History",
          to: "/history",
          icon: FaRegClock,
        },
        { label: "User", to: "/user", icon: FiUsers },
        {
          label: "Room",
          to: "/room",
          icon: MdOutlineSensorDoor,
        },
        {
          label: "Announcement",
          to: "/announcement",
          icon: AiOutlineSound,
        },
        { label: "Inbox", to: "/inbox", icon: LuMail },
      ];

    case "Instructor":
      return [
        { label: "Dashboard", to: "/instructor" },
        { label: "My Schedule", to: "/calendar" },
      ];

    case "Student":
      return [
        {
          label: "Dashboard",
          // ! Fix proper routing
          to: "/student",
          icon: MdOutlineDashboard,
        },
        { label: "Calendar", to: "/calendar", icon: FaRegCalendar },
        { label: "Room", to: "/room", icon: MdOutlineSensorDoor },
      ];

    default:
      return [];
  }
};
