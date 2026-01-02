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
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob(); // ✅ CORRECT

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "contacts_export.xlsx"; // or .csv
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Contacts exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
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
