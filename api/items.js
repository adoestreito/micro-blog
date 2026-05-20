const TABLE_NAME = 'storage_items';
const SELECT_COLUMNS = 'id,item_name,quantity,description,expiration_date,location,created_at,updated_at';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

module.exports = async function handler(req, res) {
  setJsonHeaders(res);

  if (!['GET', 'PUT'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, { error: 'Password required.' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(res, 500, {
      error: 'Missing Supabase environment variables.'
    });
  }

  try {
    if (req.method === 'GET') {
      const items = await listItems();
      return sendJson(res, 200, { items });
    }

    const items = validateItems(parseItemsPayload(req.body));
    const savedItems = await replaceItems(items);
    return sendJson(res, 200, { items: savedItems });
  } catch (error) {
    const status = error.statusCode || 500;
    return sendJson(res, status, { error: error.message || 'Unexpected server error.' });
  }
};

async function listItems() {
  const query = `select=${SELECT_COLUMNS}&order=item_name.asc.nullslast`;
  return supabaseRequest(`/rest/v1/${TABLE_NAME}?${query}`);
}

async function replaceItems(items) {
  const existingItems = await listItems();
  const incomingIds = new Set(items.map((item) => item.id).filter(Boolean));
  const idsToDelete = existingItems
    .map((item) => item.id)
    .filter((id) => !incomingIds.has(id));

  if (items.length > 0) {
    await supabaseRequest(`/rest/v1/${TABLE_NAME}?on_conflict=id`, {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(items)
    });
  }

  if (idsToDelete.length > 0) {
    await supabaseRequest(`/rest/v1/${TABLE_NAME}?id=in.(${idsToDelete.join(',')})`, {
      method: 'DELETE'
    });
  }

  return listItems();
}

async function supabaseRequest(path, options = {}) {
  const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Supabase request failed.';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return payload || [];
}

function validateItems(items) {
  if (!Array.isArray(items)) {
    throw validationError('Expected an items array.');
  }

  return items.map((item) => {
    const itemName = normalizeString(item.item_name);
    const quantity = Number(item.quantity);
    const id = normalizeString(item.id);
    const expirationDate = normalizeString(item.expiration_date);

    if (!itemName) {
      throw validationError('Every item needs a name.');
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      throw validationError('Quantity must be a number greater than or equal to zero.');
    }

    if (id && !UUID_PATTERN.test(id)) {
      throw validationError('Invalid item id.');
    }

    if (expirationDate && !/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
      throw validationError('Expiration date must use YYYY-MM-DD.');
    }

    return removeUndefined({
      id: id || undefined,
      item_name: itemName,
      quantity,
      description: normalizeNullableString(item.description),
      expiration_date: expirationDate || null,
      location: normalizeNullableString(item.location)
    });
  });
}

function parseItemsPayload(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body).items;
    } catch {
      throw validationError('Request body must be valid JSON.');
    }
  }

  return body?.items;
}

function isAuthorized(req) {
  const password = process.env.INVENTORY_APP_PASSWORD;

  if (!password) {
    return true;
  }

  return req.headers['x-inventory-password'] === password;
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNullableString(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function removeUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));
}

function setJsonHeaders(res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}
