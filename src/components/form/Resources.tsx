import {
  ActionIcon,
  MantineProvider,
  TagsInput,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { FaPlusSquare } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

interface FormData {
  participants?: string[];
  equipments?: string[];
}

interface ResourcesProps {
  onDetailsChange?: (data: FormData) => void;
  initialData?: FormData;
}

const Resources = ({ onDetailsChange, initialData }: ResourcesProps) => {
  const [formData, setFormData] = useState<FormData>(() => {
    const initialParticipants = initialData?.participants;

    return {
      participants:
        initialParticipants && initialParticipants.length > 0
          ? initialParticipants
          : ([""] as string[]),
      equipments: initialData?.equipments || ([] as string[]),
    };
  });

  const addFields = () => {
    setFormData((prev: FormData) => ({
      ...prev,
      participants: [...(prev.participants ?? []), ""],
    }));
  };

  // Update participant name
  const updateParticipantName = (index: number, name: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      participants: prev.participants?.map((p, i) => (i === index ? name : p)),
    }));
  };

  // Remove participant
  const removeParticipant = (index: number) => {
    setFormData((prev: FormData) => ({
      ...prev,
      participants: prev.participants?.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (onDetailsChange) onDetailsChange(formData);
  }, [formData, onDetailsChange]);

  return (
    <MantineProvider>
      <div className="flex flex-col gap-4">
        <div className="flex items-center  gap-2">
          <h2 className="leading-5">Participants</h2>
          <button
            className="text-(--primary) cursor-pointer flex items-center gap-2 rounded-full hover:text-(--primary-hover) duration-200"
            onClick={addFields}
            type="button"
          >
            <FaPlusSquare size={28} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {formData.participants &&
            formData.participants.map((participant, index) => (
              <div key={index} className="flex items-center gap-2">
                <TextInput
                  placeholder="Enter Name"
                  value={participant}
                  onChange={(e) =>
                    updateParticipantName(index, e.currentTarget.value)
                  }
                  className="flex-1"
                />
                {index !== 0 && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => removeParticipant(index)}
                    title="Remove participant"
                  >
                    <MdDelete size={20} />
                  </ActionIcon>
                )}
              </div>
            ))}
        </div>
        <div>
          <TagsInput
            label="Equipments"
            placeholder="e.g. Laptop, HDMI cable, Projector"
            description="List any equipment you will bring that may affect lab usage."
            data={[
              "Laptop",
              "Router",
              "Projector",
              "Extension Cord",
              "HDMI Cable",
              "Arduino",
            ]}
            value={formData.equipments?.map((e: string) => e)}
            onChange={(val) =>
              setFormData({ ...formData, equipments: val ?? [] })
            }
          />
        </div>
      </div>
    </MantineProvider>
  );
};

export default Resources;
