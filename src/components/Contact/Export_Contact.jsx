import * as XLSX from "xlsx";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";

const ExportContactsButton = () => {
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/export-contacts/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json(); // 👈 expecting JSON

      // Convert JSON → Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

      // Download file
      XLSX.writeFile(workbook, "contacts_export.xlsx");

      toast.success("Contacts exported successfully!");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Something went wrong while exporting contacts!");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
    >
      📤 Export Excel
    </button>
  );
};

export default ExportContactsButton;
