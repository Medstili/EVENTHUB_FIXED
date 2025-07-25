<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Http\Requests\ContactMessageRequest;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminReplyMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ConversationController extends Controller
{
    public function store(ContactMessageRequest $request)
    {
        $data = $request->validated();
        Log::info('ContactMessageRequest validated data', $data);
        
        try {
            // Create a new conversation for guest user
            $conversation = Conversation::create([
                'user_id' => null,
                'guest_email' => $data['email'],
                'guest_name' => $data['name'],
                'status' => 'unsolved',
                'last_message_at' => now(),
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
            ]);
            
            // Create the initial message
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_type' => 'user',
                'sender_id' => null,
                'body' => $data['message'],
                'is_read' => false,
            ]);
            return response()->json([
                'message' => 'Thank you! Your message has been sent.',
                'conversation_id' => $conversation->id
            ], 200);
            
        } catch (\Throwable $th) {
            Log::error('Error storing conversation', [
                'error' => $th->getMessage(),
                'data' => $data
            ]);
            return response()->json([
                'error' => 'Sorry, something went wrong. Please try again later.'
            ], 500);
        }
    }

    // Admin methods
    public function index(Request $request)
    {

        Log::info('Admin Conversation Index Request', [
            'params' => $request->all(),
            'url' => $request->fullUrl()
        ]);

        $query = Conversation::with(['messages'])
            ->orderBy('last_message_at', 'desc');

        // Filter by solved/unsolved
        if ($request->has('status') && in_array($request->status, ['solved', 'unsolved'])) {
            $query->where('status', $request->status);
        }

        // Filter by guest email
        if ($request->filled('email')) {
            $query->where('guest_email', 'like', '%' . $request->email . '%');
        }

        // Filter by read/unread
        if ($request->has('status')) {
            if ($request->status == 'unread') {
                $query->whereHas('messages', function ($q) {
                    $q->where('sender_type', 'user')->where('is_read', false);
                });
            } elseif ($request->status == 'read') {
                $query->whereDoesntHave('messages', function ($q) {
                    $q->where('sender_type', 'user')->where('is_read', false);
                });
            }
        }

        $perPage = $request->get('per_page', 5);
        $conversations = $query->paginate($perPage);

        // Transform the data to include guest information
        // $conversations->getCollection()->transform(function ($conversation) {
        //     $conversation->guest_info = $this->getGuestInfo($conversation);
        //     return $conversation;
        // });

        return response()->json($conversations);
    }

    public function show($id)
    {
        $conversation = Conversation::with(['messages' => function($query) {
            $query->orderBy('created_at', 'asc');
        }])->findOrFail($id);

        // Mark all messages as read
        $conversation->messages()->where('sender_type', 'user')->update(['is_read' => true]);


        return response()->json($conversation);
    }

        /**
     * @param Conversation  $conversation
     * @param string        $body
     * @param string|null  &$messageId
     * @param string|null  &$replyAlias
     * @param string|null   $threadRootId   // new
     */
    private function sendReplyEmail(
            Conversation $conversation,
            string $body,
            ?string &$messageId,
            ?string &$replyAlias,
            ?string $threadRootId = null
        ): bool {

        $recipientEmail = $conversation->guest_email;
        if (! $recipientEmail) {
            return false;
        }
        $replyAlias = 'stilistili2023+reply' . $conversation->id . '@gmail.com';

        $mailable = new AdminReplyMail($body, $replyAlias, $threadRootId);
        $messageId   = $mailable->messageId;
        Log::info("msg id in sendReplyEmail", [$messageId]);
        try {
            Mail::to($recipientEmail)->send($mailable);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send admin reply', [
                'conversation_id' => $conversation->id,
                'error'           => $e->getMessage(),
            ]);
            return false;
        }
    }


    public function reply(Request $request, $id)
    {
        $data         = $request->validate(['message' => 'required|string']);
        $conversation = Conversation::findOrFail($id);

        // 1) Grab existing thread root (null on first reply)
        $threadRootId = $conversation->thread_message_id;

        Log::info('thread_message_id', [$conversation->thread_message_id]);
        // 2) Send email, passing the root ID into the mailable
        $messageId  = null;
        $replyAlias = null;
        $sent = $this->sendReplyEmail(
            $conversation,
            $data['message'],
            $messageId,
            $replyAlias,
            $threadRootId    // NEW param
        );

        if (! $sent) {
            return response()->json(['error' => 'Failed to send email.'], 500);
        }

        Log::info("msg id in reply", [$messageId]);
        
        // 3) Persist your admin message as before
        $msg = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type'     => 'admin',
            'sender_id'       => Auth::id(),
            'body'            => $data['message'],
            'is_read'         => false,
            'message_id'      => $messageId,
            'reply_alias'     => $replyAlias,
        ]);

        // 4) On first reply, store thread root
        if (! $threadRootId) {
            $conversation->update([ 'thread_message_id' => $messageId ]);
        }

        $conversation->update(['last_message_at' => now()]);

        return response()->json(['message' => 'Reply sent and recorded.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:solved,unsolved',
        ]);

        $conversation = Conversation::findOrFail($id);
        $conversation->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated successfully']);
    }


    public function stats()
    {
        $total = Conversation::count();
        $solved = Conversation::where('status', 'solved')->count();
        $not_solved = Conversation::where('status', 'unsolved')->count();
        $read = Message::where('is_read', true)->count();
        $unread = Message::where('is_read', false)->count();

        return response()->json([
            'total' => $total,
            'solved' => $solved,
            'not_solved' => $not_solved,
            'read' => $read,
            'unread' => $unread,
        ]);
    }

 
   
    // public function markAsRead($id)
    // {
    //     $conversation = Conversation::findOrFail($id);
    //     $conversation->messages()->where('sender_type', 'user')->update(['is_read' => true]);
    //     return response()->json(['message' => 'Messages marked as read']);
    // }
    // private function getGuestInfo($conversation)
    // {
    //     return [
    //         'name' => $conversation->guest_name,
    //         'email' => $conversation->guest_email,
    //     ];
    // }
} 

