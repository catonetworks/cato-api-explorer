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
<script>
// Inject version from Docker environment variable
window.DOCKER_VERSION = '<?=(getenv('VERSION', true) ?: getenv('VERSION') ?: '1.0.9')?>';
</script>
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
</head>
<body>
	<div id="wrapper">
		<!-- Top Header -->
		<div id="topHeader">
			<div class="header-left">
				<span class="logo-text">Cato API Explorer</span>
			</div>
			<div class="header-right">
				<a href="#settings" class="header-btn" id="settingsBtn">Settings</a>
				<a href="https://api.catonetworks.com/documentation/" target="_blank" class="header-btn primary">Documentation</a>
				<div title="Change Mode (Dark/Light)" class="header-btn theme-toggle" onclick="toggleTheme()">🌙</div>
			</div>
		</div>
		
		<div id="contentWrapper" class="ui-widget">
			<div id="mainNav" class="ui-widget-content content">
				<ul>
					<li><a id="CatoAPIBtn" href="#CatoAPI">GraphQL API</a></li>
					<li><a id="CatoPOPsBtn" href="#CatoPOPs">Cato POPs</a></li>
					<li class="hidden-tab"><a id="settingsTabBtn" href="#settings">Settings</a></li>
				</ul>
				<div id="CatoAPI">
					<table>
						<tr>
							<td valign="top" style="padding: 0px 10px 0px 0px;" id="api-authentication-column">
								<div class="fieldset-header">API Authentication</div>
								<fieldset>
									<table class="tableColL">
										<tr id="catoAccountsListtr">
											<td><label for="catoApiKeys">API Key</label></td>
											<td><select name="catoApiKeys" class="cato_api_keys_select" id="catoApiKeys"></select></td>
										</tr>
										<tr>
											<td><label for="catoServer">Server</label></td>
											<td><select id="catoServer" style="width: 200px;"></select></td>
										</tr>
										<tr id="catoOperationtr">
											<td><label for="catoOperations">API Operation</label></td>
											<td>
												<div class="searchable-dropdown">
													<input type="text" name="catoOperations" class="cato_operations_select" id="catoOperations" placeholder="Select an API operation..." autocomplete="off" />
													<div class="dropdown-options" id="catoOperationsDropdown"></div>
												</div>
											</td>
										</tr>
									</table>
								</fieldset><br />
								<div class="fieldset-header">Input Arguments</div>
								<fieldset id="catoBodyParams">
									<table class="tableColL" id="catoBodyParams_tbl"></table>
								</fieldset>
							</td>
							<td valign="top" style="padding: 0px 10px 0px 0px;" id="graphql-query-column">
								<div class="fieldset-header">
									<span>GraphQL Query</span>
									<button class="collapse-button expanded" title="Collapse/Expand GraphQL Query"></button>
								</div>
								<fieldset id="catoAPIRequest">
									<label for="catoQuery">Request Query</label><span id="catorequestdataspan"></span>
									<textarea id="catoQuery"></textarea>
									<label for="catoVariables">Request Variables</label><span id="catorequestdataspan"></span>
									<textarea id="catoVariables"></textarea>
									<div style="text-align: center; margin-top: 16px;">
										<input id="execute" value="Execute Query" class="disabled button param_link" type="submit" /> 
									</div>
								</fieldset>
							</td>
							<td valign="top" style="padding: 0px 10px 0px 0px;" id="api-response-column">
								<div class="fieldset-header">
									<span>API Response</span>
									<button class="collapse-button expanded" title="Collapse/Expand API Response"></button>
								</div>
								<fieldset id="catoAPIResponse">
									<label for="catoResult">Response</label>
									<textarea id="catoResult" placeholder="Execute query to see response..."></textarea>
									<div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 0 8px 0;">
										<label for="catoExamplesNav">Code Examples</label>
										<div style="display: flex; align-items: center; gap: 8px;">
											<label for="cato_configMaskSecretKey" style="font-size: 12px; font-weight: normal;">Mask secret key</label>
											<input id="cato_configMaskSecretKey" type="checkbox" checked="checked" value="maskSecretKey" />
										</div>
									</div>
									<div id="catoExamplesNav" class="ui-widget-content content">
										<ul>
											<li><a id="catoCLIUnixExampleBtn" class="codeExampleBtn" href="#catoCLIUnixExampleDiv">Cato CLI (Unix)</a></li>
											<li><a id="catoCLIWinExampleBtn" class="codeExampleBtn" href="#catoCLIWinExampleDiv">Cato CLI (PowerShell)</a></li>
											<li><a id="catoPythonExampleBtn" class="codeExampleBtn" href="#catoPythonExampleDiv">Python</a></li>
											<li><a id="catoCurlExampleBtn" class="codeExampleBtn" href="#catoCurlExampleDiv">cURL</a></li>
										</ul>
										<div id="catoCLIUnixExampleDiv" class="codeExample"><textarea readonly id="catoCLIUnixExample" style="height: 60px;"></textarea></div>
										<div id="catoCLIWinExampleDiv" class="codeExample"><textarea readonly id="catoCLIWinExample" style="height: 60px;"></textarea></div>
										<div id="catoCurlExampleDiv" class="codeExample">
											<textarea readonly id="catoCurlExample" style="height: 60px;"></textarea><br clear="all" />
										</div>
									<div id="catoPythonExampleDiv" class="codeExample"><textarea readonly id="catoPythonExample" style="height: 60px;"></textarea></div>
								</div>
								</fieldset>
							</td>
						</tr>
					</table><br clear="all" />
				</div>
				<div id="CatoPOPs">
					
				</div>
				<div id="settings">
					<div id="cato_api_keys">
						<fieldset>
							<table id="cato_api_keys_tbl">
								<thead><tr>
									<th>Name</th>
									<th>Endpoint</th>
									<th>Account ID</th>
									<th>API KEY</th>
									<th><button id="cato_add_new_api_key" class="api-action-btn add-btn" title="Add new Cato API Key">Add</button></th>
								</tr></thead>
								<tbody></tbody>
							</table>
						</fieldset>
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

	// Theme Management
	function toggleTheme() {
		const html = document.documentElement;
		const currentTheme = html.getAttribute('data-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		
		html.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
		
		// Update theme toggle button
		const themeToggle = document.querySelector('.theme-toggle');
		themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
	}

	// Initialize theme from localStorage
	function initializeTheme() {
		const savedTheme = localStorage.getItem('theme');
		// Default to dark theme to match the design
		const theme = savedTheme || 'dark';
		
		document.documentElement.setAttribute('data-theme', theme);
		const themeToggle = document.querySelector('.theme-toggle');
		if (themeToggle) {
			themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
		}
	}

	// Initialize theme on page load
	document.addEventListener('DOMContentLoaded', initializeTheme);
	
	// Handle Settings button in header
	$(document).ready(function() {
		$('#topHeader #settingsBtn').click(function(e) {
			e.preventDefault();
			$('#mainNav').tabs('option', 'active', 2); // Activate Settings tab
		});
	});

	// Make functions global
	window.toggleTheme = toggleTheme;

</script>

</body>
</html>