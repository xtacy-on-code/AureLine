import API_URL from '../config';

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// one place for talking to the backend: auth header, JSON, and readable errors
export async function apiRequest(path, { token, method = 'GET', body, form, raw = false } = {}) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    let payload;
    if (form) {
        payload = form;
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
    }

    let res;
    try {
        res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
    } catch {
        throw new ApiError("Can't reach AureLine. Check your connection and try again.", 0);
    }

    if (raw && res.ok) return res;

    // vercel rejects request bodies over ~4.5MB before they reach the server
    if (res.status === 413) {
        throw new ApiError('PDF is too large. Please upload a file under 4 MB.', 413);
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        // empty or non-JSON body
    }

    if (!res.ok) {
        throw new ApiError(data?.error || 'Something went wrong. Please try again.', res.status);
    }
    return data;
}
