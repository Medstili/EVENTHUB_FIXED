<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AdminMiddleWare;
use App\Http\Middleware\ParticipantMiddleWare;
use App\Http\Middleware\OrganizerMiddleWare;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        $middleware->append(HandleCors::class);
        $middleware->api(  [           
            EnsureFrontendRequestsAreStateful::class,
            SubstituteBindings::class,
        ]);
             
        $middleware->web(prepend: [
            StartSession::class,
            AddQueuedCookiesToResponse::class,
            VerifyCsrfToken::class,
            ShareErrorsFromSession::class,
            SubstituteBindings::class,
        ]);
        $middleware->alias([
            'auth'        => Authenticate::class,
            'organizer'   => OrganizerMiddleWare::class,
            'participant' => ParticipantMiddleWare::class,
            'admin'       => AdminMiddleWare::class,
        ]);
        
    })
    ->withExceptions(function (Exceptions $exceptions) {
                // Configure your exception handling here
        $exceptions->render(function (\Symfony\Component\Routing\Exception\RouteNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                // If a route like 'login' is not found during an API auth failure
                return response()->json(['message' => 'Not authenticated or resource not found.'], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });
    })->create();

    
    return $app;