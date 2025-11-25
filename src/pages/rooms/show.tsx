import { Loader, MantineProvider, Title, Text, Grid } from "@mantine/core";
import { useGo, useShow } from "@refinedev/core";
import { useEffect, useState } from "react";
import type { Room } from "../pageUtils/types";
import supabase from "../../config/supabaseClient";
import "../../index.css";

export const RoomShow = () => {
  const [room, setRoom] = useState<Room>();
  const [imageUrl, setImageUrl] = useState<string>("");
  // Hardcoded equipment
  const equipmentList = [
    "Chair",
    "Table",
    "Air Conditioner",
    "Cables",
    "Curtain",
  ];

  const {
    query: { data, isLoading, error },
  } = useShow<Room>();

  // Temporary
  const go = useGo();

  // Load room data
  useEffect(() => {
    if (data && data.data?.id) {
      const roomData = data.data;

      if (roomData.images && roomData.images.length > 0) {
        setRoom(roomData);
        setImageUrl(roomData.images[0]); // first image as main
      } else {
        const { data: urlData } = supabase.storage
          .from("room_thumbnails")
          .getPublicUrl(`room-${roomData.id}/thumbnail-1.jpg`);
        const fallbackImage = urlData?.publicUrl ?? "";

        setRoom({ ...roomData, images: fallbackImage ? [fallbackImage] : [] });
        setImageUrl(fallbackImage);
      }
    }
  }, [data]);

  if (error) return <p>Error: {error.message}</p>;

  if (isLoading || !room) {
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
      <article className="w-full min-h-[75dvh] flex items-center justify-center p-10">
        <div className="bg-white w-full rounded-xl p-10 border border-gray-200 shadow">
          <Grid gutter="xl" className="h-full">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <section className="flex flex-col gap-4">
                <div className="rounded-lg overflow-hidden border border-gray-300 h-125 flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Room Thumbnail"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex gap-3 h-24 justify-center">
                  {room.images && room.images.length > 0 ? (
                    room.images.map((img, index) => (
                      <div
                        key={index}
                        className={`h-full w-24 rounded-md overflow-hidden border border-gray-300 cursor-pointer hover:opacity-80 transition ${
                          img === imageUrl ? "border-blue-500" : ""
                        }`}
                        onClick={() => setImageUrl(img)}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="w-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-md">
                      No other images
                    </div>
                  )}
                </div>
              </section>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <section className="flex flex-col gap-6 p-12 h-full">
                <div className="flex flex-col gap-2">
                  <Title
                    order={1}
                    className="text-(--dark-primary) text-4xl self-left"
                  >
                    {room?.name ?? "Undefined"}
                  </Title>

                  <Text c="dimmed" size="md">
                    {room?.room ?? "Undefined"}
                  </Text>

                  <Text size="lg" className="mt-6">
                    {room?.description ?? "Undefined"}
                  </Text>
                </div>

                <div className="mt-4">
                  <Text className="font-semibold mb-2">
                    Available Equipments
                  </Text>
                  <ul className="list-disc list-inside">
                    {equipmentList.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    go({ to: "/reservation/create" });
                  }}
                  className="
                    self-center mt-auto w-2/3
                    bg-(--primary)
                    text-(--primary-white)
                    hover:bg-(--primary-hover)
                    transition-colors duration-300
                    py-3 rounded-lg font-medium
                    border-none
                    cursor-pointer
                  "
                >
                  Create a Reservation
                </button>
              </section>
            </Grid.Col>
          </Grid>
        </div>
      </article>
    </MantineProvider>
  );
};
