<?php

use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\ConversationController;


/**
 * guess routes 
 */  
route::get('guess/home/events', [EventController::class, 'guessHomeIndex']);
route::get('guess/event/{id}', [EventController::class, 'show']);
route::get('guess/home/categories', [CategoryController::class, 'index']);
route::get('guess/latest-event', [EventController::class, 'getLatestEvent']);
route::get('tickets/total', [TicketController::class, 'getTotalTickets']);
route::get('events/total', [EventController::class, 'getTotalEvents']);
route::get('organizer/total', [UserController::class, 'getOrganizersCount']);
route::get('organizer/total', [UserController::class, 'getOrganizersCount']);
route::get('tickets/tickets-sold-each-month', [TicketController::class, 'tickets_sold_each_month']);
Route::post('contact', [ConversationController::class, 'store'])
     ->middleware('throttle:5,1');  // 5 requests per minute


/**
 * stripe webhook route
 */
Route::post('stripe/webhook', [PaymentsController::class, 'webhook']);

/**
 * auth routes
 */
route::post('/login',[LoginController::class, 'authenticate']);
Route::post('/register', [LoginController::class, 'register']);
Route::post('/forgot-password', [LoginController::class, 'forgotPassword']);
Route::patch('/reset-password', [LoginController::class, 'resetPassword']);
route::middleware('auth:sanctum')->post('/logout',[LoginController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/current-user', [LoginController::class, 'currentUser']);
Route::middleware('auth:sanctum')->post('stripe/checkout/{event}', [PaymentsController::class, 'createCheckoutSession']); 
route::middleware('auth:sanctum')->get('user-tickets',[TicketController::class, 'getTicketsByUser']);   
route::middleware('auth:sanctum')->apiResource('tickets', TicketController::class)->only('show','store');
Route::middleware('auth:sanctum')->get('user-tickets/{ticket}/download', [TicketController::class, 'downloadPdf']);

/**
 * organizer routes
 */
Route::middleware(['auth:sanctum','organizer'])->group(function(){
    Route::get('organizer/events/count', [EventController::class, 'userEventsCount']);
    Route::apiResource('organizer/events', EventController::class, [
        'names' => [
            'index' => 'organizer.events.index',
            'store' => 'organizer.events.store',
            'create' => 'organizer.events.create',
            'show' => 'organizer.events.show',
            'edit' => 'organizer.events.edit',
            'update' => 'organizer.events.update',
            'destroy' => 'organizer.events.destroy',
        ]
    ]);
    Route::apiResource('organizer/user', UserController::class, [
        'names' => [
            'index' => 'organizer.user.index',
            'store' => 'organizer.user.store',
            'create' => 'organizer.user.create',
            'show' => 'organizer.user.show',
            'edit' => 'organizer.user.edit',
            'update' => 'organizer.user.update',
            'destroy' => 'organizer.user.destroy',
        ]
    ])->only(['update', 'destroy']);
    Route::get('organizer/events', [EventController::class, 'getUserEvents']);
    // dashboard statistics
    Route::get('organizer/upcoming-events', [EventController::class, 'upcomingEvents']);
    Route::get('organizer/past-events', [EventController::class, 'pastEvents']);
    Route::get('organizer/total-tickets-sold', [EventController::class, 'totalTicketsSold']);
    Route::get('organizer/revenue', [EventController::class, 'revenue']);
    Route::get('organizer/tickets-purchased-last-week', [EventController::class, 'ticketsPurchasedLastWeek']);
    Route::get('organizer/most-ticket-sales', [EventController::class, 'mostTicketSales']);
    // Enhanced dashboard routes
    Route::get('organizer/dashboard/stats', [EventController::class, 'organizerDashboardStats']);
    Route::get('organizer/dashboard/ticket-stats', [TicketController::class, 'organizerTicketStats']);
    Route::get('organizer/dashboard/revenue-overview', [EventController::class, 'organizerRevenueOverview']);
    // Route::get('organizer/total-ticket-sold/{id}', [EventController::class, 'totalTicketSoldByevent']);

});
/**
 * participant routes
 */
Route::middleware(['auth:sanctum','participant'])->group(function(){
    Route::apiResource('participant/events', EventController::class, [
        'names' => [
            'index' => 'participant.events.index',
            'show' => 'participant.events.show',
        ]
    ])->only(['index', 'show']);
    Route::apiResource('participant/user', UserController::class, [
        'names' => [
            'update' => 'participant.user.update',
            'destroy' => 'participant.user.destroy',
        ]
    ])->only(['update', 'destroy']);
});
/**
 * admin routes
 */
Route::middleware(['auth:sanctum','admin'])->group(function(){

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('admin/events', EventController::class, [
        'names' => [
            'index' => 'admin.events.index',
            'store' => 'admin.events.store',
            'create' => 'admin.events.create',
            'show' => 'admin.events.show',
            'edit' => 'admin.events.edit',
            'update' => 'admin.events.update',
            'destroy' => 'admin.events.destroy',
        ]
    ]);
    Route::apiResource('admin/user', UserController::class, [
        'names' => [
            'index' => 'admin.user.index',
            'store' => 'admin.user.store',
            'create' => 'admin.user.create',
            'show' => 'admin.user.show',
            'edit' => 'admin.user.edit',
            'update' => 'admin.user.update',
            'destroy' => 'admin.user.destroy',
        ]
    ]);    
    Route::apiResource('admin/tickets', TicketController::class, [
        'names' => [
            'index' => 'admin.tickets.index',
            'store' => 'admin.tickets.store',
            'create' => 'admin.tickets.create',
            'show' => 'admin.tickets.show',
            'edit' => 'admin.tickets.edit',
            'update' => 'admin.tickets.update',
            'destroy' => 'admin.tickets.destroy',
        ]
    ])->except(['show']);
    route::patch('admin/cancel-ticket', [TicketController::class, 'cancel']);
    Route::get('admin/user-events', [EventController::class, 'getUserEvents']);
    route::get('admin/Or-Pr-Users',[UserController::class,'get_Or_Pr_Users']);
    route::get('admin/Pb-Pr-Events',[EventController::class,'get_All_Pb_Pr_Events']);
    route::get('admin/top-events',[TicketController::class,'top_Ten_Event_Tickets']);
    route::get('admin/tickets/tickets-sold-each-month', [TicketController::class, 'tickets_sold_each_month']);
    // Enhanced admin dashboard routes
    Route::get('admin/dashboard/stats', [EventController::class, 'adminDashboardStats']);
    Route::get('admin/dashboard/recent-activity', [EventController::class, 'recentActivity']);
    Route::get('admin/dashboard/user-distribution', [UserController::class, 'getUserDistribution']);
    Route::get('admin/dashboard/user-growth', [UserController::class, 'getUserGrowth']);
    Route::get('admin/dashboard/ticket-sales-by-category', [TicketController::class, 'ticketSalesByCategory']);
    Route::get('admin/dashboard/revenue-overview', [EventController::class, 'adminRevenueOverview']);
    // Admin conversation routes
    Route::get('admin/dashboard/conversations', [ConversationController::class, 'index']);
    Route::get('admin/dashboard/conversations/{id}', [ConversationController::class, 'show'])->where('id', '[0-9]+');;
    Route::post('admin/dashboard/conversations/{id}/reply', [ConversationController::class, 'reply']);
    Route::patch('admin/dashboard/conversations/{id}/status', [ConversationController::class, 'updateStatus']);
    route::get('admin/total-events',[EventController::class,'getTotalEvents']);
    Route::get('admin/dashboard/conversations/stats', [ConversationController::class, 'stats']);
    route::get('admin/total-tickets',[TicketController::class,'getTotalTickets']);
    // Route::patch('admin/dashboard/conversations/{id}/mark-read', [ConversationController::class, 'markAsRead']);
    // Route::get('admin/dashboard/ticket-stats', [TicketController::class, 'adminTicketStats']);
    // Route::get('admin/dashboard/top-organizers', [UserController::class, 'getTopOrganizers']);
    // route::get('admin/total-users',[UserController::class,'getAllUsers']);
});


