<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const form = ref({ bus_number: '', route_id: '', capacity: 50, status: 'active', current_stop_id: '' });
const errors     = ref({});
const submitting = ref(false);
const routes     = ref([]);
const stops      = ref([]);
const notification = ref(null);

const notify = (type, message) => {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 4000);
};

onMounted(async () => {
    const res = await axios.get('/routes');
    routes.value = res.data.data ?? [];
});

const onRouteChange = async () => {
    form.value.current_stop_id = '';
    stops.value = [];
    if (!form.value.route_id) return;
    const res = await axios.get(`/routes/${form.value.route_id}/stops`);
    stops.value = res.data.data ?? [];
};

const submit = async () => {
    errors.value = {};
    submitting.value = true;
    const payload = { ...form.value };
    if (!payload.route_id) delete payload.route_id;
    if (!payload.current_stop_id) delete payload.current_stop_id;
    try {
        const res = await axios.post('/buses', payload);
        notify('success', 'Bus created! Redirecting…');
        router.visit('/buses/' + res.data.data.id);
    } catch (e) {
        if (e.response?.status === 422) errors.value = e.response.data.errors ?? {};
        else notify('error', 'Something went wrong.');
    } finally { submitting.value = false; }
};
</script>

<template>
    <Head title="New Bus" />
    <AuthenticatedLayout>
        <div class="page-wrap">

            <Transition name="notif">
                <div v-if="notification" :class="notification.type === 'success' ? 'notif-success' : 'notif-error'" class="notif">
                    {{ notification.message }}
                </div>
            </Transition>

            <div class="breadcrumb">
                <a href="/buses" class="bc-link">← Buses</a>
                <span class="bc-sep">/</span>
                <span class="bc-current">New Bus</span>
            </div>

            <div class="card">
                <div class="card-header">
                    <h1 class="card-title">Add New Bus</h1>
                    <p class="card-sub">Register a new bus in the fleet.</p>
                </div>
                <div class="card-body">
                    <div class="grid-2">
                        <div class="field">
                            <label class="label">Bus Number <span class="req">*</span></label>
                            <input v-model="form.bus_number" class="input" :class="{'input-err': errors.bus_number}" placeholder="e.g. BUS-001" />
                            <p v-if="errors.bus_number" class="err-msg">{{ errors.bus_number[0] }}</p>
                        </div>
                        <div class="field">
                            <label class="label">Capacity</label>
                            <input v-model.number="form.capacity" type="number" min="1" max="200" class="input" />
                            <p v-if="errors.capacity" class="err-msg">{{ errors.capacity[0] }}</p>
                        </div>
                        <div class="field">
                            <label class="label">Route</label>
                            <select v-model="form.route_id" @change="onRouteChange" class="input">
                                <option value="">— No Route —</option>
                                <option v-for="r in routes" :key="r.id" :value="r.id">{{ r.name }}</option>
                            </select>
                        </div>
                        <div class="field">
                            <label class="label">Current Stop</label>
                            <select v-model="form.current_stop_id" class="input" :disabled="!stops.length">
                                <option value="">— None —</option>
                                <option v-for="s in stops" :key="s.id" :value="s.id">{{ s.stop_name }}</option>
                            </select>
                        </div>
                        <div class="field">
                            <label class="label">Status</label>
                            <select v-model="form.status" class="input">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <a href="/buses" class="btn-cancel">Cancel</a>
                        <button @click="submit" :disabled="submitting || !form.bus_number" class="btn-primary">
                            {{ submitting ? 'Creating…' : 'Create Bus' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.page-wrap   { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.breadcrumb  { display: flex; align-items: center; gap: 8px; font-size: 13.5px; }
.bc-link     { color: #64748b; text-decoration: none; } .bc-link:hover { color: #0f172a; }
.bc-sep      { color: #cbd5e1; }
.bc-current  { color: #0f172a; font-weight: 500; }
.card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.card-header { padding: 24px 24px 0; }
.card-title  { font-size: 18px; font-weight: 700; color: #0f172a; }
.card-sub    { font-size: 13px; color: #64748b; margin-top: 4px; }
.card-body   { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.grid-2      { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field       { display: flex; flex-direction: column; gap: 6px; }
.label       { font-size: 13.5px; font-weight: 500; color: #374151; }
.req         { color: #ef4444; }
.input       { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; outline: none; }
.input:focus { border-color: #1a56db; }
.input-err   { border-color: #f87171 !important; }
.input:disabled { background: #f8fafc; color: #94a3b8; }
.err-msg     { font-size: 12px; color: #dc2626; }
.form-actions{ display: flex; gap: 10px; padding-top: 4px; }
.btn-cancel  { padding: 9px 18px; background: #f1f5f9; border-radius: 10px; font-size: 13.5px; font-weight: 500; color: #475569; text-decoration: none; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-primary { padding: 9px 20px; background: #1a56db; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.notif        { padding: 12px 16px; border-radius: 10px; font-size: 13.5px; border: 1px solid; }
.notif-success{ background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.notif-error  { background: #fff5f5; border-color: #fecaca; color: #dc2626; }
.notif-enter-active, .notif-leave-active { transition: opacity .3s, transform .3s; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(-6px); }
@media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
