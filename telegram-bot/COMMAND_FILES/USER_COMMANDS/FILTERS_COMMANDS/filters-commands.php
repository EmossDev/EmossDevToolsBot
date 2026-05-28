<?php

/////////////////////////

# FİLTERS DATAS FUNCTİON


function Filters_Datas($name,$command="0") {

        $data = json_decode(file_get_contents('COMMAND_FILES/DATA_FILE/data.json'), true);

        if ($command != "0"){
                $query = $command;
        }else{
                $query = _TEXT;
        }

        if ($data["data"]["filters"]["$name"]){

                foreach ($data["data"]["filters"]["$name"] as $keys => $value){

                        $data_id = $data["data"]["filters"]["$name"]["$keys"]["data_id"];

                        $filters_name = $data["data"]["filters"]["$name"]["$keys"]["name"];

                        $filters_text = $data["data"]["filters"]["$name"]["$keys"]["text"];

                        $type = $data["data"]["filters"]["$name"]["$keys"]["type"];

                        if (preg_match("/^$filters_name\b/i", $query)){
                                if ($type == "0"){
                                        bot("sendMessage",[
                                                'chat_id'=>_CHAT_ID,
                                                'text'=>"$filters_text",
                                                'parse_mode'=>"markdown",
                                                'disable_web_page_preview'=>"true",
                                                'reply_to_message_id'=>_MESSAGE_ID
                                        ]);
                                        $break;
                                }
                                if ($type == "1"){
                                        $res = bot("sendPhoto",[
                                                'chat_id'=>_CHAT_ID,
                                                'photo'=>"$data_id",
                                                'caption'=>"$filters_text",
                                                'parse_mode'=>"markdown",
                                                'disable_web_page_preview'=>"true",
                                                'reply_to_message_id'=>_MESSAGE_ID
                                        ]);
                                        if (!$res || !$res->ok){
                                                bot("sendMessage",[
                                                        'chat_id'=>_CHAT_ID,
                                                        'text'=>"$filters_text",
                                                        'parse_mode'=>"markdown",
                                                        'disable_web_page_preview'=>"true",
                                                        'reply_to_message_id'=>_MESSAGE_ID
                                                ]);
                                        }
                                        $break;
                                }
                                if ($type == "2"){
                                        $res = bot("sendVideo",[
                                                'chat_id'=>_CHAT_ID,
                                                'video'=>"$data_id",
                                                'caption'=>"$filters_text",
                                                'parse_mode'=>"markdown",
                                                'disable_web_page_preview'=>"true",
                                                'reply_to_message_id'=>_MESSAGE_ID
                                        ]);
                                        if (!$res || !$res->ok){
                                                bot("sendMessage",[
                                                        'chat_id'=>_CHAT_ID,
                                                        'text'=>"$filters_text",
                                                        'parse_mode'=>"markdown",
                                                        'disable_web_page_preview'=>"true",
                                                        'reply_to_message_id'=>_MESSAGE_ID
                                                ]);
                                        }
                                        $break;
                                }
                                if ($type == "3"){
                                        $res = bot("sendDocument",[
                                                'chat_id'=>_CHAT_ID,
                                                'document'=>"$data_id",
                                                'caption'=>"$filters_text",
                                                'parse_mode'=>"markdown",
                                                'disable_web_page_preview'=>"true",
                                                'reply_to_message_id'=>_MESSAGE_ID
                                        ]);
                                        if (!$res || !$res->ok){
                                                bot("sendMessage",[
                                                        'chat_id'=>_CHAT_ID,
                                                        'text'=>"$filters_text",
                                                        'parse_mode'=>"markdown",
                                                        'disable_web_page_preview'=>"true",
                                                        'reply_to_message_id'=>_MESSAGE_ID
                                                ]);
                                        }
                                        $break;
                                }
                        }
                }
        }

}


/////////////////////////



if (!$callback_data){
        Filters_Datas("tools");
        Filters_Datas("mix");
        Filters_Datas("blog");
}



/////////////////////////

# FİLTERS NAMES FUNCTİON

function Filters_Names($name) {

        $data = json_decode(file_get_contents('COMMAND_FILES/DATA_FILE/data.json'), true);
        
        $code = "False";

        if ($name == "tools"){

                $names = "Tᴏᴏʟꜱ Nᴀᴍᴇꜱ 🔻\n\n";
        }

        if ($name == "mix"){

                $names = "Mɪx Aʟʟ 🔻\n\n";
        }

        if ($name == "blog"){

                $names = "Bʟᴏɢ Nᴀᴍᴇꜱ 🔻\n\n";
        }

        if ($name == "bashScript"){

                $names = "BᴀꜱʜSᴄʀɪᴘᴛ Cᴏᴍᴍᴀɴᴅꜱ 🔻\n\n";
                $code = "/bashScript";
        }

        foreach ($data["data"]["filters"]["$name"] as $keys => $value){

                if ( $keys >= "0" ){
                        if ($code == "False"){
                                $names .= "*»* `".$data["data"]["filters"]["$name"]["$keys"]["name"]."`\n";
                        }else{
                                $names .= "`$code ".$data["data"]["filters"]["$name"]["$keys"]["name"]."`\n";
                        
                        }
                }

        }


        bot('sendMessage',[
                'chat_id'=>_CHAT_ID,
                'text'=> $names,
                'parse_mode'=>"markdown",
                'reply_to_message_id'=>_MESSAGE_ID
        ]);
}



/////////////////////////




/////////////////////////

# FİLTERS NAMES COMMANDS

if ( $User_Message[0] == "/tools" or $User_Message[0] == "/tools$Bot_Username" ){

        Filters_Names("tools");
}

if ( $User_Message[0] == "/mix" or $User_Message[0] == "/mix$Bot_Username" ){

        Filters_Names("mix");
}

if ( $User_Message[0] == "/blog" or $User_Message[0] == "/blog$Bot_Username" ){

        Filters_Names("blog");
}

if ( $User_Message[0] == "/bashScript" or $User_Message[0] == "/bashScript$Bot_Username" ){
        if (isset($User_Message[1])){
                Filters_Datas("bashScript","$User_Message[1]");
        }else{
                Filters_Names("bashScript");
        }

}
/////////////////////////




/////////////////////////

# FİLTERS COMMANDS


$filters_commands_info = ("
*Fɪʟᴛᴇʀꜱ Cᴏᴍᴍᴀɴᴅꜱ 🔻*

──────────────

`/tools`

`/mix`

`/blog`

`/bashScript`

──────────────
");



if ( $User_Message[0] == "/filters" or $User_Message[0] == "/filters$Bot_Username" ){

        bot('sendMessage',[
                'chat_id'=>_CHAT_ID,
                'text'=> "$filters_commands_info",
                'parse_mode'=>"markdown",
                'reply_to_message_id'=>_MESSAGE_ID
        ]);
}



/////////////////////////




?>
