import { notifications } from "@mantine/notifications";
import { FaCheckCircle } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

interface NotificationProps {
  title: string;
  message?: string;
}

// Success notification
export const notifySuccess = ({ title, message }: NotificationProps): void => {
  notifications.show({
    color: "green",
    title,
    message,
    icon: <FaCheckCircle size={18} />,
  });
};

// Error notification
export const notifyError = ({ title, message }: NotificationProps): void => {
  notifications.show({
    color: "red",
    title,
    message,
    icon: <FaXmark size={18} />,
  });
};

// Loading notification (returns ID so it can be updated)
export const notifyLoading = ({
  title,
  message,
}: NotificationProps): string => {
  return notifications.show({
    loading: true,
    title,
    message,
    autoClose: false,
    withCloseButton: false,
  });
};
