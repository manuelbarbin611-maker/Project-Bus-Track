<script setup>
import { ref, onMounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import axios from 'axios';

const props = defineProps({ routeId: [String, Number] });

// ── State ──────────────────────────────────────────────────────────────────
const routeData    = ref(null);
const loading      = ref(true);
const error        = ref(null);
const notification = ref(null);

// Stop form
const addForm  = ref({ stop_name: '', latitude: '', longitude: '' });
const adding   = ref(false);

// Edit stop
const editing  = ref(null);
const editForm = ref({ stop_name: '', latitude: '', longitude: '' });
const saving   = ref(false);

// Delete route confirm
const showDeleteConfirm = ref(false);
const deletingRoute     = ref(false);

// Delete stop confirm
const showStopConfirm  = ref(false);
const stopDeleteTarget = ref(null);
const deletingStop     = ref(false);

// ── Helpers ────────────────────────────────────────────────────────────────
function notify(type, message) {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 3500);
}

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchRoute() {
    loading.value = true;
    error.value   = null;
    try {
        const { data } = await axios.get(`/routes/${props.routeId}`);
        routeData.value = data.data;
    } catch {
        error.value = 'Failed to load route data.';
    } finally {
        loading.value = false;
    }
}

onMounted(fetchRoute);

// ── Add stop ───────────────────────────────────────────────────────────────
async function addStop() {
    if (!addForm.value.stop_name.trim()) return;
    adding.value = true;
    try {
        const { data } = await axios.post(`/routes/${props.routeId}/stops`, addForm.value);
        routeData.value.stops.push(data.data);
        addForm.value = { stop_name: '', latitude: '', longitude: '' };
        notify('success', 'Stop added successfully.');
    } catch (e) {
        notify('error', e.response?.data?.message ?? 'Failed to add stop.');
    } finally {
        adding.value = false;
    }
}

// ── Edit stop ──────────────────────────────────────────────────────────────
function startEdit(stop) {
    editing.value  = stop.id;
    editForm.value = { stop_name: stop.stop_name, latitude: stop.latitude ?? '', longitude: stop.longitude ?? '' };
}

async function saveStop(stop) {
    saving.value = true;
    try {
        const { data } = await axios.put(`/stops/${stop.id}`, editForm.value);
        Object.assign(stop, data.data);
        editing.value = null;
        notify('success', 'Stop updated.');
    } catch {
        notify('error', 'Failed to update stop.');
    } finally {
        saving.value = false;
    }
}

// ── Delete stop ────────────────────────────────────────────────────────────
function confirmDeleteStop(stop) {
    stopDeleteTarget.value = stop;
    showStopConfirm.value  = true;
}

async function doDeleteStop() {
    if (!stopDeleteTarget.value) return;
    deletingStop.value    = true;
    showStopConfirm.value = false;
    try {
        await axios.delete(`/stops/${stopDeleteTarget.value.id}`);
        routeData.value.stops = routeData.value.stops.filter(s => s.id !== stopDeleteTarget.value.id);
        notify('success', 'Stop deleted.');
    } catch {
        notify('error', 'Failed to delete stop.');
    } finally {
        deletingStop.value     = false;
        stopDeleteTarget.value = null;
    }
}

// ── Delete route ───────────────────────────────────────────────────────────
async function doDeleteRoute() {
    deletingRoute.value     = true;
    showDeleteConfirm.value = false;
    try {
        await axios.delete(`/routes/${props.routeId}`);
        router.visit('/routes');
    } catch {
        notify('error', 'Failed to delete route.');
        deletingRoute.value = false;
    }
}
</script>

<template>
    <AuthenticatedLayout>
        <template #header>Route Detail</template>

        <div class="rs-page">

            <!-- ── Breadcrumb ───────────────────────────────────────────── -->
            <div class="rs-breadcrumb">
                <Link :href="/routes/" class="rs-bc-link">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
                    </svg>
                    Routes
                </Link>
                <span class="rs-bc-sep">/</span>
                <span class="rs-bc-current">{{ routeData?.name ?? '…' }}</span>
            </div>

            <!-- ── Notification ─────────────────────────────────────────── -->
            <Transition name="notif">
                <div v-if="notification"
                     :class="notification.type === 'success' ? 'rs-notif--success' : 'rs-notif--error'"
                     class="rs-notif">
                    <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                    </svg>
                    {{ notification.message }}
                </div>
            </Transition>

            <!-- ── Error ────────────────────────────────────────────────── -->
            <div v-if="error" class="rs-error">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
                {{ error }}
            </div>

            <!-- ── Loading skeleton ─────────────────────────────────────── -->
            <template v-if="loading">
                <div class="rs-card">
                    <div class="rs-card-body" style="gap:14px">
                        <div class="rs-skeleton rs-skeleton--h28 rs-skeleton--w50" />
                        <div class="rs-skeleton rs-skeleton--h14 rs-skeleton--w70" />
                        <div class="rs-skeleton rs-skeleton--h14 rs-skeleton--w40" />
                    </div>
                </div>
            </template>

            <template v-else-if="routeData">

                <!-- ── Route header card ────────────────────────────────── -->
                <div class="rs-card">
                    <div class="rs-route-hero">
                        <div class="rs-route-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                            </svg>
                        </div>
                        <div class="rs-route-info">
                            <h1 class="rs-route-name">{{ routeData.name }}</h1>
                            <p v-if="routeData.description" class="rs-route-desc">{{ routeData.description }}</p>
                            <div class="rs-meta-row">
                                <span class="rs-meta-chip">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                        <path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225A.613.613 0 019 6.25c0 .177-.04.264-.077.318a.956.956 0 01-.277.245c-.076.051-.158.1-.258.161l-.007.004a7.728 7.728 0 00-.313.195 2.416 2.416 0 00-.692.782.75.75 0 001.32.708.908.908 0 01.224-.31c.075-.068.17-.132.363-.261.095-.06.19-.119.28-.18.198-.133.36-.264.487-.42A1.807 1.807 0 0010.5 6.25a2.1 2.1 0 00-.676-1.55C9.48 4.37 8.9 4.15 8.25 4.15c-.637 0-1.19.195-1.582.462a2.301 2.301 0 00-.806.979.75.75 0 001.06 1.055v-.561z" clip-rule="evenodd"/>
                                    </svg>
                                    {{ routeData.stops?.length ?? 0 }} stops
                                </span>
                                <span class="rs-meta-chip">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M1.5 3.5A1.5 1.5 0 013 2h1.5v1.25a.75.75 0 001.5 0V2H10v1.25a.75.75 0 001.5 0V2H13a1.5 1.5 0 011.5 1.5v1H1.5v-1zM1.5 7v5A1.5 1.5 0 003 13.5h10A1.5 1.5 0 0014.5 12V7h-13z"/>
                                    </svg>
                                    {{ routeData.buses?.length ?? 0 }} buses
                                </span>
                            </div>
                        </div>
                        <div class="rs-hero-actions">
                            <Link :href="route('routes.edit', routeId)" class="rs-btn rs-btn--ghost">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"/>
                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"/>
                                </svg>
                                Edit Route
                            </Link>
                            <button class="rs-btn rs-btn--danger" @click="showDeleteConfirm = true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ── Stops card ────────────────────────────────────────── -->
                <div class="rs-card">
                    <div class="rs-card-header">
                        <div>
                            <h2 class="rs-section-title">Stops</h2>
                            <p class="rs-section-sub">Ordered list of stops on this route</p>
                        </div>
                        <span class="rs-count-chip">{{ routeData.stops?.length ?? 0 }}</span>
                    </div>

                    <!-- Add stop form -->
                    <div class="rs-add-stop-form">
                        <input
                            v-model="addForm.stop_name"
                            type="text"
                            class="rs-input rs-input--grow2"
                            placeholder="Stop name *"
                            @keyup.enter="addStop"
                        />
                        <input
                            v-model="addForm.latitude"
                            type="number"
                            step="any"
                            class="rs-input rs-input--grow1"
                            placeholder="Latitude"
                        />
                        <input
                            v-model="addForm.longitude"
                            type="number"
                            step="any"
                            class="rs-input rs-input--grow1"
                            placeholder="Longitude"
                        />
                        <button
                            class="rs-btn rs-btn--primary"
                            :disabled="adding || !addForm.stop_name.trim()"
                            @click="addStop"
                        >
                            <svg v-if="adding" class="rs-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                            </svg>
                            {{ adding ? 'Adding…' : 'Add Stop' }}
                        </button>
                    </div>

                    <!-- Empty stops -->
                    <div v-if="!routeData.stops?.length" class="rs-empty">
                        <div class="rs-empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                            </svg>
                        </div>
                        <p class="rs-empty-text">No stops yet — add one above.</p>
                    </div>

                    <!-- Stops list -->
                    <div v-else class="rs-stops">
                        <div v-for="stop in routeData.stops" :key="stop.id" class="rs-stop-row">

                            <!-- View mode -->
                            <template v-if="editing !== stop.id">
                                <div class="rs-stop-order">{{ stop.stop_order }}</div>
                                <div class="rs-stop-info">
                                    <span class="rs-stop-name">{{ stop.stop_name }}</span>
                                    <span v-if="stop.latitude" class="rs-stop-coords">
                                        {{ stop.latitude }}, {{ stop.longitude }}
                                    </span>
                                </div>
                                <div class="rs-stop-actions">
                                    <button class="rs-action-btn rs-action-btn--edit" title="Edit" @click="startEdit(stop)">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"/>
                                        </svg>
                                    </button>
                                    <button class="rs-action-btn rs-action-btn--del" title="Delete" @click="confirmDeleteStop(stop)">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clip-rule="evenodd"/>
                                        </svg>
                                    </button>
                                </div>
                            </template>

                            <!-- Edit mode -->
                            <template v-else>
                                <div class="rs-stop-order rs-stop-order--editing">{{ stop.stop_order }}</div>
                                <div class="rs-stop-edit-row">
                                    <input v-model="editForm.stop_name" class="rs-input rs-input--grow2" placeholder="Stop name" />
                                    <input v-model="editForm.latitude"  type="number" step="any" class="rs-input rs-input--grow1" placeholder="Lat" />
                                    <input v-model="editForm.longitude" type="number" step="any" class="rs-input rs-input--grow1" placeholder="Lng" />
                                    <button class="rs-btn rs-btn--primary rs-btn--sm" :disabled="saving" @click="saveStop(stop)">
                                        {{ saving ? '…' : 'Save' }}
                                    </button>
                                    <button class="rs-btn rs-btn--ghost rs-btn--sm" @click="editing = null">Cancel</button>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- ── Buses on this route ───────────────────────────────── -->
                <div v-if="routeData.buses?.length" class="rs-card">
                    <div class="rs-card-header">
                        <div>
                            <h2 class="rs-section-title">Buses on this Route</h2>
                            <p class="rs-section-sub">Currently assigned buses</p>
                        </div>
                        <span class="rs-count-chip">{{ routeData.buses.length }}</span>
                    </div>
                    <table class="rs-table">
                        <thead>
                            <tr>
                                <th>Bus Number</th>
                                <th>Status</th>
                                <th>Current Stop</th>
                                <th class="rs-th--right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="bus in routeData.buses" :key="bus.id" class="rs-row">
                                <td class="rs-bus-num">{{ bus.bus_number }}</td>
                                <td>
                                    <span :class="{
                                        'rs-badge rs-badge--green': bus.status === 'active',
                                        'rs-badge rs-badge--gray': bus.status === 'inactive',
                                        'rs-badge rs-badge--yellow': bus.status === 'maintenance',
                                    }">{{ bus.status }}</span>
                                </td>
                                <td class="rs-muted">{{ bus.current_stop?.stop_name ?? '—' }}</td>
                                <td class="rs-actions">
                                    <Link :href="route('buses.show', bus.id)" class="rs-action-btn rs-action-btn--view">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
                                            <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clip-rule="evenodd"/>
                                        </svg>
                                    </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </template>
        </div>

        <!-- ── Delete Route Confirm Modal ───────────────────────────────── -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showDeleteConfirm" class="rs-modal-backdrop" @click.self="showDeleteConfirm = false">
                    <div class="rs-modal">
                        <div class="rs-modal-icon rs-modal-icon--danger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.998-.303 4.5-2.599 4.5H4.645c-2.296 0-3.752-2.502-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h3 class="rs-modal-title">Delete Route</h3>
                        <p class="rs-modal-text">
                            Are you sure you want to delete <strong>{{ routeData?.name }}</strong>?
                            All stops and bus assignments will be removed. This cannot be undone.
                        </p>
                        <div class="rs-modal-actions">
                            <button class="rs-btn rs-btn--ghost" @click="showDeleteConfirm = false">Cancel</button>
                            <button class="rs-btn rs-btn--danger" :disabled="deletingRoute" @click="doDeleteRoute">
                                {{ deletingRoute ? 'Deleting…' : 'Delete Route' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ── Delete Stop Confirm Modal ─────────────────────────────────── -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showStopConfirm" class="rs-modal-backdrop" @click.self="showStopConfirm = false">
                    <div class="rs-modal">
                        <div class="rs-modal-icon rs-modal-icon--danger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.998-.303 4.5-2.599 4.5H4.645c-2.296 0-3.752-2.502-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h3 class="rs-modal-title">Delete Stop</h3>
                        <p class="rs-modal-text">
                            Are you sure you want to delete stop <strong>{{ stopDeleteTarget?.stop_name }}</strong>?
                            This cannot be undone.
                        </p>
                        <div class="rs-modal-actions">
                            <button class="rs-btn rs-btn--ghost" @click="showStopConfirm = false">Cancel</button>
                            <button class="rs-btn rs-btn--danger" :disabled="deletingStop" @click="doDeleteStop">
                                {{ deletingStop ? 'Deleting…' : 'Delete Stop' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

    </AuthenticatedLayout>
</template>

<style scoped>
.rs-page { display: flex; flex-direction: column; gap: 20px; max-width: 1000px; }

/* Breadcrumb */
.rs-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.rs-bc-link    { display: flex; align-items: center; gap: 4px; color: #64748b; text-decoration: none; transition: color .15s; }
.rs-bc-link:hover { color: #1a56db; }
.rs-bc-link svg { width: 14px; height: 14px; }
.rs-bc-sep     { color: #cbd5e1; }
.rs-bc-current { color: #0f172a; font-weight: 500; }

/* Notification */
.rs-notif { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13.5px; border: 1px solid; }
.rs-notif svg { width: 16px; height: 16px; flex-shrink: 0; }
.rs-notif--success { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.rs-notif--error   { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.notif-enter-active, .notif-leave-active { transition: opacity .3s, transform .25s; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(-6px); }

/* Error */
.rs-error { display: flex; align-items: center; gap: 8px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 13.5px; padding: 10px 14px; }
.rs-error svg { width: 16px; height: 16px; }

/* Card */
.rs-card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.rs-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 22px; border-bottom: 1px solid #f1f5f9; }
.rs-card-body   { padding: 22px; }
.rs-section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.rs-section-sub   { font-size: 12px; color: #94a3b8; margin: 3px 0 0; }
.rs-count-chip    { background: #eff6ff; color: #1a56db; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 99px; white-space: nowrap; align-self: center; }

/* Route hero */
.rs-route-hero  { display: flex; align-items: flex-start; gap: 16px; padding: 22px; flex-wrap: wrap; }
.rs-route-icon  { width: 48px; height: 48px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #1a56db; flex-shrink: 0; }
.rs-route-icon svg { width: 24px; height: 24px; }
.rs-route-info  { flex: 1; min-width: 0; }
.rs-route-name  { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
.rs-route-desc  { font-size: 13.5px; color: #64748b; margin: 4px 0 0; }
.rs-meta-row    { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.rs-meta-chip   { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; color: #475569; background: #f1f5f9; padding: 4px 10px; border-radius: 99px; }
.rs-meta-chip svg { width: 12px; height: 12px; }
.rs-hero-actions{ display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-start; }

/* Add stop form */
.rs-add-stop-form { display: flex; gap: 8px; padding: 14px 22px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap; align-items: center; }

/* Inputs */
.rs-input         { padding: 8px 11px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 7px; outline: none; color: #0f172a; font-family: inherit; transition: border-color .15s, box-shadow .15s; min-width: 0; }
.rs-input:focus   { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.rs-input--grow2  { flex: 2; min-width: 120px; }
.rs-input--grow1  { flex: 1; min-width: 80px; }

/* Stops list */
.rs-empty       { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; text-align: center; }
.rs-empty-icon  { width: 44px; height: 44px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
.rs-empty-icon svg { width: 22px; height: 22px; }
.rs-empty-text  { font-size: 13.5px; color: #94a3b8; margin: 0; }

.rs-stops         { display: flex; flex-direction: column; }
.rs-stop-row      { display: flex; align-items: center; gap: 12px; padding: 11px 22px; border-bottom: 1px solid #f8fafc; transition: background .12s; }
.rs-stop-row:last-child { border-bottom: none; }
.rs-stop-row:hover { background: #fafbff; }
.rs-stop-order    { width: 26px; height: 26px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #1a56db; flex-shrink: 0; }
.rs-stop-order--editing { background: #fef9c3; border-color: #fde68a; color: #a16207; }
.rs-stop-info     { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rs-stop-name     { font-size: 13.5px; font-weight: 500; color: #1e293b; }
.rs-stop-coords   { font-size: 11.5px; color: #94a3b8; font-family: monospace; }
.rs-stop-actions  { display: flex; gap: 4px; }
.rs-stop-edit-row { flex: 1; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* Buttons */
.rs-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; font-size: 13px; font-weight: 600; border-radius: 7px; cursor: pointer; border: 1px solid transparent; text-decoration: none; white-space: nowrap; transition: background .15s, opacity .15s; }
.rs-btn svg { width: 14px; height: 14px; }
.rs-btn--sm { padding: 5px 12px; font-size: 12px; }
.rs-btn--primary { background: #1a56db; color: #fff; border-color: #1a56db; }
.rs-btn--primary:hover:not(:disabled) { background: #1e429f; }
.rs-btn--primary:disabled { opacity: .55; cursor: not-allowed; }
.rs-btn--ghost { background: #fff; color: #475569; border-color: #e2e8f0; }
.rs-btn--ghost:hover { background: #f8fafc; }
.rs-btn--danger { background: #dc2626; color: #fff; border-color: #dc2626; }
.rs-btn--danger:hover:not(:disabled) { background: #b91c1c; }
.rs-btn--danger:disabled { opacity: .55; cursor: not-allowed; }

/* Action icon buttons */
.rs-action-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 7px; border: 1px solid transparent; cursor: pointer; background: transparent; text-decoration: none; transition: background .12s, color .12s; }
.rs-action-btn svg { width: 14px; height: 14px; }
.rs-action-btn--view { color: #64748b; } .rs-action-btn--view:hover { background: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }
.rs-action-btn--edit { color: #64748b; } .rs-action-btn--edit:hover { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.rs-action-btn--del  { color: #64748b; } .rs-action-btn--del:hover  { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* Table */
.rs-table   { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.rs-table th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.rs-th--right { text-align: right; }
.rs-row     { border-bottom: 1px solid #f1f5f9; transition: background .12s; }
.rs-row:last-child { border-bottom: none; }
.rs-row:hover { background: #fafbff; }
.rs-table td { padding: 12px 16px; color: #334155; vertical-align: middle; }
.rs-bus-num { font-weight: 600; color: #0f172a; }
.rs-muted   { color: #64748b; }
.rs-actions { text-align: right; }

/* Badges */
.rs-badge        { display: inline-block; font-size: 11px; font-weight: 600; text-transform: capitalize; padding: 3px 9px; border-radius: 99px; }
.rs-badge--green { background: #dcfce7; color: #15803d; }
.rs-badge--gray  { background: #f1f5f9; color: #475569; }
.rs-badge--yellow{ background: #fef9c3; color: #a16207; }

/* Skeleton */
.rs-skeleton { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; border-radius: 6px; animation: shimmer 1.4s infinite; margin-bottom: 12px; }
.rs-skeleton--h14 { height: 14px; } .rs-skeleton--h28 { height: 28px; }
.rs-skeleton--w50 { width: 50%; } .rs-skeleton--w70 { width: 70%; } .rs-skeleton--w40 { width: 40%; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* Modal */
.rs-modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; backdrop-filter: blur(2px); }
.rs-modal          { background: #fff; border-radius: 14px; padding: 28px; max-width: 400px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.18); text-align: center; }
.rs-modal-icon     { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.rs-modal-icon svg { width: 24px; height: 24px; }
.rs-modal-icon--danger { background: #fef2f2; color: #dc2626; }
.rs-modal-title    { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
.rs-modal-text     { font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0 0 20px; }
.rs-modal-actions  { display: flex; gap: 10px; justify-content: center; }
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }

.rs-spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
