import React from "react";

// Progress bar component for showing completion percentage
export default function LoadingBar({ percent = 0 }) {
  return (
    <div className="w-full flex justify-center items-center">
      <div
        className="relative bg-white rounded-full shadow"
        style={{ width: 120, height: 10 }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            background: "#6366f1" /* indigo-500 */,
          }}
        />
      </div>
    </div>
  );
}
