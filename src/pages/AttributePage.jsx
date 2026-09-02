import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  SlidersHorizontal,
  Plus,
  Search,
  Edit3,
  X,
  CheckCircle2,
  XCircle,
  Filter,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Trash2
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import {
  fetchAttributes,
  fetchActiveAttributes,
  fetchAttributeById,
  createAttribute,
  updateAttribute,
  updateAttributeStatus
} from '../services/attributeApi';

export default function AttributePage() {
  const { token } = useAuthContext();

  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    attribute_name: '',
    attribute_status: 'Active',
    values: [{ attribute_value: '', attribute_value_status: 'Active' }]
  });

  // Current single value input buffer for adding chips
  const [newValueInput, setNewValueInput] = useState('');

  // Helper to extract values array safely from various backend naming conventions
  const extractAttributeValues = (attr) => {
    if (!attr) return [];
    let raw =
      attr.attribute_values ??
      attr.values ??
      attr.attributevalues ??
      attr.attribute_value ??
      attr.options ??
      attr.items ??
      [];

    // If returned as a JSON string from backend
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = raw.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (!Array.isArray(raw)) {
      if (raw && typeof raw === 'object') {
        raw = Object.values(raw);
      } else {
        return [];
      }
    }

    return raw
      .map((v, idx) => {
        if (typeof v === 'string' || typeof v === 'number') {
          return {
            id: `val-${idx}`,
            attribute_value: String(v).trim(),
            attribute_value_status: 'Active',
          };
        }
        return {
          id: v.id || v.attribute_value_id || `val-${idx}`,
          attribute_value: String(
            v.attribute_value ??
            v.value ??
            v.name ??
            v.title ??
            v.attribute_values ??
            ''
          ).trim(),
          attribute_value_status: String(
            v.attribute_value_status ?? v.status ?? 'Active'
          ).trim(),
        };
      })
      .filter((v) => v.attribute_value !== '');
  };

  const loadAttributes = async () => {
    setLoading(true);
    try {
      let res;
      if (activeOnly) {
        res = await fetchActiveAttributes(token);
      } else {
        res = await fetchAttributes(token);
      }

      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.attributes)) {
        items = res.attributes;
      } else if (Array.isArray(res?.data?.attributes)) {
        items = res.data.attributes;
      } else if (res?.data && typeof res.data === 'object') {
        items = Object.values(res.data).filter((item) => item && typeof item === 'object');
      }

      // Initial set to render table immediately
      setAttributes(items);

      // If backend index endpoint did not eager-load `values` relationship, fetch details in parallel
      const needsDetailFetch = items.some((item) => extractAttributeValues(item).length === 0);
      if (needsDetailFetch) {
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const attrId = item.id || item.attribute_id;
            if (!attrId) return item;

            // If it already has values, keep it
            if (extractAttributeValues(item).length > 0) return item;

            try {
              const single = await fetchAttributeById(attrId, token);
              const singleData = single?.data || single;
              if (singleData) {
                return {
                  ...item,
                  ...singleData,
                  values:
                    singleData.values ||
                    singleData.attribute_values ||
                    singleData.attributevalues ||
                    item.values,
                };
              }
            } catch {
              // Ignore single item fetch failure
            }
            return item;
          })
        );
        setAttributes(enrichedItems);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load attributes');
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, [activeOnly]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNewValueInput('');
    setForm({
      attribute_name: '',
      attribute_status: 'Active',
      values: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (item) => {
    setEditingItem(item);
    setNewValueInput('');

    const existingValues = extractAttributeValues(item);

    setForm({
      attribute_name: item.attribute_name || item.name || '',
      attribute_status: item.attribute_status || item.status || 'Active',
      values: existingValues
    });
    setIsModalOpen(true);

    const attrId = item.id || item.attribute_id;
    if (attrId) {
      try {
        const single = await fetchAttributeById(attrId, token);
        const singleData = single?.data || single;
        if (singleData) {
          const detailValues = extractAttributeValues(singleData);

          setForm((prev) => ({
            ...prev,
            attribute_name: singleData.attribute_name || singleData.name || prev.attribute_name,
            attribute_status: singleData.attribute_status || singleData.status || prev.attribute_status,
            values: detailValues.length > 0 ? detailValues : prev.values
          }));
        }
      } catch (err) {
        console.warn('[AttributePage] Single fetch fallback:', err.message);
      }
    }
  };

  // Add a value to the values list
  const handleAddValue = () => {
    const trimmed = newValueInput.trim();
    if (!trimmed) return;

    // Avoid duplicates within current form
    const exists = form.values.some(
      (v) => v.attribute_value.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      toast.error(`Value "${trimmed}" is already added.`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        { attribute_value: trimmed, attribute_value_status: 'Active' }
      ]
    }));
    setNewValueInput('');
  };

  // Remove a value from form
  const handleRemoveValue = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      values: prev.values.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Handle Enter key inside new value input
  const handleValueKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValue();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.attribute_name.trim()) {
      toast.error('Attribute Name (attribute_name) is required');
      return;
    }

    if (form.values.length === 0) {
      toast.error('Please add at least one attribute value (e.g. Red, Blue, Small, 500g)');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const attrId = editingItem.id || editingItem.attribute_id;
        await updateAttribute(attrId, form, token);
        toast.success('Attribute updated successfully');
      } else {
        const res = await createAttribute(form, token);
        toast.success(res?.message || 'Attribute created successfully');
      }
      setIsModalOpen(false);
      await loadAttributes();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const attrId = item.id || item.attribute_id;
    const currentStatus = item.attribute_status || item.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusTogglingId(attrId);

    try {
      await updateAttributeStatus(attrId, newStatus, token);
      toast.success(`Attribute marked as ${newStatus}`);
      await loadAttributes();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  const safeAttributes = Array.isArray(attributes) ? attributes : [];
  const filteredAttributes = safeAttributes.filter((attr) => {
    const name = (attr.attribute_name || attr.name || '').toLowerCase();
    const valuesList = extractAttributeValues(attr);
    const valuesStr = valuesList.map((v) => v.attribute_value).join(' ').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || valuesStr.includes(q);
  });

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 relative flex items-center max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search attributes by name or values..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveOnly((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeOnly
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{activeOnly ? 'Showing: Active' : 'Filter: All Attributes'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Attribute</span>
            </button>
          </div>
        </div>

        {/* Attributes Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              <span>Loading attributes...</span>
            </div>
          ) : filteredAttributes.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Attributes Found</p>
              <p className="text-xs text-slate-400">
                Create product attributes like 'Size', 'Color', 'Weight', 'Material', etc.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Attribute Name</th>
                    <th className="px-6 py-3.5">Values</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredAttributes.map((attr) => {
                    const attrId = attr.id || attr.attribute_id;
                    const name = attr.attribute_name || attr.name || '-';
                    const valuesList = extractAttributeValues(attr);
                    const status = attr.attribute_status || attr.status || 'Active';
                    const isToggling = statusTogglingId === attrId;

                    return (
                      <tr key={attrId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">
                          #{attrId}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                              <SlidersHorizontal className="w-4 h-4" />
                            </div>
                            <span className="font-semibold">{name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {valuesList.length === 0 ? (
                            <span className="text-slate-400 italic text-[11px]">No values</span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap max-w-md">
                              {valuesList.slice(0, 6).map((val) => {
                                const valStr = val.attribute_value;
                                return (
                                  <span
                                    key={val.id}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-medium inline-flex items-center"
                                  >
                                    {valStr}
                                  </span>
                                );
                              })}
                              {valuesList.length > 6 && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                                  +{valuesList.length - 6} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(attr)}
                            disabled={isToggling}
                            title="Click to toggle status"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit cursor-pointer transition-all hover:scale-105 ${
                              status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {status === 'Active' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{status}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleOpenEdit(attr)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Edit Attribute"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create / Edit Attribute Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Attribute' : 'Create New Attribute'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Attribute Name (attribute_name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.attribute_name}
                    onChange={(e) => setForm({ ...form, attribute_name: e.target.value })}
                    placeholder="e.g. Size, Color, Weight, Material, Flavour"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Attribute Values Manager */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Attribute Values ({form.values.length}) <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">Press enter or click add</span>
                  </label>

                  <div className="flex items-center gap-2 mb-2.5">
                    <input
                      type="text"
                      value={newValueInput}
                      onChange={(e) => setNewValueInput(e.target.value)}
                      onKeyDown={handleValueKeyDown}
                      placeholder="e.g. Red, XL, 500g, Chocolate..."
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddValue}
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer border border-purple-200"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Value Chips list */}
                  {form.values.length === 0 ? (
                    <div className="p-3.5 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No values added yet. Type a value above and click Add.
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar">
                      {form.values.map((v, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-white border border-purple-100 shadow-2xs text-xs font-semibold text-slate-800 flex items-center gap-2 group"
                        >
                          <span>{v.attribute_value}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveValue(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                            title="Remove value"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {editingItem && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Attribute Status (attribute_status)
                    </label>
                    <select
                      value={form.attribute_status}
                      onChange={(e) => setForm({ ...form, attribute_status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-2 ${
                      submitting ? 'opacity-50 cursor-wait' : ''
                    }`}
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingItem ? 'Save Changes' : 'Create Attribute'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
