import { useGetIdentity, useTable } from "@refinedev/core";
import { useEffect, useState } from "react";
import { DataTable } from "./../components/table/DataTable";
import type { Reservation } from "./pageUtils/types";
import { Loader, MantineProvider } from "@mantine/core";
import { Search } from "../components/Search";
import { Filter } from "../components/Filter";
import { useDebouncedValue } from "@mantine/hooks";

export const InstructorDashboard = () => {
  const { data: userData } = useGetIdentity();
  const [searchCode, setSearchCode] = useState("");
  const [debouncedCode] = useDebouncedValue(searchCode, 150);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // const { open } = useNotification();
  const {
    result,
    tableQuery: { isLoading, refetch },
    currentPage,
    setCurrentPage,
    pageCount,
    setFilters,
    sorters,
    setSorters,
  } = useTable<Reservation>({
    resource: "all_reservation",
    pagination: { currentPage: 1, pageSize: 9 },
    sorters: { initial: [{ field: "id", order: "asc" }] },
    filters: {
      permanent: [
        {
          field: "user_id",
          operator: "eq",
          value: userData.user.id,
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
    if (result) setReservations(result.data);
  }, [result]);

  useEffect(() => {
    setFilters([
      {
        field: "reservation_code",
        operator: "contains",
        value: debouncedCode,
      },
    ]);
    refetch();
  }, [debouncedCode]);

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

  const getSorter = (field: string) => {
    const sorter = sorters?.find((s) => s.field === field);

    if (sorter) return sorter.order;
  };

  const onSort = (field: string) => {
    const sorter = getSorter(field);
    setSorters(
      sorter === "desc"
        ? []
        : [
            {
              field,
              order: sorter === "asc" ? "desc" : "asc",
            },
          ]
    );
  };

  const columns = [
    {
      header: "Code",
      accessor: "reservation_code" as keyof Reservation,
      action: (
        <Search
          placeholder="Search reservation"
          data={reservations.map((r) => r.reservation_code)}
          onChange={(value) => setSearchCode(value)}
          value={searchCode}
        />
      ),
    },
    {
      header: "Purpose",
      accessor: "purpose" as keyof Reservation,
      action: <Filter onClick={() => onSort("purpose")} />,
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

  if (isLoading && reservations.length === 0) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  return (
    <div>
      {/* <button
        className="rounded p-2 bg-blue-400 px-4 cursor-pointer"
        onClick={() => {
          const id = notifyLoading({
            title: "Saving...",
            message: "Please wait while we process your request.",
          });

          setTimeout(() => {
            notifications.update({
              id,
              color: "green",
              title: "Done",
              message: "The operation completed successfully!",
              icon: <FaCheckCircle size={18} />,
              loading: false,
              autoClose: 2000,
            });
          }, 2000);
        }}
      >
        Test
      </button> */}
      <DataTable
        data={reservations}
        isLoading={isLoading}
        gridColumns="grid-cols-[1fr_1fr_1fr_1fr_1fr]"
        emptyMessage="You currently do not have any reservations"
        columns={columns}
        currentPage={currentPage}
        pageCount={pageCount}
        onPrevious={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        onNext={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
        onPage={(page) => setCurrentPage(page)}
      />
    </div>
  );
};
