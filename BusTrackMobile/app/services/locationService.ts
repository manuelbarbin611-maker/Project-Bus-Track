import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@app/lib/config';

const TASK_NAME = 'BUSTRACK_LOCATION_TASK';
let foregroundBatch: any[] = [];
const BATCH_SIZE = 5;
const PENDING_KEY = 'bustrack_pending_location_batches';

async function saveFailedBatch(batch: any[]) {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    const pending = raw ? JSON.parse(raw) : [];
    pending.push(batch);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch (err) {
    console.warn('Failed to persist failed batch', err);
  }
}

async function getPendingBatches(): Promise<any[][]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function replacePendingBatches(batches: any[][]) {
  try {
    if (!batches || batches.length === 0) {
      await AsyncStorage.removeItem(PENDING_KEY);
    } else {
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(batches));
    }
  } catch (err) {
    console.warn('Failed to update pending batches', err);
  }
}

async function flushPendingBatches() {
  const pending = await getPendingBatches();
  if (!pending || pending.length === 0) return;

  const token = await SecureStore.getItemAsync('bustrack_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const remaining: any[][] = [];
  for (const batch of pending) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/locations/batch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ locations: batch }),
      });
      if (!res.ok) {
        remaining.push(batch);
      }
    } catch {
      remaining.push(batch);
    }
  }
  await replacePendingBatches(remaining);
}

async function sendBatch(locations: any[]) {
  if (!locations || locations.length === 0) return;
  const token = await SecureStore.getItemAsync('bustrack_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/locations/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ locations }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // on success, try to flush any pending batches
    await flushPendingBatches();
  } catch (err) {
    console.warn('Failed to send location batch, persisting for retry', err);
    await saveFailedBatch(locations);
  }
}

TaskManager.defineTask(TASK_NAME, async ({ data, error }: any) => {
  if (error) return console.error('Location task error', error);
  const locations = data?.locations || [];
  if (locations.length) {
    // send immediately from background
    const mapped = locations.map((l: any) => ({
      latitude: l.coords.latitude,
      longitude: l.coords.longitude,
      accuracy: l.coords.accuracy,
      timestamp: l.timestamp,
    }));
    await sendBatch(mapped);

    // try flushing any pending batches as well
    await flushPendingBatches();
  }
});

export async function startLocationUpdates() {
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) throw new Error('Location services disabled');

  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== 'granted') throw new Error('Foreground location permission denied');

  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== 'granted') throw new Error('Background location permission denied');

  const already = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
  if (!already) {
    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 20,
      timeInterval: 15000,
      // Android-specific options
      activityType: Location.ActivityType.Other,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });
  }

  // attempt to flush any pending batches when starting
  await flushPendingBatches();
}

export async function stopLocationUpdates() {
  const started = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
  if (started) {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
  }
}

export async function sendForegroundLocation(location: any) {
  const coords = location.coords || location;
  const payload = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    timestamp: location.timestamp || Date.now(),
  };

  foregroundBatch.push(payload);
  if (foregroundBatch.length >= BATCH_SIZE) {
    const toSend = foregroundBatch.splice(0, foregroundBatch.length);
    await sendBatch(toSend);
  }

  // attempt to flush pending batches after sending
  await flushPendingBatches();
}

export async function isTrackingActive() {
  return await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
}
