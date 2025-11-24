import { useState } from "react";
import { useCreate, useGo, useUpdate } from "@refinedev/core";
import {
  MantineProvider,
  NumberInput,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from "@mantine/dropzone";
import supabase from "../../config/supabaseClient";
import {
  MdAddPhotoAlternate,
  MdErrorOutline,
  MdOutlineFileUpload,
} from "react-icons/md";
import { FaXmark } from "react-icons/fa6";
import { notifyError, notifySuccess } from "../pageUtils/notifcations";

export const RoomCreate = () => {
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [status, setStatus] = useState("Unavailable");

  const go = useGo();

  const {
    mutateAsync,
    mutation: { isPending: isCreating },
  } = useCreate();
  const { mutateAsync: updateAsync } = useUpdate();

  const removePreview = (name: string) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !room || !status || capacity === undefined) {
      notifyError({
        title: "Missing Fields",
        message: "Please fill out all required fields before submitting.",
      });
      return;
    }

    try {
      // 1️⃣ Create the room first
      const newRoom = await mutateAsync(
        {
          resource: "room",
          values: {
            name,
            room,
            status,
            description,
            capacity,
            images: [], // temporarily empty
          },
        },
        {
          onError: (error) => {
            if (error?.message.includes("unique constraint")) {
              notifyError({
                title: "Duplicate Room",
                message: "A room with this name already exists.",
              });
            } else {
              notifyError({
                title: "Failed to create room",
                message: "Something went wrong.",
              });
            }

            console.error(error);
          },
        }
      );

      if (!newRoom.data.id) throw new Error("Failed to get new room ID");
      const roomId = newRoom.data.id;

      // 2️⃣ Upload files using the actual room ID
      const uploadedUrls = await Promise.all(
        files.map(async (file, i) => {
          const fileExtension = file.name.split(".").pop();
          const path = `room-${roomId}/thumbnail-${i + 1}.${fileExtension}`;

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

      await updateAsync(
        {
          resource: "room",
          id: roomId,
          values: { images: uploadedUrls },
        },
        {
          onSuccess: () => {
            notifySuccess({
              title: "Created Room",
              message: "The room has been created successfully.",
            });

            setTimeout(() => go({ to: "/room" }), 1000);
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const previewThumbnails = files.map((file, index) => {
    const blobUrl = URL.createObjectURL(file);

    if (IMAGE_MIME_TYPE.includes(file.type as any)) {
      return (
        <>
          <div key={index} className="relative">
            <img
              src={blobUrl}
              onLoad={() => URL.revokeObjectURL(blobUrl)}
              className="w-56 h-56 object-cover"
            />
            <button
              type="button"
              className="absolute right-0 top-0 cursor-pointer"
              onClick={() => removePreview(file.name)}
            >
              <FaXmark />
            </button>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="relative">
            <video
              className="w-56 h-56 object-cover"
              controls
              key={index}
              onLoad={() => URL.revokeObjectURL(blobUrl)}
            >
              <source src={blobUrl} type="video/mp4" />
            </video>
            <button
              type="button"
              className="absolute right-0 top-0 cursor-pointer"
              onClick={() => removePreview(file.name)}
            >
              <FaXmark />
            </button>
          </div>
        </>
      );
    }
  });

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Unavailable", label: "Unavailable" },
  ];

  return (
    <MantineProvider>
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleCreate}
          className="w-2xl h-max bg-white rounded-xl p-8 border border-gray-200 flex flex-col gap-4"
        >
          <Dropzone
            onDrop={(file) => setFiles((prev) => [...prev, ...file])}
            accept={{ "image/*": [], "video/mp4": [] }}
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
                  5mb
                </p>
              </div>
            </div>
          </Dropzone>
          <div className="flex gap-2">{previewThumbnails}</div>
          <div>
            <TextInput
              placeholder="Fusion"
              required
              label="Facility"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>
          <div>
            <TextInput
              placeholder="D723"
              required
              label="Room"
              value={room}
              onChange={(e) => setRoom(e.currentTarget.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="A short description here..."
              label="Description"
              styles={{ input: { height: 150 } }}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>
          <div>
            <NumberInput
              required
              value={capacity ?? 0}
              label="Capacity"
              min={0}
              max={50}
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
                required
                data={statusOptions}
                label="Status"
                value={status}
                onChange={(value) => setStatus(value || "Unavailable")}
              />
            </div>
          </div>
          <button
            type="submit"
            className="p-3 bg-(--primary) cursor-pointer text-white rounded"
            disabled={isCreating}
          >
            Submit
          </button>
        </form>
      </div>
    </MantineProvider>
  );
};
// };
