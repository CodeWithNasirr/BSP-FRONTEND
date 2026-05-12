import React, { useEffect, useState } from "react";

const VariableSubstitutionSection = ({ variables, formData, setFormData, template }) => {
  const getDefaultMethods = () => Object.fromEntries(variables.map((v) => [v, "static"]));
  const [variableMethods, setVariableMethods] = useState(
    formData.variable_methods && Object.keys(formData.variable_methods).length
      ? formData.variable_methods : getDefaultMethods()
  );

  useEffect(() => {
    const initialMethods = {};
    const initialValues = {};
    variables.forEach((variable) => {
      if (!formData.variable_methods || !(variable in formData.variable_methods)) initialMethods[variable] = "static";
      if (!formData.variable_values || !(variable in formData.variable_values)) initialValues[variable] = "";
    });
    setFormData((prev) => ({
      ...prev,
      variable_methods: { ...initialMethods, ...(prev.variable_methods || {}) },
      variable_values: { ...initialValues, ...(prev.variable_values || {}) },
    }));
    setVariableMethods((prev) => ({ ...initialMethods, ...prev }));
  }, [variables, setFormData]);

  const handleVariableMethodChange = (variable, method) => {
    const updatedMethods = { ...variableMethods, [variable]: method };
    setVariableMethods(updatedMethods);
    setFormData((prev) => ({
      ...prev,
      variable_methods: updatedMethods,
      variable_values: { ...prev.variable_values, [variable]: "" },
    }));
  };

  const handleVariableValueChange = (variable, value) => {
    setFormData((prev) => ({
      ...prev,
      variable_values: { ...prev.variable_values, [variable]: value },
    }));
  };

  const inputBaseClass = `
    block w-full rounded-xl border-0 py-2 px-3 text-gray-900 dark:text-gray-100 shadow-sm 
    outline-none ring-1 ring-inset ring-gray-300 dark:ring-white/10 
    bg-white dark:bg-[#111827] placeholder:text-gray-400 dark:placeholder:text-gray-600 
    text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200
  `;
  const selectBaseClass = `
    block w-full rounded-xl border-0 py-2 px-3 text-gray-900 dark:text-gray-100 shadow-sm 
    outline-none ring-1 ring-inset ring-gray-300 dark:ring-white/10 
    bg-white dark:bg-[#111827] text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200
  `;

  return (
    variables.length > 0 && (
      <div className="sm:col-span-6">
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Variable Substitution</label>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/5">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5">
                <th className="border-b border-gray-200 dark:border-white/5 px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variable</th>
                <th className="border-b border-gray-200 dark:border-white/5 px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Example</th>
                <th className="border-b border-gray-200 dark:border-white/5 px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                <th className="border-b border-gray-200 dark:border-white/5 px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value/Field</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {variables.map((variable, index) => {
                const method = variableMethods[variable] || "static";
                const example = template?.placeholder_mappings?.[variable]?.example || "";
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-indigo-600 dark:text-indigo-400">{variable}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{example || "—"}</td>
                    <td className="px-4 py-3">
                      <select value={method} onChange={(e) => handleVariableMethodChange(variable, e.target.value)} className={selectBaseClass}>
                        <option value="dynamic" className="dark:bg-[#111827]">Dynamic (From Contact Data)</option>
                        <option value="static" className="dark:bg-[#111827]">Static (Manual Input)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {method === "static" ? (
                        <input type="text" value={formData.variable_values[variable] || ""} onChange={(e) => handleVariableValueChange(variable, e.target.value)} className={inputBaseClass} placeholder={`e.g., ${example}`} />
                      ) : (
                        <select value={formData.variable_values[variable] || ""} onChange={(e) => handleVariableValueChange(variable, e.target.value)} className={selectBaseClass}>
                          <option value="" disabled className="dark:bg-[#111827]">Select field</option>
                          <option value="full_name" className="dark:bg-[#111827]">Full Name</option>
                          <option value="email" className="dark:bg-[#111827]">Email</option>
                          <option value="phone_number" className="dark:bg-[#111827]">Phone Number</option>
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
