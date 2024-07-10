<?php

namespace App\Listeners;

use App\Events\DailyScheduleEvent;
use App\Notifications\DailyScheduleNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class DailyScheduleListener
{
    /**
     * Create the event listener.
     */

    /**
     * Handle the event.
     */
    public function handle(DailyScheduleEvent $event)
    {
        foreach($event->userData['user'] as $key => $notifiable)
        {
            Notification::send($notifiable, new DailyScheduleNotification($event->userData, $notifiable->id));
        }
    }

}
