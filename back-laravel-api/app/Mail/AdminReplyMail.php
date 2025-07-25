<?php

namespace App\Mail;

use Illuminate\Support\Str;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Headers;

class AdminReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $bodyContent;
    public $replyAlias;
    public $messageId;
    protected ?string $parentMessageId;

    public function __construct(string $bodyContent, string $replyAlias, ?string $parentMessageId = null)
    {
        $this->bodyContent = $bodyContent;
        $this->replyAlias  = $replyAlias;
        $this->parentMessageId = $parentMessageId;

        // Generate a valid dot-atom host (e.g. "myapp.test")
        $from = config('mail.from.address', 'no-reply@'.parse_url(config('app.url'), PHP_URL_HOST));
        $host = Str::after($from, '@');

        // **Assign** to the property, not a local variable
        $this->messageId = Str::uuid()->toString() . '@' . $host;
    }

    
    public function headers(): Headers
    {
        // 1) Wrap your generated messageId in angle‑brackets:
        $rawId = $this->messageId;

        // 2) Build up any references array (only if we have a parent)
        $refs = $this->parentMessageId
        ? [$this->parentMessageId]
        : [];

        $text = [];
        if ($this->parentMessageId) {
            $text['In-Reply-To'] = "<{$this->parentMessageId}>";
        }

        return new Headers(
            $rawId,
            $refs,
            $text
        );
    }
 
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reply to your message',
            replyTo: [$this->replyAlias],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-reply',
            with: [
                'bodyContent' => $this->bodyContent,
            ],
        );
    }
} 