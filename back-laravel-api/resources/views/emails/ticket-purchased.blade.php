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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .success-message {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .success-message h2 {
            color: #155724;
            font-size: 20px;
            margin-bottom: 8px;
        }
        
        .success-message p {
            color: #155724;
            font-size: 16px;
        }
        
        .event-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
        }
        
        .event-details h3 {
            color: #495057;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .detail-label {
            font-weight: 600;
            color: #495057;
        }
        
        .detail-value {
            color: #6c757d;
            text-align: right;
        }
        
        .ticket-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .ticket-info h3 {
            font-size: 18px;
            margin-bottom: 15px;
        }
        
        .ticket-number {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        
        .price {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .cta-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
                text-align: center;
            }
            
            .detail-value {
                text-align: center;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎫 Event Manager</h1>
            <p>Your ticket is ready!</p>
        </div>
        
        <div class="content">
            <div class="success-message">
                <h2>✅ Ticket Purchase Successful!</h2>
                <p>Thank you for purchasing a ticket for <strong>{{ $ticket->event->title }}</strong></p>
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
                <p>Status: <strong>{{ ucfirst($ticket->status) }}</strong></p>
                <p>Purchased: {{ \Carbon\Carbon::parse($ticket->created_at)->format('M j, Y \a\t g:i A') }}</p>
            </div>
            
            <div class="cta-section">
                <p style="margin-bottom: 20px; color: #6c757d;">
                    📎 Your detailed ticket with QR code is attached as a PDF file.
                </p>
                <a href="#" class="cta-button">Download Ticket PDF</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>If you have any questions about your ticket, please contact our support team.</p>
            <p>© {{ date('Y') }} Event Manager. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
