<?php

	if(!isset($_POST['request'])){
		$to = "granados@yahoo-inc.com";
		$subject = "Exchange Credits";
		$message = '<html><body>';
		$message .= "<p>Hi Y! University Admin,</p><br>";
		$message .= "<p>You need to add <b>".$_POST['credits']."</b> Recognize Performance Points to <b>".$_POST['username']."</b></p><br>";
		$message .= "<img src='http://50.97.99.152/~tracking/img/logo-email.png'/><br>";
		$message .= "<small>Message sent by Credit Tool Administrator</small>";
		$message .= '</body></html>';
		$headers  = "From:".$_POST['email']."\r\n";
		$headers .= "CC: ".$_POST['email']."\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
	} else {
		$to = "granados@yahoo-inc.com";
		$subject = "Request Exchange Credits";
		$message = '<html><body>';
		$message .= "<p>Hi Y! University Admin,</p><br>";
		$message .= "<p><b>".$_POST['username']."</b> has requested the exchange of <b>".$_POST['credits']."</b> points</p><br>";;
		$message .= "<img src='http://50.97.99.152/~tracking/img/logo-email.png'/><br>";
		$message .= "<small>Message sent by Credit Tool Administrator</small>";
		$message .= '</body></html>';
		$headers  = "From:".$_POST['email']."\r\n";
		$headers .= "CC: ".$_POST['email']."\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
	}

	mail($to,$subject,$message,$headers);
?>