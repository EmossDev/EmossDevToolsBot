<?php

/////////////////////////

# FOLLOW COMMANDS


if ( $User_Message[0] == "/follow" or $User_Message[0] == "/follow$Bot_Username" ){

$follow_commands_info = ("
*Fᴏʟʟᴏᴡ Cᴏᴍᴍᴀɴᴅꜱ 🔻*

──────────────

*🇹​🇦​🇰​🇮​🇵​ 🇪​🇹​ *


[EmossDev Github](https://github.com/EmossDev)

──────────────


[İnstagram](https://instagram.com/emoss089)

[Youtube](https://youtube.com/@emoss89)


──────────────
");


	bot('sendMessage',[
		'chat_id'=>_CHAT_ID,
		'text'=> $follow_commands_info,
		'parse_mode'=>"markdown",
		'disable_web_page_preview'=>"true",
		'reply_to_message_id'=>_MESSAGE_ID
	]);

}

/////////////////////////



?>
