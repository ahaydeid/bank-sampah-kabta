<?php

namespace App\Providers;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\TransaksiSetor::observe(\App\Observers\TransaksiSetorObserver::class);
        Vite::prefetch(concurrency: 3);

        // Register authentication event listeners for login logging
        Event::listen(Login::class, \App\Listeners\RecordLoginLog::class);
        Event::listen(Logout::class, \App\Listeners\RecordLogoutLog::class);
        Event::listen(Failed::class, \App\Listeners\RecordFailedLoginLog::class);
    }
}
