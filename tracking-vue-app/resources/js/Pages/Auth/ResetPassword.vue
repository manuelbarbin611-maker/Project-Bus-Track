<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';

const props = defineProps({
    email: { type: String, required: true },
    token: { type: String, required: true },
});

const form = useForm({
    token: props.token,
    email: props.email,
    password: '',
    password_confirmation: '',
});

const submit = () => {
    form.post(route('password.store'), {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Reset Password" />

        <!-- Header -->
        <div class="mb-8 text-center">
           
            <h1 class="text-2xl font-bold text-slate-900">Set new password</h1>
            <p class="mt-1 text-sm text-slate-500">Choose a strong password for your account.</p>
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-5">

            <!-- Email (read-only) -->
            <div>
                <InputLabel for="email" value="Email address" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="email"
                    type="email"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    v-model="form.email"
                    required
                    autocomplete="username"
                    readonly
                />
                <InputError class="mt-1.5" :message="form.errors.email" />
            </div>

            <!-- New Password -->
            <div>
                <InputLabel for="password" value="New password" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="password"
                    type="password"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.password"
                    placeholder="Min. 8 characters"
                    required
                    autofocus
                    autocomplete="new-password"
                />
                <InputError class="mt-1.5" :message="form.errors.password" />
            </div>

            <!-- Confirm Password -->
            <div>
                <InputLabel for="password_confirmation" value="Confirm new password" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="password_confirmation"
                    type="password"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.password_confirmation"
                    placeholder="Repeat new password"
                    required
                    autocomplete="new-password"
                />
                <InputError class="mt-1.5" :message="form.errors.password_confirmation" />
            </div>

            <button
                type="submit"
                :disabled="form.processing"
                :class="{ 'opacity-60 cursor-not-allowed': form.processing }"
                class="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
                <span v-if="form.processing">Resetting…</span>
                <span v-else>Reset password</span>
            </button>

        </form>

    </GuestLayout>
</template>