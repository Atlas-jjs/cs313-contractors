// Refine Dev Class
import { useTable, useUpdate } from "@refinedev/core";

// React Import
import { useEffect, useState } from "react";

// Mantine Import
import { Loader, MantineProvider, ActionIcon } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { DataTable } from "../../components/table/DataTable";
import type { Reservation } from "../../utils/types";
import { Search } from "../../components/Search";
import { FaXmark } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { Filter } from "../../components/Filter";
import supabase from "../../config/supabaseClient";
import { notifyError, notifySuccess } from "../../utils/notifcations";
// import supabase from "../../config/supabaseClient";

export const ReservationList: React.FC = () => {
  const gridColumns = "grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr]";

  const [searchCode, setSearchCode] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [debouncedCode] = useDebouncedValue(searchCode, 150);
  const [debouncedUser] = useDebouncedValue(searchUser, 150);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { mutateAsync } = useUpdate();

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
    resource: "admin_reservation",
    pagination: { currentPage: 1, pageSize: 10 },
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
    if (result) setReservations(result.data);
  }, [result]);

  useEffect(() => {
    setFilters([
      {
        field: "reservation_code",
        operator: "contains",
        value: debouncedCode,
      },
      {
        field: "full_name",
        operator: "contains",
        value: debouncedUser,
      },
    ]);
    refetch();
  }, [debouncedCode, debouncedUser]);

  // Fetching Data
  if (isLoading && reservations.length === 0) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  const handleAccept = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc("approve_reservation", {
        p_reservation_id: id,
      });

      const result = JSON.parse(data);

      if (result.status !== "success" || error) {
        notifyError({
          title: "Failed to Approve Reservation",
          message: result.message,
        });
      } else {
        notifySuccess({
          title: "Reservation Approved",
          message: result.message,
        });
      }
    } catch (error) {
      notifyError({
        title: "System Error",
        message: "Something went wrong...",
      });
      console.error(error);
    }
    refetch();
  };

  const handleDenied = async (id: string) => {
    try {
      await mutateAsync({
        resource: "reservation",
        id: id,
        values: {
          status: "Denied",
        },
      });

      notifySuccess({
        title: "Reservation Denied",
        message: "The reservation status has been updated successfully.",
      });
    } catch (error) {
      notifyError({
        title: "Failed to update reservation",
        message: "Something went wrong.",
      });
      console.error(error);
    }

    refetch();
  };

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
      header: "User",
      accessor: "full_name" as keyof Reservation,
      action: (
        <div>
          <Search
            placeholder="Search user"
            data={[...new Set(reservations.map((r) => r.full_name))]}
            onChange={(value) => setSearchUser(value)}
            value={searchUser}
          />
          <Filter onClick={() => onSort("full_name")} />
        </div>
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

  return (
    <>
      <MantineProvider>
        <DataTable
          data={reservations}
          gridColumns={gridColumns}
          columns={columns}
          isLoading={isLoading}
          currentPage={currentPage}
          pageCount={pageCount}
          onPrevious={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          onNext={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
          onPage={(page) => setCurrentPage(page)}
          renderActions={(reservation) => (
            <div className="flex gap-2">
              <ActionIcon
                title="Approve reservation"
                color="green"
                onClick={() => {
                  handleAccept(reservation.id);
                }}
              >
                <FaCheck />
              </ActionIcon>
              <ActionIcon
                title="Deny reservation"
                color="red"
                onClick={() => {
                  handleDenied(reservation.id);
                }}
              >
                <FaXmark />
              </ActionIcon>
            </div>
          )}
          emptyMessage="We couldn’t find any reservation at the moment."
        />
      </MantineProvider>
    </>
  );
};
