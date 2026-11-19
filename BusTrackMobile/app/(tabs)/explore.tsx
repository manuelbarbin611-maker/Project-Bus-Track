import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getLiveBuses, getBusQueue } from '@app/services/passengerService';
import { getBuses } from '@app/services/busService';
import type { LiveBusData, QueueEntry } from '@app/types';

export default function ExploreScreen() {
  const [liveBuses, setLiveBuses] = useState<LiveBusData[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<LiveBusData | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (selectedBus !== null) {
          setSelectedBus(null);
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [selectedBus])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [liveData, busesData] = await Promise.all([
        getLiveBuses(),
        getBuses()
      ]);
      setLiveBuses(liveData?.data || []);
      setBuses(busesData?.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBus = async (bus: LiveBusData) => {
    setSelectedBus(bus);
    try {
      const queueData = await getBusQueue(bus.bus_id);
      setQueue(queueData.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load queue');
    }
  };

  const filteredBuses = liveBuses.filter(bus => {
    const matchesSearch = !searchQuery || 
      bus.bus_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoute = !routeFilter || bus.route === routeFilter;
    return matchesSearch && matchesRoute;
  });

  const getBusDetails = (busId: number) => {
    return buses.find(b => b.id === busId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <LinearGradient colors={['#0f172a', '#020617']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading buses...</Text>
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
            <Text style={styles.title}>Live Buses</Text>
            <Text style={styles.subtitle}>Track buses in real-time</Text>
          </View>

          {!selectedBus ? (
            <>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search buses or routes..."
                  placeholderTextColor="#64748b"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {filteredBuses.length === 0 ? (
                <View style={styles.centerContent}>
                  <Text style={styles.emptyText}>No buses available</Text>
                </View>
              ) : (
                <View style={styles.busList}>
                  {filteredBuses.map((bus) => {
                    const details = getBusDetails(bus.bus_id);
                    return (
                      <TouchableOpacity
                        key={bus.bus_id}
                        style={styles.busCard}
                        onPress={() => handleSelectBus(bus)}
                      >
                        <View style={styles.busInfo}>
                          <Text style={styles.busNumber}>Bus #{bus.bus_number || bus.bus_id}</Text>
                          <Text style={styles.busRoute}>{bus.route || 'No route assigned'}</Text>
                          <Text style={styles.busStatus}>Status: {bus.status}</Text>
                          <Text style={styles.busStop}>Current: {bus.current_stop || 'Unknown'}</Text>
                          {details && (
                            <Text style={styles.busCapacity}>
                              {details.available_seats || 0} / {details.capacity || 0} seats available
                            </Text>
                          )}
                          {bus.last_log?.speed && (
                            <Text style={styles.busSpeed}>
                              Speed: {bus.last_log.speed.toFixed(1)} km/h
                            </Text>
                          )}
                        </View>
                        <Text style={styles.arrow}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            <View>
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedBus(null)}>
                <Text style={styles.backButtonText}>← Back to Buses</Text>
              </TouchableOpacity>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Bus #{selectedBus.bus_number || selectedBus.bus_id}</Text>
                <Text style={styles.cardDetail}>Route: {selectedBus.route || 'N/A'}</Text>
                <Text style={styles.cardDetail}>Status: {selectedBus.status}</Text>
                <Text style={styles.cardDetail}>Current Stop: {selectedBus.current_stop || 'Unknown'}</Text>
                {selectedBus.last_log?.speed && (
                  <Text style={styles.cardDetail}>Speed: {selectedBus.last_log.speed.toFixed(1)} km/h</Text>
                )}
                {selectedBus.last_log?.latitude && selectedBus.last_log?.longitude && (
                  <Text style={styles.cardDetail}>
                    Location: {selectedBus.last_log.latitude.toFixed(4)}, {selectedBus.last_log.longitude.toFixed(4)}
                  </Text>
                )}
                {(() => {
                  const details = getBusDetails(selectedBus.bus_id);
                  return details ? (
                    <>
                      <Text style={styles.cardDetail}>
                        Capacity: {details.available_seats || 0} / {details.capacity || 0} seats
                      </Text>
                      <Text style={styles.cardDetail}>
                        Occupancy: {details.capacity ? Math.round(((details.capacity - (details.available_seats || 0)) / details.capacity) * 100) : 0}%
                      </Text>
                    </>
                  ) : null;
                })()}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Queue ({queue.length})</Text>
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
            </View>
          )}
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
  searchContainer: { marginBottom: 16 },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: { color: '#94a3b8', fontSize: 16 },
  busList: { gap: 12 },
  busCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  busInfo: { flex: 1 },
  busNumber: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  busRoute: { color: '#94a3b8', fontSize: 14, marginBottom: 2 },
  busStatus: { color: '#64748b', fontSize: 12, marginBottom: 2 },
  busStop: { color: '#64748b', fontSize: 12, marginBottom: 2 },
  busCapacity: { color: '#10b981', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  busSpeed: { color: '#f59e0b', fontSize: 12, fontWeight: '600' },
  arrow: { color: '#2563eb', fontSize: 24, fontWeight: '700' },
  backButton: { marginBottom: 16, padding: 8 },
  backButtonText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  cardDetail: { color: '#94a3b8', fontSize: 14, marginBottom: 4 },
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
