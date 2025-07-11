<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
    'event_id',
    'participant_id',
    'qr_code',
    'price',
    'payment_id',
    'status',
];

    
    public function event(){
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function user(){
        return $this->belongsTo(User::class, 'participant_id');
    }
    public function payments(){
        return $this->hasMany(Payment::class, 'payment_id');
    }
    
}
