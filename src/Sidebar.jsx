import React from "react";
import { FaFileInvoice, FaUsers, FaChartBar, FaTimes } from "react-icons/fa";

export default function Sidebar({ activeTab, setActiveTab, open, setOpen }) {
  const tabs = [
    { id: "invoices", label: "Invoices", icon: <FaFileInvoice /> },
    { id: "customers", label: "Customers", icon: <FaUsers /> },
    { id: "reports", label: "Reports", icon: <FaChartBar /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transform 
      ${open ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold text-blue-700">NovHawk Billing</h1>
        <button className="md:hidden" onClick={() => setOpen(false)}>
          <FaTimes />
        </button>
      </div>

      <nav className="mt-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition 
              ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
