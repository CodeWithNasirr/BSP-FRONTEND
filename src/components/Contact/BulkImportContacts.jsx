import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'
import API_BASE_URL from "../../config";
const BulkImportContacts = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const token = localStorage.getItem("authToken");
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await axios.post(`http://127.0.0.1:8000/api/import-contacts`, formData, {
              headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            });
      toast.success("Contacts imported successfully!");
      console.log(response.data);
    } catch (error) {
      toast.error("Error importing contacts.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto  bg-white p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold mb-4 text-center">📥 Bulk Import Contacts</h2>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFileChange}
        className="mb-4 w-full border border-zinc-400 rounded-2xl text-center px-20"
      />

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 w-full"
      >
        {isUploading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
};

export default BulkImportContacts;
