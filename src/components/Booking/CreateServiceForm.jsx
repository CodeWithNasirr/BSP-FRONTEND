import React, { useState } from 'react';

const CreateServiceForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    status_choices: [],
    notification_templates: {},
    detail_fields: [],
  });
  const [statusInput, setStatusInput] = useState('');
  const [detailInput, setDetailInput] = useState('');
  const [notifNameInput, setNotifNameInput] = useState('');
  const [notifMessageInput, setNotifMessageInput] = useState('');

  const handleStatusKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = statusInput.trim();
      if (val && !formData.status_choices.includes(val)) {
        setFormData({ ...formData, status_choices: [...formData.status_choices, val] });
      }
      setStatusInput('');
    }
  };

  const handleDetailKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = detailInput.trim();
      if (val && !formData.detail_fields.includes(val)) {
        setFormData({ ...formData, detail_fields: [...formData.detail_fields, val] });
      }
      setDetailInput('');
    }
  };

  const addNotificationTemplate = () => {
    const name = notifNameInput.trim();
    const message = notifMessageInput.trim();
    if (name && message) {
      setFormData({
        ...formData,
        notification_templates: {
          ...formData.notification_templates,
          [name]: message,
        },
      });
      setNotifNameInput('');
      setNotifMessageInput('');
    }
  };

  const removeStatus = (status) => {
    const updatedStatus = formData.status_choices.filter((s) => s !== status);
    setFormData({ ...formData, status_choices: updatedStatus });
  };

  const removeDetailField = (field) => {
    const updatedFields = formData.detail_fields.filter((f) => f !== field);
    setFormData({ ...formData, detail_fields: updatedFields });
  };

  const removeNotification = (key) => {
    const updated = { ...formData.notification_templates };
    delete updated[key];
    setFormData({ ...formData, notification_templates: updated });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Create New Service</h2>

      {/* Service Name */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Service Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter service name"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        />
      </div>

      {/* Status Choices */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Status Choices</label>
        <input
          type="text"
          value={statusInput}
          onChange={(e) => setStatusInput(e.target.value)}
          onKeyDown={handleStatusKey}
          placeholder="Type status and press Enter/comma"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {formData.status_choices.map((s, idx) => (
            <span key={idx} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
              {s}
              <button type="button" onClick={() => removeStatus(s)} className="text-red-400 font-bold">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Notification Templates */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Notification Templates</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Status Name"
            value={notifNameInput}
            onChange={(e) => setNotifNameInput(e.target.value)}
            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
          />
          <input
            type="text"
            placeholder="Message"
            value={notifMessageInput}
            onChange={(e) => setNotifMessageInput(e.target.value)}
            className="flex-2 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
          />
          <button
            type="button"
            onClick={addNotificationTemplate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(formData.notification_templates).map(([key, msg]) => (
            <span key={key} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
              {key}: {msg}
              <button type="button" onClick={() => removeNotification(key)} className="text-red-400 font-bold ml-1">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Detail Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Detail Fields</label>
        <input
          type="text"
          value={detailInput}
          onChange={(e) => setDetailInput(e.target.value)}
          onKeyDown={handleDetailKey}
          placeholder="Type field name and press Enter/comma"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {formData.detail_fields.map((f, idx) => (
            <span key={idx} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
              {f}
              <button type="button" onClick={() => removeDetailField(f)} className="text-red-400 font-bold">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors text-white"
        >
          Add Service
        </button>
      </div>
    </form>
  );
};

export default CreateServiceForm;