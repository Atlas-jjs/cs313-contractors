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
import type { Room } from "../../pageUtils/types";
import { notifyError, notifySuccess } from "../../pageUtils/notifcations";
import supabase from "../../../config/supabaseClient";
import { Dropzone } from "@mantine/dropzone";
import {
  MdAddPhotoAlternate,
  MdErrorOutline,
  MdOutlineFileUpload,
} from "react-icons/md";

export const RoomEdit = () => {
  // Store the fetched room data
  const [room, setRoom] = useState<Room>();

  const [name, setName] = useState<string>();
  const [specificRoom, setSpecificRoom] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [capacity, setCapacity] = useState<number>();

  const [images, setImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const extractPath = (url: string) => {
    return url.split("room_thumbnails/")[1];
  };

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
    if (data?.data) {
      const roomData = data.data;
      setRoom(roomData);
      setName(roomData.name);
      setSpecificRoom(roomData.room);
      setDescription(roomData.description);
      setStatus(roomData.status);
      setCapacity(roomData.capacity);
      setImages(roomData.images || []);
    }
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room?.id) {
      notifyError({ title: "Error", message: "Room data not loaded." });
      return;
    }

    try {
      let finalImages = [...(room?.images || [])];

      for (const url of deletedImages) {
        const path = extractPath(url);
        await supabase.storage.from("room_thumbnails").remove([path]);
        finalImages = finalImages.filter((img) => img !== url);
      }

      const uploadedUrls = await Promise.all(
        newFiles.map(async (file, index) => {
          const ext = file.name.split(".").pop();
          const path = `room-${
            room.id
          }/thumbnail-${Date.now()}-${index}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("room_thumbnails")
            .upload(path, file, { upsert: true });
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("room_thumbnails")
            .getPublicUrl(path);
          return publicUrlData.publicUrl;
        })
      );

      finalImages.push(...uploadedUrls);

      await mutate(
        {
          resource: "room",
          id: room?.id,
          values: {
            name: name,
            room: specificRoom,
            status: status,
            description: description,
            capacity: capacity,
            images: finalImages,
          },
        },
        {
          onSuccess: () => {
            notifySuccess({
              title: "Updated Room",
              message: "The room has been updated successfully.",
            });

            setTimeout(() => go({ to: "/room" }), 1000);
          },
          onError: (error) => {
            if (error?.message.includes("unique constraint")) {
              notifyError({
                title: "Duplicate Room",
                message: "A room with this name already exists.",
              });
            } else {
              notifyError({
                title: "Failed to update room",
                message: "Something went wrong.",
              });
            }

            console.error(error);
          },
        }
      );
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
          <Dropzone
            onDrop={(files) => {
              setNewFiles((prev) => [...prev, ...files]);
              const previews = files.map((file) => URL.createObjectURL(file));
              setImages((prev) => [...prev, ...previews]);
            }}
            accept={{ "image/*": [], "video/mp4": [] }}
            maxSize={5 * 1024 * 1024} // 5 MB
          >
            <div className="flex justify-center items-center gap-4 border rounded border-dashed cursor-pointer hover:bg-gray-100 transition-colors duration-200 p-4">
              <Dropzone.Accept>
                <MdOutlineFileUpload size={52} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <MdErrorOutline size={52} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <MdAddPhotoAlternate size={52} />
              </Dropzone.Idle>

              <div>
                <h1>Drag images here or click to select files</h1>
                <p>
                  Attach as many files as you like, each file should not exceed
                  5MB
                </p>
              </div>
            </div>
          </Dropzone>

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
            />
          </div>
          <div>
            <Textarea
              value={description ?? "Undefined"}
              label="Description"
              styles={{ input: { height: 150 } }}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>
          <div>
            <NumberInput
              value={capacity ?? 0}
              label="Capacity"
              min={0}
              max={50} // ! Change
              onChange={(value) => {
                if (
                  value !== null &&
                  Number(value) <= 50 &&
                  Number(value) >= 0
                ) {
                  setCapacity(Number(value));
                } else if (
                  (value !== null && Number(value) > 50) ||
                  (value !== null && Number(value) < 0)
                ) {
                  notifyError({
                    title: "Invalid Capacity",
                    message: "Capacity cannot be less than 0 and more than 50.",
                  });
                }
              }}
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Images</label>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      className="w-full h-28 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setDeletedImages((prev) => [...prev, img]);
                        setImages((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-(--primary) text-white text-xs w-6 h-6 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer hover:bg-(--primary-hover)"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images available</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdating || isFetching}
            className="p-3 bg-(--primary) cursor-pointer text-white rounded transition-all duration-200 hover:bg-(--primary-hover)"
          >
            Submit
          </button>
        </form>
      </div>
    </MantineProvider>
  );
};
