import {
  Checkbox,
  MantineProvider,
  MultiSelect,
  Select,
  TagsInput,
  TextInput,
} from "@mantine/core";
import { DatePickerInput, TimePicker } from "@mantine/dates";
import { useGetIdentity } from "@refinedev/core";
import { useState } from "react";
import { TbCalendar } from "react-icons/tb";

interface DetailsData {
  room?: string[];
  purpose?: string;
  date?: Date[];
  startTime?: string;
  endTime?: string;
  advisor?: string | null;
  remarks?: string;
}

interface ResourceData {
  participants?: string[];
  equipments?: string[];
}

interface ReviewProps {
  details: DetailsData[];
  resources: ResourceData[];
  onAgreeChange?: (checked: boolean) => void;
}

const Review = ({ details, resources, onAgreeChange }: ReviewProps) => {
  const { data: userData } = useGetIdentity();
  const detail = details[0] || {};
  const resource = resources[0] || {};
  const [agreed, setAgreed] = useState(false);

  const handleCheckboxChange = (value: boolean) => {
    setAgreed(value);
    onAgreeChange?.(value);
  };

  return (
    <MantineProvider>
      <div className="flex flex-col gap-5 justify-center w-full max-w-3xl">
        {/* Room and Purpose */}
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <MultiSelect label="Room" value={detail.room} readOnly />
          </div>
          <div className="flex-1">
            <Select
              label="Purpose"
              data={["IT Project-Related", "Research-Related"]}
              placeholder="Select Purpose"
              value={detail.purpose}
              readOnly
            />
          </div>
        </div>

        {/* Date */}
        <div className="w-full">
          <DatePickerInput
            type="multiple"
            leftSection={<TbCalendar size={18} />}
            leftSectionPointerEvents="none"
            value={detail.date}
            label="Date"
            readOnly
          />
        </div>

        {/* Time */}
        <div className="flex w-full gap-4">
          <div className="flex-1">
            <TimePicker
              label="Time Start"
              value={detail.startTime}
              withDropdown
              format="12h"
              readOnly
            />
          </div>
          <div className="flex-1">
            <TimePicker
              label="Time End"
              value={detail.endTime}
              withDropdown
              format="12h"
              readOnly
            />
          </div>
        </div>

        {/* Advisor */}
        {userData.type !== "Instructor" && (
          <div className="w-full">
            <Select
              label="Advisor"
              placeholder="Select Advisor"
              data={["Josephine Dela Cruz", "Dalos Miguel", "Ramel Cabanilla"]}
              value={detail.advisor}
              readOnly
            />
          </div>
        )}

        {/* Remarks */}
        <div className="w-full">
          <TextInput
            readOnly
            label="Remarks"
            value={detail.remarks ? [detail.remarks] : undefined}
            disabled={!detail.remarks?.length ? true : false}
          />
        </div>

        {/* Participants */}
        <div className="w-full flex flex-col gap-4">
          {resource.participants?.length ? (
            resource.participants
              .filter(
                (participant, index) => index === 0 || participant.trim() !== ""
              )
              .map((participant, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TextInput
                    label={index === 0 ? "Participants" : undefined}
                    value={participant}
                    className="flex-1"
                    disabled={!participant}
                    readOnly
                  />
                </div>
              ))
          ) : (
            <div className="flex items-center gap-2">
              <TextInput
                label="Participants"
                className="flex-1"
                disabled={true}
                readOnly
              />
            </div>
          )}
        </div>

        {/* Equipments */}
        <div className="w-full">
          <TagsInput
            readOnly
            label="Equipments"
            data={[
              "Laptop",
              "Router",
              "Projector",
              "Extension Cord",
              "HDMI Cable",
              "Arduino",
            ]}
            value={resource.equipments?.map((e: string) => e)}
            disabled={!resource.equipments?.length ? true : false}
          />
        </div>

        {/* Terms & Policies Checkbox */}
        <Checkbox
          label="I have read and understand the terms and policies."
          checked={agreed}
          onChange={(event) =>
            handleCheckboxChange(event.currentTarget.checked)
          }
        />
      </div>
    </MantineProvider>
  );
};

export default Review;
