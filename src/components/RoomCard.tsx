import { useEffect, useState } from "react";
import type { Room } from "../pages/pageUtils/types";
import { Badge, MantineProvider } from "@mantine/core";
import { useGo } from "@refinedev/core";
import { MdPerson } from "react-icons/md";

interface RoomCardProps {
  roomData: Room;
}

export const RoomCard = ({ roomData }: RoomCardProps) => {
  const [room, setRoom] = useState<Room>();

  useEffect(() => {
    if (roomData) setRoom(roomData);
  }, [roomData]);

  const go = useGo();

  const getStatusColor = (status: string) =>
    status === "Available" ? "green" : "red";
  return (
    <>
      <MantineProvider>
        {room?.status === "Available" && (
          <div
            onClick={() => {
              go({ to: `show/${room.id}` });
            }}
            className="bg-white flex gap-4 flex-col rounded-xl hover:-translate-y-4 duration-200 transition-all cursor-pointer border border-gray-200 shadow"
          >
            <div>
              <img
                className="w-100 h-75 object-cover rounded-t-xl"
                src={room?.images[0]}
                alt="Room Thumbnail"
              />
            </div>
            <div className="p-4 pt-0 flex flex-col gap-4">
              <div className="">
                <div className="font-bold lg:text-3xl">{room?.name}</div>
                <div className="">{room?.room}</div>
              </div>
              <div className="flex justify-between">
                <div className="flex gap-1 items-center">
                  <MdPerson />
                  <span>{room?.capacity} people</span>
                </div>
                <div>
                  <Badge
                    size="lg"
                    variant="light"
                    color={getStatusColor(room.status)}
                  >
                    {room.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </MantineProvider>
    </>
  );
};
