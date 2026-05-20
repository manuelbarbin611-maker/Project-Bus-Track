<script setup>
import { ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import axios from 'axios';

// ── State ──────────────────────────────────────────────────────────────────
const form = ref({ name: '', description: '' });
const errors     = ref({});
const submitting = ref(false);
const error      = ref(null);

// ── Submit ─────────────────────────────────────────────────────────────────
async function submit() {
    errors.value     = {};
    error.value      = null;
    submitting.value = true;
    try {
        const { data } = await axios.post('/routes', form.value);
        router.visit('/routes/' + data.data.id);
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response.data.errors ?? {};
        } else {
            error.value = 'Something went wrong. Please try again.';
        }
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <AuthenticatedLayout>
        <template #header>New Route</template>

        <div class="rc-page">

            <!-- ── Breadcrumb ───────────────────────────────────────────── -->
            <div class="rc-breadcrumb">
                <Link :href="/routes/" class="rc-bc-link">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
                    </svg>
                    Routes
                </Link>
                <span class="rc-bc-sep">/</span>
                <span class="rc-bc-current">New Route</span>
            </div>

            <!-- ── Page heading ─────────────────────────────────────────── -->
            <div class="rc-heading">
                <h1 class="rc-title">Create Route</h1>
                <p class="rc-subtitle">Add a new transit route. You can add stops after creation.</p>
            </div>

            <!-- ── Error banner ─────────────────────────────────────────── -->
            <div v-if="error" class="rc-error">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
                {{ error }}
                <button class="rc-error-close" @click="error = null">✕</button>
            </div>

            <!-- ── Form card ────────────────────────────────────────────── -->
            <div class="rc-card">
                <div class="rc-card-header">
                    <div class="rc-card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 class="rc-card-title">Route Details</h2>
                        <p class="rc-card-sub">Fill in the information below to create a new route.</p>
                    </div>
                </div>

                <div class="rc-card-body">
                    <!-- Route Name -->
                    <div class="rc-field">
                        <label class="rc-label">
                            Route Name
                            <span class="rc-required">*</span>
                        </label>
                        <input
                            v-model="form.name"
                            type="text"
                            class="rc-input"
                            :class="{ 'rc-input--error': errors.name }"
                            placeholder="e.g. Route 1 – North Line"
                            autofocus
                        />
                        <p v-if="errors.name" class="rc-field-error">{{ errors.name[0] }}</p>
                        <p class="rc-field-hint">This name will appear in bus assignments and passenger displays.</p>
                    </div>

                    <!-- Description -->
                    <div class="rc-field">
                        <label class="rc-label">Description</label>
                        <textarea
                            v-model="form.description"
                            class="rc-input rc-textarea"
                            :class="{ 'rc-input--error': errors.description }"
                            placeholder="Brief description of this route, key landmarks, terminals…"
                            rows="4"
                        />
                        <p v-if="errors.description" class="rc-field-error">{{ errors.description[0] }}</p>
                    </div>
                </div>

                <!-- ── Form actions ───────────────────────────────────── -->
                <div class="rc-card-footer">
                    <Link :href="route('routes.index')" class="rc-btn rc-btn--ghost">
                        Cancel
                    </Link>
                    <button
                        class="rc-btn rc-btn--primary"
                        :disabled="submitting || !form.name.trim()"
                        @click="submit"
                    >
                        <svg v-if="submitting" class="rc-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                        </svg>
                        {{ submitting ? 'Creating…' : 'Create Route' }}
                    </button>
                </div>
            </div>

        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.rc-page       { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }

/* Breadcrumb */
.rc-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.rc-bc-link    { display: flex; align-items: center; gap: 4px; color: #64748b; text-decoration: none; transition: color .15s; }
.rc-bc-link:hover { color: #1a56db; }
.rc-bc-link svg{ width: 14px; height: 14px; }
.rc-bc-sep     { color: #cbd5e1; }
.rc-bc-current { color: #0f172a; font-weight: 500; }

/* Heading */
.rc-heading  { display: flex; flex-direction: column; gap: 3px; }
.rc-title    { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.4px; }
.rc-subtitle { font-size: 13px; color: #64748b; margin: 0; }

/* Error banner */
.rc-error { display: flex; align-items: center; gap: 8px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 13.5px; padding: 10px 14px; }
.rc-error svg { width: 16px; height: 16px; flex-shrink: 0; }
.rc-error-close { margin-left: auto; background: none; border: none; cursor: pointer; color: #dc2626; font-size: 13px; }

/* Card */
.rc-card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.rc-card-header { display: flex; align-items: flex-start; gap: 14px; padding: 22px 24px; border-bottom: 1px solid #f1f5f9; }
.rc-card-icon   { width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #1a56db; flex-shrink: 0; }
.rc-card-icon svg { width: 20px; height: 20px; }
.rc-card-title  { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.rc-card-sub    { font-size: 12.5px; color: #64748b; margin: 3px 0 0; }
.rc-card-body   { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.rc-card-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fafbff; }

/* Fields */
.rc-field       { display: flex; flex-direction: column; gap: 6px; }
.rc-label       { font-size: 13.5px; font-weight: 600; color: #374151; }
.rc-required    { color: #ef4444; margin-left: 2px; }
.rc-input       { width: 100%; padding: 9px 12px; font-size: 13.5px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; color: #0f172a; background: #fff; transition: border-color .15s, box-shadow .15s; box-sizing: border-box; font-family: inherit; }
.rc-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
.rc-input--error{ border-color: #f87171; }
.rc-input--error:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.15); }
.rc-textarea    { resize: vertical; min-height: 100px; }
.rc-field-error { font-size: 12px; color: #dc2626; margin: 0; }
.rc-field-hint  { font-size: 12px; color: #94a3b8; margin: 0; }

/* Buttons */
.rc-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; font-size: 13.5px; font-weight: 600; border-radius: 8px; cursor: pointer; border: 1px solid transparent; text-decoration: none; white-space: nowrap; transition: background .15s, opacity .15s; }
.rc-btn svg { width: 15px; height: 15px; }
.rc-btn--primary { background: #1a56db; color: #fff; border-color: #1a56db; }
.rc-btn--primary:hover:not(:disabled) { background: #1e429f; }
.rc-btn--primary:disabled { opacity: .55; cursor: not-allowed; }
.rc-btn--ghost { background: #fff; color: #475569; border-color: #e2e8f0; }
.rc-btn--ghost:hover { background: #f8fafc; }

/* Spin */
.rc-spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
