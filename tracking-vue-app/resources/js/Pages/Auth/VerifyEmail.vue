<script setup>
import { ref, computed } from 'vue';
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

const props = defineProps({
    status: { type: String },
});

// ── OTP boxes ────────────────────────────────────────────────────────────────
const digits = ref(['', '', '', '', '', '']);
const inputs = ref([]);

const joinedCode = computed(() => digits.value.join(''));

const onInput = (index, event) => {
    const val = event.target.value.replace(/\D/g, '').slice(-1);
    digits.value[index] = val;
    if (val && index < 5) {
        inputs.value[index + 1]?.focus();
    }
};

const onKeydown = (index, event) => {
    if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
        digits.value[index - 1] = '';
        inputs.value[index - 1]?.focus();
    }
};

const onPaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    pasted.split('').forEach((ch, i) => { digits.value[i] = ch; });
    inputs.value[Math.min(pasted.length, 5)]?.focus();
    event.preventDefault();
};

// ── Forms ─────────────────────────────────────────────────────────────────────
const verifyForm = useForm({ code: '' });
const resendForm = useForm({});

const submit = () => {
    verifyForm.code = joinedCode.value;
    verifyForm.post(route('verification.verify'), {
        onError: () => {
            digits.value = ['', '', '', '', '', ''];
            inputs.value[0]?.focus();
        },
    });
};

const resend = () => resendForm.post(route('verification.send'));

const codeSent = computed(() => props.status === 'verification-code-sent');
</script>

<template>
    <GuestLayout>
        <Head title="Verify Email" />

        <!-- Header -->
        <div class="mb-8 text-center">
            
            <h1 class="text-2xl font-bold text-slate-900">Check your email</h1>
            <p class="mt-1 text-sm text-slate-500 leading-relaxed">
                We sent a 6-digit code to your email.<br/>Enter it below to verify your account.
            </p>
        </div>

        <!-- Success banner -->
        <div v-if="codeSent" class="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
            ✓ A new verification code has been sent.
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-5">

            <!-- OTP boxes -->
            <div class="flex justify-center gap-2.5">
                <input
                    v-for="(digit, index) in digits"
                    :key="index"
                    :ref="el => inputs[index] = el"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    :value="digit"
                    @input="onInput(index, $event)"
                    @keydown="onKeydown(index, $event)"
                    @paste="index === 0 ? onPaste($event) : null"
                    class="h-13 w-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition"
                    :class="{ 'border-red-400 ring-2 ring-red-200 bg-red-50': verifyForm.errors.code }"
                />
            </div>

            <InputError class="text-center -mt-2" :message="verifyForm.errors.code" />

            <button
                type="submit"
                :disabled="verifyForm.processing || joinedCode.length < 6"
                :class="{ 'opacity-60 cursor-not-allowed': verifyForm.processing || joinedCode.length < 6 }"
                class="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
                <span v-if="verifyForm.processing">Verifying…</span>
                <span v-else>Verify email</span>
            </button>

        </form>

        <!-- Resend + Logout -->
        <div class="mt-6 flex items-center justify-between text-sm">
            <button
                type="button"
                :disabled="resendForm.processing"
                @click="resend"
                class="font-semibold text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-50 transition-colors"
            >
                Resend code
            </button>
            <Link
                :href="route('logout')"
                method="post"
                as="button"
                class="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
                Log out
            </Link>
        </div>

    </GuestLayout>
</template>