<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Category;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Event::with('category');

        if ($request->has('category')) {
            $query->where('category_id', $request->input('category'));
        }
     
        if ($request->has('is_public')) {
            $query->where('is_public', $request->input('is_public'));
        }
        if ($request->has('date')) {
            $query->where('date', $request->input('date'));
        }
        if ($request->has('title')) {
                $query->whereRaw('LOWER(title) LIKE ?', ['%'.strtolower($request->input('title')).'%']);
        }

        $query->orderBy('date', 'desc');
        $pagination = $query->paginate(35);

        // log::info('pagination', [$pagination]);

        return $pagination;
    }

    public function guessHomeIndex(Request $request){

        Log::info('EventController@guessHomeIndex called with filters: ', $request->all());
        $query = Event::with('category');

        if ($request->has('category')) {
            $query->where('category_id', $request->input('category'));
        }
     
        if ($request->has('is_public')) {
            $query->where('is_public', $request->input('is_public'));
        }
        if ($request->has('date')) {
            $query->where('date', $request->input('date'));
        }
        if ($request->has('title')) {
                $query->whereRaw('LOWER(title) LIKE ?', ['%'.strtolower($request->input('title')).'%']);
        }

        $query->where('date', '>=', Carbon::now()->subDays(3)->toDateString());
        
        $query->orderBy('date', 'asc');
        $pagination = $query->paginate(15);
        // Log::info('guess home pagination ',[$pagination]);


        return $pagination;

    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'title'       => 'required',
                'date'        => 'required|date',
                'time'        => 'required|date_format:H:i',
                'location'    => 'required',
                'description' => 'required',
                'capacity'    => 'required|integer',
                'is_public'   => 'required|boolean',
                'category'    => 'required|exists:categories,id',
                'price'       => 'required_if:is_public,1|numeric',
                'image'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'city'=>'nullable|string|required',
            ]);

            
            $event = new Event();
            $event->title        = $data['title'];
            $event->date         = $data['date'];
            $event->time         = $data['time'];
            $event->location     = $data['location'];
            $event->description  = $data['description'];
            $event->capacity     = $data['capacity'];
            $event->is_public    = $data['is_public'];
            $event->category_id  = $data['category'];
            $event->organizer_id = $request->user()->id;
            $event->price        = $data['price'] ?? null;
            $event->city         = $data['city'];
            $event->current_registrations = 0;

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('events', 'public');
                $data['image'] = $path;
            }
            $event->image        = $data['image'] ?? null;  

            $event->save();
            
            return response()->json(['message'=>'Event created','event'=>$event], 201);
            
        } catch (\Throwable $th) {
            Log::error('Error creating event: '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error creating event',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }

            return response()->json(['message'=>'Error creating event'], 500);
            }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $event = Event::findOrFail($id);
            return $event;
        } catch (\Throwable $th) {
            return response()->json(['message'=>'Event not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
      

        try {
            $data = $request->validate([
                'title'       => 'required',
                'date'        => 'required|date',
                'time'        => 'required|date_format:H:i',
                'location'    => 'required',
                'description' => 'required',
                'capacity'    => 'required|integer',
                'is_public'   => 'required|boolean',
                'category'    => 'required|exists:categories,id',
                'price'       => 'required_if:is_public,1|numeric',
                'image'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            $event = Event::findOrFail($id);
            $event->title         = $data['title'];
            $event->date         = $data['date'];
            $event->time         = $data['time'];
            $event->location     = $data['location'];
            $event->description  = $data['description'];
            $event->capacity     = $data['capacity'];
            $event->is_public    = $data['is_public'];
            $event->category_id  = $data['category'];
            $event->organizer_id = $request->user()->id;
            $event->price        = $data['price'] ?? null;
            if ($request->hasFile('image')) {
                if ($event->image && Storage::disk('public')->exists($event->image)) {
                    Storage::disk('public')->delete($event->image);
                }
                $path = $request->file('image')->store('events', 'public');
                $data['image'] = $path;
                $event->image        = $data['image'];  
            }
            $event->save();
            return response()->json(['message'=>'Event updated successfully']);
        } catch (\Throwable $th) {
            Log::error('Error updating event: '.$th->getMessage());
            Log::error($th->getTraceAsString());
            Log::error($th->getMessage());
            
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error updating event',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }

            return response()->json(['message'=>'Error updating event'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        
        try {
            $event = Event::findOrFail($id);
            $event->delete();
            // Delete the event image from storage if it exists
            if ($event->image && Storage::disk('public')->exists($event->image)) {
                Storage::disk('public')->delete($event->image);
            }
            return response()->json(['message'=>'Event deleted successfully']);
        } catch (\Throwable $th) {
            return response()->json(['message'=>'Error deleting event'], 500);
        }
    } 

    public function getUserEvents(Request $request)
    {
        $events = $request->user()->events()
            ->orderBy('date', 'desc')
            ->get();


        foreach ($events as $evt) {
            $evt->totalTicketsSold = Ticket::where('event_id', $evt->id)->count();
        }
        Log::info('events',$events->toArray());

        return $events;
    }

    public function userEventsCount(Request $request){
        $totalCount = $request->user()->events()->count();
        $publicEvents = $request->user()->events()->where('is_public', true)->count();
        $privateEvents = $request->user()->events()->where('is_public', false)->count();
        $eventsCount = ['total'=> $totalCount,'public'=>$publicEvents,'private'=>$privateEvents];
        return $eventsCount; 
    }

    // statistics for organizer
    public function upcomingEvents(){
        $events = Event::where('organizer_id', Auth::user()->id) 
            ->where('date', '>', Carbon::now()) 
            ->orderBy('date', 'asc') 
            ->get(); 
        $count = $events->count();
        $upcomingEvents = [
            'events' => $events,
            'count' => $count,
        ];
        return $upcomingEvents;
    }
    public function pastEvents(){
        $events = Event::where('organizer_id', Auth::user()->id)
            ->where('date', '<', Carbon::now()) 
            ->orderBy('date', 'desc') 
            ->get(); 
        $count = $events->count();
        $pastEvents = [
            'events' => $events,
            'count' => $count,
        ];

        return $pastEvents;
    }

    public function totalTicketsSold(Request $request){
        $totalTicketsSold = Ticket::whereHas('event', function ($query) {
            $query->where('organizer_id', Auth::user()->id);
        })->count();

        return $totalTicketsSold;
    }

    public function revenue(){
        $year   = Carbon::now()->year;

        // If your tickets table holds the per-ticket sale (and has `event_id` + `price` + `date`):
        $rows = DB::table('tickets')
            ->join('events', 'tickets.event_id', '=', 'events.id')
            ->where('events.organizer_id', Auth::user()->id)
            ->whereYear('tickets.created_at', $year)
            ->selectRaw('MONTH(tickets.created_at) as month, SUM(tickets.price) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Fill missing months with zero:
        $data = collect(range(1,12))
            ->map(fn($m) => [
                'month'   => $m,
                'revenue' => (float) ($rows->firstWhere('month', $m)->revenue ?? 0)
            ]);

        return $data;
    }

    public function ticketsPurchasedLastWeek()
    {
        $oneWeekAgo = Carbon::now()->subWeek();

        $ticketsPurchased = Ticket::whereHas('event', function ($query)  {
            $query->where('organizer_id', Auth::user()->id);
        })
        ->where('created_at', '>=', $oneWeekAgo)
        ->count();

        return $ticketsPurchased;
    }

    public function mostTicketSales(){
        $startOfLastWeek = Carbon::now()->subWeek()->startOfWeek();
        $endOfLastWeek = Carbon::now()->subWeek()->endOfWeek();
   
        $events = Event::where('organizer_id', Auth::user()->id)
        ->whereBetween('date', [$startOfLastWeek, $endOfLastWeek])
        ->withCount('tickets')
        ->orderByDesc('tickets_count')
        ->take(10)
        ->get(['tickets_count', 'title']);

        $data = $events->map(fn($e) => [
            'name' => $e->title,
            'value'=> $e->tickets_count
        ]);

        return $data;
    }

    public function getTotalEvents(){
        try{
            $totalEvents = Event::count();
            return $totalEvents;
        }
        catch (\Throwable $th) {
            Log::error('Error getting events '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error getting events',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json([
                'message' => 'Error getting events'
            ], 500);
        }
    }

    public function get_All_Pb_Pr_Events(){
        try {
            $publicEvents = Event::where('is_public', true)->count();
            $privateEvents = Event::where('is_public', false)->count();
            $events = [
                ['name' => 'publicEvents', 'value' => $publicEvents],
                ['name' => 'privateEvents', 'value' => $privateEvents]
            ];
            return $events;

        }
        catch (\Throwable $th) {
            Log::error('Error getting pr pb events '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error getting pr pb events',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json([
                'message' => 'Error getting pr pb events'
            ], 500);
        }
    }

    /**
     * Get organizer dashboard comprehensive stats
     */
    public function organizerDashboardStats()
    {
        try {
            $organizerId = Auth::user()->id;
            $now = Carbon::now();

            // Basic counts
            $totalEvents = Event::where('organizer_id', $organizerId)->count();
            $activeEvents = Event::where('organizer_id', $organizerId)
                ->where('date', '>=', $now->toDateString())
                ->count();
            $totalTicketsSold = Ticket::whereHas('event', function($query) use ($organizerId) {
                $query->where('organizer_id', $organizerId);
            })->count();
            $totalRevenue = Ticket::whereHas('event', function($query) use ($organizerId) {
                $query->where('organizer_id', $organizerId);
            })->sum('price');

            // Average attendance
            $averageAttendance = Event::where('organizer_id', $organizerId)
                ->where('date', '<', $now->toDateString())
                ->withCount('tickets')
                ->get()
                ->avg('tickets_count');

            // Recent events
            $recentEvents = Event::where('organizer_id', $organizerId)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(['id', 'title', 'date', 'image']);

            return response()->json([
                'totalEvents' => $totalEvents,
                'activeEvents' => $activeEvents,
                'totalTicketsSold' => $totalTicketsSold,
                'totalRevenue' => $totalRevenue,
                'averageAttendance' => round($averageAttendance, 1),
                'recentEvents' => $recentEvents
            ]);

        } catch (\Throwable $th) {
            Log::error('Error getting organizer dashboard stats: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching dashboard data'], 500);
        }
    }

    /**
     * Get admin dashboard comprehensive stats
     */
    public function adminDashboardStats()
    {
        try {
            $now = Carbon::now();

            // Basic counts
            $totalEvents = Event::count();
            $activeEvents = Event::where('date', '>=', $now->toDateString())->count();
            $totalUsers = User::count();
            $totalTicketsSold = Ticket::count();
            $totalRevenue = Ticket::sum('price');

            // Top categories
            $topCategories = Category::withCount('events')
                ->orderByDesc('events_count')
                ->take(5)
                ->get(['id', 'name', 'events_count'])
                ->map(function($category) use ($totalEvents) {
                    return [
                        'name' => $category->name,
                        'count' => $category->events_count,
                        'percentage' => $totalEvents > 0 ? round(($category->events_count / $totalEvents) * 100, 1) : 0
                    ];
                });

            // Recent events with organizer info
            $recentEvents = Event::with('organizer')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(['id', 'title', 'date', 'image', 'organizer_id'])
                ->map(function($event) {
                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'date' => $event->date,
                        'status' => $event->date >= Carbon::now()->toDateString() ? 'active' : 'past',
                        'imageUrl' => $event->image_url ? asset('storage/' . $event->image) : null,
                        'organizer' => $event->organizer->name
                    ];
                });

            
                return response()->json([
                'totalEvents' => $totalEvents,
                'activeEvents' => $activeEvents,
                'totalUsers' => $totalUsers,
                'totalTicketsSold' => $totalTicketsSold,
                'totalRevenue' => $totalRevenue,
                'topCategories' => $topCategories,
                'recentEvents' => $recentEvents
            ]);

        } catch (\Throwable $th) {
            Log::error('Error getting admin dashboard stats: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching dashboard data'], 500);
        }
    }

    /**
     * Get recent activity for admin dashboard
     */
    public function recentActivity()
    {
        try {
            $recentActivity = collect();

            // Recent event creations
            $recentEventsCreated = Event::orderBy('created_at', 'desc')
                ->take(3)
                ->get(['id', 'title', 'created_at']);
            
            foreach ($recentEventsCreated as $event) {
                $recentActivity->push([
                    'type' => 'event',
                    'icon' => 'event',
                    'text' => "New event \"{$event->title}\" was created",
                    'time' => $event->created_at
                ]);
            }

            // Recent user registrations
            $recentUsers = User::orderBy('created_at', 'desc')
                ->take(3)
                ->get(['id', 'name', 'email', 'created_at']);
            
            foreach ($recentUsers as $user) {
                $recentActivity->push([
                    'type' => 'user',
                    'icon' => 'person_add',
                    'text' => "New user \"{$user->email}\" registered",
                    'time' => $user->created_at
                ]);
            }

            // Recent ticket purchases
            $recentTickets = Ticket::with('event')
                ->orderBy('created_at', 'desc')
                ->take(3)
                ->get(['id', 'price', 'created_at', 'event_id']);
            
            foreach ($recentTickets as $ticket) {
                $recentActivity->push([
                    'type' => 'payment',
                    'icon' => 'payment',
                    'text' => "Payment received for \"{$ticket->event->title}\"",
                    'time' => $ticket->created_at
                ]);
            }

            $recentActivity = $recentActivity->sortByDesc('time')->take(10)->values();

            return response()->json($recentActivity);

        } catch (\Throwable $th) {
            Log::error('Error getting recent activity: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching recent activity'], 500);
        }
    }

    /**
     * Get revenue overview data for admin dashboard chart
     */
    public function adminRevenueOverview()
    {
        try {
            $year = Carbon::now()->year;

            // Get monthly revenue for current year
            $monthlyRevenue = DB::table('tickets')
                ->whereYear('created_at', $year)
                ->selectRaw('MONTH(created_at) as month, SUM(price) as revenue')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Fill missing months with zero and format for chart
            $revenueData = collect(range(1, 12))->map(function($month) use ($monthlyRevenue) {
                $monthData = $monthlyRevenue->firstWhere('month', $month);
                return [
                    'name' => Carbon::create()->month($month)->format('M'),
                    'value' => $monthData ? (float) $monthData->revenue : 0
                ];
            });

            // Format for ngx-charts line chart
            $chartData = [
                [
                    'name' => 'Revenue',
                    'series' => $revenueData
                ]
            ];

            return response()->json($chartData);

        } catch (\Throwable $th) {
            Log::error('Error getting admin revenue overview: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching revenue overview'], 500);
        }
    }

    /**
     * Get revenue overview data for organizer dashboard chart
     */
    public function organizerRevenueOverview()
    {
        try {
            $organizerId = Auth::user()->id;
            $year = Carbon::now()->year;

            // Get monthly revenue for current year for this organizer
            $monthlyRevenue = DB::table('tickets')
                ->join('events', 'tickets.event_id', '=', 'events.id')
                ->where('events.organizer_id', $organizerId)
                ->whereYear('tickets.created_at', $year)
                ->selectRaw('MONTH(tickets.created_at) as month, SUM(tickets.price) as revenue')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Fill missing months with zero and format for chart
            $revenueData = collect(range(1, 12))->map(function($month) use ($monthlyRevenue) {
                $monthData = $monthlyRevenue->firstWhere('month', $month);
                return [
                    'name' => Carbon::create()->month($month)->format('M'),
                    'value' => $monthData ? (float) $monthData->revenue : 0
                ];
            });

            // Format for ngx-charts line chart
            $chartData = [
                [
                    'name' => 'Revenue',
                    'series' => $revenueData
                ]
            ];

            return response()->json($chartData);

        } catch (\Throwable $th) {
            Log::error('Error getting organizer revenue overview: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching revenue overview'], 500);
        }
    }

   public function getLatestEvent(){
        try {
            $latestEvent = Event::with(['category', 'organizer'])
                ->where('date', '>=', Carbon::now()->toDateString()) // Only future events
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestEvent) {
                // If no future public events, get the latest public event regardless of date
                $latestEvent = Event::with(['category', 'organizer'])
                    ->orderBy('created_at', 'desc')
                    ->first();
            }

            if (!$latestEvent) {
                return response()->json(['message' => 'No events found'], 404);
            }

            return $latestEvent;


        } catch (\Throwable $th) {
            Log::error('Error getting latest event: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching latest event'], 500);
        }
   }
}
