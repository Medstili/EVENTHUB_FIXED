<?php

namespace App\Http\Controllers;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('name')) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->input('name')) . '%']);
        }
        if ($request->has('email')) {
            $query->where('email', $request->input('email'));
        }
        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        $pagination = $query->paginate(35);

        return $pagination;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {

            $request->validate([
                'full_name'=>'required',
                'email'=>'required|email|unique:users,email',
                'password'=>'required|confirmed|min:8',
                'role'=>'required|in:organizer,participant',
            ]);
    
            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                return response()->json(['message' => 'Email already exists'], 409);
            }

            $user = new User();
            $user->name = $request->full_name;
            $user->email = $request->email;
            $user->password = Hash::make($request->password);
            $user->role = $request->role;


            $user->save();

            return response()->json(['message'=>'User created successfully'], 201);
            
        } catch (\Throwable $th) {
            return response()->json(['message'=>'Error creating user'], 500);
        }
    

        
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json(['user'=>$user]);
        } catch (\Throwable $th) {
            return response()->json(['message'=>'User not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        Log::info('updated method called');
      
        try {

            $user = User::findOrFail($id);


            $request->validate([
                'name'=>'required',
                'email'=>Rule::unique('users', 'email')->ignore($user->id),
                'password'=>'sometimes|nullable|min:8|',
                'password_confirmation'=>'sometimes|nullable|min:8|same:password'
            ]);
    
            $user->name = $request->name;
            $user->email = $request->email;
            if ($request->password && $request->password === $request->password_confirmation) {   
                $user->password = Hash::make($request->password);
                // $request->session()->invalidate();
                // $request->session()->regenerateToken();
                // $cookieName = session()->getName();
                // $response = response()->json(['message'=>'User updated successfully', 'user'=>$user])
                //             ->withCookie(cookie()->forget($cookieName));
            }

            $user->save();

            if ($request->session()->has('password_hash_web')) {
                $user = Auth::guard('web')->user();

                Auth::guard('web')->attempt(['email' => $request->email, 'password' => $request->password]);

                Log::info('user logged in successfully',[Auth::user()]);
            }

            Log::info('user updated successfully ', [$user]);
            $response = response()->json(['message'=>'User updated successfully', 'user'=>$user]);
            return  $response;
        } catch (\Throwable $th) {
            Log::error('Error updating user: '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error updating user',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }

            return response()->json(['message'=>'Error updating user'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request)
    {
        log::info('delete method called', [$id]);
        try {
            $userToDelete = User::findOrFail($id);
            $authenticatedUser = Auth::user();
            $isDeletingSelf = $authenticatedUser && $authenticatedUser->id == $userToDelete->id;

            $userToDelete->delete();

            if ($isDeletingSelf) {
                // If the user is deleting their own account, perform a full logout
                Log::info('User deleting self. ID: ' . $userToDelete->id . '. Logging out.');
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                $cookieName = session()->getName();
                return response()->json(['message' => 'User deleted successfully and logged out'])
                    ->withCookie(cookie()->forget($cookieName));
            } else {
                // If an admin (or another authorized user) is deleting someone else
                Log::info('User ID: ' . ($authenticatedUser ? $authenticatedUser->id : 'N/A') . ' deleted user ID: ' . $userToDelete->id);
                return response()->json(['message' => 'User deleted successfully']);
            }
        } catch (\Throwable $th) {
            Log::error('Error deleting user: '.$th->getMessage(), ['exception_trace' => $th->getTraceAsString()]);
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error deleting user',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json(['message' => 'Error deleting user'], 500);
        }
    }

    public function getOrganizersCount(){
         try{
            $totalOrganizers = User::where('role', 'organizer')->count();
            return $totalOrganizers;
        }
        catch (\Throwable $th) {
            Log::error('Error getting organizers '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error getting organizers',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json([
                'message' => 'Error getting organizers'
            ], 500); 
    }}  
    
    public function getAllUsers(){
        try {
            $users = User::whereIn('role', ['organizer', 'participant'])->count();
            return $users;

        } catch (\Throwable $th){
                        Log::error('Error getting users '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error getting users',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json(['message'=>'Error getting users'], 500);
        }
    }
    public function get_Or_Pr_Users(){
        try {
            $organizers = User::where('role', 'organizer')->count();
            $participants = User::where('role', 'participant')->count();
            $users = [
                ['name' => 'organizers', 'value' => $organizers],
                ['name' => 'participants', 'value' => $participants]
            ];
    
            return  $users;

        }
        catch (\Throwable $th){
                        Log::error('Error getting users '.$th->getMessage());
            Log::error($th->getTraceAsString());
            
            // In debug mode, return the exception message so you can see it in Postman/Angular
            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Error getting users',
                    'error'   => $th->getMessage(),
                    'trace'   => explode("\n", $th->getTraceAsString())
                ], 500);
            }
            return response()->json(['message'=>'Error getting users'], 500);
        }
    }

    /**
     * Get user distribution for admin dashboard charts
     */
    public function getUserDistribution()
    {
        try {
            $userDistribution = User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->get()
                ->map(function($item) {
                    return [
                        'name' => ucfirst($item->role),
                        'value' => $item->count
                    ];
                });

            return response()->json($userDistribution);

        } catch (\Throwable $th) {
            Log::error('Error getting user distribution: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching user distribution'], 500);
        }
    }

    /**
     * Get user growth over time for admin dashboard
     */
    public function getUserGrowth()
    {
        try {
            $year = Carbon::now()->year;

            $monthlyUsers = User::whereYear('created_at', $year)
                ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $data = collect(range(1, 12))->map(function($month) use ($monthlyUsers) {
                $monthData = $monthlyUsers->firstWhere('month', $month);
                return [
                    'name' => Carbon::create()->month($month)->format('M'),
                    'value' => $monthData ? $monthData->count : 0
                ];
            });

            return response()->json($data);

        } catch (\Throwable $th) {
            Log::error('Error getting user growth: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching user growth data'], 500);
        }
    }

    /**
     * Get top organizers by event count
     */
    public function getTopOrganizers()
    {
        try {
            $topOrganizers = User::where('role', 'organizer')
                ->withCount('events')
                ->orderByDesc('events_count')
                ->take(10)
                ->get(['id', 'name', 'email', 'events_count'])
                ->map(function($organizer) {
                    return [
                        'name' => $organizer->name,
                        'value' => $organizer->events_count,
                        'email' => $organizer->email
                    ];
                });

            return response()->json($topOrganizers);

        } catch (\Throwable $th) {
            Log::error('Error getting top organizers: ' . $th->getMessage());
            return response()->json(['message' => 'Error fetching top organizers'], 500);
        }
    }

}
