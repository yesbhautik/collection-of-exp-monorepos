<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Qrcodes extends Model
{
    use HasFactory;
    protected $table = 'qrcode';
    protected $fillable = ['qr_enable'];
}
