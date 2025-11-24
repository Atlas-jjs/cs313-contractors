import { useEffect, useState } from "react";
import type { RoomUsage } from "../utils/types";

interface ReservationCardProps {
  header: string;
  totalValue: number | undefined;
  roomsUsage: RoomUsage[];
  type: string;
}

// Can accommodate 10 rooms
const roomColors: Record<number, string> = {
  1: "text-[#2E8B57]",
  2: "text-[#FF6347]",
  3: "text-[#8A38F5]",
  4: "text-[#272EF5]",
  5: "text-[#FFA500]",
  6: "text-[#20B2AA]",
  7: "text-[#FF69B4]",
  8: "text-[#9400D3]",
  9: "text-[#00CED1]",
  10: "text-[#FF4500]",
};

const bgRoomColors: Record<number, string> = {
  1: "bg-[#2E8B5754]",
  2: "bg-[#FF634754]",
  3: "bg-[#8A38F554]",
  4: "bg-[#272EF554]",
  5: "bg-[#FFA50054]",
  6: "bg-[#20B2AA54]",
  7: "bg-[#FF69B454]",
  8: "bg-[#9400D354]",
  9: "bg-[#00CED154]",
  10: "bg-[#FF450054]",
};
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

  return (
    <>
      <div className="bg-white rounded-xl p-4 border-gray-200 border w-full flex flex-col justify-center items-center h-full">
        <div className="flex flex-col items-center mb-4">
          <div className="font-bold text-2xl text-(--dark-primary)">
            {header}
          </div>
          <div className="flex gap-1 italic">
            {type !== "total" && <span>{currentMonth}</span>}
            <span>{currentYear}</span>
          </div>
        </div>
        <div className={`font-black text-6xl mb-4 ${valueColor}`}>
          {totalValue && totalValue > 0 ? totalValue : 0}
        </div>
        <div
          className={`grid w-full text-sm gap-4`}
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          }}
        >
          <div
            className="grid w-full text-sm gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            }}
          >
            {roomsUsage?.map((r, index) => {
              const textColor = roomColors[index + 1];
              const bgColor = bgRoomColors[index + 1];

              return (
                <div
                  key={r.room_id}
                  className={`flex gap-2 ${textColor} items-center`}
                >
                  <span
                    className={`font-bold w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${bgColor}`}
                  >
                    {r.total_usage}
                  </span>
                  <span>{r.room_name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
