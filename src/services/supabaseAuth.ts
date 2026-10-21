export type SupabaseUser = {
  id: string;
  phone?: string;
  email?: string;
  app_metadata?: { role?: string };
};

export type CustomerOrder = {
  id: string;
  created_at: string;
  customer_phone: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SESSION_KEY = 'etoile_supabase_session_v1';

export const isSupabaseConfigured = Boolean(url && anonKey);

type Session = { access_token: string; refresh_token?: string; user?: SupabaseUser };

function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as Session | null;
  } catch { return null; }
}

function saveSession(session: Session | null) {
  if (typeof window === 'undefined') return;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!url || !anonKey) throw new Error('Supabase is not configured. Check the project URL and publishable key in .env.local.');
  const send = (accessToken?: string) => fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
  let response = await send(token);
  if (response.status === 401 && token && path !== '/auth/v1/token?grant_type=refresh_token') {
    const current = readSession();
    if (current?.refresh_token) {
      const refreshResponse = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: current.refresh_token }),
      });
      if (refreshResponse.ok) {
        const renewed = await refreshResponse.json() as Session;
        saveSession({ ...renewed, user: current.user });
        response = await send(renewed.access_token);
      }
    }
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || data.error || 'Supabase request failed.');
  return data as T;
}

export async function sendPhoneOtp(phone: string) {
  await request('/auth/v1/otp', { method: 'POST', body: JSON.stringify({ phone, create_user: true }) });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const session = await request<Session>('/auth/v1/verify', {
    method: 'POST', body: JSON.stringify({ phone, token, type: 'sms' }),
  });
  saveSession(session);
  return session;
}

export async function signInAdmin(email: string, password: string) {
  const session = await request<Session>('/auth/v1/token?grant_type=password', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
  const user = await request<SupabaseUser>('/auth/v1/user', { method: 'GET' }, session.access_token);
  if (user.app_metadata?.role !== 'admin') {
    await request('/auth/v1/logout', { method: 'POST' }, session.access_token).catch(() => undefined);
    throw new Error('This account does not have admin access.');
  }
  saveSession({ ...session, user });
  return user;
}

export async function getCurrentUser() {
  const session = readSession();
  if (!session?.access_token) return null;
  try {
    const user = await request<SupabaseUser>('/auth/v1/user', { method: 'GET' }, session.access_token);
    return user;
  } catch {
    saveSession(null);
    return null;
  }
}

export async function signOut() {
  const session = readSession();
  if (session?.access_token) await request('/auth/v1/logout', { method: 'POST' }, session.access_token).catch(() => undefined);
  saveSession(null);
}

export async function placeCustomerOrder(order: Omit<CustomerOrder, 'id' | 'created_at' | 'status'>) {
  const session = readSession();
  if (!session?.access_token) throw new Error('Verify your phone number before placing the order.');
  const rows = await request<CustomerOrder[]>('/rest/v1/customer_orders?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...order, status: 'New' }),
  }, session.access_token);
  return rows[0];
}

export async function listCustomerOrders() {
  const session = readSession();
  if (!session?.access_token) throw new Error('Please sign in again.');
  return request<CustomerOrder[]>('/rest/v1/customer_orders?select=*&order=created_at.desc', { method: 'GET' }, session.access_token);
}

export async function updateCustomerOrder(id: string, status: CustomerOrder['status']) {
  const session = readSession();
  if (!session?.access_token) throw new Error('Please sign in again.');
  await request(`/rest/v1/customer_orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }),
  }, session.access_token);
}
