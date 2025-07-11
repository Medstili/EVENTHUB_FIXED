<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
      'date','time','location','description',
      'capacity','is_public','category_id','organizer_id','image'
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null; 
        }
        return asset('storage/'.$this->image);
    }

    public function organizer(){
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function tickets(){
        return $this->hasMany(Ticket::class, 'event_id');
    }

    public function category(){
        return $this->belongsTo(Category::class, 'category_id');
    }

    

    


}
