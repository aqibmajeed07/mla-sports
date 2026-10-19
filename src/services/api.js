import { supabase } from './supabase';

const getAuthHeader = async (url = '') => {
  const adminToken = localStorage.getItem('mla_admin_token');
  const isAdminLocation = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isAdminRequest = 
    url.includes('/admin') || 
    url.includes('/orders/all') || 
    url.includes('/verify-payment') || 
    url.includes('/status') ||
    isAdminLocation;

  if (adminToken && isAdminRequest) {
    return { Authorization: `Bearer ${adminToken}` };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  if (adminToken) {
    return { Authorization: `Bearer ${adminToken}` };
  }
  return {};
};

const handleResponse = async (response) => {
  let data;
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || response.statusText };
    }
  } catch {
    data = { message: response.statusText || 'Network response was not ok' };
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export const api = {
  get: async (url) => {
    const headers = await getAuthHeader(url);
    const response = await fetch(url, { headers });
    return handleResponse(response);
  },

  post: async (url, body) => {
    const headers = await getAuthHeader(url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (url, body) => {
    const headers = await getAuthHeader(url);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (url, body) => {
    const headers = await getAuthHeader(url);
    const options = {
      method: 'DELETE',
      headers: { ...headers },
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    return handleResponse(response);
  },
};
