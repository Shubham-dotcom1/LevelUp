import { NativeModules } from 'react-native';

const DEFAULT_FALLBACK_URL = 'http://10.252.214.56:3000';
const REQUEST_TIMEOUT_MS = 20000;
const HEALTH_TIMEOUT_MS = 3500;

/**
 * Resolve backend base URL dynamically from Expo env, local Metro host IP, or fallback IP.
 */
export function getApiBaseUrl() {
  const envUrl = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.trim()
    : '';
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (typeof scriptURL === 'string') {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
      const host = match?.[1] || '';
      const isTunnelHost = host.includes('exp.direct') || host.includes('ngrok');
      if (host && !isTunnelHost) {
        return `http://${host}:3000`;
      }
    }
  } catch {
    // Ignore and fall back to default URL
  }

  return DEFAULT_FALLBACK_URL;
}

export const API_BASE_URL = getApiBaseUrl();

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted || err?.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s (${url})`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/health`, { method: 'GET' }, HEALTH_TIMEOUT_MS);
    if (!res.ok) return { online: false, aiConfigured: false };
    const data = await res.json();
    return { online: data?.status === 'ok', aiConfigured: Boolean(data?.aiConfigured) };
  } catch {
    return { online: false, aiConfigured: false };
  }
}

export async function fetchAiPlan(context) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ context })
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const text = await res.text();
  if (!text || !text.trim().startsWith('{')) {
    throw new Error('Invalid JSON response');
  }

  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.workouts) || !Array.isArray(data.diet)) {
    throw new Error('Incomplete plan payload');
  }

  return data;
}

export async function sendChatMessage({ message, context, history }) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ message, context, history })
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const text = await res.text();
  if (!text || !text.trim().startsWith('{')) {
    throw new Error('Invalid JSON response');
  }

  const json = JSON.parse(text);
  if (!json?.reply) {
    throw new Error('Empty chat reply');
  }

  return json;
}
