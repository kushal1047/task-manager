import { useState, useEffect, useMemo } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DueDatePopup({ open, initialDate, onSet, onClose }) {
  const now = useMemo(() => new Date(), []);
  const base = initialDate ? new Date(initialDate) : now;
  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [day, setDay] = useState(base.getDate());
  const [hour, setHour] = useState(base.getHours());
  const [minute, setMinute] = useState(base.getMinutes());
  const [amPm, setAmPm] = useState(base.getHours() >= 12 ? "PM" : "AM");

  // Helper: get days in month
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Helper: is selected date/time in the past or present?
  function isInPastOrPresent(y, m, d, h, min, ampm) {
    const selected = new Date(y, m, d);
    let selectedHour = h;

    // Convert 12-hour to 24-hour format
    if (ampm === "PM" && h !== 12) {
      selectedHour = h + 12;
    } else if (ampm === "AM" && h === 12) {
      selectedHour = 0;
    }

    selected.setHours(selectedHour, min, 0, 0);
    return selected <= now;
  }

  // Generate all days for the selected month/year
  const daysInMonth = getDaysInMonth(year, month);
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Validate selected date/time
  const isValid = !isInPastOrPresent(year, month, day, hour, minute, amPm);

  useEffect(() => {
    if (open) {
      if (initialDate) {
        const d = new Date(initialDate);
        setYear(d.getFullYear());
        setMonth(d.getMonth());
        setDay(d.getDate());

        // Convert 24-hour format to 12-hour format for display
        let displayHour = d.getHours();
        let displayAmPm = "AM";

        if (displayHour === 0) {
          displayHour = 12;
          displayAmPm = "AM";
        } else if (displayHour === 12) {
          displayHour = 12;
          displayAmPm = "PM";
        } else if (displayHour > 12) {
          displayHour = displayHour - 12;
          displayAmPm = "PM";
        } else {
          displayAmPm = "AM";
        }

        setHour(displayHour);
        setMinute(d.getMinutes());
        setAmPm(displayAmPm);
      } else {
        // Default to 1 hour from now
        const future = new Date(now);
        future.setHours(now.getHours() + 1);

        // If we've crossed midnight, adjust the date
        if (future.getDate() !== now.getDate()) {
          // We've moved to the next day
          setYear(future.getFullYear());
          setMonth(future.getMonth());
          setDay(future.getDate());
        } else {
          // Same day
          setYear(now.getFullYear());
          setMonth(now.getMonth());
          setDay(now.getDate());
        }

        // Convert 24-hour format to 12-hour format for display
        let displayHour = future.getHours();
        let displayAmPm = "AM";

        if (displayHour === 0) {
          displayHour = 12;
          displayAmPm = "AM";
        } else if (displayHour === 12) {
          displayHour = 12;
          displayAmPm = "PM";
        } else if (displayHour > 12) {
          displayHour = displayHour - 12;
          displayAmPm = "PM";
        } else {
          displayAmPm = "AM";
        }

        setHour(displayHour);
        setMinute(future.getMinutes());
        setAmPm(displayAmPm);
      }
    }
  }, [open, initialDate, now]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-xs animate-pop relative">
        {/* Close button at top right */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex flex-col items-center mb-4">
          {/* Date row */}
          <div className="flex gap-2 mb-2 overflow-x-auto">
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="scrollbar-thin px-2 py-1 rounded border"
            >
              {allDays.map((i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="scrollbar-thin px-2 py-1 rounded border"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="scrollbar-thin px-2 py-1 rounded border"
            >
              {[...Array(6)].map((_, i) => {
                const y = now.getFullYear() + i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
          {/* Time row */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="scrollbar-thin px-2 py-1 rounded border"
            >
              {[...Array(12)].map((_, i) => {
                const displayHour = i === 0 ? 12 : i;
                return (
                  <option key={i} value={displayHour}>
                    {displayHour}
                  </option>
                );
              })}
            </select>
            <span className="text-lg font-bold">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="scrollbar-thin px-2 py-1 rounded border"
            >
              {[...Array(60)].map((_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              value={amPm}
              onChange={(e) => setAmPm(e.target.value)}
              className="scrollbar-thin px-2 py-1 rounded border"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <button
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition mb-2"
          onClick={() => {
            if (!isValid) return;

            // Convert 12-hour format to 24-hour format
            let selectedHour = hour;
            if (amPm === "PM" && hour !== 12) {
              selectedHour = hour + 12;
            } else if (amPm === "AM" && hour === 12) {
              selectedHour = 0;
            }

            const due = new Date(year, month, day, selectedHour, minute);
            onSet && onSet(due);
          }}
          disabled={!isValid}
        >
          Set Due Date
        </button>
        <button
          className={`w-full py-2 rounded-lg transition ${
            initialDate
              ? "text-red-500 hover:text-red-700 hover:bg-red-50"
              : "text-gray-400 cursor hover:text-gray-600"
          }`}
          onClick={() => {
            if (initialDate) {
              onSet && onSet(null); // Remove due date by setting to null
            } else {
              // For new tasks, just close the popup
              onClose && onClose();
            }
          }}
          disabled={false} // Always enabled, but behavior changes based on initialDate
        >
          {initialDate ? "Remove Due Date" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
