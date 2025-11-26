import {
  Badge,
  Card,
  Grid,
  Group,
  List,
  Loader,
  MantineProvider,
  Select,
  Stack,
  TagsInput,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useGo, useList, useShow } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import type { Reservation, Room } from "../pageUtils/types";
import { notifyError, notifySuccess } from "../pageUtils/notifcations";
import supabase from "../../config/supabaseClient";
import { formatDate, formatTime } from "../pageUtils/functions";

export const ReservationEdit = () => {
  const [reservation, setReservation] = useState<Reservation>();
  const go = useGo();
  const { id } = useParams();

  const {
    query: { data, isLoading },
  } = useShow<Reservation>({
    resource: "all_reservation",
    id,
  });

  const { query: rooms } = useList<Room>({ resource: "room" });

  useEffect(() => {
    if (data) setReservation(data?.data);
  }, [data]);

  // Local state for editable fields
  const [name, setName] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [advisor, setAdvisor] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [, setRoom] = useState<number[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);

  const parsedRooms =
    reservation?.room_ids?.map(
      (roomId) => rooms.data?.data.find((room) => room.id === roomId)?.name
    ) ?? [];

  // Populate state when reservation is loaded
  useEffect(() => {
    if (reservation) {
      setName(reservation.full_name ?? "");
      setPurpose(reservation.purpose ?? "");
      setAdvisor(reservation.advisor ?? "");
      setRemarks(reservation.remarks ?? "");
      setRoom(reservation.room_ids ?? []);
      setParticipants(reservation.participants?.flat() ?? []);
      setEquipments(reservation.equipments?.flat().map(String) ?? []);
    }
  }, [reservation]);

  if (isLoading) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!remarks.trim()) {
      notifyError({
        title: "Invalid input",
        message: "Remarks cannot be empty.",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("update_reservation", {
        p_reservation_id: reservation?.id,
        p_purpose: purpose,
        p_advisor: advisor,
        p_remarks: remarks,
        p_participants: participants,
        p_equipments: equipments,
      });

      // Handle RPC-level errors
      if (error) {
        notifyError({
          title: "Failed to update reservation",
          message: error.message,
        });
        console.error(error);
        return;
      }

      // Handle function-level response failures
      if (data?.status !== "success") {
        notifyError({
          title: "Failed to update reservation",
          message: data?.message ?? "Unexpected error",
        });
        return;
      }

      notifySuccess({
        title: "Reservation Updated",
        message: "The reservation has been updated successfully.",
      });

      go({ to: `/reservation/show/${reservation?.id}` });

      // Delay
      // setTimeout(() => {
      //   go({ to: `/reservation/show/${reservation?.id}` });
      // }, 1000);
    } catch (err) {
      notifyError({
        title: "Failed to update reservation",
        message: "Something went wrong.",
      });
      console.error(err);
    }
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

  return (
    <MantineProvider>
      <form
        onSubmit={handleUpdate}
        className="w-full h-full flex flex-col gap-6"
      >
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-md">
          <div>
            <Group>
              <Title order={2} className="text-(--primary)">
                Reservation Details
              </Title>
              <Badge
                size="lg"
                variant="light"
                color={getStatusColor(reservation?.status || "")}
              >
                {reservation?.status}
              </Badge>
            </Group>
            <Text c="dimmed" size="sm">
              Code: {reservation?.reservation_code}
            </Text>
          </div>
        </div>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card
              padding="lg"
              radius="md"
              withBorder
              className="h-full flex flex-col gap-4"
            >
              <Title order={4} className="mb-2">
                General Information
              </Title>
              <TextInput
                readOnly
                label="Full Name"
                value={name}
                variant="filled"
              />
              <Select
                label="Purpose"
                data={[
                  "IT Project-Related",
                  "Research-Related",
                  "Academic Requirement",
                  "Thesis / Capstone",
                  "Event / Activity",
                  "Training / Workshop",
                  "Maintenance Work",
                  "Administrative Task",
                  "Meeting / Consultation",
                  "System Testing",
                  "Department Request",
                  "Facility Use",
                  "Other",
                ]}
                value={purpose}
                onChange={(value) => setPurpose(value ?? purpose)}
              />
              <Select
                label="Advisor"
                data={[
                  "Josephine Dela Cruz",
                  "Dalos Miguel",
                  "Ramel Cabanilla",
                  "Roderick Makil",
                  "Maria Concepcion Clemente",
                  "Kasima Mendoza",
                  "Randy Domantay",
                  "Romulos Amistad",
                ]}
                value={advisor ?? "Not Applicable"}
                onChange={(value) => setAdvisor(value ?? "Not Applicable")}
                clearable
              />
              <TextInput
                label="Remarks"
                value={remarks}
                maxLength={30}
                description={"30 Character Limit"}
                onChange={(e) => setRemarks(e.currentTarget.value)}
              />
              <TextInput
                label="Room/s"
                value={parsedRooms.join(", ") || "No rooms provided."}
                readOnly
                variant="filled"
              />
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} className="mb-4">
                  Schedule
                </Title>
                <List spacing="sm" center>
                  {reservation?.schedules?.map((schedule, index) => (
                    <List.Item
                      key={index}
                      icon={
                        <ThemeIcon color="blue" size={24} radius="xl">
                          <IoCalendarOutline size={14} />
                        </ThemeIcon>
                      }
                    >
                      <div className="flex flex-col ml-2">
                        <Text size="sm" fw={500}>
                          {formatDate(schedule.date)}
                        </Text>
                        <Group gap="xs">
                          <IoTimeOutline size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {formatTime(schedule.start_time)} -{" "}
                            {formatTime(schedule.end_time)}
                          </Text>
                        </Group>
                      </div>
                    </List.Item>
                  ))}
                </List>
              </Card>

              <Card padding="lg" radius="md" withBorder>
                <Title order={4} className="mb-4">
                  Resources
                </Title>
                <Stack gap="sm">
                  <div>
                    <Text size="sm" fw={500} className="mb-1">
                      Participants
                    </Text>
                    <TagsInput
                      value={participants}
                      onChange={setParticipants}
                      placeholder="Add participants"
                    />
                  </div>
                  <div>
                    <Text size="sm" fw={500} className="mb-1">
                      Equipments
                    </Text>
                    <TagsInput
                      value={equipments}
                      onChange={setEquipments}
                      placeholder="Add equipments"
                    />
                  </div>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            className="p-3 border border-(--primary) bg-transparent cursor-pointer text-(--primary) rounded"
            onClick={() => {
              go({
                to: `/reservation/show/${reservation?.id}`,
              });
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="p-3 bg-(--primary) cursor-pointer text-white rounded"
          >
            Update Reservation
          </button>
        </div>
      </form>
    </MantineProvider>
  );
};
