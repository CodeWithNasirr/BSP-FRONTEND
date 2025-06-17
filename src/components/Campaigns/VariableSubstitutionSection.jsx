import React, { useEffect, useState } from "react";

const VariableSubstitutionSection = ({ variables, formData, setFormData }) => {
    // Default all variables to static initially
  const getDefaultMethods = () =>
    Object.fromEntries(variables.map((v) => [v, "static"]));

  const [variableMethods, setVariableMethods] = useState(
    formData.variable_methods && Object.keys(formData.variable_methods).length
      ? formData.variable_methods
      : getDefaultMethods()
  );

  // Initialize missing methods and values when component mounts
  useEffect(() => {
    const initialMethods = {};
    const initialValues = {};

    variables.forEach((variable) => {
      if (!formData.variable_methods || !(variable in formData.variable_methods)) {
        initialMethods[variable] = "static";
      }

      if (!formData.variable_values || !(variable in formData.variable_values)) {
        initialValues[variable] = "";
      }
    });

    setFormData((prev) => ({
      ...prev,
      variable_methods: {
        ...initialMethods,
        ...(prev.variable_methods || {}),
      },
      variable_values: {
        ...initialValues,
        ...(prev.variable_values || {}),
      },
    }));

    setVariableMethods((prev) => ({
      ...initialMethods,
      ...prev,
    }));
  }, [variables, setFormData]);

  // When user switches method (static/dynamic)
  const handleVariableMethodChange = (variable, method) => {
    const updatedMethods = { ...variableMethods, [variable] : method };
    setVariableMethods(updatedMethods);

    setFormData((prev) => ({
      ...prev,
      variable_methods: updatedMethods,
      variable_values: {
        ...prev.variable_values,
        [variable]: "", // Reset value when switching
      },
    }));
  };

  // When user changes value or selects dynamic field
  const handleVariableValueChange = (variable, value) => {
    setFormData((prev) => ({
      ...prev,
      variable_values: {
        ...prev.variable_values,
        [variable]: value,
      },
    }));
  };

  return (
    variables.length > 0 && (
      <div className="sm:col-span-6">
        <label className="block text-sm leading-6 text-gray-900">
          Variable Substitution
        </label>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm">Variable</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm">Method</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm">Value/Field</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((variable, index) => {
                const method = variableMethods[variable] || "static";
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 text-sm">{variable}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <select
                        value={method}
                        onChange={(e) => handleVariableMethodChange(variable, e.target.value)}
                        className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm"
                      >
                        <option value="dynamic">Dynamic (From Contact Data)</option>
                        <option value="static">Static (Manual Input)</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {method === "static" ? (
                        <input
                          type="text"
                          value={formData.variable_values[variable] || ""}
                          onChange={(e) => handleVariableValueChange(variable, e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          placeholder="Enter value"
                        />
                      ) : (
                        <select
                          value={formData.variable_values[variable] || ""}
                          onChange={(e) => handleVariableValueChange(variable, e.target.value)}
                          className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm"
                        >
                          <option value="" disabled>Select field</option>
                          <option value="full_name">Full Name</option>
                          <option value="email">Email</option>
                          <option value="phone_number">Phone Number</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  );
};

export default VariableSubstitutionSection;
