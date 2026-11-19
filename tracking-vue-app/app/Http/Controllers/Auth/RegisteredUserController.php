<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendEmailVerificationCode;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Generate a 6-digit OTP code (zero-padded)
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name'                               => $request->name,
            'email'                              => $request->email,
            'password'                           => Hash::make($request->password),
            'role'                               => 'user', // new sign-ups are always regular users
            'email_verification_code'            => $code,
            'email_verification_code_expires_at' => now()->addMinutes(15),
        ]);

        event(new Registered($user));

        // Send the OTP code to the user's email
        $user->notify(new SendEmailVerificationCode($code));

        Auth::login($user);

        // Redirect to the OTP verification page
        return redirect()->route('verification.notice');
    }
}
