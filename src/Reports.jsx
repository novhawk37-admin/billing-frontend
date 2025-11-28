import React from "react";

export default function Reports({ invoices }) {
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce(
    (sum, i) => sum + (Number(i.amount) || 0),
    0
  );

  const paid = invoices.filter((i) => i.status === "Paid").length;
  const pending = invoices.filter((i) => i.status === "Pending").length;
  const overdue = invoices.filter((i) => i.status === "Overdue").length;

  // ---- CSV DOWNLOAD ----
  const downloadCSV = () => {
    const header = "Invoice ID,Customer,Email,Amount,Date,Status\n";

    const rows = invoices
      .map(
        (i) =>
          `${i.id},${i.customer},${i.email},${i.amount},${i.date},${i.status}`
      )
      .join("\n");

    const csv = header + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice-report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reports Summary</h2>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReportCard title="Total Invoices" value={totalInvoices} />
        <ReportCard
          title="Total Revenue"
          value={`₹ ${totalRevenue.toLocaleString("en-IN")}`}
        />
        <ReportCard title="Paid" value={paid} />
        <ReportCard title="Pending" value={pending} />
        <ReportCard title="Overdue" value={overdue} />
      </div>
    </div>
  );
}

function ReportCard({ title, value }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold mt
">{value}</p>
    </div>
  );
}
