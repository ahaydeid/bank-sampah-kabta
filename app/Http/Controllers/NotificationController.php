<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Ambil semua notifikasi real-time.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id() ?? 0;
        $dismissed = Cache::get("notifications_dismissed_{$userId}", []);
        
        // Fetch all notifications from service
        $notifications = $this->notificationService->getNotifications($dismissed);

        $notifications = array_values(array_filter($notifications, fn($n) => !in_array($n['id'], $dismissed)));

        $readIds = Cache::get("notifications_read_{$userId}", []);
        
        // Count unread notifications
        $unreadCount = 0;
        foreach ($notifications as $notif) {
            if (!in_array($notif['id'], $readIds)) {
                $unreadCount++;
            }
        }

        return response()->json([
            'notifications' => $notifications, // Still returns all (unless dismissed)
            'count' => $unreadCount,
        ]);
    }

    /**
     * Tandai semua notifikasi sebagai dibaca / dismiss semua.
     */
    public function dismissAll(Request $request): JsonResponse
    {
        $userId = auth()->id() ?? 0;
        // Ambil semua notifikasi aktif lalu simpan ID-nya ke cache
        $current = $this->getCurrentNotificationIds();
        $dismissed = Cache::get("notifications_dismissed_{$userId}", []);
        $merged = array_unique(array_merge($dismissed, $current));
        Cache::forever("notifications_dismissed_{$userId}", $merged);

        return response()->json(['success' => true]);
    }

    /**
     * Tandai semua notifikasi sebagai dibaca.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $userId = auth()->id() ?? 0;
        $current = $this->getCurrentNotificationIds();
        $readIds = Cache::get("notifications_read_{$userId}", []);
        
        $merged = array_unique(array_merge($readIds, $current));
        Cache::forever("notifications_read_{$userId}", $merged);

        return response()->json(['success' => true]);
    }

    /**
     * Dismiss satu notifikasi.
     */
    public function dismiss(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|string']);
        $userId = auth()->id() ?? 0;

        $dismissed = Cache::get("notifications_dismissed_{$userId}", []);
        $dismissed[] = $request->id;
        Cache::forever("notifications_dismissed_{$userId}", array_unique($dismissed));

        return response()->json(['success' => true]);
    }

    /**
     * Helper: ambil semua ID notifikasi aktif saat ini.
     */
    private function getCurrentNotificationIds(): array
    {
        return $this->notificationService->getCurrentNotificationIds();
    }

    /**
     * Static helper untuk Inertia shared props — hitung notifikasi count (ringan).
     */
    public static function getNotificationCount(?int $userId = null): int
    {
        $userId = $userId ?? auth()->id() ?? 0;
        return (new NotificationService())->getUnreadCount($userId);
    }
}
