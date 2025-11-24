import { useState } from "react";

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
  remarks?: string;
}

// Form Components
import Review from "../../components/form/Review";
import Details from "../../components/form/Details";
import Resources from "../../components/form/Resources";

// Mantine Import
import { MantineProvider, Stepper } from "@mantine/core";

// React Icons
import { TbClipboardText, TbUsersGroup, TbCheckupList } from "react-icons/tb";

// Refine Import
import { useGetIdentity, useGo, useList } from "@refinedev/core";
import supabase from "../../config/supabaseClient";
import { notifyError, notifySuccess } from "../../utils/notifcations";

export const ReservationCreate = () => {
  const { data: userData } = useGetIdentity();
  const [active, setActive] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [detailsData, setDetailsData] = useState<DetailsData>({});
  const [resourcesData, setResourcesData] = useState<ResourceData>({});
  const [showErrors, setShowErrors] = useState(false);

  const go = useGo();

  // Fetch room table
  const { result } = useList({ resource: "room" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = userData.user.id;

      if (!userId) throw new Error("You are not logged in.");

      // Get the ids base from the name column
      const matchedRooms = result?.data?.filter((room) =>
        detailsData.room?.includes(room.name)
      );

      if (!matchedRooms || matchedRooms.length === 0) {
        alert("No valid rooms selected!");
        return;
      }
      const roomIds = matchedRooms.map((room) => room.id);

      // Call the SQL function directly
      const { error } = await supabase.rpc("create_reservation", {
        p_user_id: userId,
        p_purpose: detailsData.purpose,
        p_room_ids: roomIds,
        p_dates: Array.isArray(detailsData.date)
          ? detailsData.date
          : [detailsData.date],
        p_start_time: detailsData.startTime,
        p_end_time: detailsData.endTime,
        p_advisor: detailsData.advisor || null,
        p_remarks: detailsData.remarks || null,
        p_equipments: resourcesData.equipments || null,
        p_participants: resourcesData.participants || null,
      });

      if (error) {
        notifyError({
          title: "Unable to Create Reservation",
          message: "We couldn’t create your reservation. Please try again.", // ! Change
        });

        window.location.reload();
      }

      notifySuccess({
        title: "Reservation Created",
        message: "Your reservation has been successfully submitted.",
      });

      go({
        to: "/",
      });
    } catch (error) {
      notifyError({
        title: "System Error",
        message:
          "We’re having trouble processing your request. Please try again shortly.",
      });
      console.error(error);
    }
  };

  // Pagination
  const nextStep = () => {
    if (active === 0) {
      setShowErrors(true);
      if (
        detailsData &&
        detailsData.room &&
        detailsData.room.length > 0 &&
        detailsData.purpose &&
        detailsData.date &&
        detailsData.date?.length > 0 &&
        detailsData.startTime &&
        detailsData.endTime &&
        detailsData.remarks
      ) {
        setActive(1);
      }
    } else {
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };
  const prevStep = () => setActive((current) => Math.max(0, current - 1));

  return (
    <>
      <MantineProvider
        theme={{
          components: {
            Stepper: {
              styles: {
                separator: {
                  backgroundColor: "var(--ui-border)",
                },
              },
            },
          },
        }}
      >
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-10 rounded flex flex-col gap-6 sm:gap-8 w-4xl max-w-xl">
              <Stepper
                active={active}
                onStepClick={setActive}
                allowNextStepsSelect={false}
                color="var(--primary)"
                styles={{
                  stepIcon: {
                    className: "bg-blue-200 border-blue-200 text-white",
                  },
                  separator: { className: "bg-blue-200" },
                }}
              >
                <Stepper.Step
                  label="Details"
                  icon={<TbClipboardText size={24} />}
                >
                  {active === 0 && (
                    <Details
                      initialData={detailsData as DetailsData}
                      onDetailsChange={setDetailsData}
                      showErrors={showErrors}
                    />
                  )}
                </Stepper.Step>
                <Stepper.Step
                  label="Resources"
                  icon={<TbUsersGroup size={24} />}
                >
                  <Resources
                    initialData={resourcesData as ResourceData}
                    onDetailsChange={setResourcesData}
                  />
                </Stepper.Step>
                <Stepper.Step label="Review" icon={<TbCheckupList size={24} />}>
                  <Review
                    details={detailsData ? [detailsData] : []}
                    resources={resourcesData ? [resourcesData] : []}
                    onAgreeChange={setAgreed}
                  />
                </Stepper.Step>
              </Stepper>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  type="button"
                  className={`py-2 px-12 text-[var(--primary)] border border-[var(--primary)] rounded-sm cursor-pointer duration-200 hover:bg-[var(--primary)] hover:text-white ${
                    active === 0 ? "invisible" : "visible"
                  }`}
                >
                  Back
                </button>

                {active === 2 ? (
                  <button
                    type="submit"
                    disabled={!agreed}
                    className="py-2 px-12 bg-[var(--primary)] text-[var(--primary-white)] rounded-sm cursor-pointer hover:bg-[var(--primary-hover)] duration-200 disabled:opacity-50"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="py-2 px-12 bg-[var(--primary)] text-[var(--primary-white)] rounded-sm cursor-pointer hover:bg-[var(--primary-hover)] duration-200"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </MantineProvider>
    </>
  );
};
