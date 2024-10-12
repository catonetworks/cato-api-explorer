<?
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

header('Cache-Control: no-cache, must-revalidate');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

$headers = getallheaders();
$api_key = isset($headers['X-Api-Key']) ? $headers['X-Api-Key'] : '';
$query = json_decode(file_get_contents("php://input"), true);
$server = $_GET["server"];
$method='POST';
$post_headers = array(
	'Content-Type: application/json',
	'X-Api-Key: '.$api_key,
	'User-Agent: '.$headers['User-Agent']
);
// print_r($GLOBALS);
// ob_start();
// print_r($headers);
// print_r($query);
// $querystr = json_decode($query, true);
// $data = ob_get_contents();
// ob_end_clean();
// error_log($logDate." | post_data=".$querystr);
// $curlstr='curl -ik -X '.$method.' -H "'.implode('" -H "',$post_headers)." -d '".$querystr."' ".$server;
// error_log($logDate." - Cato API Request | ".$curlstr);

$ch = curl_init($server);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $query); 
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

error_log($logDate." | Cato API Response: (http_code=".$http_code.") ".$response);

if(curl_errno($ch)){
	error_log("CURL ERROR: ".curl_error($ch));
}
curl_close($ch);
header('Content-type: application/json');
error_log($response);
print($response);


?>