<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {



        Log::info('filters: ',[$request->all()]);
        $query = Ticket::with('event', 'user');

        if ($request->has('user')) {
            $query->whereHas('user',function($query) use ($request){
                    $query->whereRaw('LOWER(name) LIKE ?', ['%'.strtolower($request->input('user')).'%']);
            });
        }
    
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }
        if ($request->has('title')) {
            $query->whereHas('event', function ($query) use ($request) {
                $query->whereRaw('LOWER(title) LIKE ?', ['%'.strtolower($request->input('title')).'%']);

            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $pagination = $query->paginate(35);
        // Log::info('pagination', [$pagination]);


        return $pagination;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'event_id' => 'required|exists:events,id',
                'user_id' => 'required|exists:users,id',
                'ticket_status' => 'required|string',
                'price' => 'required|numeric',
                'QR_code' => 'required|string',
            ]);

            $ticket = new Ticket();
            $ticket->event_id = $request->event_id;
            $ticket->user_id = $request->user_id;
            $ticket->price = $request->price;
            $ticket->ticket_status = $request->ticket_status;
            $ticket->QR_code = $request->QR_code;
            $ticket->save();

            return response()->json(['message' => 'Ticket created successfully'], 201);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Error creating ticket'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $ticket = Ticket::with('event','user')->findOrFail($id);
            return  $ticket;
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // empty for now
    }
    public function cancel(Request $request)
    {
        try {
            $ticket = Ticket::findOrFail($request->id);
            $ticket->status = 'cancelled';
            $ticket->save();
            return response()->json('cancelled successully');
            
        } catch (\Throwable $th) {
            Log::error('Error cancelling ticket: '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error cancelling ticket',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }

            return response()->json(['message'=>'Error cancelling ticket'], 500);
        }
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $ticket = Ticket::findOrFail($id);
            $ticket->delete();
            return response()->json(['message' => 'Ticket deleted successfully'], 200);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Error deleting ticket'], 500);
        }
    }

    public function getTicketsByUser(){
        $user=Auth::user();

        try {
            $tickets = Ticket::where('participant_id', $user->id)
            ->with('event')
            ->get();
            return $tickets;

        } catch (\Throwable $th) {
            Log::error('Error fetching tickets: '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error  fecthing Tieckts',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
        }

    }

     public function downloadPdf($ticketId)
    {
        
        // pass data to a Blade view that lays out the PDF
        try {
            $ticket = Ticket::with('event','user')->findOrFail($ticketId);

            Log::info('Ticket found:', [$ticket]);
            

            $pdf = PDF::loadView('tickets.pdf', ['ticket' => $ticket]);

            Log::info('pdf generated:', [$pdf]);

            return $pdf->stream("ticket-{$ticket->id}.pdf");
            
        } catch (\Throwable $th) {
            Log::error('Error generating PDF: '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error generating PDF',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json([
                'message' => 'Error generating PDF'
            ], 500);
        }



        // stream it inline, or use ->download() to force a save dialog
    }

    public function getTotalTickets(){
        try{
            $totalTickets = Ticket::count();
            return $totalTickets;
        }
        catch (\Throwable $th) {
            Log::error('Error getting tickets '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error getting tickets',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json([
                'message' => 'Error getting tickets'
            ], 500);
        }
    }

    public function top_Ten_Event_Tickets(){
        try {

            $eventsWithCount = Event::withCount('tickets') 
                ->orderByDesc('tickets_count')
                ->take(10)
                ->get(['id', 'title']); // Select only 'id' and 'title' from the 'events' table

            // 2. Transform the collection to the desired structure
            $topEvents = $eventsWithCount->map(function ($event) {
                return 
                    // ['name' =>'event_id'    , 'value'  => $event->id],      
                    ['name' => $event->title, 'value' => $event->tickets_count]

                    // ['name' =>'tickets_count', 'value' => $event->tickets_count]
                ;
            });
            return $topEvents;

        } 
        catch (\Throwable $th) {
            Log::error('Error getting top_Ten_Event_Tickets '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error getting top_Ten_Event_Tickets',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json([
                'message' => 'Error getting top_Ten_Event_Tickets'
            ], 500);
        }
    }
    
  
    public function tickets_sold_each_month(){
        try {

            $year = Carbon::now()->year;

            $rows = Ticket::whereYear('tickets.created_at', $year)
                ->selectRaw('MONTH(tickets.created_at) as month, COUNT(*) as ticket_count')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $data = [
                [
                'name'=>'tickets sold',
                'series' =>
                    collect(range(1,12))
                        ->map(fn($m) => [
                            'name' => "$m",
                            'value' => (float) ($rows->firstWhere('month', $m)->ticket_count ?? 0)
                        ])

                ]
                
            ];

            return $data;
        }        catch (\Throwable $th) {
            Log::error('Error getting tickets_sold_each_month '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
        }
    }

    /**
     * Get organizer ticket statistics
     */
    public function organizerTicketStats()
    {
        try {
            $organizerId = Auth::user()->id;
            $now = Carbon::now();

            // Total tickets sold by organizer
            $totalTicketsSold = Ticket::whereHas('event', function($query) use ($organizerId) {
                $query->where('organizer_id', $organizerId);
            })->count();

            // Total revenue
            $totalRevenue = Ticket::whereHas('event', function($query) use ($organizerId) {
                $query->where('organizer_id', $organizerId);
            })->sum('price');

            // Tickets sold this month
            $thisMonthTickets = Ticket::whereHas('event', function($query) use ($organizerId) {
                $query->where('organizer_id', $organizerId);
            })->whereMonth('created_at', $now->month)
              ->whereYear('created_at', $now->year)
              ->count();

            // Average ticket price
            $averageTicketPrice = Ticket::whereHas('event', function($query) use ($organizerId) {
                $query->where('organizer_id', $organizerId);
            })->avg('price');

            return response()->json([
                'totalTicketsSold' => $totalTicketsSold,
                'totalRevenue' => $totalRevenue,
                'thisMonthTickets' => $thisMonthTickets,
                'averageTicketPrice' => round($averageTicketPrice, 2)
            ]);

        } catch (\Throwable $th) {
            Log::error('Error getting organizer ticket stats: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching ticket statistics'], 500);
        }
    }

    /**
     * Get admin ticket statistics
     */
    
    // public function adminTicketStats()
    // {
    //     try {
    //         $now = Carbon::now();

    //         // Total tickets sold
    //         $totalTicketsSold = Ticket::count();
    //         $totalRevenue = Ticket::sum('price');

    //         // Tickets sold this month
    //         $thisMonthTickets = Ticket::whereMonth('created_at', $now->month)
    //             ->whereYear('created_at', $now->year)
    //             ->count();

    //         // Average ticket price
    //         $averageTicketPrice = Ticket::avg('price');

    //         // Ticket status distribution
    //         $ticketStatusDistribution = Ticket::selectRaw('ticket_status, COUNT(*) as count')
    //             ->groupBy('ticket_status')
    //             ->get()
    //             ->map(function($item) {
    //                 return [
    //                     'name' => ucfirst($item->ticket_status),
    //                     'value' => $item->count
    //                 ];
    //             });

    //         // Monthly ticket sales for current year
    //         $monthlyTickets = DB::table('tickets')
    //             ->whereYear('created_at', $now->year)
    //             ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
    //             ->groupBy('month')
    //             ->orderBy('month')
    //             ->get();

    //         $ticketData = collect(range(1, 12))->map(function($month) use ($monthlyTickets) {
    //             $monthData = $monthlyTickets->firstWhere('month', $month);
    //             return [
    //                 'name' => Carbon::create()->month($month)->format('M'),
    //                 'value' => $monthData ? $monthData->count : 0
    //             ];
    //         });

    //         return response()->json([
    //             'totalTicketsSold' => $totalTicketsSold,
    //             'totalRevenue' => $totalRevenue,
    //             'thisMonthTickets' => $thisMonthTickets,
    //             'averageTicketPrice' => round($averageTicketPrice, 2),
    //             'ticketStatusDistribution' => $ticketStatusDistribution,
    //             'monthlyTickets' => $ticketData
    //         ]);

    //     } catch (\Throwable $th) {
    //         Log::error('Error getting admin ticket stats: ' . $th->getMessage());
    //         return response()->json(['message' => 'Error fetching ticket statistics'], 500);
    //     }
    // }

    /**
     * Get ticket sales by category for admin dashboard
     */
    public function ticketSalesByCategory()
    {
        try {
            $ticketSalesByCategory = DB::table('tickets')
                ->join('events', 'tickets.event_id', '=', 'events.id')
                ->join('categories', 'events.category_id', '=', 'categories.id')
                ->selectRaw('categories.name, COUNT(*) as ticket_count, SUM(tickets.price) as total_revenue')
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc('ticket_count')
                ->get()
                ->map(function($item) {
                    return [
                        'name' => $item->name,
                        'tickets' => $item->ticket_count,
                        'revenue' => $item->total_revenue
                    ];
                });

            return response()->json($ticketSalesByCategory);

        } catch (\Throwable $th) {
            Log::error('Error getting ticket sales by category: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching ticket sales by category'], 500);
        }
    }

}
