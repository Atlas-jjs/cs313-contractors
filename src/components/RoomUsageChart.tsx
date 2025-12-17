import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import supabase from "../config/supabaseClient";
import { Select } from "@mantine/core";

export interface HoursPerRoom {
  period_start: string;
  room_id: number;
  total_hours_used: number;
}

interface RoomUsageChartProps {
  rooms: string[];
  initialRange?: string;
}

export const RoomUsageChart = ({ rooms }: RoomUsageChartProps) => {
  const [roomRange, setRoomRange] = useState<
    "Week" | "Month" | "Quarter" | "Year"
  >("Week");
  const [chartRoomUsage, setChartRoomUsage] = useState<HoursPerRoom[]>([]);

  //   Can accommodate 5 rooms with different colors
  const roomColors = ["#F6C501", "#0070CC", "#073066", "#FF6B6B", "#4CAF50"];
  const parsedNow = new Date().toISOString().split("T")[0];

  const totalHours = chartRoomUsage.reduce(
    (sum, room) => sum + room.total_hours_used,
    0
  );

  const roomPercentages = chartRoomUsage.map((room) => ({
    room_id: room.room_id,
    percentage: totalHours
      ? Math.round((room.total_hours_used / totalHours) * 100)
      : 0,
    total_hours: room.total_hours_used,
  }));

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

    function onUpdate() {
      fetchRoomHourUsage();
    }

    window.addEventListener("reservation-updated", onUpdate);
    fetchRoomHourUsage();

    return () => {
      isMounted = false;
      window.removeEventListener("reservation-updated", onUpdate);
    };
  }, [parsedNow, roomRange]);

  return (
    <div className="bg-white w-full h-full border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-(--dark-primary) mb-2">
          Total Room Utilization (Hours)
        </h2>
        <Select
          data={["Week", "Month", "Quarter", "Year"]}
          value={roomRange}
          onChange={(val: string | null) => {
            if (
              val === "Week" ||
              val === "Month" ||
              val === "Quarter" ||
              val === "Year"
            ) {
              setRoomRange(val);
            }
          }}
        />
      </div>
      <div>
        <div className="w-full max-h-[600px] flex items-center justify-center">
          <Bar
            data={{
              labels: rooms,
              datasets: [
                {
                  label: "Total Hours Used",
                  data: chartRoomUsage?.map((d) => d.total_hours_used),
                  backgroundColor: rooms.map(
                    (_, i) => roomColors[i % roomColors.length]
                  ),
                },
              ],
            }}
            options={{
              animation: { duration: 1000 },
              plugins: {
                legend: { display: true, position: "top" },
                title: {
                  display: true,
                  text: `Room Usage on ${parsedNow}`,
                },
              },
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Hours Used" },
                },
                x: { title: { display: true, text: "Room" } },
              },
            }}
          />
        </div>
        <div
          className="grid lg:gap-8 gap-4"
          style={{
            gridTemplateColumns: `repeat(${roomPercentages.length}, minmax(0, 1fr))`,
          }}
        >
          {roomPercentages.map((room, index) => (
            <div
              key={room.room_id}
              className="bg-white p-4 rounded-xl shadow flex flex-col items-center"
            >
              <h3 className="text-lg font-bold">{rooms[index]}</h3>
              <p className="text-2xl font-semibold">{room.percentage}%</p>
              <span className="text-gray-500">{room.total_hours} hours</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
