import { useGo, useTable } from "@refinedev/core";
import type {
  Reservation,
  RoomUsage,
  UsageByPurpose,
  UserCount,
} from "./pageUtils/types";
import supabase from "../config/supabaseClient";
import { useEffect, useState } from "react";
import { ReservationCard } from "../components/ReservationCard";
import { Loader, MantineProvider } from "@mantine/core";
import { NoResults } from "../components/NoResults";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
export const AdminDashboard = () => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
  );

  const gridColumns = "grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr]";

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [records, setRecords] = useState<Reservation[]>();
  const [pendingRoomUsage, setPendingRoomUsage] = useState<RoomUsage[]>();
  const [activeRoomUsage, setActiveRoomUsage] = useState<RoomUsage[]>();
  const [totalRoomUsage, setTotalRoomUsage] = useState<RoomUsage[]>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userCount, setUserCount] = useState<UserCount[]>([]);
  const [usageByPurpose, setUsageByPurpose] = useState<UsageByPurpose[]>([]);
  const [totalPending, setTotalPending] = useState<number>();
  const [totalActive, setTotalActive] = useState<number>();
  const [chartUserCount, setChartUserCount] = useState<UserCount[]>([]);
  const [chartUsageByPurpose, setChartUsageByPurpose] = useState<
    UsageByPurpose[]
  >([]);

  const rooms = [...new Set(usageByPurpose.map((r) => r.room_name))];
  const purposes = [...new Set(usageByPurpose.map((r) => r.purpose))];

  // Route to reservation Tab
  const go = useGo();

  // Fetch the total records from the database
  const {
    result: totalRecords,
    tableQuery: { isLoading: reservationIsLoading },
  } = useTable<Reservation>({
    resource: "reservation",
  });

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Fetch total records
  const {
    result: monthReservation,
    tableQuery: { isLoading: monthReservationsIsLoading },
  } = useTable<Reservation>({
    resource: "all_reservation",
    filters: {
      permanent: [
        {
          field: "created_at",
          operator: "gte",
          value: firstDay.toISOString(),
        },
        {
          field: "created_at",
          operator: "lte",
          value: lastDay.toISOString(),
        },
      ],
    },
  });

  // Fetch all the data from the all_reservation table
  const {
    result,
    tableQuery: { isLoading: adminReservationIsLoading, refetch },
  } = useTable<Reservation>({
    resource: "all_reservation",
    pagination: { currentPage: 1, pageSize: 6 },
    sorters: { initial: [{ field: "id", order: "asc" }] },
    filters: {
      permanent: [
        {
          field: "status",
          operator: "contains",
          value: "Pending",
        },
      ],
      initial: [
        {
          field: "reservation_code",
          operator: "contains",
          value: "",
        },
      ],
    },
    queryOptions: {
      enabled: true,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60,
    },
  });

  useEffect(() => {
    if (monthReservation) setRecords(monthReservation.data);
  }, [monthReservation]);

  // Realtime Update
  useEffect(() => {
    async function fetchAllData() {
      const [
        { data: pendingData },
        { data: activeData },
        { data: totalData },
        { data: userData },
        { data: purposeData },
        { data: totalPendingData },
        { data: totalActiveData },
      ] = await Promise.all([
        supabase.rpc("admin_get_room_usage", { p_status: "Pending" }),
        supabase.rpc("admin_get_room_usage", { p_status: "Approved" }),
        supabase.rpc("admin_get_all_room_usage"),
        supabase.rpc("admin_get_user_counts"),
        supabase.rpc("admin_get_room_usage_per_purpose"),
        supabase.rpc("admin_get_total_reservation_by_month", {
          p_status: "Pending",
        }),
        supabase.rpc("admin_get_total_reservation_by_month", {
          p_status: "Approved",
        }),
      ]);

      // Update ALL state at once
      setPendingRoomUsage(pendingData || []);
      setActiveRoomUsage(activeData || []);
      setTotalRoomUsage(totalData || []);
      setUserCount(userData || []);
      setUsageByPurpose(purposeData || []);
      setTotalPending(totalPendingData || []);
      setTotalActive(totalActiveData || []);
    }

    function onUpdate() {
      refetch();
      fetchAllData();
    }

    console.log("Updating");

    window.addEventListener("reservation-updated", onUpdate);
    fetchAllData();
    return () => window.removeEventListener("reservation-updated", onUpdate);
  }, [refetch]);

  useEffect(() => {
    async function fetchAllData() {
      setIsLoadingData(true);
      const [
        { data: pendingData },
        { data: activeData },
        { data: totalData },
        { data: userData },
        { data: purposeData },
        { data: totalPendingData },
        { data: totalActiveData },
      ] = await Promise.all([
        supabase.rpc("admin_get_room_usage", { p_status: "Pending" }),
        supabase.rpc("admin_get_room_usage", { p_status: "Approved" }),
        supabase.rpc("admin_get_all_room_usage"),
        supabase.rpc("admin_get_user_counts"),
        supabase.rpc("admin_get_room_usage_per_purpose"),
        supabase.rpc("admin_get_total_reservation_by_month", {
          p_status: "Pending",
        }),
        supabase.rpc("admin_get_total_reservation_by_month", {
          p_status: "Approved",
        }),
      ]);

      // Update ALL state at once
      setPendingRoomUsage(pendingData || []);
      setActiveRoomUsage(activeData || []);
      setTotalRoomUsage(totalData || []);
      setUserCount(userData || []);
      setUsageByPurpose(purposeData || []);
      setTotalPending(totalPendingData || []);
      setTotalActive(totalActiveData || []);
    }

    fetchAllData();
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    if (
      !reservationIsLoading &&
      !adminReservationIsLoading &&
      !monthReservationsIsLoading &&
      !isLoadingData
    ) {
      setChartUserCount(userCount);
      setChartUsageByPurpose(usageByPurpose);
    }
  }, [
    reservationIsLoading,
    adminReservationIsLoading,
    userCount,
    usageByPurpose,
    monthReservationsIsLoading,
    isLoadingData,
  ]);

  useEffect(() => {
    if (result) setReservations(result.data);
  }, [result]);

  // If the data are still loading, it will display the loading state
  if (
    reservationIsLoading ||
    adminReservationIsLoading ||
    monthReservationsIsLoading ||
    isLoadingData
  ) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  // Format data (e.g. 15:00:00+00) to human readable (3:00 PM)
  function formatTime(time: string): string {
    const date = new Date(`2001-09-11T${time.replace("+00", "Z")}`); // Dummy date, will be removed anyway

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  }

  const columns = [
    {
      header: "Code",
      accessor: "reservation_code" as keyof Reservation,
    },
    {
      header: "User",
      accessor: "full_name" as keyof Reservation,
    },
    {
      header: "Purpose",
      accessor: "purpose" as keyof Reservation,
    },
    {
      header: "Date(s)",
      accessor: (item: Reservation) =>
        item.schedules
          ?.map((s: { date: string }) =>
            new Date(s.date).toLocaleDateString("en-us", {
              month: "short",
              day: "numeric",
            })
          )
          .join(", ") || "—",
    },
    {
      header: "Start",
      accessor: (item: Reservation) =>
        item.schedules && item.schedules.length > 0
          ? formatTime(item.schedules[0].start_time)
          : "-",
    },
    {
      header: "End",
      accessor: (item: Reservation) =>
        item.schedules && item.schedules.length > 0
          ? formatTime(item.schedules[0].end_time)
          : "-",
    },
  ];

  return (
    <>
      {records &&
      pendingRoomUsage &&
      activeRoomUsage &&
      totalRoomUsage &&
      reservations &&
      userCount &&
      usageByPurpose ? (
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 w-full h-full">
          {/* First Column - Reservations */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="w-full">
                <ReservationCard
                  header="Pending Reservations"
                  totalValue={totalPending}
                  roomsUsage={pendingRoomUsage}
                  type="pending"
                />
              </div>
              <div className="w-full">
                <ReservationCard
                  header="Active Reservations"
                  totalValue={totalActive}
                  roomsUsage={activeRoomUsage}
                  type="active"
                />
              </div>
              <div className="w-full">
                <ReservationCard
                  header="Total Reservations"
                  totalValue={totalRecords.total}
                  roomsUsage={totalRoomUsage}
                  type="total"
                />
              </div>
            </div>
            <div className="border-gray-200 border flex flex-col bg-white rounded-xl h-full">
              <div className="flex justify-between items-center p-4">
                <span className="text-2xl text-(--primary) font-bold">
                  Reservation
                </span>
                <button
                  className="text-white text-medium bg-(--primary) cursor-pointer p-2 px-4 rounded hover:bg-(--primary-hover) transition-colors duration-200"
                  onClick={() =>
                    go({
                      to: `/reservation`,
                    })
                  }
                >
                  View Reservations
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="border-b border-gray-200 ">
                    <tr className={`grid ${gridColumns} items-center p-4 `}>
                      {columns.map((col, index) => (
                        <th
                          key={index}
                          className="font-bold flex gap-2 items-center"
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {reservations.length === 0 ? (
                      <NoResults
                        subheading={
                          "We couldn’t find any reservation at the moment."
                        }
                      />
                    ) : (
                      reservations.map((item, index) => (
                        <tr
                          key={index}
                          className={`grid px-4 items-center border-gray-200
                    ${gridColumns} ${
                            index !== reservations.length - 1 && "border-b "
                          }`}
                        >
                          {columns.map((col, i) => {
                            const value =
                              typeof col.accessor === "function"
                                ? col.accessor(item)
                                : (item[col.accessor] as React.ReactNode);
                            return (
                              <td key={i} className="py-4">
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* 2nd Column - User Type & Room Utilization Purpose*/}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white p-4 py-8 border-gray-200 border rounded-xl w-full h-max text-center">
              <h2 className="text-2xl font-bold text-(--dark-primary) mb-2">
                Total Users
              </h2>
              <Pie
                data={{
                  labels: chartUserCount.map((u) => u.user_type),
                  datasets: [
                    {
                      data: chartUserCount.map((u) => u.total),
                      backgroundColor: ["#F6C501", "#0070CC", "#073066"],
                    },
                  ],
                }}
                options={{ animation: { duration: 1000 } }}
              />
            </div>
            <div className="bg-white p-4 border-gray-200 border rounded-xl w-full text-center h-full grid place-items-center">
              <div>
                <h2 className="text-2xl font-bold text-(--dark-primary) mb-2">
                  Room Utilization Purpose
                </h2>
                <Bar
                  data={{
                    labels: rooms,
                    datasets: purposes.map((purpose, index) => ({
                      label: purpose,
                      data: rooms.map((room) => {
                        const record = chartUsageByPurpose.find(
                          (r) => r.room_name === room && r.purpose === purpose
                        );
                        return record ? record.total_usage : 0;
                      }),
                      backgroundColor: [
                        "#F6C501",
                        "#0070CC",
                        "#073066",
                        "#FF6B6B",
                      ][index % 4],
                    })),
                  }}
                  options={{ animation: { duration: 1000 } }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MantineProvider>
          <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        </MantineProvider>
      )}
    </>
  );
};
