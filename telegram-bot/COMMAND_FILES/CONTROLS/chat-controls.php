<?php

/////////////////////////

# CHAT CONTROL

if ( ! $callback_data ){

        $chat_control = "false";

        if ( $chat_id == $Config_Private_Chat_id ){
                $chat_control = "true";
        }
        if ( $chat_id == $Config_Chat_id ){
                $chat_control = "true";
        }

        if ( $chat_id == $Config_Test_Chat_id ){
                $chat_control = "true";
        }

        if ( $chat_id == $Config_Log_Chat_id ){
                $chat_control = "true";
        }

        if ( $chat_type != "private" and !empty($chat_type) and $chat_control == "false"){

                if ($chat_type == "group"){
                        $_chat_id = explode("-", $chat_id);
                }else{
                        $_chat_id = explode("-100", $chat_id);
                }

                bot("getChatAdministrators",['chat_id'=>$chat_id]);
                $result_file = json_decode(file_get_contents('COMMAND_FILES/DATA_FILE/commands_result'), true);

                $result = $result_file["result"];

                if (!is_array($result)) { exit(); }

                $adminlist = "*Aᴅᴍɪɴ Lɪꜱᴛ 🔻*\n\n──────────────\n\n";

                foreach ($result as $keys => $value){

                        $status = $result["$keys"]["status"];
                        
                        $title = $result["$keys"]["custom_title"];

                        $id = $result["$keys"]["user"]["id"];

                        $first_name = $result["$keys"]["user"]["first_name"];
                        $username = $result["$keys"]["user"]["username"];
                        if (!$title){
                                $title = "Yönetici";
                        }
                        
                        $_username = "";
                        if (isset($username)){
                                $_username = "\n\n`@$username`\n";
                        }

                        $adminlist .= "[$first_name](tg://user?id=$id) *» $status*$_username\n\n";

                }

                bot('sendMessage',[
                        'chat_id'=>$chat_id,
                        'text'=> "❗ Merhaba Bu Bot Sadece [Emoss Dev Tools](https://t.me/emossdevtools) Grubunda Kullanılabilir...",
                        'parse_mode'=>"markdown",
                        'disable_web_page_preview'=>"true",
                        'reply_to_message_id'=>$message_id
                ]);
                
                $logoutControl = file_get_contents("logout");
                
                if(isset($status) and $logoutControl != "$chat_id"){
                        
                        file_put_contents("logout","$chat_id");
                
                        bot('sendMessage',[
                                'chat_id'=>$Config_Log_Chat_id,
                                'text'=> "*Bᴏᴛ Aᴅᴅ Cᴏɴᴛʀᴏʟꜱ 🔻*\n\n──────────────\n\n*Chat İd » *`$chat_id`\n\n*Chat Title » *`$chat_title`\n\n*Chat Username » *`@$chat_username`\n\n*Chat Type » *`$chat_type`\n\n[Cʜᴀᴛ Lɪɴᴋ](https://t.me/c/$_chat_id[1]/1)\n\n──────────────\n\n\n$adminlist\n──────────────",
                                'parse_mode'=>"markdown",
                                'disable_web_page_preview'=>"true"
                        ]);
        
                        bot('sendMessage',[
                                'chat_id'=>$Config_Private_Chat_id,
                                'text'=> "*Bᴏᴛ Aᴅᴅ Cᴏɴᴛʀᴏʟꜱ 🔻*\n\n──────────────\n\n*Chat İd » *`$chat_id`\n\n*Chat Title » *`$chat_title`\n\n*Chat Username » *`@$chat_username`\n\n*Chat Type » *`$chat_type`\n\n[Cʜᴀᴛ Lɪɴᴋ](https://t.me/c/$_chat_id[1]/1)\n\n──────────────\n\n\n$adminlist\n──────────────",
                                'parse_mode'=>"markdown",
                                'disable_web_page_preview'=>"true"
                        ]);
                }

                bot('leaveChat',[
                        'chat_id'=>$chat_id
                ]);
                
                exit;
        }
/*
        if ( isset($sender_chat_id) and $user_id != $creator_id){

                bot('deleteMessage',[
                        'chat_id'=>$chat_id,
                        'message_id'=> $message_id
                ]);

                bot('banChatSenderChat',[
                        'chat_id'=>$chat_id,
                        'sender_chat_id'=> $sender_chat_id
                ]);

                exit;

        }
 */
}

/////////////////////////




/////////////////////////

# DATABASE CONTROL
/*
if ($databaseStatus != "True"){
        
        if ( $BotWebhookUrl == $_BotWebhookUrl ){
                
                bot('sendMessage',[
                        'chat_id'=>$creator_id,
                        'text'=> "Dᴀᴛᴀʙᴀꜱᴇ Cᴏɴᴛʀᴏʟ 🔻\n\n──────────────\n\nSᴛᴀᴛᴜꜱ  »  `❗ Eʀʀᴏʀ ❗ `\n\n──────────────",
                        'parse_mode'=>"markdown"
                ]);
                
        }
}
 */
/////////////////////////





?>
