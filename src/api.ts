const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function readJsonSafely(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return await response.json();
  const text = await response.text();
  return text ? { message: text } : null;
}

async function request(path: string, options?: RequestInit) {
  if (!BASE_URL) {
    throw new Error(
      'Missing VITE_API_BASE_URL. Create a .env file (see .env.example) and restart the dev server.',
    );
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await readJsonSafely(response);

  if (!response.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

export type Tree = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_active?: boolean;
};

export type OrderPayload = {
  customer_name: string;
  phone: string;
  tree_id: string;
  quantity: number;
  delivery_location: string;
};

export const fetchTrees = async (): Promise<Tree[]> => {
  const data = await request('/api/trees');
  return Array.isArray(data) ? (data as Tree[]) : [];
};

export const placeOrder = async (orderDetails: OrderPayload) => {
  return await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderDetails),
  });
};

