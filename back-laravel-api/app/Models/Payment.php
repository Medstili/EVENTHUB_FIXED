<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
      'participant_id',
      'event_id',
      'stripe_session_id',
      'payment_intent_id',
      'amount',
      'currency',
      'payment_method',
      'status',
    ];
    
    public function event()  { return $this->belongsTo(Event::class); }
    public function user()   { return $this->belongsTo(User::class, 'participant_id'); }
}
