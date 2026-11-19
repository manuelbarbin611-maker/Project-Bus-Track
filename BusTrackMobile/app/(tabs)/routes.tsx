import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useAuth } from '@app/context/AuthContext';
import { getRoutes, getRouteStops } from '@app/services/routeService';
import type { Route, Stop } from '@app/types';

export default function RoutesScreen() {
  const { user, loading: authLoading } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  if (!authLoading && user && (user.role === 'operator' || user.role === 'admin')) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await getRoutes();
      setRoutes(data?.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoute = async (route: Route) => {
    setSelectedRoute(route);
    try {
      const stopsData = await getRouteStops(route.id);
      setStops(stopsData.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load stops');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <LinearGradient colors={['#0f172a', '#020617']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading routes...</Text>
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
            <Text style={styles.title}>Routes</Text>
            <Text style={styles.subtitle}>View route details and stops</Text>
          </View>

          {!selectedRoute ? (
            <View style={styles.routeList}>
              {routes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={styles.routeCard}
                  onPress={() => handleSelectRoute(route)}
                >
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <Text style={styles.routeDescription}>{route.description || 'No description'}</Text>
                    <Text style={styles.routeStats}>
                      {route.stops_count || 0} stops • {route.buses_count || 0} buses
                    </Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedRoute(null)}>
                <Text style={styles.backButtonText}>← Back to Routes</Text>
              </TouchableOpacity>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{selectedRoute.name}</Text>
                <Text style={styles.cardDescription}>{selectedRoute.description || 'No description'}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Stops ({stops.length})</Text>
                {stops.length === 0 ? (
                  <Text style={styles.emptyText}>No stops for this route</Text>
                ) : (
                  stops.map((stop) => (
                    <View key={stop.id} style={styles.stopItem}>
                      <View style={styles.stopOrder}>
                        <Text style={styles.stopOrderText}>{stop.stop_order}</Text>
                      </View>
                      <View style={styles.stopDetails}>
                        <Text style={styles.stopName}>{stop.stop_name}</Text>
                        {stop.latitude && stop.longitude && (
                          <Text style={styles.stopCoords}>
                            {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                          </Text>
                        )}
                      </View>
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
  routeList: { gap: 12 },
  routeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  routeInfo: { flex: 1 },
  routeName: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  routeDescription: { color: '#94a3b8', fontSize: 14, marginBottom: 4 },
  routeStats: { color: '#64748b', fontSize: 12 },
  arrow: { color: '#2563eb', fontSize: 24, fontWeight: '700' },
  backButton: {
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardDescription: { color: '#94a3b8', fontSize: 14 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  stopOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopOrderText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  stopDetails: { flex: 1 },
  stopName: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  stopCoords: { color: '#64748b', fontSize: 12 },
});
