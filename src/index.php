<?php
header('Cache-Control: no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
?>
<!DOCTYPE html> 
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<meta HTTP-EQUIV="Pragma" CONTENT="no-cache" />
<meta HTTP-EQUIV="Expires" CONTENT="-1" />
<title>Cato Networks: API Explorer</title>
<link rel="shortcut icon" type="image/ico" href="https://www.catonetworks.com/favicon-32x32.png" />
<link type="text/css" href="css/jquery.gritter.css" rel="stylesheet" />
<link type="text/css" href="css/jquery-ui.min.css" rel="stylesheet" />
<link type="text/css" href="css/jquery-ui.structure.min.css" rel="stylesheet" />
<link type="text/css" href="css/jquery-ui.theme.min.css" rel="stylesheet" />
<script src="js/jquery-3.7.1.min.js"></script>
<script src="js/jquery-ui-1.13.3.js"></script>
<script src="js/plugins/jquery.gritter.js"></script>
<script src="js/plugins/datatables.min.js"></script>
<script src="js/plugins/jquery.datetimepicker.full.js"></script>
<link type="text/css" href="css/common.css" rel="stylesheet" />
<link type="text/css" href="css/jquery.datetimepicker.css" rel="stylesheet" />
<script src="js/settings.js"></script>
<script src="js/countries.js"></script>
<script src="js/timezones.js"></script>
<script src="js/common.js"></script>
<script src="js/cato/cato_enumFunctions.js"></script>
<script src="js/cato/cato_codeExamples.js"></script>
<script src="js/cato/cato_settings_keys.js"></script>
<script src="js/cato/cato_common.js"></script>

<script src="js/cato_pop/d3.js"></script>
<script src="js/cato_pop/leaflet.js"></script>
<script src="js/cato_pop/bootstrap.bundle.min.js"></script>
<link type="text/css" href="css/cato_pop/leaflet.css" rel="stylesheet" />
<!-- <link type="text/css" href="css/cato_pop/bootstrap.min.css" rel="stylesheet" /> -->
<script>
$.extend($.gritter.options, {
	//class_name: 'gritter-light', // for light notifications (can be added directly to $.gritter.add too)
	position: 'top-right', // possibilities: bottom-left, bottom-right, top-left, top-right
	fade_in_speed: 100, // how fast notifications fade in (string or int)
	fade_out_speed: 100, // how fast the notices fade out
	time: 5000 // hang on the screen for...
});
</script>
<style>
textarea { width:510px; height:200px; }
#catoBodyParams select {
    width: 200px;
}

#catoBodyParams input {
    width: 200px;
}

#catoBodyParams select.searchParam {
	width: 165px;
	height: 110px;
}
#catoBodyParams input.searchParam {
	width: 140px;
}

#catoResponseObject textarea {
	width: 350px;
	height: 200px;
}
#catoResponseObject textarea.parent,
#catoBodyParams textarea.parent {
	width: 90%;
	height: 50px;
}

textarea#catoQuery,
textarea#catoResult {
	width: 510px;
	height: 450px;
}
</style>
</head>
<body>
	<div id="wrapper">
		<div id="header" class="ui-widget">
			<div id="logo" class="ui-corner-all dropshadow"></div>
		</div>
		<div id="contentWrapper" class="ui-widget">
			<div id="header_bar" class="ui-widget-header ui-corner-top">
				<h1>Cato API Explorer</h1>
			</div>
			<div id="mainNav" class="ui-widget-content content">
				<ul>
					<li><a id="CatoAPIBtn" href="#CatoAPI">GraphQL API Explorer</a></li>
					<li><a id="CatoPOPsBtn" href="#CatoPOPs">Cato POPs</a></li>
					<li><a id="settingsBtn" href="#settings">Settings</a></li>
				</ul>		
				<div id="CatoAPI">
					<table>
						<tr>
							<td></td>
							<td valign="top">
								<input id="execute" value="execute call" class="disabled button param_link" type="submit" /> 
							</td>
						<tr>
							<td valign="top" style="padding: 0px 10px 0px 0px;">
								<fieldset>
									<legend>API Authentication</legend>
									<table class="tableColL"-->
										<tr><td align="right"><label for="catoServer">Server: </label></td>
										  <td><input id="catoServer" style="width: 200px;" value="https://api.catonetworks.com/api/v1/graphql2" type="text" readonly="readonly" /></td></tr>
										<tr id="catoAccountsListtr">
											<td align="right"><label for="catoApiKeys">API Key: </label></td>
											<td><select name="catoApiKeys" class="cato_api_keys_select" id="catoApiKeys"></select></td>
										</tr>
										<tr id="catoOperationtr">
											<td align="right"><label for="catocatoOperations">API Operations: </label></td>
											<td><select name="catoOperations" class="cato_operations_select" id="catoOperations"></select></td>
										</tr>
									</table>
								</fieldset>
								<fieldset id="catoBodyParams">
									<legend>Input Arguments and Variables</legend>
									<table class="tableColL" id="catoBodyParams_tbl"></table>
								</fieldset>
								<fieldset id="catoResponseObject">
									<legend>Response Object</legend>
									<table class="tableColL" id="catoResponseObject_tbl">
										<tr><td>
											<textarea title="Response Object" class="responseObject bodyParams" name="responseObject" id="responseObject" placeholder="{}" required=""></textarea>
										</td></tr>
									</table>
								</fieldset>
							</td>
							<td valign="top" style="padding: 0px 10px 0px 0px;">
								<fieldset id="catoAPIRequest">
									<legend>API Request</legend>
									<label for="catoQuery">Request Query: </label><span id="catorequestdataspan"></span><br clear="all" />
									<textarea id="catoQuery"></textarea><br clear="all" /><br clear="all" />
									<label for="catoVariables">Request Variables: </label><span id="catorequestdataspan"></span><br clear="all" />
									<textarea id="catoVariables"></textarea><br clear="all" /><br clear="all" />
								</fieldset>
							</td>
							<td valign="top" style="padding: 0px 10px 0px 0px;">
								<fieldset id="catoAPIResponse">
									<legend>API Response</legend>
									<label for="catoResult">Response:</label><br clear="all" />
									<textarea id="catoResult"></textarea><br clear="all" /><br />
									<label for="catoExamplesNav">Code Examples: 
										<span style="float: right;">
											<label for="cato_configMaskSecretKey">Mask secret key: </label>
											<input id="cato_configMaskSecretKey" type="checkbox" checked="checked" value="maskSecretKey" />
										</span><br clear="all" />
									</label>
									<div id="catoExamplesNav" class="ui-widget-content content">
										<ul>
											<li><a id="catoCLIUnixExampleBtn" class="codeExampleBtn" href="#catoCLIUnixExampleDiv">[Cato CLI (unix)]</a></li>
											<li><a id="catoCLIWinExampleBtn" class="codeExampleBtn" href="#catoCLIWinExampleDiv">[Cato CLI (windows)]</a></li>
											<li><a id="catoCurlExampleBtn" class="codeExampleBtn" href="#catoCurlExampleDiv">[CURL]</a></li>
											<li><a id="catoPythonExampleBtn" class="codeExampleBtn" href="#catoPythonExampleDiv">[Python]</a></li>
										</ul>
										<div id="catoCLIUnixExampleDiv" class="codeExample"><textarea readonly id="catoCLIUnixExample" style="height: 60px;"></textarea></div>
										<div id="catoCLIWinExampleDiv" class="codeExample"><textarea readonly id="catoCLIWinExample" style="height: 60px;"></textarea></div>
										<div id="catoCurlExampleDiv" class="codeExample">
											<textarea readonly id="catoCurlExample" style="height: 60px;"></textarea><br clear="all" />
										</div>
										<div id="catoPythonExampleDiv" class="codeExample"><textarea readonly id="catoPythonExample" style="height: 60px;"></textarea></div>
									</div><br clear="all" />
									<a href="https://api.catonetworks.com/documentation/" target="_blank">Cato API Documentation</a><br />
									<a href="https://api.catonetworks.com/api/schema" target="_blank">Cato GraphQL API Schema</a>
								</fieldset>
							</td>
						</tr>
					</table><br clear="all" />
				</div>
				<div id="CatoPOPs">
					
				</div>
				<div id="settings">
					<div id="settingsNav">
						<table>
							<tr valign="top">
								<td style="width: 13em;">		
									<ul>
										<li><span>&nbsp;</span></li>
										<li><a href="#cato_api_keys" title="Manage Cato API Keys">Cato API Keys</a></li>
									</ul>
								</td>
								<td>
									<div id="cato_api_keys">
										<fieldset>
											<legend>Manage Cato API Keys</legend>
											<table id="cato_api_keys_tbl">
												<thead><tr>
													<th>Description</th>
													<th>Account ID</th>
													<th>API KEY</th>
													<th><a id="cato_add_new_api_key" style="padding:0px;" title="Add new Cato API Key" class="ui-icon ui-icon-plusthick"></a></th>
												</tr></thead>
												<tbody></tbody>
											</table>
										</fieldset>
									</div>
								</td>
							</tr>
						</table>
					</div>
				</div>
				<div class="ui-widget-content ui-corner-bottom footer">
					<p><span id="version" style="float: right;"><?=(getenv('VERSION', true) ?: getenv('VERSION'))?></span>Copyright ©<?=date("Y")?> Cato Networks. All Rights Reserved.  <a href="#">Privacy &amp; Legal</a></p>
				</div>
			</div>
			<div id="footer">
			</div>
		</div>
	</div>

<script>
	const map = L.map('CatoPOPs').setView([47.81, 15], 3);
	const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		noWrap: true,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	var catoIcon = L.icon({
		iconUrl: 'images/cato_pop_icon.svg',
		iconSize:     [23, 30], // size of the icon
		iconAnchor:   [22, 50], // point of the icon which will correspond to marker's location
		popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
	});

	const data = d3.csv("ajax/parsed_pop_locations_uniq.csv", function(data) {
			pop_up_desc = "POP: " + data.City
			if (data.Via.length > 0) {
				pop_up_desc += " via " + data.Via
			}
			L.marker([data.Latitude, data.Longitude], {icon: catoIcon}).addTo(map).bindPopup(pop_up_desc);
		}
	)
</script>

</body>
</html>