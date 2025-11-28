import React from "react";

export default function Card({ title, value, warning }) {
  return (
    <div
      className={`p-4 rounded-lg shadow-sm bg-white border 
      ${warning ? "border-red-400" : "border-gray-200"}`}
    >
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}
