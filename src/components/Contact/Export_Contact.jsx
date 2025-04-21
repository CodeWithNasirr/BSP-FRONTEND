import API_BASE_URL from "../../config";
import { toast } from 'react-toastify'

const ExportContactsButton = () => {
    const handleExport = () => {
      const token = localStorage.getItem("authToken");
  
      fetch(`${API_BASE_URL}/api/export-contacts/`, {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Network error");
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "contacts_export.csv");
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success("Export Sucessfully...")

        })
        .catch((error) => {
          console.error("Export failed", error);
          toast.error("Something went wrong while exporting contacts!");
        });
    };
  
    return (
      <button
        onClick={handleExport}
        className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
      >
        📤 Export
      </button>
    );
  };
  
  export default ExportContactsButton;
  