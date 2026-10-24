import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Copy, Check, AlertCircle, Edit, ShieldAlert, Key, Filter, DollarSign, Calendar, Mail, Building, Phone, UserCheck, X } from 'lucide-react';
import { Department, Employee } from '../../types';
import { api } from '../../services/api';

export const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState<number | ''>('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Success credential modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    employee: Employee;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit employee modal
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empList, depts] = await Promise.all([
        api.getEmployees({
          search: search || undefined,
          department_id: deptFilter || undefined,
        }),
        api.getDepartments(),
      ]);
      setEmployees(empList);
      setDepartments(depts);
      if (depts.length > 0 && departmentId === '') {
        setDepartmentId(depts[0].id);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, deptFilter]);

  const handleOpenRegister = async () => {
    setIsRegisterOpen(true);
    setRegError(null);
    try {
      const next = await api.getNextEmployeeCode();
      setCode(next.nextCode);
    } catch {
      setCode('EMP001');
    }
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!code || !name || !email || !departmentId || !joinDate || basicSalary === '') {
      setRegError('Please provide all mandatory employee fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.registerEmployee({
        code: code.trim(),
        name: name.trim(),
        email: email.trim(),
        department_id: Number(departmentId),
        join_date: joinDate,
        basic_salary: Number(basicSalary),
        designation: designation ? designation.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
      });

      // Show temporary credentials modal
      setCreatedCredentials({
        employee: res.employee,
        temporaryPassword: res.temporaryPassword,
      });

      // Reset form
      setIsRegisterOpen(false);
      setName('');
      setEmail('');
      setDesignation('');
      setPhone('');
      loadData();
    } catch (err: any) {
      setRegError(err.message || 'Failed to register employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `HCM Lite Login Credentials:\nName: ${createdCredentials.employee.name}\nEmail: ${createdCredentials.employee.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nNote: You will be prompted to change your password upon first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      await api.updateEmployee(editingEmployee.id, {
        name: editingEmployee.name,
        department_id: editingEmployee.department_id,
        basic_salary: editingEmployee.basic_salary,
        designation: editingEmployee.designation,
        phone: editingEmployee.phone,
        status: editingEmployee.status,
      });
      setEditingEmployee(null);
      loadData();
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, name, or email..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenRegister}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Employee</span>
        </button>
      </div>

      {/* Employee List Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Employee Code</th>
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Join Date</th>
                <th className="py-3 px-4">Basic Salary</th>
                <th className="py-3 px-4">Password Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    {loading ? 'Loading employee roster...' : 'No employees registered yet. Click "Register New Employee" to get started.'}
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-300 whitespace-nowrap">
                      {emp.code}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700 text-[11px] font-medium">
                        {emp.department_name || 'Unassigned'}
                      </span>
                      {emp.designation && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{emp.designation}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      {emp.join_date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-emerald-400">
                      ${Number(emp.basic_salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {emp.must_change_password ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Key className="w-3 h-3" />
                          Needs 1st Sign-in Change
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          Password Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
                        title="Edit employee record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER EMPLOYEE MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Register New Employee</h3>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regError && (
              <div className="mt-4 bg-rose-950/60 border border-rose-800 text-rose-200 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EMP001"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Unique identifier for staff</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@company.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Used for employee login portal</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department *</label>
                  <select
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Basic Monthly Salary ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Job Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Software Engineer"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/60 text-xs text-indigo-300 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Auto-Generated Temporary Password
                </div>
                <p className="text-slate-300 text-[11px]">
                  HCM Lite will automatically create a login account and generate a one-time temporary password. The employee will be forced to set their permanent password upon their first sign-in.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating Employee...' : 'Register & Generate Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPORARY CREDENTIALS SUCCESS DIALOG */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-800 border border-indigo-500/40 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-slate-100 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 mb-2">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Employee Onboarded!</h3>
              <p className="text-xs text-slate-400">
                Account created for <span className="text-white font-medium">{createdCredentials.employee.name}</span>
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Employee Code:</span>
                <span className="text-white font-semibold">{createdCredentials.employee.code}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Login Email:</span>
                <span className="text-white font-semibold">{createdCredentials.employee.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Temporary Password:</span>
                <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-lg text-sm">
                  {createdCredentials.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-200">First Sign-In Notice:</span> When this employee logs in for the first time, they will be prompted immediately to choose their own permanent password.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Edit Employee: {editingEmployee.code}</h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={editingEmployee.department_id}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Salary ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingEmployee.basic_salary}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, basic_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingEmployee.designation || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive / On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 text-xs rounded-xl hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
