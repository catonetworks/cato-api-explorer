<?
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

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

// Forward x-force-tracing header if present
if (isset($headers['X-Force-Tracing'])) {
	$post_headers[] = 'x-force-tracing: '.$headers['X-Force-Tracing'];
}

$ch = curl_init($server);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
curl_setopt($ch, CURLOPT_HEADER, 1); // Include headers in output
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$response_headers = substr($response, 0, $header_size);
$response_body = substr($response, $header_size);

error_log($logDate." | Cato API Response: (http_code=".$http_code.") ".$response_body);

// Parse response headers to extract trace_id
$trace_id = null;
if (preg_match('/trace_id: ([^\r\n]+)/i', $response_headers, $matches)) {
	$trace_id = trim($matches[1]);
}

if(curl_errno($ch)){
	error_log("CURL ERROR: ".curl_error($ch));
}
curl_close($ch);

// Set response headers
header('Content-type: application/json');
if ($trace_id) {
	header('X-Trace-ID: ' . $trace_id);
}

error_log($response_body);
print($response_body);


?>