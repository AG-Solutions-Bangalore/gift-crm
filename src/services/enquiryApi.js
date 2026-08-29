// Enquiry & Report API Mock Service for UtsavGifts CRM

const STORAGE_KEY = 'utsav_enquiries';

const initialEnquiries = [
  {
    id: 'ENQ-1001',
    customerName: 'Rajesh Kumar',
    email: 'rajesh.k@techcorp.in',
    phone: '+91 98112 34567',
    productName: 'Royal Walnut & Brass Wooden Desk Clock',
    quantity: 50,
    occasion: 'Corporate Events & Rewards',
    date: '2026-08-28',
    status: 'Pending',
    notes: 'Bulk corporate branding required on clock front panel.'
  },
  {
    id: 'ENQ-1002',
    customerName: 'Ananya Sharma',
    email: 'ananya.sharma@gmail.com',
    phone: '+91 98765 12345',
    productName: 'Gourmet Belgian Chocolate Delights Box',
    quantity: 120,
    occasion: 'Diwali & Festival Celebrations',
    date: '2026-08-27',
    status: 'In Progress',
    notes: 'Custom festive greeting card inserted in each box.'
  },
  {
    id: 'ENQ-1003',
    customerName: 'Vikramaditya Roy',
    email: 'vroy@royalweddings.com',
    phone: '+91 99001 88776',
    productName: 'Exquisite Orchid Floral Hamper',
    quantity: 25,
    occasion: 'Weddings & Anniversaries',
    date: '2026-08-25',
    status: 'Closed',
    notes: 'Delivered to Taj Palace hotel venue.'
  }
];

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
