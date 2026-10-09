const getBaseUrl = () => {
  let url = 'http://localhost:8080';
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '') {
    url = import.meta.env.VITE_API_URL.trim();
  } else if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    url = 'https://queue-less-platform.onrender.com';
  }

  url = url.replace(/\/+$/, '');
  if (url.endsWith('/api')) {
    return url;
  }
  return `${url}/api`;
};

const BASE_URL = getBaseUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('queueless_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || (data.data && typeof data.data === 'object' ? Object.values(data.data).join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }
  return data.data !== undefined ? data.data : data;
};

const customFetch = async (url, options = {}, retries = 1) => {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (err) {
    if (retries > 0 && (err.name === 'TypeError' || err.message === 'Failed to fetch')) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return customFetch(url, options, retries - 1);
    }
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to backend server. The server may be warming up or offline. Please try again in a few seconds.');
    }
    throw err;
  }
};

export const api = {
  // Auth
  login: (email, password, expectedRole) =>
    customFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, expectedRole }),
    }),

  register: (payload) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateProfile: (payload) =>
    fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Public
  getOrganization: () =>
    fetch(`${BASE_URL}/public/organization`).then(handleResponse),

  getBranches: () =>
    fetch(`${BASE_URL}/public/branches`).then(handleResponse),

  getBranchById: (id) =>
    fetch(`${BASE_URL}/public/branches/${id}`).then(handleResponse),

  getServices: (branchId) =>
    fetch(`${BASE_URL}/public/services${branchId ? `?branchId=${branchId}` : ''}`).then(handleResponse),

  getCounters: (branchId) =>
    fetch(`${BASE_URL}/public/counters${branchId ? `?branchId=${branchId}` : ''}`).then(handleResponse),

  getAvailableSlots: (branchId, serviceId, date) =>
    fetch(`${BASE_URL}/public/available-slots?branchId=${branchId}&serviceId=${serviceId}&date=${date}`).then(handleResponse),

  getQueueDisplay: (branchId) =>
    fetch(`${BASE_URL}/public/display/${branchId}`).then(handleResponse),

  getLiveQueue: (branchId) =>
    fetch(`${BASE_URL}/public/live-queue/${branchId}`).then(handleResponse),

  createWalkInTokenGuest: (payload) =>
    fetch(`${BASE_URL}/public/token/walkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Customer
  bookAppointment: (payload) =>
    fetch(`${BASE_URL}/customer/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getMyAppointments: () =>
    fetch(`${BASE_URL}/customer/appointments`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  rescheduleAppointment: (id, payload) =>
    fetch(`${BASE_URL}/customer/appointments/${id}/reschedule`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  cancelAppointment: (id, reason) =>
    fetch(`${BASE_URL}/customer/appointments/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    }).then(handleResponse),

  checkInAppointment: (id) =>
    fetch(`${BASE_URL}/customer/appointments/${id}/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  createWalkInTokenCustomer: (payload) =>
    fetch(`${BASE_URL}/customer/tokens/walkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getMyTokens: () =>
    fetch(`${BASE_URL}/customer/tokens`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getActiveToken: () =>
    fetch(`${BASE_URL}/customer/active-token`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  cancelToken: (id, remarks) =>
    fetch(`${BASE_URL}/customer/tokens/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remarks }),
    }).then(handleResponse),

  getNotifications: () =>
    fetch(`${BASE_URL}/customer/notifications`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${BASE_URL}/customer/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  markAllNotificationsRead: () =>
    fetch(`${BASE_URL}/customer/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Staff
  getStaffQueue: (branchId) =>
    fetch(`${BASE_URL}/staff/queue/${branchId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getStaffWaitingQueue: (branchId) =>
    fetch(`${BASE_URL}/staff/queue/${branchId}/waiting`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  callNextToken: (branchId, counterId, preferredServiceId) =>
    fetch(`${BASE_URL}/staff/queue/call-next?branchId=${branchId}&counterId=${counterId}${preferredServiceId ? `&preferredServiceId=${preferredServiceId}` : ''}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  callSpecificToken: (tokenId, counterId) =>
    fetch(`${BASE_URL}/staff/queue/call/${tokenId}?counterId=${counterId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  recallToken: (tokenId) =>
    fetch(`${BASE_URL}/staff/queue/recall/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  startService: (tokenId) =>
    fetch(`${BASE_URL}/staff/queue/start/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  pauseService: (tokenId, remarks) =>
    fetch(`${BASE_URL}/staff/queue/pause/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remarks }),
    }).then(handleResponse),

  resumeService: (tokenId) =>
    fetch(`${BASE_URL}/staff/queue/resume/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  completeService: (tokenId, notes) =>
    fetch(`${BASE_URL}/staff/queue/complete/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    }).then(handleResponse),

  skipToken: (tokenId, remarks) =>
    fetch(`${BASE_URL}/staff/queue/skip/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remarks }),
    }).then(handleResponse),

  markNoShow: (tokenId, remarks) =>
    fetch(`${BASE_URL}/staff/queue/no-show/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remarks }),
    }).then(handleResponse),

  updateCounterStatus: (counterId, status) =>
    fetch(`${BASE_URL}/staff/counters/${counterId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getTokenAuditLogs: (tokenId) =>
    fetch(`${BASE_URL}/staff/queue/audit-logs/${tokenId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Admin
  updateOrganization: (payload) =>
    fetch(`${BASE_URL}/admin/organization`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getAllBranchesAdmin: () =>
    fetch(`${BASE_URL}/admin/branches`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  createBranch: (payload) =>
    fetch(`${BASE_URL}/admin/branches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  updateBranch: (id, payload) =>
    fetch(`${BASE_URL}/admin/branches/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  deleteBranch: (id) =>
    fetch(`${BASE_URL}/admin/branches/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  addHoliday: (payload) =>
    fetch(`${BASE_URL}/admin/holidays`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  deleteHoliday: (id) =>
    fetch(`${BASE_URL}/admin/holidays/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAllServicesAdmin: (branchId) =>
    fetch(`${BASE_URL}/admin/services${branchId ? `?branchId=${branchId}` : ''}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  createService: (payload) =>
    fetch(`${BASE_URL}/admin/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  updateService: (id, payload) =>
    fetch(`${BASE_URL}/admin/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  toggleServiceStatus: (id) =>
    fetch(`${BASE_URL}/admin/services/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  deleteService: (id) =>
    fetch(`${BASE_URL}/admin/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAllCountersAdmin: (branchId) =>
    fetch(`${BASE_URL}/admin/counters${branchId ? `?branchId=${branchId}` : ''}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  createCounter: (payload) =>
    fetch(`${BASE_URL}/admin/counters`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  updateCounter: (id, payload) =>
    fetch(`${BASE_URL}/admin/counters/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  assignStaffToCounter: (counterId, staffId) =>
    fetch(`${BASE_URL}/admin/counters/${counterId}/assign-staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ staffId }),
    }).then(handleResponse),

  deleteCounter: (id) =>
    fetch(`${BASE_URL}/admin/counters/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAllStaffAdmin: () =>
    fetch(`${BASE_URL}/admin/staff`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAllUsersAdmin: () =>
    fetch(`${BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAllAppointmentsAdmin: (branchId, date) =>
    fetch(`${BASE_URL}/admin/appointments?${branchId ? `branchId=${branchId}&` : ''}${date ? `date=${date}` : ''}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAllQueueAdmin: (branchId) =>
    fetch(`${BASE_URL}/admin/queue?${branchId ? `branchId=${branchId}` : ''}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAllAuditLogsAdmin: () =>
    fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAnalyticsSummary: (branchId) =>
    fetch(`${BASE_URL}/admin/analytics${branchId ? `?branchId=${branchId}` : ''}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getSettings: () =>
    fetch(`${BASE_URL}/admin/settings`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateSetting: (key, value, description) =>
    fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ key, value, description }),
    }).then(handleResponse),
};
