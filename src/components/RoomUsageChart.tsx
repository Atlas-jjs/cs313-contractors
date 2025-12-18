import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import supabase from "../config/supabaseClient";
import { Select } from "@mantine/core";

export interface HoursPerRoom {
  name: string,
  period_start: string;
  room_id: number;
  total_hours_used: number;
}

export interface RoomUsageChartProps {
  range?: "Week" | "Month" | "Quarter" | "Year";
  disableSelect?: boolean;
}

const HOURS_PER_DAY = 10; // 7AM–5PM
const DAYS_PER_RANGE: Record<"Week" | "Month" | "Quarter" | "Year", number> = {
  Week: 5,
  Month: 22,
  Quarter: 66,
  Year: 220,
};

export const RoomUsageChart = ({ range, disableSelect }: RoomUsageChartProps) => {
  const [roomRange, setRoomRange] = useState(range || "Week");
  const [chartRoomUsage, setChartRoomUsage] = useState<HoursPerRoom[]>([]);

  const roomColors = ["#F6C501", "#0070CC", "#073066", "#FF6B6B", "#4CAF50"];
  const parsedNow = new Date().toISOString().split("T")[0];

  const availableHours = HOURS_PER_DAY * DAYS_PER_RANGE[roomRange];

  useEffect(() => {
    let isMounted = true;

    const fetchRoomHourUsage = async () => {
      const { data } = await supabase.rpc("admin_get_room_usage_hours", {
        p_date: parsedNow,
        p_range: roomRange?.toLowerCase(),
      });

      if (data && isMounted) {
        setChartRoomUsage(data || []);
      }
    };

    window.addEventListener("reservation-updated", fetchRoomHourUsage);
    fetchRoomHourUsage();

    return () => {
      isMounted = false;
      window.removeEventListener("reservation-updated", fetchRoomHourUsage);
    };
  }, [parsedNow, roomRange]);

  return (
    <div className="bg-white w-full h-full rounded-xl p-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-(--dark-primary) mb-2">
          Room Utilization ({roomRange})
        </h2>
        <Select
          data={Object.keys(DAYS_PER_RANGE)}
          value={roomRange}
          onChange={(val) => val && setRoomRange(val as keyof typeof DAYS_PER_RANGE)}
          disabled={disableSelect}
        />
      </div>
      <div>
        <div className="w-full max-h-[600px] flex items-center justify-center">
          <Bar
            data={{
              labels: chartRoomUsage.map((room) => room.name),
              datasets: [
                {
                  label: "Total Hours Used",
                  data: chartRoomUsage.map((d) => d.total_hours_used),
                  backgroundColor: chartRoomUsage.map(
                    (_, i) => roomColors[i % roomColors.length]
                  ),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: {
                  display: true,
                  text: `Room Usage on ${parsedNow}`,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Hours Used" },
                },
              },
            }}
          />
        </div>
        <div
          className="grid lg:gap-8 gap-4 mt-6"
          style={{
            gridTemplateColumns: `repeat(${chartRoomUsage.length}, minmax(0, 1fr))`,
          }}
        >
          {chartRoomUsage.map((room) => {
            const utilization = Math.round((room.total_hours_used / availableHours) * 100);
            return (
              <div
                key={room.room_id}
                className="bg-white p-4 rounded-xl shadow flex flex-col items-center"
              >
                <h3 className="text-lg font-bold">{room.name}</h3>
                <p
                  className={`text-2xl font-semibold ${
                    utilization >= 70
                      ? "text-[#7CFC00]"
                      : utilization >= 40
                        ? "text-[#ffcc00]"
                        : "text-[#cc3300]"
                  }`}
                >
                  {utilization}%
                </p>
                <span className="text-[#6a7282]">
                {room.total_hours_used.toFixed(1)} / {availableHours} hrs
              </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
