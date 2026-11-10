<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') — Korak Digitals</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
            background-color: #FAF9F8;
            color: #1F1720;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
        }
        .card {
            background: #FFFFFF;
            border: 1px solid #E9E1E5;
            border-radius: 12px;
            box-shadow: 0 4px 8px -2px rgba(64, 0, 16, 0.05);
            max-width: 480px;
            width: 100%;
            padding: 36px 32px;
            text-align: center;
        }
        .badge-code {
            display: inline-block;
            font-size: 13px;
            font-weight: 800;
            padding: 4px 12px;
            border-radius: 9999px;
            background: #F8E9ED;
            color: #800020;
            margin-bottom: 16px;
            letter-spacing: 0.05em;
        }
        h1 {
            font-size: 22px;
            font-weight: 800;
            color: #1F1720;
            letter-spacing: -0.02em;
            margin-bottom: 10px;
        }
        p {
            font-size: 13px;
            color: #6B6268;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background-color: #800020;
            color: #FFFFFF;
            font-size: 13px;
            font-weight: 700;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.15s ease, transform 0.05s ease;
            cursor: pointer;
            border: none;
        }
        .btn:hover {
            background-color: #5C0018;
        }
        .btn:active {
            transform: scale(0.98);
        }
        .btn-outline {
            background-color: transparent;
            color: #475569;
            border: 1px solid #E2E8F0;
            margin-left: 8px;
        }
        .btn-outline:hover {
            background-color: #F1F5F9;
            color: #0F172A;
        }
        .actions {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
        }
        .brand-footer {
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid #E2E8F0;
            font-size: 11px;
            color: #94A3B8;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge-code">@yield('code')</div>
        <h1>@yield('title')</h1>
        <p>@yield('message')</p>
        <div class="actions">
            @yield('actions')
        </div>
        <div class="brand-footer">
            Korak Digitals &bull; Secure Digital Services Platform
        </div>
    </div>
</body>
</html>
