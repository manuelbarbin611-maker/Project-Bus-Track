<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const form = ref({ first_name: '', last_name: '', status: 'waiting', assigned_bus_id: '' });
const errors     = ref({});
const submitting = ref(false);
const buses      = ref([]);
const notification = ref(null);

const notify = (type, message) => {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 4000);
};

onMounted(async () => {
    const res = await axios.get('/buses?status=active');
    buses.value = res.data.data ?? [];
});

const submit = async () => {
    errors.value = {};
    submitting.value = true;
    const payload = { ...form.value };
    if (!payload.assigned_bus_id) delete payload.assigned_bus_id;
    try {
        await axios.post('/passengers', payload);
        notify('success', 'Passenger added! Redirecting…');
        router.visit('/passengers');
    } catch (e) {
        if (e.response?.status === 422) errors.value = e.response.data.errors ?? {};
        else notify('error', 'Something went wrong.');
    } finally { submitting.value = false; }
};
</script>

<template>
    <Head title="New Passenger" />
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
                <span class="bc-current">New Passenger</span>
            </div>

            <div class="card">
                <div class="card-header">
                    <h1 class="card-title">Add New Passenger</h1>
                    <p class="card-sub">Register a new passenger in the system.</p>
                </div>
                <div class="card-body">
                    <div class="grid-2">
                        <div class="field">
                            <label class="label">First Name <span class="req">*</span></label>
                            <input v-model="form.first_name" class="input" :class="{'input-err': errors.first_name}" placeholder="Juan" />
                            <p v-if="errors.first_name" class="err-msg">{{ errors.first_name[0] }}</p>
                        </div>
                        <div class="field">
                            <label class="label">Last Name <span class="req">*</span></label>
                            <input v-model="form.last_name" class="input" :class="{'input-err': errors.last_name}" placeholder="dela Cruz" />
                            <p v-if="errors.last_name" class="err-msg">{{ errors.last_name[0] }}</p>
                        </div>
                        <div class="field">
                            <label class="label">Initial Status</label>
                            <select v-model="form.status" class="input">
                                <option value="waiting">Waiting</option>
                                <option value="onboarded">Onboarded</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="field">
                            <label class="label">Assign to Bus (optional)</label>
                            <select v-model="form.assigned_bus_id" class="input">
                                <option value="">— None —</option>
                                <option v-for="b in buses" :key="b.id" :value="b.id">Bus {{ b.bus_number }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <a href="/passengers" class="btn-cancel">Cancel</a>
                        <button @click="submit" :disabled="submitting || !form.first_name || !form.last_name" class="btn-primary">
                            {{ submitting ? 'Adding…' : 'Add Passenger' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.page-wrap   { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
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
