
<?php
    use SimpleSoftwareIO\QrCode\Facades\QrCode;
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: sans-serif; 
      	background-color: black;
        color: white;
        padding: 16px;
        height: 200px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 2rem; 
    }
    .qr { 
      /* margin: 1rem 0;  */
      padding: 20px;
      width: 200px;
      height: 200px;
      /* margin: auto; */
      /* margin-bottom: 20px; */
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem; border: 1px solid #ccc; }

  </style>
</head>
<body>
  <div class="header">
    <h1>Ticket #{{ $ticket->id }}</h1>
    <h2>{{ $ticket->event->title }}</h2>
  </div>

  <table style="width: 100%; text-align: center;">
  <tr>
    <td>
      <table>
        <tr><th>Holder</th><td>{{ $ticket->user->name }}</td></tr>
        <tr><th>Status</th><td>{{ ucfirst($ticket->status) }}</td></tr>
        <tr><th>Price</th><td>{{ number_format($ticket->price,2) }} {{ $ticket->currency }}</td></tr>
        <tr><th>Purchased On</th><td>{{ $ticket->created_at }}</td></tr>
      </table>
    </td>
    <td>
      <img src="data:image/svg+xml;base64,{{ base64_encode(QrCode::format('svg')->size(200)->generate($ticket->qr_code ?? 'QR_Code')) }}" />
    </td>
  </tr>
</table>

  <!-- <div class="container">
    <table>
      <tr> <th>Holder</th>         <td>{{ $ticket->user->name }}</td></tr>
      <tr><th>Status</th>         <td>{{ ucfirst($ticket->status) }}</td></tr>
      <tr><th>Price</th>          <td>{{ number_format($ticket->price,2) }} {{ $ticket->currency }}</td></tr>
      <tr><th>Purchased On</th>   <td>{{ $ticket->created_at }}</td></tr>
    </table>
    <div class="qr">
          <img src="data:image/svg+xml;base64,{{ base64_encode(QrCode::format('svg')->size(200)->generate($ticket->qr_code ?? 'QR_Code')) }}" />
    </div> -->
  </div>
</body>
</html>
