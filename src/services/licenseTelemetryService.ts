// src/services/licenseTelemetryService.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'hde-gallery';
const TELEMETRY_KEY = 'telemetry/license_telemetry.json';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export interface LicenseTelemetryEvent {
  id: string;
  timestamp: string;
  email: string;
  license_key: string;
  machine_id: string;
  app_version: string;
  os: string;
  status: 'SUCCESS' | 'FAILED';
  failure_reason?: string | null;
  ip?: string;
  plan?: string;
}

export interface TelemetryStats {
  total: number;
  successful: number;
  failed: number;
  recentFailures: number;
  uniqueMachines: number;
}

// In-memory fallback ring-buffer in case R2 is slow or temporarily unreachable
let memoryLogs: LicenseTelemetryEvent[] = [];

/**
 * Fetch telemetry records from R2
 */
export async function getTelemetryLogs(limit = 100): Promise<{ stats: TelemetryStats; logs: LicenseTelemetryEvent[] }> {
  let logs: LicenseTelemetryEvent[] = [];

  try {
    if (accountId && accessKeyId && secretAccessKey) {
      const res = await r2Client.send(new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: TELEMETRY_KEY,
      }));
      const body = await res.Body?.transformToString();
      if (body) {
        logs = JSON.parse(body);
      }
    }
  } catch (err: any) {
    // If not found or R2 unavailable, use in-memory logs
    if (err.name !== 'NoSuchKey') {
      console.warn('Could not read telemetry from R2, using memory store:', err.message);
    }
  }

  // Merge with memory logs ensuring uniqueness
  if (memoryLogs.length > 0) {
    const map = new Map<string, LicenseTelemetryEvent>();
    [...memoryLogs, ...logs].forEach(item => map.set(item.id, item));
    logs = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Calculate statistics
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;

  const successful = logs.filter(l => l.status === 'SUCCESS').length;
  const failed = logs.filter(l => l.status === 'FAILED').length;
  const recentFailures = logs.filter(l => l.status === 'FAILED' && new Date(l.timestamp).getTime() > dayAgo).length;
  const uniqueMachines = new Set(logs.map(l => l.machine_id)).size;

  const stats: TelemetryStats = {
    total: logs.length,
    successful,
    failed,
    recentFailures,
    uniqueMachines,
  };

  return {
    stats,
    logs: logs.slice(0, limit),
  };
}

/**
 * Record a new license activation or validation attempt
 */
export async function recordTelemetryEvent(
  event: Omit<LicenseTelemetryEvent, 'id' | 'timestamp'>
): Promise<LicenseTelemetryEvent> {
  const newEntry: LicenseTelemetryEvent = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    ...event,
  };

  // Add to memory ring-buffer
  memoryLogs.unshift(newEntry);
  if (memoryLogs.length > 300) memoryLogs = memoryLogs.slice(0, 300);

  // Persist to Cloudflare R2
  try {
    if (accountId && accessKeyId && secretAccessKey) {
      let existing: LicenseTelemetryEvent[] = [];
      try {
        const res = await r2Client.send(new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: TELEMETRY_KEY,
        }));
        const body = await res.Body?.transformToString();
        if (body) {
          existing = JSON.parse(body);
        }
      } catch (e: any) {
        if (e.name !== 'NoSuchKey') {
          console.warn('R2 get before put error:', e.message);
        }
      }

      // Prepend and cap at 500 items
      const combined = [newEntry, ...existing.filter(e => e.id !== newEntry.id)].slice(0, 500);

      await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: TELEMETRY_KEY,
        Body: JSON.stringify(combined, null, 2),
        ContentType: 'application/json',
      }));
    }
  } catch (err: any) {
    console.error('Failed to persist telemetry to R2:', err.message);
  }

  return newEntry;
}
