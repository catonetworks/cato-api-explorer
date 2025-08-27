<?php
header('Content-Type: text/html; charset=UTF-8');
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
<meta charset="UTF-8">
<title>Cato Networks: API Explorer</title>

<script src="js/cato_pop/d3.js"></script>
<script src="js/cato_pop/leaflet.js"></script>
<!-- <script src="js/cato_pop/bootstrap.bundle.min.js"></script> -->
<link type="text/css" href="css/cato_pop/leaflet.css" rel="stylesheet" />
<!-- <link type="text/css" href="css/cato_pop/bootstrap.min.css" rel="stylesheet" /> -->

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
/* Basic layout styles */
body, html {
	margin: 0;
	padding: 0;
	height: 100%;
	overflow-x: auto;
	/* Cato Networks website background */
	background: linear-gradient(0deg,#0e3046,#2f7a5b);
	background-attachment: fixed;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#wrapper {
	height: 100vh;
	display: flex;
	flex-direction: column;
}

/* Cato Networks Header Styling */
#header {
	background: #FFF;
	border-bottom: 3px solid #00d4aa;
	border-radius: 0 0 3rem 3rem;
    padding-bottom: 9px;
    padding-inline-end: 9px;
    padding-inline-start: 20px;
    padding-top: 9px;
}

#logo {
	display: flex;
	align-items: left;
	justify-content: left;
	width: auto;
	position: relative;
}

#logo img {
	height: 32px;
	width: auto;
	position: absolute;
	left: 0;
}

#logo .logo-text {
	color: #158864;
	font-size: 30px;
	font-weight: 600;
	margin: 0;
	text-align: center;
	padding-left: 90px;
	padding-top: 5px;
}

#header_bar {
	background: linear-gradient(90deg, #00d4aa 0%, #1a73e8 100%);
	color: white;
	padding: 15px 20px;
	border: none;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#header_bar h1 {
	margin: 0;
	font-size: 28px;
	font-weight: 600;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

#contentWrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

#mainNav {
	flex: 1;
	overflow: hidden !important;
	overflow-x: hidden !important;
	overflow-y: hidden !important;
	position: relative;
	height: 100%;
	max-height: 100% !important;
}

/* Make navigation tabs sticky */
#mainNav > ul {
	position: sticky;
	top: 0;
	z-index: 100;
	background: white;
	border-bottom: 2px solid #00d4aa;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	margin: 0;
	padding: 0;
}

/* Make content area scrollable */
#CatoAPI {
	height: calc(100vh - 160px); /* Adjust based on header heights */
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	padding: 0 5px !important;
}

#CatoAPI > table {
	flex: 1;
	height: 100%;
	table-layout: fixed;
	border-spacing: 10px;
}

#CatoAPI > table > tbody > tr:nth-child(2) {
	height: 100%;
}

/* Column widths - Even distribution across three columns */
#CatoAPI > table > tbody > tr:nth-child(2) > td:nth-child(1) {
	width: 33.333%;
	min-width: 350px;
	vertical-align: top;
}

#CatoAPI > table > tbody > tr:nth-child(2) > td:nth-child(2),
#CatoAPI > table > tbody > tr:nth-child(2) > td:nth-child(3) {
	width: 33.333%;
	vertical-align: top;
}

/* Fieldset styling */
fieldset {
	display: flex;
	flex-direction: column;
	margin-bottom: 10px;
	box-sizing: border-box;
}

/* Left column fieldsets - fit content only */
fieldset:not(#catoAPIRequest):not(#catoAPIResponse) {
	height: auto;
	min-height: auto;
	flex-shrink: 0;
}

/* Request and Response fieldsets - take remaining space */
#catoAPIRequest,
#catoAPIResponse {
	height: calc(100vh - 200px);
	min-height: 500px;
	flex: 1;
}

/* Textarea styling */
textarea {
	width: 100%;
	height: 200px;
	box-sizing: border-box;
	resize: vertical;
	font-family: 'Courier New', monospace;
	font-size: 12px;
}

textarea#catoQuery,
textarea#catoVariables {
	height: 45%;
	min-height: 150px;
	max-height: 500px;
}

textarea#catoResult {
	flex: 1;
	min-height: 200px;
	resize: both;
}

/* Form element styling */
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
	width: 100%;
	height: 200px;
}
#catoResponseObject textarea.parent,
#catoBodyParams textarea.parent {
	width: 90%;
	height: 50px;
}

/* Code examples styling */
.codeExample textarea {
	height: 60px;
	width: 100%;
	min-height: 40px;
}

/* Searchable dropdown styles */
.searchable-dropdown {
	position: relative;
	width: 200px;
	display: inline-block;
}

.searchable-dropdown input {
	width: 200px;
	padding: 4px 8px;
	border: 1px solid #ccc;
	border-radius: 4px;
	box-sizing: border-box;
}

.dropdown-options {
	position: absolute;
	top: 100%;
	left: 0;
	min-width: 100%;
	max-width: 600px;
	max-height: min(70vh, 600px); /* Use 70% of viewport height or 600px, whichever is smaller */
	overflow-y: auto;
	background: white;
	border: 1px solid #ccc;
	border-top: none;
	border-radius: 0 0 4px 4px;
	z-index: 1000;
	display: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	white-space: nowrap;
}

.dropdown-options.show {
	display: block;
}

.dropdown-group {
	border-bottom: 1px solid #eee;
}

.dropdown-group:last-child {
	border-bottom: none;
}

.dropdown-group-header {
	padding: 6px 12px;
	background: #f5f5f5;
	font-weight: bold;
	font-size: 12px;
	color: #666;
	border-bottom: 1px solid #ddd;
}

.dropdown-option {
	padding: 8px 12px;
	cursor: pointer;
	border-bottom: 1px solid #eee;
	color: #333;
	font-size: 13px;
}

.dropdown-option:last-child {
	border-bottom: none;
}

.dropdown-option:hover,
.dropdown-option.highlighted {
	background-color: #e6f3ff;
	color: #0066cc;
}

.dropdown-option.selected {
	background-color: #0066cc;
	color: white;
}

.no-results {
	padding: 12px;
	text-align: center;
	color: #666;
	font-style: italic;
}
</style>
</head>
<body>
	<div id="wrapper">
		<div id="header">
			<div id="logo">
				<span class="logo-text">| Cato API Explorer</span>
			</div>
		</div>
		<div id="contentWrapper" class="ui-widget">
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
										<tr id="catoAccountsListtr">
											<td align="right"><label for="catoApiKeys">API Key: </label></td>
											<td><select name="catoApiKeys" class="cato_api_keys_select" id="catoApiKeys"></select></td>
										</tr>
										<tr><td align="right"><label for="catoServer">Server: </label></td>
										  <td><select id="catoServer" style="width: 200px;"></select></td></tr>
										<tr id="catoOperationtr">
											<td align="right"><label for="catoOperations">API Operations: </label></td>
											<td>
												<div class="searchable-dropdown">
													<input type="text" name="catoOperations" class="cato_operations_select" id="catoOperations" placeholder="Select an API operation..." autocomplete="off" />
													<div class="dropdown-options" id="catoOperationsDropdown"></div>
												</div>
											</td>
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
													<th>Endpoint</th>
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
			</div>
			<div id="footer">
				<div class="ui-widget-content ui-corner-bottom footer">
					<p><span id="version" style="float: right;"><?=(getenv('VERSION', true) ?: getenv('VERSION'))?></span>Copyright ©<?=date("Y")?> Cato Networks. All Rights Reserved.  <a href="https://www.catonetworks.com/privacypolicy/">Privacy &amp; Legal</a></p>
				</div>
			</div>
		</div>
	</div>

<script>
// Searchable dropdown functionality
var searchableDropdown = {
	allOptions: [],
	filteredOptions: [],
	currentHighlight: -1,
	selectedValue: '',

	init: function() {
		var $input = $('#catoOperations');
		var $dropdown = $('#catoOperationsDropdown');
		
		// Input event handlers
		$input.on('input', this.handleInput.bind(this));
		$input.on('focus', this.handleFocus.bind(this));
		$input.on('blur', this.handleBlur.bind(this));
		$input.on('keydown', this.handleKeydown.bind(this));
		
		// Click outside to close
		$(document).on('click', function(e) {
			if (!$(e.target).closest('.searchable-dropdown').length) {
				$dropdown.removeClass('show');
			}
		});
	},

	setOptions: function(optionsData) {
		this.allOptions = optionsData;
		this.filteredOptions = [...optionsData];
		this.renderOptions();
	},

	handleInput: function(e) {
		var searchTerm = e.target.value.toLowerCase();
		this.filterOptions(searchTerm);
		this.currentHighlight = -1;
		this.renderOptions();
		$('#catoOperationsDropdown').addClass('show');
	},

	handleFocus: function(e) {
		this.filterOptions(e.target.value.toLowerCase());
		this.renderOptions();
		$('#catoOperationsDropdown').addClass('show');
	},

	handleBlur: function(e) {
		// Delay hiding to allow clicks on dropdown items
		setTimeout(function() {
			$('#catoOperationsDropdown').removeClass('show');
		}, 150);
	},

	handleKeydown: function(e) {
		var $dropdown = $('#catoOperationsDropdown');
		
		switch(e.key) {
			case 'ArrowDown':
				e.preventDefault();
				this.currentHighlight = Math.min(this.currentHighlight + 1, this.filteredOptions.length - 1);
				this.updateHighlight();
				break;
			case 'ArrowUp':
				e.preventDefault();
				this.currentHighlight = Math.max(this.currentHighlight - 1, -1);
				this.updateHighlight();
				break;
			case 'Enter':
				e.preventDefault();
				if (this.currentHighlight >= 0 && this.currentHighlight < this.filteredOptions.length) {
					this.selectOption(this.filteredOptions[this.currentHighlight]);
				}
				break;
			case 'Escape':
				$dropdown.removeClass('show');
				$('#catoOperations').blur();
				break;
		}
	},

	filterOptions: function(searchTerm) {
		if (!searchTerm) {
			this.filteredOptions = [...this.allOptions];
		} else {
			this.filteredOptions = this.allOptions.filter(function(option) {
				return option.value.toLowerCase().includes(searchTerm) || 
					   option.text.toLowerCase().includes(searchTerm);
			});
		}
	},

	renderOptions: function() {
		var $dropdown = $('#catoOperationsDropdown');
		var $input = $('#catoOperations');
		$dropdown.empty();

		if (this.filteredOptions.length === 0) {
			$dropdown.append('<div class="no-results">No matching operations found</div>');
			return;
		}

		var currentGroup = '';
		var optionIndex = 0;
		var maxWidth = 0;
		
		// Create a temporary element to measure text width
		var $measurer = $('<div style="position: absolute; visibility: hidden; white-space: nowrap; font-size: 13px; padding: 8px 12px;"></div>').appendTo('body');
		
		this.filteredOptions.forEach(function(option, index) {
			if (option.group !== currentGroup) {
				currentGroup = option.group;
				$dropdown.append('<div class="dropdown-group-header">' + currentGroup + '</div>');
				
				// Measure group header width
				$measurer.text(currentGroup);
				maxWidth = Math.max(maxWidth, $measurer.outerWidth());
			}
			
			var $option = $('<div class="dropdown-option" data-value="' + option.value + '">' + option.text + '</div>');
			$option.on('click', function() {
				searchableDropdown.selectOption(option);
			});
			
			// Measure option width
			$measurer.text(option.text);
			maxWidth = Math.max(maxWidth, $measurer.outerWidth());
			
			$dropdown.append($option);
			optionIndex++;
		});
		
		// Remove the measurer
		$measurer.remove();
		
		// Set the dropdown width to fit content, but respect min/max constraints
		var inputWidth = $input.outerWidth();
		var dropdownWidth = Math.max(inputWidth, Math.min(maxWidth + 20, 600)); // Add 20px for padding/scrollbar
		
		$dropdown.css('width', dropdownWidth + 'px');
	},

	updateHighlight: function() {
		var $options = $('#catoOperationsDropdown .dropdown-option');
		$options.removeClass('highlighted');
		
		if (this.currentHighlight >= 0 && this.currentHighlight < $options.length) {
			$options.eq(this.currentHighlight).addClass('highlighted');
			// Scroll into view if needed
			var highlightedOption = $options.eq(this.currentHighlight)[0];
			if (highlightedOption) {
				highlightedOption.scrollIntoView({ block: 'nearest' });
			}
		}
	},

	selectOption: function(option) {
		this.selectedValue = option.value;
		$('#catoOperations').val(option.text);
		$('#catoOperationsDropdown').removeClass('show');
		
		// Trigger change event to maintain compatibility with existing code
		$('#catoOperations').trigger('change');
	},

	getValue: function() {
		return this.selectedValue;
	},

	setValue: function(value, text) {
		this.selectedValue = value || '';
		$('#catoOperations').val(text || '');
	},

	clear: function() {
		this.selectedValue = '';
		$('#catoOperations').val('');
		$('#catoOperationsDropdown').removeClass('show');
	}
};

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