<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <p>Hello,</p>

  <p>You requested a password reset. Click the button below to choose a new password:</p>

  <p>
    <a href="{{ $url }}"
       style="display:inline-block;
              padding:12px 24px;
              background-color:#1976d2;
              color:#fff;
              text-decoration:none;
              border-radius:4px;">
      Reset Your Password
    </a>
  </p>

  <p>If you didn’t request this, you can safely ignore this email.</p>
</body>
</html>
