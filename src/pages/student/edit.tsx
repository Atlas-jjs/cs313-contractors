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
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useGo, useShow } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import type { Reservation } from "../pageUtils/types";
import { notifyError, notifySuccess } from "../pageUtils/notifcations";
import supabase from "../../config/supabaseClient";
import { useDebouncedValue } from "@mantine/hooks";

export const StudentDashboardEdit = () => {
  const go = useGo();
  //   const { mutateAsync } = useUpdate();
  const { id } = useParams();

  const {
    query: { data, isLoading },
  } = useShow<Reservation>({
    resource: "all_reservation",
    id,
  });

  const record = data?.data;

  // Local state for editable fields
  const [fullName, setFullName] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [advisor, setAdvisor] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);

  const [tempRemarks, setTempRemarks] = useState("");
  const [debouncedRemarks] = useDebouncedValue(tempRemarks, 300);

  console.log(record);

  // Populate state when record is loaded
  useEffect(() => {
    if (record) {
      setFullName(record.full_name ?? "");
      setPurpose(record.purpose ?? "");
      setAdvisor(record.advisor ?? "");
      setRemarks(record.remarks ?? "");
      setTempRemarks(record.remarks ?? "");

      setParticipants(record.participants?.flat() ?? []);
      setEquipments(record.equipments?.flat().map(String) ?? []);
    }
  }, [record]);

  useEffect(() => {
    setRemarks(debouncedRemarks);
  }, [debouncedRemarks]);

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      //   await mutateAsync({
      //     resource: "reservation",
      //     id: record?.id,
      //     values: {
      //       full_name: fullName,
      //       purpose,
      //       advisor,
      //       remarks,
      //       participants,
      //       equipments,
      //     },
      //   });
      const { data, error } = await supabase.rpc("update_reservation", {
        p_reservation_id: record?.id,
        p_purpose: purpose,
        p_advisor: advisor,
        p_remarks: remarks,
        p_participants: participants,
        p_equipments: equipments,
      });

      if (data.status !== "success") {
        notifyError({
          title: "Failed to update reservation",
          message: error?.message,
        });
        console.error(error);
      }

      notifySuccess({
        title: "Reservation Updated",
        message: "The reservation has been updated successfully.",
      });
      go({ to: "/" });
    } catch (error) {
      notifyError({
        title: "Failed to update reservation",
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
      <form
        onSubmit={handleUpdate}
        className="w-full h-full flex flex-col gap-6"
      >
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
                disabled
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.currentTarget.value)}
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
              {/* <TextInput
                label="Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.currentTarget.value)}
              /> */}
              <Select
                label="Advisor"
                data={[
                  "Josephine Dela Cruz",
                  "Dalos Miguel",
                  "Ramel Cabanilla",
                ]}
                clearable
                value={advisor}
                onChange={(value) => setAdvisor(value ?? advisor)}
              />
              {/* <TextInput
                label="Advisor"
                value={advisor}
                onChange={(e) => setAdvisor(e.currentTarget.value)}
              /> */}
              <Textarea
                readOnly
                label="Remarks"
                value={tempRemarks}
                styles={{ input: { height: 150 } }}
                onChange={(e) => setTempRemarks(e.currentTarget.value)}
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
                to: `/student/show/${record?.id}`,
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
