import { useEffect, useState } from "react";
import axios from "axios";

const adminToken = "NovHawk337&"; // static token

const AddCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("https://billing-backend-2pfd.onrender.com/api/customers");
      setCustomers(res.data.data); // backend returns { success, data }
    } catch (err) {
      console.error(err);
    }
  };

  // ADD CUSTOMER
  const addCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://billing-backend-2pfd.onrender.com/api/customers",
        form,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setForm({ name: "", email: "", phone: "" });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to add customer");
    }
  };

  // DELETE CUSTOMER
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await axios.delete(
        `https://billing-backend-2pfd.onrender.com/api/customers/${id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      if (res.data.success) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        alert("Customer deleted successfully");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Customer Management</h1>

      {/* Add Customer Form */}
      <form
        onSubmit={addCustomer}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm"
      >
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded-md px-3 py-2 w-full focus:outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded-md px-3 py-2 w-full focus:outline-none"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border rounded-md px-3 py-2 w-full focus:outline-none"
          required
        />
        <button
          type="submit"
          className="md:col-span-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Customer
        </button>
      </form>

      {/* Customer List */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Customers</h2>
        <ul className="divide-y divide-gray-200">
          {customers.length === 0 && (
            <li className="p-2 text-gray-500 text-center">No customers found.</li>
          )}
          {customers.map((c) => (
            <li key={c._id} className="flex justify-between items-center py-2">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">{c.email}</div>
                <div className="text-sm text-gray-500">{c.phone}</div>
              </div>
              <button
                onClick={() => deleteCustomer(c._id)}
                className="text-red-500 text-sm px-2 py-1 border border-red-500 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddCustomer;
