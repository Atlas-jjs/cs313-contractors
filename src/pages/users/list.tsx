// Refine Dev Class
import { useTable, useUpdate } from "@refinedev/core";

// Icons
import { IoPersonCircleOutline } from "react-icons/io5";

// React Import
import { useEffect, useState } from "react";

// Mantine Import
import { ActionIcon, Badge, Loader, MantineProvider } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { DataTable } from "../../components/table/DataTable";
import type { User } from "../pageUtils/types/index";
import { Search } from "../../components/Search";
import { Filter } from "../../components/Filter";
import { FaUserCheck, FaUserSlash } from "react-icons/fa";
import { notifyError, notifySuccess } from "../pageUtils/notifcations";

export const UserList: React.FC = () => {
  const gridColumns = "grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr]";

  const [searchValue, setSearchValue] = useState<string>("");
  const [debounced] = useDebouncedValue(searchValue, 50);
  const [users, setUsers] = useState<User[]>([]);
  const { mutateAsync } = useUpdate<User>();

  const {
    result,
    tableQuery: { isLoading, refetch },
    currentPage,
    setCurrentPage,
    pageCount,
    setFilters,
    sorters,
    setSorters,
  } = useTable<User>({
    resource: "user",
    pagination: { currentPage: 1, pageSize: 10 },
    sorters: { initial: [{ field: "id", order: "asc" }] },
    filters: {
      // permanent: [
      //   {
      //     field: "type",
      //     operator: "ne",
      //     value: "Admin",
      //   },
      // ],
      initial: [
        {
          field: "full_name",
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
    if (result) setUsers(result.data);
  }, [result]);

  useEffect(() => {
    setFilters([
      {
        field: "full_name",
        operator: "contains",
        value: debounced,
      },
    ]);
    refetch();
  }, [debounced]);

  // Fetching Data
  if (isLoading) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </MantineProvider>
    );
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

  const getStatusColor = (is_suspended: boolean) =>
    is_suspended !== true ? "green" : "red";

  const columns = [
    {
      header: "Full Name",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              onError={(e) => (e.currentTarget.style.display = "none")}
              alt={`${user.full_name}'s avatar`}
              referrerPolicy="no-referrer"
              className="w-8 rounded-full"
            />
          ) : (
            <IoPersonCircleOutline size="2rem" />
          )}
          <span>{user.full_name}</span>
        </div>
      ),
      action: (
        <Search
          placeholder="Search Users"
          data={users.map((u) => u.full_name)}
          onChange={(value) => setSearchValue(value)}
          value={searchValue}
        />
      ),
    },
    {
      header: "Type",
      accessor: "type" as keyof User,
      action: <Filter onClick={() => onSort("type")} />,
    },
    {
      header: "Identifier",
      accessor: "identifier" as keyof User,
      action: <Filter onClick={() => onSort("identifier")} />,
    },
    {
      header: "Email",
      accessor: "email" as keyof User,
      action: <Filter onClick={() => onSort("email")} />,
    },
    {
      header: "Status",
      accessor: (user: User) => {
        if (user.is_suspended === false) {
          return (
            <div className="w-fit">
              <Badge
                size="lg"
                variant="light"
                color={getStatusColor(user.is_suspended)}
              >
                {user.is_suspended ? "Suspended" : "Active"}
              </Badge>
            </div>
          );
        } else {
          return (
            <div className="w-fit">
              <Badge
                size="lg"
                variant="light"
                color={getStatusColor(user.is_suspended)}
              >
                Suspended
              </Badge>
            </div>
          );
        }
      },

      action: <Filter onClick={() => onSort("is_suspended")} />,
    },
  ];

  const handleUserSuspension = async (id: string, status: boolean) => {
    let userSuspension;

    if (status === true) {
      userSuspension = false;
    } else {
      userSuspension = true;
    }

    try {
      await mutateAsync({
        resource: "user",
        id,
        values: {
          is_suspended: userSuspension,
        },
      });

      notifySuccess({
        title: userSuspension ? "User Suspended" : "Access Restored",
        message: "The user status has been updated successfully.",
      });
    } catch (error) {
      notifyError({
        title: "Failed to update user",
        message: "Something went wrong.",
      });
      console.error(error);
    }
  };

  return (
    <>
      <MantineProvider>
        <div className="flex flex-col w-full h-full rounded-xl">
          <DataTable
            data={users}
            gridColumns={gridColumns}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            pageCount={pageCount}
            onPrevious={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            onNext={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
            onPage={(page) => setCurrentPage(page)}
            renderActions={(user) => (
              <div className="flex gap-2">
                {user.is_suspended === true ? (
                  <ActionIcon
                    title="Lift user suspension"
                    color="green.8"
                    onClick={() => {
                      handleUserSuspension(user.id, user.is_suspended);
                    }}
                  >
                    <FaUserCheck />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    title="Suspend user"
                    color="yellow"
                    onClick={() => {
                      handleUserSuspension(user.id, user.is_suspended);
                    }}
                  >
                    <FaUserSlash />
                  </ActionIcon>
                )}
                {/* <ActionIcon
                  title="Delete user"
                  color="red"
                  onClick={() => {
                    handlerUserDeletion(user.id);
                  }}
                >
                  <MdDelete />
                </ActionIcon> */}
              </div>
            )}
            emptyMessage="We couldn’t find any users at the moment."
          />
        </div>
      </MantineProvider>
    </>
  );
};
