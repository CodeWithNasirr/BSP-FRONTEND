// import React from "react";

// const DownloadCSVTemplate = () => {
//   const handleDownload = () => {
//     const csvContent =
//       "full_name,phone_number,email,initial_name,source,location,tags,total_purchases,last_interaction,last_purchase_at,total_spent\n" +
//       "John Doe,9876543210,john@example.com,JD,CRM,Bhubaneswar,VIP,5,,,1000,\n"

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "contact_template.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <button
//       onClick={handleDownload}
//       className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
//     >
//       📥 Download Sample
//     </button>
//   );
// };

// export default DownloadCSVTemplate;
import React from "react";
import * as XLSX from "xlsx";

const DownloadCSVTemplate = () => {
  const sampleData = [
    {
      full_name: "John Doe",
      phone_number: "9876543210",
      email: "john@example.com",
      initial_name: "JD",
      source: "CRM",
      location: "Bhubaneswar",
      tags: "VIP",
      total_purchases: 5,
      last_interaction: "",
      last_purchase_at: "",
      total_spent: 1000,
    },
  ];

  // Download CSV file
  const handleDownloadCSV = () => {
    const headers = Object.keys(sampleData[0]).join(",") + "\n";
    const values = Object.values(sampleData[0]).join(",") + "\n";
    const csvContent = headers + values;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contact_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download XLSX file
  const handleDownloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

    XLSX.writeFile(workbook, "contact_template.xlsx");
  };

  return (
    <div className="flex items-center gap-3">
      {/* <button
        onClick={handleDownloadCSV}
        className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
      >
        📥 Download CSV Sample
      </button> */}

      <button
        onClick={handleDownloadXLSX}
        className="rounded-md bg-green-600 hover:bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
      >
        📊 Download Excel Sample
      </button>
    </div>
  );
};

export default DownloadCSVTemplate;
