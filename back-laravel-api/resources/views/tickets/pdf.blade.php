
<?php
    use SimpleSoftwareIO\QrCode\Facades\QrCode;
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      background: #1e293b;
      color: #fff;
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
    }
    .ticket-outer {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 0;
      background: #1e293b;
    }
    .ticket-card {
      background: #232f45;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      max-width: 420px;
      width: 100%;
      margin: 0 auto;
      padding: 0 0 32px 0;
      border: 1.5px solid #334155;
      overflow: hidden;
    }
    .ticket-header {
      background: #1e293b;
      padding: 32px 0 16px 0;
      text-align: center;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
    }
    .ticket-header img {
      max-width: 180px;
      width: auto;
      height: 48px;
      display: block;
      margin: 0 auto 12px auto;
      background: transparent;
    }
    .ticket-title {
      font-family: 'Poppins', Arial, sans-serif;
      font-size: 1.7rem;
      font-weight: 700;
      color: #60a5fa;
      margin-bottom: 6px;
      letter-spacing: 1px;
    }
    .event-title {
      font-size: 1.1rem;
      font-weight: 400;
      color: #fff;
      opacity: 0.92;
      margin-bottom: 0;
    }
    .ticket-main {
      padding: 28px 32px 0 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 22px;
      border-radius: 999px;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 18px;
      background: #22c55e;
      color: #fff;
    }
    .status-badge.invalide {
      background: #ef4444;
      color: #fff;
    }
    .details-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 10px;
      margin-bottom: 22px;
    }
    .details-table th {
      text-align: left;
      font-weight: 600;
      color: #cbd5e1;
      font-size: 1rem;
      padding: 0;
      width: 40%;
    }
    .details-table td {
      color: #60a5fa;
      font-size: 1rem;
      padding: 0;
      text-align: right;
      font-weight: 600;
    }
    .qr-section {
      margin: 18px 0 0 0;
      background: #1e293b;
      border-radius: 16px;
      border: 1.5px solid #334155;
      padding: 18px 10px 10px 10px;
      width: 200px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    .qr-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: #60a5fa;
      margin-bottom: 8px;
      text-align: center;
    }
    .qr-img {
      display: block;
      margin: 0 auto;
      max-width: 140px;
      width: 140px;
      height: 140px;
      background: #fff;
      border-radius: 12px;
      border: 1.5px solid #334155;
      padding: 8px;
    }
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
    @media (max-width: 500px) {
      .ticket-card { padding: 0 0 18px 0; }
      .ticket-main { padding: 18px 8px 0 8px; }
      .footer { padding: 12px 8px 0 8px; }
    }
  </style>
</head>
<body>
  <div class="ticket-outer">
    <div class="ticket-card">
      <div class="ticket-header">
        <img src="{{ public_path('logo/EVENTHUB.png') }}" alt="EventHub Logo">
        <div class="ticket-title">Event Ticket</div>
        <div class="event-title">{{ $ticket->event->title }}</div>
      </div>
      <div class="ticket-main">
        <div class="status-badge {{ $ticket->status == 'invalide' ? 'invalide' : '' }}">
          {{ strtoupper($ticket->status) }}
        </div>
        <table class="details-table">
          <tr><th>Holder</th><td>{{ $ticket->user->name }}</td></tr>
          <tr><th>Price</th><td>{{ number_format($ticket->price,2) }} {{ $ticket->currency }}</td></tr>
          <tr><th>Purchased On</th><td>{{ $ticket->created_at }}</td></tr>
        </table>
        <div class="qr-section">
          <div class="qr-title">Your QR Code</div>
          <img class="qr-img" src="data:image/svg+xml;base64,{{ base64_encode(QrCode::format('svg')->size(140)->generate($ticket->qr_code ?? 'QR_Code')) }}" />
        </div>
      </div>
      <div class="footer">
        Present this ticket and QR code at the event entrance.<br>
        &copy; {{ date('Y') }} EventHub. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
