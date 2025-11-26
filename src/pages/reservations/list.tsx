// Refine Dev Class
import {
  useGetIdentity,
  useGo,
  useTable,
  useUpdate,
  type CrudFilter,
} from "@refinedev/core";

// React Import
import { useEffect, useState } from "react";

// Mantine Import
import {
  Loader,
  MantineProvider,
  ActionIcon,
  Badge,
  Button,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { DataTable } from "../../components/table/DataTable";
import type { Reservation } from "../pageUtils/types";
import { Search } from "../../components/Search";
import { FaXmark } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { Filter } from "../../components/Filter";
import supabase from "../../config/supabaseClient";
import { notifyError, notifySuccess } from "../pageUtils/notifcations";
import { formatTime } from "../pageUtils/functions";
import { LuPencilLine } from "react-icons/lu";
import { FiSlash } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";

export const ReservationList: React.FC = () => {
  const [permanentFilter, setPermanentFilter] = useState<CrudFilter[] | null>(
    null
  );

  const gridColumns = "grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr]";

  // Identify which user type is currently logged in
  const [type, setType] = useState<string>("");
  const { data: user } = useGetIdentity();

  useEffect(() => {
    if (!user) return;

    setType(user.type);
    if (type === "Admin") {
      setPermanentFilter([
        {
          field: "status",
          operator: "contains",
          value: "Pending",
        },
      ]);
    } else {
      setPermanentFilter([
        {
          field: "user_id",
          operator: "eq",
          value: user.user.id,
        },
      ]);
    }
  }, [user, type]);

  const [searchCode, setSearchCode] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [debouncedCode] = useDebouncedValue(searchCode, 150);
  const [debouncedUser] = useDebouncedValue(searchUser, 150);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { mutateAsync } = useUpdate();
  const go = useGo();

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
    pagination: { currentPage: 1, pageSize: 10 },
    sorters: { initial: [{ field: "id", order: "asc" }] },
    filters: {
      permanent: permanentFilter ?? [],
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

  // Realtime
  useEffect(() => {
    function onUpdate() {
      refetch();
    }

    window.addEventListener("reservation-updated", onUpdate);
    return () => window.removeEventListener("reservation-updated", onUpdate);
  }, [refetch]);

  useEffect(() => {
    if (result) setReservations(result.data);
  }, [result, reservations]);

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

      console.log(result);

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

  const handleCancellation = async (id: string) => {
    try {
      await mutateAsync(
        {
          resource: "reservation",
          id: id,
          values: {
            status: "Cancelled",
          },
        },
        {
          onSuccess: () => {
            notifySuccess({
              title: "Reservation Cancelled",
              message: "The reservation has been cancelled successfully.",
            });

            go({ to: "/" });
          },
          onError: () => {
            notifyError({
              title: "Failed to cancel reservation",
              message: "An unexpected error occurred. Please try again later.",
            });
          },
        }
      );
    } catch (error) {
      notifyError({
        title: "Failed to cancel reservation",
        message: "An unexpected error occurred. Please try again later.",
      });
      console.error(error);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "green";
      case "Denied":
      case "Cancelled":
        return "red";
      case "Pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const userColumn = [
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
  ];

  const statusColumn = [
    {
      header: "Status",
      accessor: (reservation: Reservation) => (
        <div className={`w-fit`}>
          <Badge
            size="lg"
            variant="light"
            color={getStatusColor(reservation.status)}
          >
            {reservation.status}
          </Badge>
        </div>
      ),
      action: <Filter onClick={() => onSort("status")} />,
    },
  ];

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
    ...(type === "Admin" ? userColumn : []),
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
    ...(type !== "Admin" ? statusColumn : []),
  ];

  return (
    <>
      <MantineProvider>
        {type !== "Admin" && (
          <Button
            variant="filled"
            color="#073066"
            className="transition-all duration-300 hover:shadow-blue-300/40 hover:bg-(--primary-hover) mb-4"
            leftSection={<IoMdAdd size={18} />}
            onClick={() => go({ to: "create" })}
          >
            Add Reservation
          </Button>
        )}

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
          renderActions={(reservation) =>
            type === "Admin" ? (
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
            ) : type === "Student" &&
              reservation.status !== "Approved" &&
              reservation.status !== "Cancelled" &&
              reservation.status !== "Denied" ? (
              <div className="flex gap-2">
                <ActionIcon
                  title="Edit Reservation"
                  onClick={() =>
                    go({
                      to: `edit/${reservation?.id}`,
                    })
                  }
                >
                  <LuPencilLine />
                </ActionIcon>
                <ActionIcon
                  title="Cancel Reservation"
                  color="red"
                  onClick={() => handleCancellation(reservation?.id ?? "")}
                >
                  <FiSlash />
                </ActionIcon>
              </div>
            ) : reservation.status !== "Cancelled" &&
              reservation.status !== "Denied" ? (
              <div className="flex gap-2 ml-4">
                <ActionIcon
                  title="Edit Reservation"
                  onClick={() =>
                    go({
                      to: `edit/${reservation?.id}`,
                    })
                  }
                >
                  <LuPencilLine />
                </ActionIcon>
              </div>
            ) : null
          }
          emptyMessage="We couldn’t find any reservation at the moment."
        />
      </MantineProvider>
    </>
  );
};
