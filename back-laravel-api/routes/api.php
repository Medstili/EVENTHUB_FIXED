<?php

use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\TicketController;

/**
 * guess routes 
 */  
route::get('guess/home/events', [EventController::class, 'index']);
route::get('guess/event/{id}', [EventController::class, 'show']);
route::get('guess/home/categories', [CategoryController::class, 'index']);
route::get('guess/latest-event', [EventController::class, 'getLatestEvent']);
route::get('tickets/total', [TicketController::class, 'getTotalTickets']);
route::get('events/total', [EventController::class, 'getTotalEvents']);
route::get('organizer/total', [UserController::class, 'getOrganizersCount']);
route::get('organizer/total', [UserController::class, 'getOrganizersCount']);
route::get('tickets/tickets-sold-each-month', [TicketController::class, 'tickets_sold_each_month']);

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
    Route::apiResource('organizer/events', EventController::class);
    Route::apiResource('organizer/user', UserController::class)->only(['update', 'destroy']);
    Route::get('organizer/events', [EventController::class, 'getUserEvents']);
    // dashboard statistics
    Route::get('organizer/upcoming-events', [EventController::class, 'upcomingEvents']);
    Route::get('organizer/past-events', [EventController::class, 'pastEvents']);
    Route::get('organizer/total-tickets-sold', [EventController::class, 'totalTicketsSold']);
    // Route::get('organizer/total-ticket-sold/{id}', [EventController::class, 'totalTicketSoldByevent']);
    Route::get('organizer/revenue', [EventController::class, 'revenue']);
    Route::get('organizer/tickets-purchased-last-week', [EventController::class, 'ticketsPurchasedLastWeek']);
    Route::get('organizer/most-ticket-sales', [EventController::class, 'mostTicketSales']);
    
    // Enhanced dashboard routes
    Route::get('organizer/dashboard/stats', [EventController::class, 'organizerDashboardStats']);
    Route::get('organizer/dashboard/ticket-stats', [TicketController::class, 'organizerTicketStats']);
    Route::get('organizer/dashboard/revenue-overview', [EventController::class, 'organizerRevenueOverview']);

});
/**
 * participant routes
 */
Route::middleware(['auth:sanctum','participant'])->group(function(){
    Route::apiResource('participant/events', EventController::class)->only(['index', 'show']);
    Route::apiResource('participant/user', UserController::class)->only(['update', 'destroy']);
});
/**
 * admin routes
 */
Route::middleware(['auth:sanctum','admin'])->group(function(){

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('admin/events', EventController::class);
    Route::apiResource('admin/user', UserController::class);    
    Route::apiResource('admin/tickets', TicketController::class)->except(['show']);
    route::patch('admin/cancel-ticket', [TicketController::class, 'cancel']);
    Route::get('admin/user-events', [EventController::class, 'getUserEvents']);
    route::get('admin/total-users',[UserController::class,'getAllUsers']);
    route::get('admin/total-events',[EventController::class,'getTotalEvents']);
    route::get('admin/total-tickets',[TicketController::class,'getTotalTickets']);
    route::get('admin/Or-Pr-Users',[UserController::class,'get_Or_Pr_Users']);
    route::get('admin/Pb-Pr-Events',[EventController::class,'get_All_Pb_Pr_Events']);
    route::get('admin/top-events',[TicketController::class,'top_Ten_Event_Tickets']);
    route::get('admin/tickets/tickets-sold-each-month', [TicketController::class, 'tickets_sold_each_month']);
    
    // Enhanced admin dashboard routes
    Route::get('admin/dashboard/stats', [EventController::class, 'adminDashboardStats']);
    Route::get('admin/dashboard/ticket-stats', [TicketController::class, 'adminTicketStats']);
    Route::get('admin/dashboard/recent-activity', [EventController::class, 'recentActivity']);
    Route::get('admin/dashboard/user-distribution', [UserController::class, 'getUserDistribution']);
    Route::get('admin/dashboard/user-growth', [UserController::class, 'getUserGrowth']);
    Route::get('admin/dashboard/top-organizers', [UserController::class, 'getTopOrganizers']);
    Route::get('admin/dashboard/ticket-sales-by-category', [TicketController::class, 'ticketSalesByCategory']);
    Route::get('admin/dashboard/revenue-overview', [EventController::class, 'adminRevenueOverview']);

});

