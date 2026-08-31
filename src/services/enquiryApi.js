// Enquiry & Report API Mock Service for Gift CRM

const STORAGE_KEY = 'gift_enquiries_v2';

const initialEnquiries = [];

const getStoredEnquiries = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEnquiries));
  return initialEnquiries;
};

const saveStoredEnquiries = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const fetchEnquiries = async () => {
  await new Promise((res) => setTimeout(res, 200));
  return { success: true, data: getStoredEnquiries() };
};

export const updateEnquiryStatus = async (id, status) => {
  await new Promise((res) => setTimeout(res, 250));
  const enquiries = getStoredEnquiries();
  const updated = enquiries.map((enq) => (enq.id === id ? { ...enq, status } : enq));
  saveStoredEnquiries(updated);
  return { success: true, message: `Enquiry status updated to ${status}` };
};

export const fetchEnquiryReport = async (filters = {}) => {
  await new Promise((res) => setTimeout(res, 300));
  const data = getStoredEnquiries();
  return {
    success: true,
    data,
    total: data.length,
    pendingCount: data.filter((e) => e.status === 'Pending').length,
    inProgressCount: data.filter((e) => e.status === 'In Progress').length,
    closedCount: data.filter((e) => e.status === 'Closed').length
  };
};
