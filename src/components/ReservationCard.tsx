import { useEffect, useState } from "react";
import type { RoomUsage } from "../utils/types";

interface ReservationCardProps {
  header: string;
  totalValue: number | undefined;
  roomsUsage: RoomUsage[];
  type: string;
}

export const ReservationCard = ({
  header,
  totalValue,
  roomsUsage,
  type,
}: ReservationCardProps) => {
  const [valueColor, setValueColor] = useState<string>();

  useEffect(() => {
    if (type === "pending") {
      setValueColor("text-[var(--primary)]");
    } else if (type === "active") {
      setValueColor("text-[var(--accent)]");
    } else {
      setValueColor("text-[var(--dark-secondary)]");
    }
  }, [valueColor, type]);

  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = new Date();
  const currentMonth = month[date.getMonth()];
  const currentYear = new Date().getFullYear();

  let gridColumns = "";
  for (let i = 0; i < roomsUsage?.length; i++) {
    gridColumns += "1fr";

    if (i + 1 < roomsUsage.length) gridColumns += "_";
  }
  return (
    <>
      <div className="bg-white rounded-xl p-4 border-gray-200 border w-full flex flex-col justify-center items-center h-full">
        <div className="flex flex-col items-center mb-4">
          <div className="font-bold text-2xl text-[var(--dark-primary)]">
            {header}
          </div>
          <div className="flex gap-1 italic">
            {type !== "total" ? (
              <div>
                <span>{currentMonth}</span>
              </div>
            ) : (
              ""
            )}
            <span>{currentYear}</span>
          </div>
        </div>
        <div className={`font-black text-6xl mb-4 ${valueColor}`}>
          {totalValue}
        </div>
        <div className={`grid grid-cols-[${gridColumns}] text-sm gap-4`}>
          {roomsUsage?.map((r) => (
            <div
              key={r.room_id}
              className={`flex gap-2 ${
                r.room_id === 3
                  ? "text-[#2E8B57]"
                  : r.room_id === 1
                  ? "text-[#FF6347]"
                  : "text-[#8A38F5]"
              }`}
            >
              <span
                className={`font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                  r.room_id === 3
                    ? "bg-[#2E8B5754] "
                    : r.room_id === 1
                    ? "bg-[#FF634754]"
                    : "bg-[#8A38F554]"
                }`}
              >
                {r.total_usage}
              </span>
              <span>{r.room_name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
