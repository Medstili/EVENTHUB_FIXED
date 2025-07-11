<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class OrganizerMiddleWare
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
     
         if (Auth::check() && Auth::user()->role === 'organizer') {
            return $next($request);
         }
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);

        // Log::info('OrganizerMiddleWare: Entered.');
        // Log::info('OrganizerMiddleWare: Session ID from request: ' . $request->session()->getId()); // Check current session ID
        // Log::info('OrganizerMiddleWare: Has session user? ' . ($request->hasSession() && $request->session()->has('login_web_'.Auth::getDefaultDriver())));

        /**
         *  if (Auth::check()) {
         *    $user = Auth::user();
         *   Log::info('OrganizerMiddleWare: User is authenticated.', ['id' => $user->id, 'email' => $user->email, 'role' => $user->role]);
         *   if ($user->role === 'organizer') {
         *       Log::info('OrganizerMiddleWare: User IS an organizer. Proceeding.');
         *       return $next($request);
         *   } else {
         *       Log::warning('OrganizerMiddleWare: User is authenticated but NOT an organizer.', ['id' => $user->id, 'role' => $user->role]);
         *       return response()->json(['message' => 'Access Denied: organizer role required.'], 403);
         *   }
        * } else {
        *     Log::warning('OrganizerMiddleWare: User is NOT authenticated. Auth::check() failed.');
        *     // This indicates auth:sanctum didn't authenticate, or session wasn't loaded.
        *     return response()->json(['message' => 'Authentication failed in OrganizerMiddleWare.'], 401); // Or 403
        * }
         */
       
    }


}
