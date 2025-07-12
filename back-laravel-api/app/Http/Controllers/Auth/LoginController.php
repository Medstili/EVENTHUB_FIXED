<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordLink;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash ;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Handle an authentication attempt.
     */
    public function authenticate(Request $request): JsonResponse
    {

         try {
           

            $validateUser = Validator::make($request->all(), 
            [
                'email' => 'required|email',
                'password' => 'required'
            ]);


            if($validateUser->fails()){
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            if(!Auth::attempt($request->only(['email', 'password']))){
                
                return response()->json([
                    'status' => false,
                    'message' => 'Email & Password does not match with our record.',
                ], 401);
            }

            $request->session()->regenerate();
            // Log::info('Login successful. Session regenerated. Session ID: ' . $request->session()->getId() . ', User ID: ' . Auth::id());

            $user = Auth::user();
            Log::info('auth user',[$user]);

            return response()->json([
                'status' => true,
                'message' => 'User Logged In Successfully',
                'user'=>$user,
            ], 200);


        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    
    }


     public function logout(Request $request): JsonResponse
    {
        // $currentSessionId = $request->session()->getId();
        // $userBeforeLogout = Auth::user();
        // Log::info('LogoutController: Entered. Session ID before logout: ' . $currentSessionId . '. User ID: ' . ($userBeforeLogout ? $userBeforeLogout->id : 'None'));

        Auth::guard('web')->logout(); // Use 'web' or your specific SPA guard

        $request->session()->invalidate();
        // Log::info('LogoutController: Session invalidated. Old Session ID: ' . $currentSessionId);

        $request->session()->regenerateToken(); // Regenerate CSRF token
        // Log::info('LogoutController: CSRF token regenerated.');

        // Explicitly tell the browser to forget the session cookie
        $cookieName = session()->getName(); // Get the configured session cookie name
        // Log::info('LogoutController: Attempting to forget cookie: ' . $cookieName);

        return response()->json(['message' => 'Logged out successfully'])
            ->withCookie(cookie()->forget($cookieName));
    }


//     public function logout(Request $request): JsonResponse
//     {
//         // Auth::logout();
//         // Log out the user and invalidate the session
//         try{
//             $request->session()->invalidate();
//             $request->session()->regenerateToken();
                
//             return response()->json([
//                 'message' => 'Logout successful'
//             ], 200)->withCookie(cookie()->forget(session()->getName())); 
//         }
//         catch (\Throwable $th) {
//             Log::error('Error logging out '.$th->getMessage());
//             Log::error($th->getTraceAsString());
            
//             // In debug mode, return the exception message so you can see it in Postman/Angular
//             if (config('app.debug')) {
//                 return response()->json([
//                     'message' => 'Error logging out',
//                     'error'   => $th->getMessage(),
//                     'trace'   => explode("\n", $th->getTraceAsString())
//                 ], 500);
//             }
//             return response()->json([
//                 'message' => 'Error getting organizers'
//             ], 500);
//     }
// }

    
    public function currentUser(Request $request)
    {
            // Log::info('currentUser method: Entered. Session ID: ' . $request->session()->getId());
            // Log::info('currentUser method: Auth::check(): ' . (Auth::check() ? 'true' : 'false'));
            // Log::info('currentUser method: Auth::user(): ', ['user' => Auth::user()]);
        $user = Auth::user();
        if ($user) {
        return response()->json($user,200);
        }
        // Log::info('currentUser ',['Unauthenticated']);
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    public function register(Request $request)
    {
        try{

        
            $credentials = $request->validate([

                'name' => ['required'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required'],
                'role'=>['required'],
            ]);


            try {
                $user = new User();
                $user->name = $credentials['name'];
                $user->email = $credentials['email'];
                $user->password = Hash::make($credentials['password']);
                $user->role = $credentials['role'];
                $user->save();
                Auth::login($user);

                return response()->json([
                    'message' => 'Login successful',
                    'user' => Auth::user(),
                ], 200);

            } catch (\Throwable $th) {
                Log::error('creating user failed',[$th->getMessage()]);
                return response()->json('Something went wrong'.$th->getMessage(), 500);
            }
        } catch (ValidationException $e) {
            $errors = $e->errors();
            if (isset($errors['email'])) {
                return response()->json(['email_errors' => $errors['email']], 422);
            }
            return response()->json(['errors' => $errors], 422);
        }

      
    }

    public function forgotPassword(Request $request)
    {
         $validator = $request->validate([
             'email' => 'required|email|exists:users,email',
         ]);

         Log::info('email',[$validator['email']]);
        // create a plain‐text token and store its hash
        $resetToken = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validator['email']],
            [
              'token'      => Hash::make($resetToken),
              'created_at' => Carbon::now(),
            ]
        );

        // send the reset link (Angular front-end & token)
        $url = config('app.frontend_url') . '/change-password?token=' . $resetToken;



             try {
                Mail::to($request->email)
                ->send(new ResetPasswordLink($url, $validator['email']));

                return response()->json([
                'message' => 'Reset link sent to your email.'
                ], 200);
             } catch (\Throwable $th) {
                return response()->json(
                    ['email failed' =>$th->getMessage()],
                    500
                );
             }
   
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required|string',
            'password'              => 'required|string|confirmed|min:8',
            
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('created_at', '>=', Carbon::now()->subMinutes(60))
            ->get()
            ->first(function($row) use ($request) {
                return Hash::check($request->token, $row->token);
            });

        if (! $record) {
            return response()->json(['message' => 'Invalid or expired token'], 422);
        }

        // find the user & update password
        $user = User::where('email', $record->email)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();


        // delete the reset record
        DB::table('password_reset_tokens')->where('email', $record->email)->delete();

        return response()->json([ 'message' => 'Password reset successful' ], 200);        
                // ->withCookie(cookie()->forget($cookieName));
    }
}
