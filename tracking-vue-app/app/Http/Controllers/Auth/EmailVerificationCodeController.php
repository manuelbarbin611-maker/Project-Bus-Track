<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\SendEmailVerificationCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationCodeController extends Controller
{
    /**
     * Display the OTP verification page.
     */
    public function show(Request $request): RedirectResponse|Response
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status'),
        ]);
    }

    /**
     * Verify the submitted 6-digit code.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // Check code match and expiry
        if (
            $user->email_verification_code !== $request->code ||
            now()->isAfter($user->email_verification_code_expires_at)
        ) {
            throw ValidationException::withMessages([
                'code' => 'The verification code is invalid or has expired.',
            ]);
        }

        // Mark email as verified and clear the code
        $user->forceFill([
            'email_verified_at'                  => now(),
            'email_verification_code'            => null,
            'email_verification_code_expires_at' => null,
        ])->save();

        event(new Verified($user));

        return redirect()->intended(route('dashboard', absolute: false) . '?verified=1');
    }

    /**
     * Resend a fresh verification code.
     */
    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->forceFill([
            'email_verification_code'            => $code,
            'email_verification_code_expires_at' => now()->addMinutes(15),
        ])->save();

        $user->notify(new SendEmailVerificationCode($code));

        return back()->with('status', 'verification-code-sent');
    }
}
