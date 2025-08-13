import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Calendar, Clock, User, Pencil, Stethoscope } from 'lucide-react';



const EXAMPLE_DOCTORS = {
  consultation: "Dr. Smith, Dr. Johnson, Dr. Brown",
  followup: "Dr. Adams, Dr. Lee",
  emergency: "Dr. Emergency, Dr. Care",
  checkup: "Dr. Patel, Dr. Gupta",
};

const EXAMPLE_TIME_SLOTS = {
  consultation: "9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM",
  followup: "10:00 AM, 11:30 AM, 3:00 PM",
  emergency: "Anytime 24/7",
  checkup: "8:30 AM, 9:30 AM, 4:00 PM",
};

const updateAppointmentType = (type) => {
  setFormData(prev => ({
    ...prev,
    appointmentType: type,
    doctors_list: prev.doctors_list || EXAMPLE_DOCTORS[type],
    time_slots: prev.time_slots || EXAMPLE_TIME_SLOTS[type]
  }));
};


const FIELD_CONFIG = [
  { key: 'collect_name', label: 'Name' },
  { key: 'collect_phone', label: 'Phone' },
  { key: 'collect_email', label: 'Email' },
  { key: 'collect_age', label: 'Age' },
  { key: 'collect_gender', label: 'Gender' },
  { key: 'collect_address', label: 'Address' },
  { key: 'collect_symptoms', label: 'Symptoms' },
  { key: 'collect_medical_history', label: 'Medical History' },
  { key: 'collect_preferred_date', label: 'Preferred Date' },
  { key: 'collect_preferred_time', label: 'Preferred Time' },
  { key: 'collect_doctor', label: 'Doctor Preference' },
  { key: 'collect_emergency_contact', label: 'Emergency Contact' },
];

const AppointmentBookingNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    appointmentType: data.appointmentType || 'consultation',
    message: data.message || 'Let me help you book an appointment.',
    doctors_list: data.doctors_list || '',
    time_slots: data.time_slots || '',
    require_insurance: data.require_insurance || false,
    min_age: data.min_age || '',
    max_age: data.max_age || '',
    ...FIELD_CONFIG.reduce((acc, field) => {
      acc[field.key] = data[field.key] || false;
      return acc;
    }, {})
  });

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.message.trim()) {
      alert('Message cannot be empty.');
      return;
    }
    if (formData.min_age && formData.max_age && Number(formData.min_age) > Number(formData.max_age)) {
      alert('Min age cannot be greater than max age.');
      return;
    }

    // Update node data (for parent/ReactFlow)
    Object.assign(data, formData);

    setEditing(false);
  };

  const getCollectedFields = () => FIELD_CONFIG
    .filter(field => formData[field.key])
    .map(f => f.label);

  const getAppointmentIcon = () => {
    switch (formData.appointmentType) {
      case 'consultation': return <Stethoscope className="mr-2 text-green-500" size={16} />;
      case 'followup': return <Calendar className="mr-2 text-blue-500" size={16} />;
      case 'emergency': return <Clock className="mr-2 text-red-500" size={16} />;
      default: return <Calendar className="mr-2 text-green-500" size={16} />;
    }
  };

  const getNodeColor = () => {
    switch (formData.appointmentType) {
      case 'consultation': return 'border-green-200 bg-green-50';
      case 'followup': return 'border-blue-200 bg-blue-50';
      case 'emergency': return 'border-red-200 bg-red-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg ${getNodeColor()} border ${selected ? 'border-2' : 'border'} min-w-[250px]`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {getAppointmentIcon()}
          <div className="text-sm font-medium">
            Book {formData.appointmentType}
          </div>
        </div>
        <button onClick={() => setEditing(!editing)}>
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div>
            <label className="text-xs font-medium">Appointment Type</label>
            <select
              className="w-full text-xs p-2 border rounded"
              value={formData.appointmentType}
              onChange={e => updateField('appointmentType', e.target.value)}
            >
              <option value="consultation">Consultation</option>
              <option value="followup">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="checkup">Regular Checkup</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Initial Message</label>
            <textarea
              className="w-full text-xs p-2 border rounded"
              value={formData.message}
              onChange={e => updateField('message', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Collect Information</label>
            <div className="grid grid-cols-2 gap-1">
              {FIELD_CONFIG.map(field => (
                <label key={field.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[field.key]}
                    onChange={e => updateField(field.key, e.target.checked)}
                    className="mr-1"
                  />
                  <span className="text-xs">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

         {formData.collect_doctor && (
            <div className="mt-2">
              <label className="text-xs font-medium">Available Doctors</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  className="flex-1 text-xs p-2 border rounded"
                  value={formData.doctors_list}
                  onChange={e => updateField('doctors_list', e.target.value)}
                />
                <button
                  type="button"
                  className="bg-gray-200 text-xs px-2 rounded hover:bg-gray-300"
                  onClick={() => updateField('doctors_list', EXAMPLE_DOCTORS[formData.appointmentType])}
                >
                  Use Example
                </button>
              </div>
            </div>
          )}

          {formData.collect_preferred_time && (
            <div className="mt-2">
              <label className="text-xs font-medium">Available Time Slots</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  className="flex-1 text-xs p-2 border rounded"
                  value={formData.time_slots}
                  onChange={e => updateField('time_slots', e.target.value)}
                />
                <button
                  type="button"
                  className="bg-gray-200 text-xs px-2 rounded hover:bg-gray-300"
                  onClick={() => updateField('time_slots', EXAMPLE_TIME_SLOTS[formData.appointmentType])}
                >
                  Use Example
                </button>
              </div>
            </div>
          )}


          <div>
            <label className="text-xs font-medium">Validation Rules</label>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.require_insurance}
                  onChange={e => updateField('require_insurance', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs">Require Insurance</span>
              </label>
              <div className="flex gap-1 mt-1">
                <input
                  type="number"
                  placeholder="Min Age"
                  className="w-1/2 text-xs p-2 border rounded"
                  value={formData.min_age}
                  onChange={e => updateField('min_age', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max Age"
                  className="w-1/2 text-xs p-2 border rounded"
                  value={formData.max_age}
                  onChange={e => updateField('max_age', e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white text-xs py-1 rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="text-xs p-2 bg-white border rounded">{formData.message}</div>
          {getCollectedFields().length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {getCollectedFields().map((f, i) => (
                <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {f}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(AppointmentBookingNode);
