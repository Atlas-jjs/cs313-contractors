import { useList } from "@refinedev/core";
import type { Room } from "../../../utils/types";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import supabase from "../../../config/supabaseClient";
import { BiDownArrow } from "react-icons/bi";
import { Link } from "react-router";
import { IoAddCircleSharp } from "react-icons/io5";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import {
  formatEvents,
  generateWeekOptions,
  getDuration,
  getTop,
  type ParsedCalendarEvent,
} from "./util";
import { Loader, MantineProvider, Select } from "@mantine/core";

export interface CalendarListProps {
  events?: ParsedCalendarEvent[];
  startHour?: number;
  endHour?: number;
}

export const CalendarList = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [events, setEvents] = useState<ParsedCalendarEvent[]>([]);
  const [roomsQuery, setRoomQuery] = useState<Room[]>();
  const [loadingEvent, setLoadingEvents] = useState<boolean>(false);

  console.log(loadingEvent); // Temporary

  const startHour = 7,
    endHour = 18;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  // Fetch rooms
  const {
    result: roomsData,
    query: { isLoading: roomsIsLoading },
  } = useList<Room>({ resource: "room" });

  useEffect(() => {
    if (roomsData) setRoomQuery(roomsData.data);
  }, [roomsData]);

  // Indicate which day it will start (Starts on Sunday)
  const baseWeek = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    []
  );

  //
  const startWeek = useMemo(
    () => addWeeks(baseWeek, weekOffset),
    [baseWeek, weekOffset]
  );

  // Total number of days to display on the Calendar
  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(startWeek, i)),
    [startWeek]
  );
  // Fetch the current date today
  const today = new Date();

  // px height of the events
  const rowHeight = 24; // px per 30 minutes

  // Convert the total number of 30 minutes *cell
  const totalHalfHours = (endHour - startHour) * 2;

  // Generate the options for picking per week
  const weekOptions = generateWeekOptions(baseWeek);

  useEffect(() => {
    if (!selectedRoom && roomsQuery?.length && !roomsIsLoading) {
      setSelectedRoom(roomsQuery[0].id.toString());
    }
  }, [selectedRoom, roomsIsLoading, roomsQuery]);

  useEffect(() => {
    async function fetchSchedules() {
      setLoadingEvents(true);

      try {
        const { data, error } = await supabase.rpc("get_room_schedule2", {
          p_room_id: Number(selectedRoom),
          p_start: format(startWeek, "yyyy-MM-dd"),
          p_end: format(addDays(startWeek, 6), "yyyy-MM-dd"),
        });

        if (error) throw error;

        setEvents(formatEvents(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchSchedules();
  }, [selectedRoom, startWeek]);

  if (roomsIsLoading) {
    return (
      <MantineProvider>
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider>
      <div className="bg-white rounded-md border border-gray-200 mb-4">
        {/* Header */}
        <div
          // ref={ref}
          className="flex justify-between items-center relative pt-3 pb-3 pl-0.5 pr-0.5"
        >
          {/* Week Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 bg-white"
            >
              <span className="font-bold text-lg">
                {format(startWeek, "MMMM d, yyyy")} -{" "}
                {format(addDays(startWeek, 6), "MMMM d, yyyy")}
              </span>
              <BiDownArrow
                className={`transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {weekOptions.map((week) => (
                  <button
                    key={week.offset}
                    onClick={() => {
                      setWeekOffset(week.offset);
                      setDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 transition ${
                      week.offset === weekOffset
                        ? "bg-blue-50 font-semibold"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{week.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 mr-3 relative">
            <Link to="/reservation/create">
              <IoAddCircleSharp className="text-4xl cursor-pointer text-(--primary) hover:text-(--primary-hover) transition" />
            </Link>

            {/* Room Dropdown */}
            <div className="relative">
              <Select
                data={roomsQuery?.map((r) => ({
                  value: r.id.toString(),
                  label: r.name,
                }))}
                // placeholder={roomsQuery?.[0]?.name || "Select a room"}
                value={selectedRoom}
                onChange={(value) => setSelectedRoom(value || "")}
              />
            </div>

            {/* Week navigation */}
            <span className="flex gap-1">
              <IoIosArrowDropleft
                className="text-2xl cursor-pointer hover:text-gray-700 transition"
                onClick={() => setWeekOffset((prev) => prev - 1)}
              />
              <IoIosArrowDropright
                className="text-2xl cursor-pointer hover:text-gray-700 transition"
                onClick={() => setWeekOffset((prev) => prev + 1)}
              />
            </span>
          </div>
        </div>

        <div>
          {/* Header Row */}
          <div className="flex">
            {/* Corner Cell */}
            <div className="border-r border-t border-b text-sm w-26 shrink-0 border-gray-400">
              <div className="border-b border-gray-400"></div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 flex-1 border-gray-400">
              {days.map((day, dayIndex) => {
                const isPast =
                  day <
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                  );

                return (
                  <div
                    key={dayIndex}
                    className={`flex flex-col justify-center text-center py-2 font-medium border-r border-b border-t-2 border-gray-400 transition-colors
                                    ${
                                      isPast ? "bg-gray-100 text-gray-400" : ""
                                    }`}
                  >
                    <span className="uppercase font-light">
                      {format(day, "EEE")}
                    </span>
                    <span className="font-black text-3xl">
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main body (time + days) */}
          <div className="flex">
            {/* Time Column */}
            <div className="border-r border-gray-400 text-sm w-26 font-bold">
              {Array.from({ length: totalHalfHours }).map((_, i) => {
                const hour = Math.floor(i / 2) + startHour;
                const minute = i % 2 === 0 ? "00" : "30";
                const timeLabel = `${hour > 12 ? hour - 12 : hour}:${minute} ${
                  hour >= 12 ? "PM" : "AM"
                }`;

                return (
                  <div
                    key={i}
                    className="h-6 border-b text-center border-gray-400 text-gray-600"
                  >
                    {timeLabel}
                  </div>
                );
              })}
            </div>

            {/* Day Columns */}
            <div className="grid grid-cols-7 flex-1">
              {days.map((day, dayIndex) => {
                const isPast =
                  day <
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                  );

                return (
                  <div
                    key={dayIndex}
                    className={`border-r border-gray-400 relative ${
                      isPast ? "bg-gray-50 opacity-60" : ""
                    }`}
                  >
                    {/* Background rows */}
                    {Array.from({ length: totalHalfHours }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 border-b 0.5 border-gray-400"
                      ></div>
                    ))}

                    {/* Events */}
                    {events &&
                      events
                        .filter((e) => e.day === dayIndex)
                        .map((event, idx) => {
                          const topPx =
                            (getTop(event.startTime) - startHour) *
                            2 *
                            rowHeight;
                          const heightPx =
                            getDuration(event.startTime, event.endTime) *
                            2 *
                            rowHeight;

                          return (
                            <div
                              key={idx}
                              className={`absolute left-1 right-1 p-2 rounded transition-all shadow-md duration-400 text-white
                          ${
                            event.reserverId === currentUserId
                              ? "bg-(--primary)"
                              : event.reserverType === "Admin"
                              ? "bg-[#CC5500]"
                              : event.reserverType === "Instructor"
                              ? "bg-[#2E8B57]"
                              : "bg-[#6A0DAD]"
                          }`}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                              }}
                            >
                              <div className="font-semibold text-sm truncate overflow-hidden whitespace-nowrap uppercase">
                                {event.remarks}
                              </div>
                              <div className="text-xs truncate overflow-hidden whitespace-nowrap">
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                          );
                        })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center">
          <div className={`${legendColor} bg-(--primary)`}></div>
          <span className="font-medium">Own Reservations</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`${legendColor} bg-[#CC5500]`}></div>
          <span className="font-medium">Admin</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`${legendColor} bg-[#2E8B57]`}></div>
          <span className="font-medium">Instructor</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`${legendColor} bg-[#6A0DAD]`}></div>
          <span className="font-medium">Other Students</span>
        </div>
      </div>
    </MantineProvider>
  );
};

const legendColor = "lg:w-8 lg:h-8 rounded-full border w-4 h-4";
