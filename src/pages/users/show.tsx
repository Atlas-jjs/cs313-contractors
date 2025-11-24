import { useEffect, useState } from "react";
import type { User } from "../pageUtils/types";
import { useShow, useUpdate } from "@refinedev/core";
import {
  ActionIcon,
  Badge,
  Card,
  Grid,
  Group,
  Loader,
  MantineProvider,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { FaUserCheck, FaUserSlash } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { notifyError, notifySuccess } from "../pageUtils/notifcations";

export const UserShow = () => {
  const [user, setUser] = useState<User>();
  const { mutateAsync } = useUpdate<User>();

  const {
    query: { data, isLoading, error },
  } = useShow<User>();

  useEffect(() => {
    if (data) setUser(data.data);
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

  const handleUserSuspension = async (id: string, status: boolean) => {
    let userSuspension;

    if (status === true) {
      userSuspension = false;
    } else {
      userSuspension = true;
    }

    try {
      await mutateAsync({
        resource: "user",
        id,
        values: {
          is_suspended: userSuspension,
        },
      });

      notifySuccess({
        title: userSuspension ? "User Suspended" : "Access Restored",
        message: "The user status has been updated successfully.",
      });
    } catch (error) {
      notifyError({
        title: "Failed to update user",
        message: "Something went wrong.",
      });
      console.error(error);
    }
  };

  // ! Finalize
  const handlerUserDeletion = (userId: string) => {
    console.log(userId);
  };

  const getStatusColor = (status: boolean) => (status ? "red" : "green");

  return (
    <MantineProvider>
      <div className="w-full h-full flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <Group>
              <Title order={2} className="text-[var(--primary)]">
                User Details
              </Title>

              <Badge
                size="lg"
                variant="light"
                color={getStatusColor(user?.is_suspended ?? false)}
              >
                {user?.is_suspended ? "Suspended" : "Active"}
              </Badge>
            </Group>

            <Text c="dimmed" size="sm">
              User Id:{" "}
              {user?.id && user.id !== "N/A" ? user.id : "Not Available"}
            </Text>
          </div>
          <div className="flex gap-2">
            {user?.is_suspended === true ? (
              <ActionIcon
                title="Lift user suspension"
                color="green.8"
                onClick={() => {
                  handleUserSuspension(user.id, user.is_suspended);
                }}
              >
                <FaUserCheck />
              </ActionIcon>
            ) : (
              <ActionIcon
                title="Suspend user"
                color="yellow"
                onClick={() => {
                  handleUserSuspension(
                    user?.id ?? "",
                    user?.is_suspended ?? false
                  );
                }}
              >
                <FaUserSlash />
              </ActionIcon>
            )}
            <ActionIcon
              title="Delete user"
              color="red"
              onClick={() => {
                handlerUserDeletion(user?.id ?? "");
              }}
            >
              <MdDelete />
            </ActionIcon>
          </div>
        </div>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card
              padding="lg"
              radius="md"
              withBorder
              className="flex flex-col gap-4"
            >
              <Title order={4} className="mb-2">
                General Information
              </Title>

              <TextInput
                label="Full Name"
                value={user?.full_name ?? "Undefined"}
                readOnly
                variant="filled"
              />

              <TextInput
                label="Email"
                value={user?.email ?? "Undefined"}
                readOnly
                variant="filled"
              />

              <TextInput
                label="Role"
                value={user?.type ?? "Undefined"}
                readOnly
                variant="filled"
              />

              <TextInput
                label="Status"
                value={user?.is_suspended ? "Suspended" : "Active"}
                readOnly
                variant="filled"
              />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card
              padding="lg"
              radius="md"
              withBorder
              className="flex flex-col items-center gap-4"
            >
              <Title order={4}>Profile Picture</Title>

              <div className="w-40 h-40 rounded-full overflow-hidden border border-gray-300 shadow-sm">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    No Image
                  </div>
                )}
              </div>
            </Card>
          </Grid.Col>
        </Grid>
      </div>
    </MantineProvider>
  );
};
