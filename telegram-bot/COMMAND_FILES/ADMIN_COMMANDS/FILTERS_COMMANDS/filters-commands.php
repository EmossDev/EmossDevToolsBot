<?php


/////////////////////////

# FİLTERS ADD FUNCTİON


function Filters_Add($filter) {
		
	$data = json_decode(file_get_contents('COMMAND_FILES/DATA_FILE/data.json'), true);

	$data_location = 'COMMAND_FILES/DATA_FILE/data.json';

	
	$_name = preg_split('/ |\r|\n/', _TEXT);
	
	if ( preg_match('/^"/', $_name[1])){
			
		$_name = explode ('"', _TEXT);
		$control = "true";
		
	}
	
	$name = $_name[1];

	$User_Message = _USER_MESSAGE;

	if ($control == "true"){
			
		$reason = str_replace("$User_Message[0] \"$name\"","", _TEXT);
		
	}else{
		
		$reason = str_replace("$User_Message[0] $name","", _TEXT);
	
	}

	if (! $name){
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> "*❗ Filtre adı girmelisin...*",
			'parse_mode'=>"markdown",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();

	}

	if (! $reason){
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> "*❗ Biraz içerik girmelisin...*",
			'parse_mode'=>"markdown",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();

	}


	foreach ($data["data"]["filters"]["$filter"] as $keys => $value){

		$names = $data["data"]["filters"]["$filter"]["$keys"]["name"];
		
		if ( $names == $name ){
			
			unset($data["data"]["filters"]["$filter"]["$keys"]);
			
			$status = "True";

			break;

		}
	}




	if ( DATA_TYPE == "0" ){
		
		$_reason = str_replace(["code#","#code"],["`","`"],$reason);
		
		
		$add = array(
		"data_id"=> "\n",
		"name"=> "$name",
		"text"=> "$_reason",
		"type"=> "0"
		);
		
		array_push($data["data"]["filters"]["$filter"], $add);
		
		$json = json_encode($data, JSON_PRETTY_PRINT);
				
		file_put_contents($data_location, $json);

		file_upload ("COMMAND_FILES/DATA_FILE/data.json","data.json");

		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> "✅ `$name` Kaydedildi..",
			'parse_mode'=>"markdown",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();

	}else{


		$_reason = str_replace(["code#","#code"],["`","`"],$reason);
		
		
		$add = array(
		"data_id"=> "".DATA_ID."",
		"name"=> "$name",
		"text"=> "$_reason",
		"type"=> DATA_TYPE
		);
		
		array_push($data["data"]["filters"]["$filter"], $add);
		
		$json = json_encode($data, JSON_PRETTY_PRINT);
				
		file_put_contents($data_location, $json);

		file_upload ("COMMAND_FILES/DATA_FILE/data.json","data.json");

		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> "✅ `$name` Kaydedildi..",
			'parse_mode'=>"markdown",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();

	
	
	
	
	}
}
	

/////////////////////////




/////////////////////////

# FİLTERS DELETE FUNCTİON


function Filters_Del($filter) {
		
	$data = json_decode(file_get_contents('COMMAND_FILES/DATA_FILE/data.json'), true);

	$data_location = 'COMMAND_FILES/DATA_FILE/data.json';

	
	$_name = preg_split('/ |\r|\n/', _TEXT);
	
	if ( preg_match('/^"/', $_name[1])){
			
		$_name = explode ('"', _TEXT);
		$control = "true";
		
	}
	
	$name = $_name[1];


	foreach ($data["data"]["filters"]["$filter"] as $keys => $value){

		$names = $data["data"]["filters"]["$filter"]["$keys"]["name"];
		
		if ( $names == $name ){
			
			unset($data["data"]["filters"]["$filter"]["$keys"]);
			
			$status = "True";

			break;
		}
	}
	
	if ($status == "True"){

		$json = json_encode($data, JSON_PRETTY_PRINT);
				
		file_put_contents($data_location, $json);

		file_upload ("COMMAND_FILES/DATA_FILE/data.json","data.json");
		
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> "✅ `$name` *Silindi...*",
			'parse_mode'=>"markdown",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();
	}else{
	
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> "❗ `$name` *Bulunamadı...*",
			'parse_mode'=>"markdown",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();

	}

}
	

/////////////////////////




/////////////////////////

# TOOLS COMMANDS


if ( $User_Message[0] == "/addTools" or $User_Message[0] == "/addTools$Bot_Username" ){
	
	User_Controls("admin","0","Change_Info");

	$filterTools_example = ("
<code>/addTools test

*───────────────────


AD 🔻


⚡ ÖZELLİK


───────────────────


KURULUM  🔻*


code#pkg install git -y&&git clone https://github.com/EmossDev/test#code


*ÇALIŞTIRMA 🔻*


code#cd TEST && chmod 777 test.sh && bash test.sh#code


*───────────────────*
</code>
");
	if (!$User_Message[1]){
		
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> $filterTools_example,
			'parse_mode'=>"html",
			'disable_web_page_preview'=>"true",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
	
	}else{

		Filters_Add("tools");
	
	}
}


if ( $User_Message[0] == "/delTools" or $User_Message[0] == "/delTools$Bot_Username" ){
	
	User_Controls("admin","0","Change_Info");

	$filterTools_delete_info = ("

*Dᴇʟᴇᴛᴇ Tᴏᴏʟꜱ Fɪʟᴛᴇʀ 🔻*


───────────────────


`/delTools test`


───────────────────
");
	if (!$User_Message[1]){
		
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> $filterTools_delete_info,
			'parse_mode'=>"markdown",
			'disable_web_page_preview'=>"true",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();
	
	}else{

		Filters_Del("tools");
		exit();
	
	}
}

if ( $User_Message[0] == "/toolsCommands" or $User_Message[0] == "/toolsCommands$Bot_Username" ){
	
	User_Controls("admin","0","True");

	$filterToolsCommands_info = ("

*Tᴏᴏʟꜱ Fɪʟᴛᴇʀ Cᴏᴍᴍᴀɴᴅꜱ 🔻*


───────────────────


`/tools`

`/addTools`

`/delTools`


───────────────────
");

	bot('sendMessage',[
		'chat_id'=>_CHAT_ID,
		'text'=> $filterToolsCommands_info,
		'parse_mode'=>"markdown",
		'disable_web_page_preview'=>"true",
		'reply_to_message_id'=>_MESSAGE_ID
	]);
	exit();
}

/////////////////////////




/////////////////////////

# MİX COMMANDS


if ( $User_Message[0] == "/addMix" or $User_Message[0] == "/addMix$Bot_Username" ){
	
	User_Controls("admin","0","Change_Info");

	$filterMix_example = ("
<code>/addMix test

*───────────────────


AD 🔻


⚡ ÖZELLİK


İNDİRME LİNKİ  🔻*


[TIKLA](LİNK)


*───────────────────*
</code>
");
	if (!$User_Message[1]){
		
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> $filterMix_example,
			'parse_mode'=>"html",
			'disable_web_page_preview'=>"true",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
	
	}else{

		Filters_Add("mix");
		exit;
	
	}
}


if ( $User_Message[0] == "/delMix" or $User_Message[0] == "/delMix$Bot_Username" ){
	
	User_Controls("admin","0","Change_Info");

	$filterMix_delete_info = ("

*Dᴇʟᴇᴛᴇ Mɪx Fɪʟᴛᴇʀ 🔻*


───────────────────


`/delMix termux`


───────────────────
");
	if (!$User_Message[1]){
		
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> $filterMix_delete_info,
			'parse_mode'=>"markdown",
			'disable_web_page_preview'=>"true",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();
	
	}else{

		Filters_Del("mix");
		exit();
	
	}
}

if ( $User_Message[0] == "/mixCommands" or $User_Message[0] == "/mixCommands$Bot_Username" ){
	
	User_Controls("admin","0","True");

	$filterMixCommands_info = ("

*Mɪx Fɪʟᴛᴇʀ Cᴏᴍᴍᴀɴᴅꜱ 🔻*


───────────────────


`/mix`

`/addMix`

`/delMix`


───────────────────
");

	bot('sendMessage',[
		'chat_id'=>_CHAT_ID,
		'text'=> $filterMixCommands_info,
		'parse_mode'=>"markdown",
		'disable_web_page_preview'=>"true",
		'reply_to_message_id'=>_MESSAGE_ID
	]);
	exit();
}


/////////////////////////




/////////////////////////

# BLOG COMMANDS


if ( $User_Message[0] == "/addBlog" or $User_Message[0] == "/addBlog$Bot_Username" ){
	
	User_Controls("admin","0","Change_Info");

	$filterBlog_example = ("
<code>/addBlog test

*───────────────────


AD 🔻


⚡ ÖZELLİK


BLOG SİTE LİNKİ  🔻*


[TIKLA](LİNK)


*───────────────────*
</code>

");
	if (!$User_Message[1]){
		
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> $filterBlog_example,
			'parse_mode'=>"html",
			'disable_web_page_preview'=>"true",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
	
	}else{

		Filters_Add("blog");
		exit;
	
	}
}


if ( $User_Message[0] == "/delBlog" or $User_Message[0] == "/delBlog$Bot_Username" ){
	
	User_Controls("admin","0","Change_Info");

	$filterBlog_delete_info = ("

*Dᴇʟᴇᴛᴇ Bʟᴏɢ Fɪʟᴛᴇʀ 🔻*


───────────────────


`/delBlog termux-nedir`


───────────────────
");
	if (!$User_Message[1]){
		
		bot('sendMessage',[
			'chat_id'=>_CHAT_ID,
			'text'=> $filterBlog_delete_info,
			'parse_mode'=>"markdown",
			'disable_web_page_preview'=>"true",
			'reply_to_message_id'=>_MESSAGE_ID
		]);
		exit();
	
	}else{

		Filters_Del("blog");
		exit();
	
	}
}

if ( $User_Message[0] == "/blogCommands" or $User_Message[0] == "/blogCommands$Bot_Username" ){
	
	User_Controls("admin","0","True");

	$filterBlogCommands_info = ("

*Bʟᴏɢ Fɪʟᴛᴇʀ Cᴏᴍᴍᴀɴᴅꜱ 🔻*


───────────────────


`/blog`

`/addBlog`

`/delBlog`


───────────────────
");

	bot('sendMessage',[
		'chat_id'=>_CHAT_ID,
		'text'=> $filterBlogCommands_info,
		'parse_mode'=>"markdown",
		'disable_web_page_preview'=>"true",
		'reply_to_message_id'=>_MESSAGE_ID
	]);
	exit();
}


/////////////////////////

?>
