<?php
	$to = "granados@yahoo-inc.com";
	$subject = "Changed Credits";
	$message = '<html><body>';
	$message.= "<p>Hi Admin, you should add <b>".$_POST['credits']."</b> credits to <b>".$_POST['username']."</b></p>";
	$message.= '</body></html>';
	$from = "granados@yahoo-inc.com";
	$headers = "From:" . $from;
	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
	mail($to,$subject,$message,$headers);
?>