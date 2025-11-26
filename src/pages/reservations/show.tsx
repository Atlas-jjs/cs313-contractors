import {
  ActionIcon,
  Badge,
  Card,
  Grid,
  Group,
  List,
  Loader,
  MantineProvider,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  useGetIdentity,
  useGo,
  useList,
  useShow,
  useUpdate,
} from "@refinedev/core";
import { useParams } from "react-router-dom";
import {
  IoCalendarOutline,
  IoPersonSharp,
  IoTimeOutline,
} from "react-icons/io5";
import type { Reservation, Room } from "../pageUtils/types";
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { notifyError, notifySuccess } from "../pageUtils/notifcations";
import supabase from "../../config/supabaseClient";
import { formatDate, formatTime } from "../pageUtils/functions";
import { useEffect, useState } from "react";
import { LuPencilLine } from "react-icons/lu";
import { FiSlash } from "react-icons/fi";

export const ReservationShow = () => {
  const [reservation, setReservation] = useState<Reservation>();
  const [type, setType] = useState<string>();

  const { id } = useParams();
  const { mutateAsync } = useUpdate();
  const go = useGo();
  const { data: userData } = useGetIdentity();
  const {
    query: { data: reservationData, isLoading },
  } = useShow<Reservation>({
    resource: "all_reservation",
    id,
  });
  const { query: rooms } = useList<Room>({ resource: "room" });

  useEffect(() => {});

  useEffect(() => {
    if (reservationData) setReservation(reservationData.data);
  }, [reservationData]);

  useEffect(() => {
    if (userData) setType(userData.type);
  }, [userData]);

  const parsedRooms =
    reservation?.room_ids?.map(
      (roomId) => rooms.data?.data.find((room) => room.id === roomId)?.name
    ) ?? [];

  if (isLoading) {
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
      <div className="w-full h-full flex flex-col gap-6">
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
          {type === "Admin" && reservation?.status === "Pending" ? (
            <div className="flex gap-2">
              <ActionIcon
                title="Approve Reservation"
                color="green"
                onClick={() => {
                  handleAccept(reservation?.id ?? "");
                }}
              >
                <FaCheck />
              </ActionIcon>
              <ActionIcon
                title="Reject Reservation"
                color="red"
                onClick={() => {
                  handleDenied(reservation?.id ?? "");
                }}
              >
                <FaXmark />
              </ActionIcon>
            </div>
          ) : null}
          {type !== "Admin" && reservation?.status === "Pending" ? (
            <div className="flex gap-2">
              <ActionIcon
                title="Edit Reservation"
                onClick={() =>
                  go({
                    to: `/reservation/edit/${reservation?.id}`,
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
          ) : reservation?.status !== "Cancelled" &&
            reservation?.status !== "Denied" &&
            type !== "Admin" ? (
            <div className="flex gap-2">
              <ActionIcon
                title="Edit Reservation"
                onClick={() =>
                  go({
                    to: `/reservation/edit/${reservation?.id}`,
                  })
                }
              >
                <LuPencilLine />
              </ActionIcon>
            </div>
          ) : null}
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
                label="Full Name"
                value={reservation?.full_name}
                readOnly
                variant="filled"
              />
              <TextInput
                label="Purpose"
                value={reservation?.purpose}
                readOnly
                variant="filled"
              />
              <TextInput
                label="Advisor"
                value={reservation?.advisor || "Not Applicable"}
                readOnly
                variant="filled"
              />
              <Textarea
                label="Remarks"
                value={reservation?.remarks || "No remarks provided."}
                readOnly
                variant="filled"
                minRows={3}
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

              {/* Resources Card */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} className="mb-4">
                  Resources
                </Title>
                <Stack gap="sm">
                  <div>
                    <Text size="sm" fw={500} className="mb-1">
                      Participants
                    </Text>
                    <List
                      type="ordered"
                      size="sm"
                      spacing="md"
                      icon={
                        <ThemeIcon color="teal" size={24} radius="xl">
                          <IoPersonSharp size={16} />
                        </ThemeIcon>
                      }
                    >
                      {(reservation?.participants || [])
                        .flat()
                        .filter((p) => p && p.trim?.() !== "").length > 0 ? (
                        reservation?.participants
                          .flat()
                          .filter((p) => p && p.trim?.() !== "")
                          .map((p, i) => (
                            <List.Item key={i} variant="filled">
                              {p}
                            </List.Item>
                          ))
                      ) : (
                        <Text size="sm" c="dimmed">
                          No participants listed.
                        </Text>
                      )}
                    </List>
                  </div>
                  <div>
                    <Text size="sm" fw={500} className="mb-1">
                      Equipments
                    </Text>
                    <TagsInput
                      readOnly
                      value={(reservation?.equipments || [])
                        .flat()
                        .filter((e) => e && String(e).trim() !== "")
                        .map((e) => String(e))}
                      placeholder={
                        (reservation?.equipments || [])
                          .flat()
                          .filter((e) => e && String(e).trim() !== "").length
                          ? ""
                          : "No equipment requested"
                      }
                      variant="filled"
                    />
                  </div>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </div>
    </MantineProvider>
  );
};
