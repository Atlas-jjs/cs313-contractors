import {
  Loader,
  MantineProvider,
  NumberInput,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useGo, useShow, useUpdate } from "@refinedev/core";
import { useEffect, useState } from "react";
import type { Room } from "../../../utils/types";
import { notifyError, notifySuccess } from "../../../utils/notifcations";

export const RoomEdit = () => {
  // Store the fetched room data
  const [room, setRoom] = useState<Room>();

  const [name, setName] = useState<string>();
  const [specificRoom, setSpecificRoom] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [capacity, setCapacity] = useState<number>();

  const go = useGo();

  // Fetch the data from the database
  const {
    query: { data, isLoading, error, isFetching },
  } = useShow<Room>();

  const {
    mutate,
    mutation: { isPending: isUpdating },
  } = useUpdate();

  useEffect(() => {
    if (data) setRoom(data.data);
    if (room) {
      setName(room.name);
      setSpecificRoom(room.room);
      setDescription(room.description);
      setStatus(room.status);
      setCapacity(room.capacity);
    }
  }, [data, room]);

  if (error) return <p>Error: {error.message}</p>;

  if (isLoading) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center h-[75dvh] w-full">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await mutate({
        resource: "room",
        id: room?.id,
        values: {
          name: name,
          room: specificRoom,
          status: status,
          description: description,
          capacity: capacity,
        },
      });

      notifySuccess({
        title: "Updated Room",
        message: "The room has been updated successfully.",
      });

      setTimeout(() => go({ to: "/room" }), 1000);
    } catch (error) {
      notifyError({
        title: "Failed to update room",
        message: "Something went wrong.",
      });
      console.error(error);
    }
  };

  return (
    <MantineProvider>
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleUpdate}
          className="w-2xl h-max bg-white rounded-xl p-8 border border-gray-200 flex flex-col gap-4"
        >
          <div>
            <TextInput
              label="Facility"
              value={name ?? "Undefined"}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>
          <div>
            <TextInput
              value={specificRoom ?? "Undefined"}
              label="Room"
              onChange={(e) => setSpecificRoom(e.currentTarget.value)}
              // onChange={(e) =>
              //   setRoom((prev) => ({ ...prev, room: e.currentTarget.value }))
              // }
            />
          </div>
          <div>
            <Textarea
              value={description ?? "Undefined"}
              label="Description"
              styles={{ input: { height: 150 } }}
              onChange={(e) => setDescription(e.currentTarget.value)}
              // onChange={(e) =>
              //   setRoom((prev) => ({
              //     ...prev,
              //     description: e.currentTarget.value,
              //   }))
              // }
            />
          </div>
          <div>
            <NumberInput
              value={capacity ?? 0}
              label="Capacity"
              onChange={(value) => setCapacity(Number(value))}
              // onChange={(value) =>
              //   setRoom((prev) => ({ ...prev, capacity: Number(value) }))
              // }
            />
            <div>
              <Select
                data={["Available", "Unavailable"]}
                value={status ?? "Undefined"}
                label="Status"
                onChange={(value) => setStatus(value ?? "Available")}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isUpdating || isFetching}
            className="p-3 bg-(--primary) cursor-pointer text-white rounded"
          >
            Submit
          </button>
        </form>
      </div>
    </MantineProvider>
  );
};
