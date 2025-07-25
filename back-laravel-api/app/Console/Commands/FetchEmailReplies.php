<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Webklex\IMAP\Facades\Client;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Support\Facades\Log;
use EmailReplyParser\EmailReplyParser;

class FetchEmailReplies extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-email-replies';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch unread Gmail replies and store them in the DB';

    /**
     * Execute the console command.
     */

    public function handle()
    {
        // 1) Connect & open INBOX
        $client   = Client::account('default')->connect();
        $inbox    = $client->getFolder('INBOX');

        // 2) Pull unseen messages
        $messages = $inbox->messages()->unseen()->get();

        if ($messages->isEmpty()) {
            return $this->info('No new messages to process.');
        }

        $this->info("Found {$messages->count()} message(s).");

        foreach ($messages as $msg) {
            $subject   = $msg->getSubject()     ?: '(no subject)';
            $messageId = $msg->getMessageId();         
            $rawBody   = $msg->getTextBody() 
                       ?: $msg->getHTMLBody() 
                       ?: '';
            Log::info("FetchEmailReplies",[$messageId]);
            
            // 3) Extract “To” addresses
            $addresses = is_array($msg->getTo()) 
                ? $msg->getTo() 
                : $msg->getTo()->all();

            $emails = array_map(fn($a) => $a->mail, $addresses);

            $this->line("── Processing: {$subject}");
            $this->info(' To → ' . implode(', ', $emails));

            // 4) Match only on +reply{ID}@ alias
            $conversationId = null;
            foreach ($emails as $mail) {
                if (preg_match('/\+reply(\d+)@/', $mail, $m)) {
                    $conversationId = (int)$m[1];
                    $this->info(" ➔ Matched alias for Conversation #{$conversationId}");
                    break;
                }
            }

            // 5) Skip everything without a +reply alias
            if (! $conversationId 
                || ! Conversation::find($conversationId)
            ) {
                $this->warn('No +reply{ID}@ alias found. Marking read and skipping.');
                $msg->setFlag('Seen');
                continue;
            }

            // 6) Clean the body to only the fresh reply
            //    (EmailReplyParser handles “> quoted text” and “Le…a écrit:”)
            $decoded  = quoted_printable_decode($rawBody);
            $clean    = EmailReplyParser::parseReply($decoded);

            // 7) Persist
            Message::create([
                'conversation_id' => $conversationId,
                'sender_type'     => 'user',
                'body'            => trim($clean),
                'is_read'         => false,
                'message_id'      => $messageId,
                'reply_alias'     => null,
            ]);

            $this->info(" ➔ Stored reply for Conversation #{$conversationId}");

            // 8) Mark as Seen
            $msg->setFlag('Seen');
        }
        
        $this->info(" ➔ Stored reply for Conversation #{$conversationId}");

        $msg->setFlag('Seen');
    }

}
