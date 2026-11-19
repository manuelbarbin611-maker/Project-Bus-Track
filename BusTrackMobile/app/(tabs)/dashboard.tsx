import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useAuth } from '@app/context/AuthContext';
import { getBus, updateBusStatus, updateBusStop } from '@app/services/busService';
import { getRouteStops } from '@app/services/routeService';
import { getBusQueue } from '@app/services/queueService';
import { startLocationUpdates, stopLocationUpdates, isTrackingActive } from '@app/services/locationService';
import type { Bus, Stop, QueueEntry } from '@app/types';

export default function DashboardScreen() {
  const { user, loading: authLoading, busId } = useAuth();
  const [bus, setBus] = useState<Bus | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);

  const checkTrackingStatus = async () => {
    const active = await isTrackingActive();
    setTracking(active);
  };

  const loadBusData = async () => {
    if (!busId) return;
    try {
      setLoading(true);
      const busData = await getBus(busId);
      setBus(busData.data);

      if (busData.data?.route_id) {
        const stopsData = await getRouteStops(busData.data.route_id);
        setStops(stopsData.data || []);
      }

      const queueData = await getBusQueue(busId);
      setQueue(queueData.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load bus data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (busId) {
      loadBusData();
    }
  }, [busId]);

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  if (!authLoading && user && user.role !== 'operator' && user.role !== 'admin') {
    return <Redirect href="/(tabs)/explore" />;
  }

  const handleToggleTracking = async () => {
    try {
      if (tracking) {
        await stopLocationUpdates();
        setTracking(false);
        Alert.alert('Tracking Stopped', 'Location tracking has been stopped');
      } else {
        await startLocationUpdates();
        setTracking(true);
        Alert.alert('Tracking Started', 'Location tracking is now active');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle tracking');
    }
  };

  const handleStatusChange = async (status: 'active' | 'inactive' | 'maintenance') => {
    if (!busId) return;
    try {
      await updateBusStatus(busId, status);
      await loadBusData();
      Alert.alert('Success', `Bus status changed to ${status}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update bus status');
    }
  };

  const handleStopChange = async (stopId: number | null) => {
    if (!busId) return;
    try {
      await updateBusStop(busId, stopId);
      await loadBusData();
      Alert.alert('Success', 'Current stop updated');
    } catch (err) {
      Alert.alert('Error', 'Failed to update current stop');
    }
  };

  if (!busId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <LinearGradient colors={['#0f172a', '#020617']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <Text style={styles.title}>No Bus Selected</Text>
            <Text style={styles.subtitle}>Please select a bus from the Explore tab</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <LinearGradient colors={['#0f172a', '#020617']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading bus data...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#0f172a" />
      <LinearGradient colors={['#0f172a', '#020617']} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Driver Dashboard</Text>
            <Text style={styles.subtitle}>Bus #{bus?.bus_number || bus?.id}</Text>
          </View>

          {/* Tracking Control */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Tracking</Text>
            <TouchableOpacity
              style={[styles.button, tracking ? styles.buttonActive : styles.buttonInactive]}
              onPress={handleToggleTracking}
            >
              <Text style={styles.buttonText}>{tracking ? 'Stop Tracking' : 'Start Tracking'}</Text>
            </TouchableOpacity>
          </View>

          {/* Bus Status Control */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bus Status</Text>
            <Text style={styles.currentValue}>Current: {bus?.status || 'N/A'}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.smallButton, bus?.status === 'active' && styles.smallButtonActive]} onPress={() => handleStatusChange('active')}>
                <Text style={styles.smallButtonText}>Active</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, bus?.status === 'inactive' && styles.smallButtonActive]} onPress={() => handleStatusChange('inactive')}>
                <Text style={styles.smallButtonText}>Inactive</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, bus?.status === 'maintenance' && styles.smallButtonActive]} onPress={() => handleStatusChange('maintenance')}>
                <Text style={styles.smallButtonText}>Maintenance</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Capacity Display */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Capacity</Text>
            <Text style={styles.capacityText}>
              {bus?.available_seats || 0} / {bus?.capacity || 0} seats available
            </Text>
          </View>

          {/* Current Stop Control */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Stop</Text>
            <Text style={styles.currentValue}>
              {bus?.current_stop?.stop_name || 'No stop selected'}
            </Text>
            <ScrollView style={styles.stopsScroll} horizontal>
              <TouchableOpacity style={styles.stopButton} onPress={() => handleStopChange(null)}>
                <Text style={styles.stopButtonText}>None</Text>
              </TouchableOpacity>
              {stops.map((stop) => (
                <TouchableOpacity
                  key={stop.id}
                  style={[styles.stopButton, bus?.current_stop_id === stop.id && styles.stopButtonActive]}
                  onPress={() => handleStopChange(stop.id)}
                >
                  <Text style={styles.stopButtonText}>{stop.stop_order}. {stop.stop_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Passenger Queue */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Passenger Queue ({queue.length})</Text>
            {queue.length === 0 ? (
              <Text style={styles.emptyText}>No passengers in queue</Text>
            ) : (
              queue.map((entry) => (
                <View key={entry.id} style={styles.queueItem}>
                  <Text style={styles.queueOrder}>#{entry.queue_order}</Text>
                  <Text style={styles.queueName}>
                    {entry.passenger?.first_name} {entry.passenger?.last_name}
                  </Text>
                  <Text style={styles.queueStatus}>{entry.passenger?.status}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  gradient: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
  header: { marginBottom: 24 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#94a3b8', fontSize: 14 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  currentValue: { color: '#94a3b8', fontSize: 14, marginBottom: 12 },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonActive: { backgroundColor: '#dc2626' },
  buttonInactive: { backgroundColor: '#2563eb' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  smallButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  smallButtonActive: { backgroundColor: '#2563eb' },
  smallButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  capacityText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  stopsScroll: { marginTop: 8 },
  stopButton: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  stopButtonActive: { backgroundColor: '#2563eb' },
  stopButtonText: { color: '#ffffff', fontSize: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  queueOrder: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
    width: 30,
  },
  queueName: { color: '#ffffff', fontSize: 14, flex: 1 },
  queueStatus: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
