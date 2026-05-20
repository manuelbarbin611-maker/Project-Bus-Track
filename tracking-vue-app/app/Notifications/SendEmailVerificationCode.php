<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendEmailVerificationCode extends Notification
{
    use Queueable;

    public function __construct(protected string $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Email Verification Code')
            ->greeting('Hello, ' . $notifiable->name . '!')
            ->line('Use the 6-digit code below to verify your email address.')
            ->line('This code expires in **15 minutes**.')
            ->line('') // spacer
            ->line('## ' . implode(' ', str_split($this->code))) // e.g. "1 2 3 4 5 6"
            ->line('')
            ->line('If you did not create an account, no further action is required.');
    }
}
