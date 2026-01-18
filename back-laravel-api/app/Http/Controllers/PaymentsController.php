<?php

namespace App\Http\Controllers;

use App\Mail\TicketPurchased;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Payment;
use App\Models\Ticket;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use \Stripe\Webhook;

class PaymentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'event_id' => 'required|integer|exists:events,id',
                'amount' => 'required|numeric',
                'status' => 'required|string|max:255',
            ]);
    
            $payment = Payment::create($request->all());
    
            return response()->json($payment, 201);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Failed to create payment',
                'message' => $th->getMessage()
            ], 500);
        }
    
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        try {
            $payment = Payment::findOrFail($id);
            return response()->json($payment, 200);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Failed to retrieve payment',
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        try {
            $payment = Payment::findOrFail($payment->id);
            $payment->update($request->all());
            return response()->json($payment, 200);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Failed to update payment',
                'message' => $th->getMessage()
            ], 500);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        //
    }
   

    public function createCheckoutSession($eventId)
    {
        $user = Auth::user();
        $event = Event::findOrFail($eventId);

        // Check if event is full before creating checkout session
        if ($event->current_registrations >= $event->capacity) {
            return response()->json(['error' => 'Event is already full'], 400);
        }
        
        Stripe::setApiKey(config(key: 'services.stripe.secret'));
        
        $session = CheckoutSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'mad',
                    'product_data' => [
                        'name' => $event->title,
                    ],
                    'unit_amount' => intval($event->price * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'customer_email' => $user->email,
            'metadata' => [
                'participant_id' => $user->id,
                'event_id'       => $event->id,
                'event_capacity' => $event->capacity,
                'event_current_registrations' => $event->current_registrations
            ],
            'success_url' => config('app.client_url')."/checkout/success?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url'  => config('app.client_url')."/events/{$event->id}"
        ]);
        log::info('session creates successfully');
        return response()->json(
        ['id' => $session->id,
            'url' => $session->url   ],
        200);
    }


    public function webhook(Request $request)
    {
        log::info('webhook called succefully');
        $payload    = $request->getContent();
        $sigHeader  = $request->header('Stripe-Signature');
        $secret     = config('services.stripe.webhook');
  
        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $session = $event->data->object;
        // Log::info('webhook session',[$session]);
        if ($event->type === 'checkout.session.completed') {
            DB::beginTransaction();
            try {
                // Check if payment already exists
                $existingPayment = Payment::where('stripe_session_id', $session->id)->first();
                if ($existingPayment) {
                    DB::rollBack();
                    return response()->json(['received' => true]);
                }

                $event = Event::findOrFail($session->metadata->event_id);

                if ($event->current_registrations >= $event->capacity) {
                    DB::rollBack();
                    Log::warning('Event full at webhook, skipping ticket/payment creation.');
                    return response()->json(['error' => 'Event is already full'], 400);
                }

                $payment = Payment::create([
                    'participant_id' => $session->metadata->participant_id,
                    'event_id' => $session->metadata->event_id,
                    'stripe_session_id' => $session->id,
                    'payment_intent_id' => $session->payment_intent,
                    'amount' => $session->amount_total / 100,
                    'currency' => $session->currency,
                    'payment_method' => $session->payment_method_types[0] ?? 'card',
                    'status' => $session->payment_status,
                ]);

                if ($session->payment_status === 'paid') {

                    $ticket = Ticket::create([
                        'event_id' => $session->metadata->event_id,
                        'participant_id' => $session->metadata->participant_id,
                        'qr_code' => (string) Str::uuid(),
                        'price' => $session->amount_total / 100,
                        'payment_id' => $payment->id,   
                        'status'=>'valide',
                         
                    ]);
                        // ->load('event', 'user'

                    $event->current_registrations += 1;
                    $event->save();

                    DB::commit();

                    // Generate PDF and send email (ideally queue this)

                    $pdf = Pdf::loadView('tickets.pdf', [
                        'ticket' => $ticket->load('event','user'),
                    ]);
                    Mail::to($ticket->user->email)
                        ->send(new TicketPurchased($ticket, $pdf->output(), $ticket->user->email));

                } else {
                    DB::commit();
                }
            } catch (\Throwable $th) {
                DB::rollBack();
                Log::error('Webhook error: ' . $th->getMessage());
            }
        }

        return response()->json(['received' => true]);
    }

}

