<?php
	/*后端获取请求字段，并生成返回内容*/
	$data=$_GET["data"];
	$callback=$_GET["callback"];
	echo $callback."('success','".$data."')";
?>