import React from "react";

const DownloadCSVTemplate = () => {
  const handleDownload = () => {
    const csvContent =
      "full_name,phone_number,email,initial_name,source,location,tags,total_purchases,last_interaction,last_purchase_at,total_spent\n" +
      "John Doe,9876543210,john@example.com,JD,CRM,Bhubaneswar,VIP,5,,,1000,\n"

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contact_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
    >
      📥 Download Sample
    </button>
  );
};

export default DownloadCSVTemplate;
