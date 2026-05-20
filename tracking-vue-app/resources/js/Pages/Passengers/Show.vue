<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({ passengerId: [String, Number] });

const passenger     = ref(null);
const buses         = ref([]);
const loading       = ref(true);
const notification  = ref(null);
const assigning     = ref(false);
const selectedBusId = ref('');

const notify = (type, message) => {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 3500);
};

onMounted(async () => {
    loading.value = true;
    try {
        const [pRes, bRes] = await Promise.all([
            axios.get(`/passengers/${props.passengerId}`),
            axios.get('/buses?status=active'),
        ]);
        passenger.value     = pRes.data.data;
        selectedBusId.value = pRes.data.data.assigned_bus_id ?? '';
        buses.value         = bRes.data.data ?? [];
    } finally { loading.value = false; }
});

const assignBus = async () => {
    assigning.value = true;
    try {
        const res = await axios.patch(`/passengers/${props.passengerId}/assign`, { bus_id: selectedBusId.value || null });
        passenger.value = res.data.data;
        notify('success', res.data.message);
    } catch (e) {
        notify('error', e.response?.data?.message ?? 'Failed to assign.');
    } finally { assigning.value = false; }
};

const updateStatus = async (status) => {
    try {
        const res = await axios.patch(`/passengers/${props.passengerId}/status`, { status });
        passenger.value.status = res.data.data.status;
        notify('success', `Status → ${status}`);
    } catch { notify('error', 'Failed to update status.'); }
};

const statusColor = (s) => ({
    waiting:   'badge-amber',
    onboarded: 'badge-green',
    cancelled: 'badge-red',
}[s] ?? '');
</script>

<template>
    <Head title="Passenger Detail" />
    <AuthenticatedLayout>
        <div class="page-wrap">

            <Transition name="notif">
                <div v-if="notification" :class="notification.type === 'success' ? 'notif-success' : 'notif-error'" class="notif">
                    {{ notification.message }}
                </div>
            </Transition>

            <div class="breadcrumb">
                <a href="/passengers" class="bc-link">← Passengers</a>
                <span class="bc-sep">/</span>
                <span class="bc-current">{{ passenger ? `${passenger.first_name} ${passenger.last_name}` : '…' }}</span>
            </div>

            <div v-if="loading" class="loading">Loading…</div>

            <template v-else-if="passenger">
                <!-- Info Card -->
                <div class="card">
                    <div class="passenger-hero">
                        <div>
                            <div class="avatar-lg">{{ passenger.first_name?.charAt(0)?.toUpperCase() }}</div>
                            <h1 class="page-title">{{ passenger.first_name }} {{ passenger.last_name }}</h1>
                            <div class="meta-row">
                                <span :class="statusColor(passenger.status)" class="badge">{{ passenger.status }}</span>
                                <span class="meta-chip">#{{ passenger.id }}</span>
                            </div>
                        </div>
                        <a :href="`/passengers/${passengerId}/edit`" class="btn-edit">Edit</a>
                    </div>

                    <!-- Status change -->
                    <div class="status-section">
                        <p class="section-label">Change Status</p>
                        <div class="status-btns">
                            <button @click="updateStatus('waiting')"
                                :class="passenger.status === 'waiting' ? 'status-active-amber' : 'status-ghost'"
                                class="status-btn">⏳ Waiting</button>
                            <button @click="updateStatus('onboarded')"
                                :class="passenger.status === 'onboarded' ? 'status-active-green' : 'status-ghost'"
                                class="status-btn">✅ Onboarded</button>
                            <button @click="updateStatus('cancelled')"
                                :class="passenger.status === 'cancelled' ? 'status-active-red' : 'status-ghost'"
                                class="status-btn">❌ Cancelled</button>
                        </div>
                    </div>
                </div>

                <!-- Bus Assignment -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Bus Assignment</h2>
                    </div>
                    <div class="card-body">
                        <div v-if="passenger.assigned_bus" class="assigned-bus">
                            <span class="bus-icon">🚌</span>
                            <div>
                                <p class="bus-num">Bus {{ passenger.assigned_bus.bus_number }}</p>
                                <p class="bus-route">{{ passenger.assigned_bus.route?.name ?? 'No route' }}</p>
                            </div>
                        </div>
                        <div class="assign-row">
                            <select v-model="selectedBusId" class="input" style="flex:1">
                                <option value="">— Unassign —</option>
                                <option v-for="b in buses" :key="b.id" :value="b.id">
                                    Bus {{ b.bus_number }} ({{ b.available_seats }} seats)
                                </option>
                            </select>
                            <button @click="assignBus" :disabled="assigning" class="btn-primary">
                                {{ assigning ? '…' : 'Assign' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Queue Info -->
                <div v-if="passenger.queue_entry" class="card">
                    <div class="card-header">
                        <h2 class="card-title">Queue Position</h2>
                    </div>
                    <div class="card-body">
                        <div class="queue-info">
                            <span class="queue-num">#{{ passenger.queue_entry.queue_order }}</span>
                            <div>
                                <p class="queue-label">Position in queue</p>
                                <p class="queue-time">Added {{ new Date(passenger.queue_entry.queued_at).toLocaleString() }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.page-wrap   { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.breadcrumb  { display: flex; align-items: center; gap: 8px; font-size: 13.5px; }
.bc-link     { color: #64748b; text-decoration: none; } .bc-link:hover { color: #0f172a; }
.bc-sep      { color: #cbd5e1; }
.bc-current  { color: #0f172a; font-weight: 500; }
.loading     { text-align: center; color: #94a3b8; padding: 48px; }

.card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.card-title  { font-size: 15px; font-weight: 700; color: #0f172a; }
.card-body   { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

.passenger-hero { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px; gap: 16px; }
.avatar-lg   { width: 48px; height: 48px; background: linear-gradient(135deg,#1a56db,#1e429f); color:#fff; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; margin-bottom: 10px; }
.page-title  { font-size: 22px; font-weight: 700; color: #0f172a; }
.meta-row    { display: flex; gap: 8px; margin-top: 8px; }
.badge       { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-amber { background: #fef3c7; color: #d97706; }
.badge-red   { background: #fff5f5; color: #dc2626; }
.meta-chip   { background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 99px; }
.btn-edit    { padding: 8px 16px; background: #eff6ff; color: #1a56db; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; }
.btn-edit:hover { background: #dbeafe; }

.status-section { padding: 16px 24px; border-top: 1px solid #f1f5f9; }
.section-label  { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px; }
.status-btns    { display: flex; gap: 8px; flex-wrap: wrap; }
.status-btn     { font-size: 13px; padding: 7px 16px; border-radius: 9px; border: 1px solid transparent; cursor: pointer; font-weight: 500; transition: all .15s; }
.status-ghost       { background: #f1f5f9; color: #64748b; border-color: transparent; }
.status-ghost:hover { background: #e2e8f0; }
.status-active-amber{ background: #fef3c7; color: #d97706; border-color: #fde68a; }
.status-active-green{ background: #dcfce7; color: #16a34a; border-color: #86efac; }
.status-active-red  { background: #fff5f5; color: #dc2626; border-color: #fecaca; }

.assigned-bus{ display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
.bus-icon    { font-size: 22px; }
.bus-num     { font-size: 14px; font-weight: 600; color: #1e293b; }
.bus-route   { font-size: 12px; color: #94a3b8; }
.assign-row  { display: flex; gap: 10px; }
.input       { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 9px; font-size: 13.5px; outline: none; }
.input:focus { border-color: #1a56db; }
.btn-primary { padding: 9px 18px; background: #1a56db; color: #fff; border: none; border-radius: 9px; font-size: 13.5px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.queue-info  { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
.queue-num   { width: 40px; height: 40px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #1a56db; flex-shrink: 0; }
.queue-label { font-size: 13.5px; font-weight: 500; color: #1e293b; }
.queue-time  { font-size: 11px; color: #94a3b8; margin-top: 2px; }

.notif        { padding: 12px 16px; border-radius: 10px; font-size: 13.5px; border: 1px solid; }
.notif-success{ background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.notif-error  { background: #fff5f5; border-color: #fecaca; color: #dc2626; }
.notif-enter-active, .notif-leave-active { transition: opacity .3s, transform .3s; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
