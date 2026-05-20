<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const submit = () => {
    form.post(route('register'), {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Register" />

        <!-- Back to home -->
        <div class="mb-6">
            <Link
                href="/"
                class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 no-underline transition-colors group"
            >
                <svg class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to home
            </Link>
        </div>

        <!-- Brand header -->
        <div class="mb-8 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                <svg class="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-900">Create an account</h1>
            <p class="mt-1 text-sm text-slate-500">Join the fleet management platform</p>
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-5">

            <!-- Name -->
            <div>
                <InputLabel for="name" value="Full name" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="name"
                    type="text"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.name"
                    placeholder="Juan dela Cruz"
                    required
                    autofocus
                    autocomplete="name"
                />
                <InputError class="mt-1.5" :message="form.errors.name" />
            </div>

            <!-- Email -->
            <div>
                <InputLabel for="email" value="Email address" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="email"
                    type="email"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.email"
                    placeholder="you@example.com"
                    required
                    autocomplete="username"
                />
                <InputError class="mt-1.5" :message="form.errors.email" />
            </div>

            <!-- Password -->
            <div>
                <InputLabel for="password" value="Password" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="password"
                    type="password"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.password"
                    placeholder="Min. 8 characters"
                    required
                    autocomplete="new-password"
                />
                <InputError class="mt-1.5" :message="form.errors.password" />
            </div>

            <!-- Confirm Password -->
            <div>
                <InputLabel for="password_confirmation" value="Confirm password" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="password_confirmation"
                    type="password"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.password_confirmation"
                    placeholder="Repeat password"
                    required
                    autocomplete="new-password"
                />
                <InputError class="mt-1.5" :message="form.errors.password_confirmation" />
            </div>

            <!-- Submit -->
            <button
                type="submit"
                :disabled="form.processing"
                :class="{ 'opacity-60 cursor-not-allowed': form.processing }"
                class="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
                <span v-if="form.processing">Creating account…</span>
                <span v-else>Create account</span>
            </button>

        </form>

        <!-- Login link -->
        <p class="mt-6 text-center text-sm text-slate-500">
            Already have an account?
            <Link :href="route('login')" class="font-semibold text-blue-600 hover:text-blue-800 no-underline">
                Sign in
            </Link>
        </p>

    </GuestLayout>
</template>