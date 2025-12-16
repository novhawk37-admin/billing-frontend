import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
import AddCustomer from "./AddCustomer";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Card from "./Card";
import Reports from "./Reports";   // ✅ IMPORTANT

const NOVHAWK_BLUE = "#2a5298";

export default function App() {
  const [invoices, setInvoices] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("invoices");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---- FETCH INVOICES ----
  const fetchInvoices = async () => {
    try {
      const res = await axios.get("https://billing-backend-2pfd.onrender.com/api/invoices");
      setInvoices(res.data.data || []);
    } catch (err) {
      console.warn("Could not fetch invoices from backend — using sample data.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = query.toLowerCase();
    return (
      (inv.id || "").toLowerCase().includes(q) ||
      (inv.customer || "").toLowerCase().includes(q) ||
      String(inv.amount || "").includes(q) ||
      (inv.email || "").toLowerCase().includes(q)
    );
  });

  // ---- CREATE INVOICE ----
  async function addInvoice(payload) {
    try {
      const res = await axios.post("https://billing-backend-2pfd.onrender.com/api/invoices", {
        customer: payload.customer,
        email: payload.email,
        phone: payload.phone,
        amount: Number(payload.amount),
        status: payload.status,
        date: payload.date,
      });

      const saved = res.data.data;
      setInvoices((s) => [saved, ...s]);
      setShowNew(false);
      alert(`Invoice ${saved.id} created successfully.`);
    } catch (err) {
      console.error("Failed to save invoice:", err);
      setInvoices((s) => [payload, ...s]);
      setShowNew(false);
      alert("Invoice created locally but failed to save to server.");
    }
  }

  // ---- UPDATE STATUS ----
  function updateStatus(id, status) {
    setInvoices((s) => s.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
  }

  // ---- SEND INVOICE EMAIL ----
  async function sendInvoice(inv) {
    if (!inv.email) return alert("No email provided for this invoice.");
    try {
      await axios.post("https://billing-backend-2pfd.onrender.com/api/send-invoice", {
        name: inv.customer,
        email: inv.email,
        invoiceId: inv.id,
        paid: inv.status === "Paid" ? inv.amount : 0,
        pending: inv.status === "Pending" ? inv.amount : 0,
      });
      alert(`Invoice ${inv.id} sent to ${inv.email}`);
    } catch (err) {
      console.error("Manual send failed:", err);
      alert(`Failed to send invoice ${inv.id}`);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex-1 p-4 md:ml-64 transition-all">
        <Topbar
          query={query}
          setQuery={setQuery}
          onCreate={() => setShowNew(true)}
          onMenu={() => setSidebarOpen(true)}
        />

        <main className="mt-6 space-y-6">
          {/* TOP CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card title="Total Invoices" value={invoices.length} />
            <Card title="Total Receivables" value={`₹ ${formatMoney(sumAmounts(invoices))}`} />
            <Card title="Overdue" value={`${countByStatus(invoices, "Overdue")} invoices`} warning />
          </div>

          {/* MAIN CONTENT */}
          {loading ? (
            <div className="p-6 bg-white rounded-lg shadow-sm text-center">
              Loading invoices…
            </div>
          ) : activeTab === "invoices" ? (
            <InvoiceTable
              invoices={filtered}
              onStatusChange={updateStatus}
              onSendInvoice={sendInvoice}
            />
          ) : activeTab === "customers" ? (
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <AddCustomer adminToken="your_super_secret_admin_token" />
            </div>
          ) : (
            <Reports invoices={invoices} /> // ✅ Reports page fully integrated
          )}
        </main>
      </div>

      {showNew && <NewInvoiceModal onClose={() => setShowNew(false)} onCreate={addInvoice} />}
    </div>
  );
}

/* ---------------- TABLE ---------------- */

function InvoiceTable({ invoices, onStatusChange, onSendInvoice }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 border-b">
            <th className="p-3 text-left">Invoice</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-right">Amount</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Send</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50">
              <td className="p-3 font-medium">{inv.id}</td>
              <td className="p-3">{inv.customer}</td>
              <td className="p-3">{inv.email}</td>
              <td className="p-3 text-right">₹ {formatMoney(inv.amount)}</td>
              <td className="p-3">
                {inv.date ? new Date(inv.date).toLocaleDateString() : "-"}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span>{statusPill(inv.status)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onStatusChange(inv.id, "Paid")}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => onStatusChange(inv.id, "Pending")}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      Pending
                    </button>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <button
                  onClick={() => onSendInvoice(inv)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                >
                  Send Mail
                </button>
              </td>
            </tr>
          ))}

          {invoices.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-500">
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function statusPill(status) {
  const map = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Overdue: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}

/* ---------------- NEW INVOICE MODAL ---------------- */

function NewInvoiceModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    customer: "",
    email: "",
    phone: "",
    amount: "",
    date: "",
    status: "Pending",
  });

  function submit(e) {
    e.preventDefault();
    if (!form.customer || !form.amount || !form.email)
      return alert("Please fill all fields");
    onCreate({ ...form, amount: Number(form.amount) });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4 z-40">
      <form className="w-full max-w-2xl bg-white rounded-lg p-6 shadow-lg" onSubmit={submit}>
        <h2 className="text-lg font-semibold" style={{ color: NOVHAWK_BLUE }}>
          New Invoice
        </h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col md:col-span-2">
            <span className="text-sm">Customer Name</span>
            <input
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              placeholder="Customer name"
              className="mt-1 px-3 py-2 border rounded-md"
            />
          </label>

          <label className="flex flex-col md:col-span-2">
            <span className="text-sm">Customer Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@gmail.com"
              className="mt-1 px-3 py-2 border rounded-md"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone number"
              className="mt-1 px-3 py-2 border rounded-md"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Amount (₹)</span>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="mt-1 px-3 py-2 border rounded-md"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 px-3 py-2 border rounded-md"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 px-3 py-2 border rounded-md"
            >
              <option>Pending</option>
              <option>Paid</option>
              <option>Overdue</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md text-white"
            style={{ background: NOVHAWK_BLUE }}
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------- UTIL FUNCTIONS ---------------------- */
function sumAmounts(list) {
  return list.reduce((s, i) => s + (Number(i.amount) || 0), 0);
}
function countByStatus(list, status) {
  return list.filter((i) => i.status === status).length;
}
function formatMoney(n) {
  return n.toLocaleString("en-IN");
}
