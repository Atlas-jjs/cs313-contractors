import { useDelete, useGetIdentity, useGo, useTable } from "@refinedev/core";
import React, { useEffect, useState } from "react";
import type { Room } from "../pageUtils/types/index";
import { ActionIcon, Button, Loader, MantineProvider } from "@mantine/core";
import { NoResults } from "../../components/NoResults";
import { DataTable } from "../../components/table/DataTable";
import { LuPencilLine } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import { RoomCard } from "../../components/RoomCard";
import { IoMdAdd } from "react-icons/io";

export const RoomList: React.FC = () => {
  const gridColumns = "grid-cols-[1fr_1fr_1fr_1fr]";
  const { data: userData } = useGetIdentity();

  const go = useGo();
  const {
    result,
    tableQuery: { isLoading },
  } = useTable<Room>({
    resource: "room",
    sorters: { initial: [{ field: "id", order: "asc" }] },
  });

  const {
    mutate,
    mutation: { isPending: isDeleting },
  } = useDelete<Room>();

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (result) setRooms(result.data);
  }, [result]);

  if (isLoading) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  const columns = [
    {
      header: "Facility",
      accessor: "name" as keyof Room,
    },
    {
      header: "Room",
      accessor: "room" as keyof Room,
    },
    {
      header: "Status",
      accessor: "status" as keyof Room,
    },
  ];

  return (
    <>
      <MantineProvider>
        {userData.type === "Admin" ? (
          <div className="w-full h-full">
            <Button
              variant="filled"
              color="#073066"
              className="transition-all duration-300 hover:shadow-blue-300/40 hover:bg-(--primary-hover) mb-4"
              leftSection={<IoMdAdd size={18} />}
              onClick={() => go({ to: "create" })}
            >
              Add Room
            </Button>

            {!isLoading && rooms.length === 0 ? (
              <NoResults subheading="We couldn’t find any rooms at the moment." />
            ) : (
              <DataTable
                data={rooms}
                gridColumns={gridColumns}
                columns={columns}
                isLoading={isLoading}
                renderActions={(room) => (
                  <div className="flex gap-2">
                    {/* <ActionIcon title="View Details">
                    <LuEye />
                  </ActionIcon> */}

                    <ActionIcon
                      title="Show Room"
                      onClick={() =>
                        go({
                          to: `edit/${room.id}`,
                        })
                      }
                    >
                      <LuPencilLine />
                    </ActionIcon>
                    <ActionIcon
                      title="Delete Room"
                      color="red"
                      onClick={() => {
                        mutate({
                          resource: "room",
                          id: room.id,
                        });
                      }}
                      disabled={isDeleting}
                    >
                      <MdDelete />
                    </ActionIcon>
                  </div>
                )}
              />
            )}
          </div>
        ) : (
          <div className="flex gap-4 w-full items-center justify-center flex-wrap">
            {rooms.map((room) => (
              <RoomCard key={room.id} roomData={room} />
            ))}
          </div>
        )}
      </MantineProvider>
    </>
  );
};
