import { useEffect, useState } from "react";
import { DatePickerInput, getTimeRange, TimePicker } from "@mantine/dates";
import { MantineProvider, MultiSelect, Select, TextInput } from "@mantine/core";
import { TbCalendar } from "react-icons/tb";
import dayjs from "dayjs";
import { useGetIdentity, useList } from "@refinedev/core";

interface FormData {
  room?: string[];
  purpose?: string;
  date?: Date[];
  startTime?: string;
  endTime?: string;
  advisor?: string | null;
  remarks?: string;
}

interface DetailsProps {
  onDetailsChange?: (data: FormData) => void;
  initialData?: FormData;
  showErrors?: boolean;
}

const Details = ({
  onDetailsChange,
  initialData,
  showErrors,
}: DetailsProps) => {
  const { data: userData } = useGetIdentity();

  // Fetch Room List
  const { result } = useList({
    resource: "room",
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "Available",
      },
    ],
  });

  // Form
  const [formData, setFormData] = useState<FormData>(
    initialData
      ? {
          ...initialData,
          date: initialData.date?.map((d) => new Date(d)) ?? [],
          advisor: userData?.type === "Instructor" ? null : initialData.advisor,
        }
      : {
          room: [] as string[],
          purpose: "",
          date: [] as Date[],
          startTime: "",
          endTime: "",
          advisor: userData?.type === "Instructor" ? null : "",
          remarks: "",
        }
  );
  const allTimes = getTimeRange({
    startTime: "7:30",
    endTime: "17:30",
    interval: "00:30",
  });

  const filteredStartTimes = allTimes.slice(0, -1);

  const filteredEndTimes =
    formData.startTime && allTimes.includes(formData.startTime)
      ? allTimes.slice(
          allTimes.indexOf(formData.startTime) + 2,
          allTimes.indexOf(formData.startTime) + 5
        )
      : allTimes;

  // Validation to reset the end time if start time is changed
  useEffect(() => {
    if (
      formData.startTime &&
      formData.endTime &&
      allTimes.indexOf(formData.endTime) <= allTimes.indexOf(formData.startTime)
    ) {
      setFormData((prev) => ({ ...prev, endTime: "" }));
    }
  }, [formData.startTime, formData.endTime, allTimes]);

  // Send data up whenever formData changes
  useEffect(() => {
    if (onDetailsChange) {
      onDetailsChange(formData);
    }
  }, [formData, onDetailsChange]);

  // Purpose Choices
  // const purposeOptions = [
  //   { value: "it_project", label: "IT Project-Related" },
  //   { value: "research", label: "Research-Related" },
  //   { value: "academic", label: "Academic Requirement" },
  //   { value: "thesis", label: "Thesis / Capstone" },
  //   { value: "event", label: "Event / Activity" },
  //   { value: "training", label: "Training / Workshop" },
  //   { value: "maintenance", label: "Maintenance Work" },
  //   { value: "admin_task", label: "Administrative Task" },
  //   { value: "meeting", label: "Meeting / Consultation" },
  //   { value: "testing", label: "System Testing" },
  //   { value: "dept_request", label: "Department Request" },
  //   { value: "facility", label: "Facility Use" },
  //   { value: "other", label: "Other" },
  // ];

  // Errors
  const errors = {
    room:
      showErrors && !formData.room
        ? "Please select at least one available room."
        : "",
    purpose:
      showErrors && !formData.purpose
        ? "Please provide the purpose of your reservation."
        : "",
    date:
      showErrors && (!formData.date || formData.date.length === 0)
        ? "Please choose at least one date."
        : "",
    startTime:
      showErrors && !formData.startTime ? "Please specify a start time." : "",
    endTime:
      showErrors && !formData.endTime ? "Please specify an end time." : "",
    advisor:
      showErrors && !formData.advisor && userData?.type !== "Instructor"
        ? "Please select your advisor’s name."
        : "",
    remarks:
      showErrors && !formData.remarks
        ? "Please provide a short title describing this reservation."
        : "",
  };

  return (
    <MantineProvider>
      <div className="flex flex-col gap-5 justify-center items-center">
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <MultiSelect
              description="Select one or more rooms."
              type="multiple"
              label="Room"
              placeholder="Tril"
              data={result.data.map((r) => r.name)}
              value={formData.room?.map((id) => id.toString())}
              onChange={(val) => setFormData({ ...formData, room: val })}
              error={errors.room}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Purpose"
              description="Select the main purpose"
              placeholder="IT Project-Related"
              // data={purposeOptions}
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
              value={formData.purpose}
              onChange={(val) =>
                setFormData({ ...formData, purpose: val ?? "" })
              }
              error={errors.purpose}
            />
          </div>
        </div>

        <div className="w-full">
          <DatePickerInput
            description="Select one or more dates."
            placeholder="November 21, 2025, December 2, 2025"
            type="multiple"
            leftSection={<TbCalendar size={18} />}
            leftSectionPointerEvents="none"
            label="Select Date"
            clearable
            minDate={new Date()}
            maxDate={dayjs().add(1, "M").toDate()}
            excludeDate={(date) => dayjs(date).day() === 0}
            firstDayOfWeek={0}
            value={formData.date?.map((d) => new Date(d))}
            onChange={(val) =>
              setFormData({
                ...formData,
                date: (val ?? []).map((v) => new Date(v)),
              })
            }
            error={errors.date}
          />
        </div>

        <div className="flex w-full gap-4">
          <div className="flex-1">
            <TimePicker
              label="Time Start"
              value={formData.startTime}
              onChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  startTime: val ?? "",
                  endTime: "",
                }));
              }}
              presets={filteredStartTimes}
              withDropdown
              format="12h"
              error={errors.startTime}
            />
          </div>
          <div className="flex-1">
            <TimePicker
              label="Time End"
              value={formData.endTime}
              onChange={(val) => setFormData({ ...formData, endTime: val })}
              presets={filteredEndTimes}
              withDropdown
              disabled={!formData.startTime}
              format="12h"
              error={errors.endTime}
            />
          </div>
        </div>

        {userData?.type !== "Instructor" && (
          <div className="w-full">
            <Select
              label="Advisor"
              placeholder="Josephine Dela Cruz"
              data={["Josephine Dela Cruz", "Dalos Miguel", "Ramel Cabanilla"]}
              description="Enter the supervising advisor/faculty"
              value={formData.advisor}
              onChange={(val) =>
                setFormData({ ...formData, advisor: val ?? "" })
              }
              error={errors.advisor}
            />
          </div>
        )}

        <div className="w-full">
          <TextInput
            label="Remarks"
            description="Enter the class code or research purpose. (Max 30 characters)"
            placeholder="CS 311, Thesis, Capstone"
            value={formData.remarks}
            max={30}
            onChange={(val) =>
              setFormData({
                ...formData,
                remarks: val.currentTarget.value ?? "",
              })
            }
            error={errors.remarks}
          />
        </div>
      </div>
    </MantineProvider>
  );
};

export default Details;
