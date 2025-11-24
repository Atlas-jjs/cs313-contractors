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
  const { result } = useList({ resource: "room" });

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
        ? "Please enter the purpose of this reservation"
        : "",
  };

  return (
    <MantineProvider>
      <div className="flex flex-col gap-5 justify-center items-center">
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <MultiSelect
              type="multiple"
              label="Room"
              placeholder="Select Room"
              data={result.data.map((r) => r.name)}
              value={formData.room?.map((id) => id.toString())}
              onChange={(val) => setFormData({ ...formData, room: val })}
              error={errors.room}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Purpose"
              placeholder="Select Purpose"
              data={["IT Project-Related", "Research-Related"]}
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
            placeholder="Select Date"
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
              placeholder="Select Advisor"
              data={["Josephine Dela Cruz", "Dalos Miguel", "Ramel Cabanilla"]}
              description="If applicable, enter the supervising advisor/faculty"
              clearable
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
            description="Class Code or specific research."
            placeholder="CS 311, Thesis, Capstone"
            value={formData.remarks}
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
