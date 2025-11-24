import {
  Loader,
  MantineProvider,
  NumberInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useShow } from "@refinedev/core";
import { useEffect, useState } from "react";
import type { Room } from "../pageUtils/types";
import supabase from "../../config/supabaseClient";

export const RoomShow = () => {
  const [room, setRoom] = useState<Room>();
  const {
    query: { data, isLoading, error },
  } = useShow<Room>();

  // const { query: roomList } = useList<Room>({ resource: "room" });

  // TEST
  const { data: imageUrl } = supabase.storage
    .from("room_thumbnails")
    .getPublicUrl(`room-${room?.id}/thumbnail-1.jpg`);

  useEffect(() => {
    if (data) setRoom(data.data);
  }, [data]);

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

  return (
    <MantineProvider>
      <img src={imageUrl.publicUrl} alt="Test" />
      <div className="w-max h-max bg-white rounded-xl p-4 border border-gray-200">
        <div>
          <TextInput
            value={room?.name ?? "Undefined"}
            readOnly
            label="Facility"
          />
        </div>
        <div>
          <TextInput value={room?.room ?? "Undefined"} readOnly label="Room" />
        </div>
        <div>
          <Textarea
            value={room?.description ?? "Undefined"}
            readOnly
            label="Description"
          />
        </div>
        <div>
          <NumberInput
            value={room?.capacity ?? "Undefined"}
            readOnly
            label="Capacity"
          />
        </div>
        <div>
          <TextInput
            value={room?.status ?? "Undefined"}
            readOnly
            label="Status"
          />
        </div>
      </div>
    </MantineProvider>
  );
};
