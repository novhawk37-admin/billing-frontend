import React from "react";
import { FaBars, FaPlus } from "react-icons/fa";

export default function Topbar({ query, setQuery, onCreate, onMenu }) {
  return (
    <header className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      
      <div className="flex items-center gap-3">
        <button className="md:hidden text-gray-600" onClick={onMenu}>
          <FaBars size={20} />
        </button>

        <input
          type="text"
          placeholder="Search invoices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-4 py-2 border rounded-md w-60 focus:outline-none"
        />
      </div>

      <button
        onClick={onCreate}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        <FaPlus />
        New Invoice
      </button>
    </header>
  );
}
