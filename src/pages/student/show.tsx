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
import { useGo, useShow, useUpdate } from "@refinedev/core";
import { useParams } from "react-router-dom";
import {
  IoCalendarOutline,
  IoPersonSharp,
  IoTimeOutline,
} from "react-icons/io5";
import type { Reservation } from "../pageUtils/types";

import { notifyError, notifySuccess } from "../pageUtils/notifcations";
import { LuPencilLine } from "react-icons/lu";
import { FiSlash } from "react-icons/fi";

export const StudentDashboardShow = () => {
  const go = useGo();
  const { id } = useParams();
  const { mutateAsync } = useUpdate();
  const {
    query: { data, isLoading },
  } = useShow<Reservation>({
    resource: "all_reservation",
    id,
  });

  const record = data?.data;

  if (isLoading) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center h-[75dvh] w-full">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  const formatTime = (time: string) => {
    if (!time) return "-";
    const date = new Date(`2000-01-01T${time.replace("+00", "Z")}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  // Format Date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeletion = async (id: string) => {
    try {
      await mutateAsync({
        resource: "reservation",
        id: id,
        values: {
          status: "Closed",
        },
      });

      notifySuccess({
        title: "Reservation Closed",
        message: "The reservation has been closed successfully.",
      });

      go({ to: "/" });
    } catch (error) {
      notifyError({
        title: "Failed to closed reservation",
        message: "Something went wrong.",
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
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <Group>
              <Title order={2} className="text-(--primary)">
                Reservation Details
              </Title>
              <Badge
                size="lg"
                variant="light"
                color={getStatusColor(record?.status || "")}
              >
                {record?.status}
              </Badge>
            </Group>
            <Text c="dimmed" size="sm">
              Code: {record?.reservation_code}
            </Text>
          </div>
          {record?.status === "Pending" && (
            <div className="flex gap-2">
              <ActionIcon
                title="Edit Reservation"
                onClick={() =>
                  go({
                    to: `/student/edit/${record?.id}`,
                  })
                }
              >
                <LuPencilLine />
              </ActionIcon>
              <ActionIcon
                title="Close Reservation"
                color="red"
                onClick={() => handleDeletion(record?.id ?? "")}
              >
                <FiSlash />
              </ActionIcon>
            </div>
          )}
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
                value={record?.full_name}
                readOnly
                variant="filled"
              />
              <TextInput
                label="Purpose"
                value={record?.purpose}
                readOnly
                variant="filled"
              />
              <TextInput
                label="Advisor"
                value={record?.advisor || "N/A"}
                readOnly
                variant="filled"
              />
              <Textarea
                label="Remarks"
                value={record?.remarks || "No remarks provided."}
                readOnly
                variant="filled"
                minRows={3}
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
                  {record?.schedules?.map((schedule, index) => (
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
                      {(record?.participants || [])
                        .flat()
                        .filter((p) => p && p.trim?.() !== "").length > 0 ? (
                        record?.participants
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
                      value={(record?.equipments || [])
                        .flat()
                        .filter((e) => e && String(e).trim() !== "")
                        .map((e) => String(e))}
                      placeholder={
                        (record?.equipments || [])
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
