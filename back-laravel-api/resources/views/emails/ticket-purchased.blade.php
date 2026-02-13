<?php
    use SimpleSoftwareIO\QrCode\Facades\QrCode;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Event Ticket</title>
    <style>
        body {
            background: #1e293b;
            color: #fff;
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 480px;
            margin: 32px auto;
            background: #232f45;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.25);
            overflow: hidden;
            border: 1.5px solid #334155;
        }
        .header {
            background: #1e293b;
            padding: 32px 0 16px 0;
            text-align: center;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
        }
        .header h1 {
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 1.7rem;
            font-weight: 700;
            color: #60a5fa;
            margin-bottom: 6px;
            letter-spacing: 1px;
        }
        .header p {
            font-size: 1.1rem;
            color: #fff;
            opacity: 0.92;
            margin-bottom: 0;
        }
        .content {
            padding: 28px 32px 0 32px;
            background: #232f45;
        }
        .success-message {
            background: #22c55e;
            color: #fff;
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 22px;
            text-align: center;
            font-weight: 600;
            font-size: 1.1rem;
        }
        .event-details {
            background: #1e293b;
            border-radius: 12px;
            border: 1px solid #334155;
            padding: 18px 14px;
            margin-bottom: 22px;
        }
        .event-details h3 {
            color: #60a5fa;
            font-size: 1.05rem;
            font-family: 'Poppins', Arial, sans-serif;
            font-weight: 600;
            margin-bottom: 10px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 6px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 1rem;
        }
        .detail-label {
            font-weight: 600;
            color: #cbd5e1;
        }
        .detail-value {
            color: #60a5fa;
            text-align: right;
        }
        .ticket-info {
            background: #1e293b;
            color: #fff;
            border-radius: 12px;
            padding: 18px 14px;
            text-align: center;
            margin-bottom: 22px;
            border: 1px solid #334155;
        }
        .ticket-info h3 {
            font-size: 1.05rem;
            font-family: 'Poppins', Arial, sans-serif;
            font-weight: 600;
            margin-bottom: 8px;
            color: #60a5fa;
        }
        .ticket-number {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 6px;
            letter-spacing: 2px;
        }
        .price {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: #60a5fa;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 22px;
            border-radius: 999px;
            font-size: 1rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            background: #22c55e;
            color: #fff;
        }
        .status-badge.invalide {
            background: #ef4444;
            color: #fff;
        }
        .cta-section {
            text-align: center;
            margin-bottom: 18px;
        }
        /* .cta-button {
            display: inline-block;
            background: #2563eb;
            color: #fff;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 1rem;
            transition: transform 0.2s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.10);
        }
        .cta-button:hover {
            transform: translateY(-2px) scale(1.03);
            background: #60a5fa;
        } */
        .footer {
            background: #232f45;
            padding: 18px 32px 0 32px;
            text-align: center;
            border-bottom-left-radius: 20px;
            border-bottom-right-radius: 20px;
            color: #cbd5e1;
            font-size: 0.95rem;
            margin-top: 18px;
        }
        .footer p {
            color: #cbd5e1;
            font-size: 0.95rem;
            margin-bottom: 6px;
        }
        .footer a {
            color: #60a5fa;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 12px; }
            .header, .content, .footer { padding: 14px; }
            .detail-row { flex-direction: column; text-align: center; }
            .detail-value { text-align: center; margin-top: 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Event Ticket</h1>
            <p>{{ $ticket->event->title }}</p>
        </div>
        <div class="content">
            <div class="success-message">
                ✅ Ticket Purchase Successful!<br>
                Thank you for purchasing a ticket for <strong>{{ $ticket->event->title }}</strong>
            </div>
            <div class="event-details">
                <h3>📅 Event Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value">{{ $ticket->event->title }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($ticket->event->date)->format('F j, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{{ $ticket->event->time ?? 'TBD' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{ $ticket->event->location }}</span>
                </div>
                @if($ticket->event->city)
                <div class="detail-row">
                    <span class="detail-label">City:</span>
                    <span class="detail-value">{{ $ticket->event->city }}</span>
                </div>
                @endif
                <div class="detail-row">
                    <span class="detail-label">Organizer:</span>
                    <span class="detail-value">{{ $ticket->event->organizer->name }}</span>
                </div>
            </div>
            <div class="ticket-info">
                <h3>🎟️ Your Ticket</h3>
                <div class="ticket-number">#{{ $ticket->id }}</div>
                <div class="price">{{ number_format($ticket->price, 2) }} {{ $ticket->currency }}</div>
                <div class="status-badge {{ $ticket->status == 'invalide' ? 'invalide' : '' }}">
                    {{ strtoupper($ticket->status) }}
                </div>
                <p>Purchased: {{ \Carbon\Carbon::parse($ticket->created_at)->format('M j, Y \a\t g:i A') }}</p>
            </div>
            <div class="cta-section">
                <p style="margin-bottom: 14px; color: #cbd5e1;">
                    📎 Your detailed ticket with QR code is attached as a PDF file.
                </p>
                <!-- <a href="#" class="cta-button">Download Ticket PDF</a> -->
            </div>
        </div>
        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>If you have any questions about your ticket, please contact our support team.</p>
            <p>© {{ date('Y') }} EVENTORA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
