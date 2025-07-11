<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketPurchased extends Mailable
{
    use Queueable, SerializesModels;
    public $ticket;
    public $email;
    protected $pdfBytes;

    /**
     * Create a new message instance.
     */
    public function __construct($ticket, $pdfBytes, $email)
    {
        $this->email = $email;
        $this->ticket   = $ticket;
        $this->pdfBytes = $pdfBytes;    
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ticket Purchased',
            // from: new Address('event.manger@example.com','Event Manager'),
            replyTo: [
                new Address($this->email),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-purchased',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
             Attachment::fromData(fn () =>  $this->pdfBytes, "ticket-{$this->ticket->qr_code}.pdf")
            ->withMime('application/pdf'),
    ];

        
    }
}
