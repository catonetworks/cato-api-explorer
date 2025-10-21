/* BEGIN Manage User Secion */

function renderApiKeys(){
	if (localStorage.getItem('CATO_API_KEYS') == null) localStorage.setItem('CATO_API_KEYS','{}');
	CATO_API_KEYS = JSON.parse(localStorage.getItem('CATO_API_KEYS'));
	
	// Sort API keys alphabetically by description name
	var sortedApiKeys = [];
	$.each(CATO_API_KEYS, function(id, usrObj) {
		sortedApiKeys.push({
			id: id,
			usrObj: usrObj
		});
	});
	
	// Sort by description (case-insensitive)
	sortedApiKeys.sort(function(a, b) {
		return a.usrObj.description.toLowerCase().localeCompare(b.usrObj.description.toLowerCase());
	});
	
	// Render sorted API keys
	var str = '';
	$.each(sortedApiKeys, function(i, item) {
		str += '<tr id="tr_' + item.usrObj.account_id + '_' + item.usrObj.api_id + '">' + set_renderApiKeyHTML(item.usrObj) + '</tr>';
	});
	$('#cato_api_keys_tbl tbody').html(str);
	initApiKeySettingsButtons();
	loadCredentials();
}

function initApiKeySettingsButtons(){ // work through adding a new user in UI, and test credentials first
	if ($('#cato_api_keys_tbl tr.current').length==0) {
		$('.cato_delete_api_key').unbind().removeClass('disabled').click(function () { set_deleteApiKey(this); });
		$('.cato_edit_api_key').unbind().removeClass('disabled').click(function () { set_editApiKey(this); });
		$('#cato_add_new_api_key').unbind().removeClass('disabled').click(function () { set_addNewApiKey(this); });
    } else {
		$('.cato_delete_api_key').unbind().addClass('disabled'); 
		$('.cato_edit_api_key').unbind().addClass('disabled'); 
		$('#cato_add_new_api_key').unbind().addClass('disabled'); 
    }
	$('.cato_save_api_key').unbind().click(function(){ set_saveApiKey(this); });
	$('.cato_cancel_api_key').unbind().click(function(){ set_cancelApiKey(this); });
}

function set_addNewApiKey() {
	var str = '<tr class="new_api_key current">';
	str += '<td><input type="text" class="description" value="" /></td>';
	str += '<td>'+renderServers('',null)+'</td>';
	str += '<td><input type="text" class="account_id" value="" /></td>';
	str += '<td><input type="password" class="api_key" value="" /></td>';
	str += '<td class="td_new_api_key">';
	str += '  <button class="cato_save_api_key api-action-btn save-btn" title="Save">Save</button>';
	str += '  <button class="cato_cancel_api_key api-action-btn cancel-btn" title="Cancel">Cancel</button>';
	str += '</td></tr>';
	$('#cato_api_keys_tbl tbody').append(str);
	$('#cato_add_new_api_key').removeClass('highlight');
	initApiKeySettingsButtons();
}

function set_editApiKey(obj) {
	var idsAry = obj.id.split(";|;");
	$(obj).parent().parent().addClass("current");
	CATO_API_KEYS = JSON.parse(localStorage.getItem('CATO_API_KEYS'));
	var usrObj = CATO_API_KEYS[idsAry[2] + ';|;' + idsAry[3]];
	var str = '<td><input type="text" class="description" name="'+obj.id+';|;description" id="'+obj.id+';|;description" value="'+usrObj.description+'" /></td>';
	str += '<td>'+renderServers(obj.id+';|;endpoint',usrObj.endpoint)+'</td>';
	str += '<td><input type="text" class="account_id" name="'+obj.id+';|;account_id" id="'+obj.id+';|;account_id" value="'+usrObj.account_id+'" readonly="readonly" /></td>';	
	str += '<td><input type="password" class="api_key" name="' + obj.id + ';|;api_key" id="' + obj.id + ';|;api_key" value="' + usrObj.api_key +'" readonly="readonly" /></td>';	
	str += '<td class="nobr">';
	str += '  <button id="save;|;'+obj.id+'" class="cato_save_api_key api-action-btn save-btn" title="Save">Save</button>';
	str += '  <button id="cancel;|;'+obj.id+'" class="cato_cancel_api_key api-action-btn cancel-btn" title="Cancel">Cancel</button>';
	str += '</td>';
	$(obj).parent().parent().html(str);
	initApiKeySettingsButtons();
}

function set_cancelApiKey(obj) {
    renderApiKeys();
}

function renderServers(id, selectedServer){
	// Create a text input with datalist for autocomplete
	var datalistId = id + '_datalist';
	var str = '<input type="text" list="' + datalistId + '" class="endpoint" name="'+id+'" id="'+id+'" placeholder="Select or enter custom endpoint" ';
	
	// Set the value - always use the actual URL
	if (selectedServer) {
		// Check if it's a known server name (stored value) and convert to URL
		var serverUrl = selectedServer;
		if (catoConfig.servers[selectedServer]) {
			// It's a known server name, get the URL
			serverUrl = catoConfig.servers[selectedServer];
		}
		// Always populate with the actual URL
		str += 'value="' + serverUrl + '"';
	}
	str += ' />';
	
	// Add datalist with predefined options - use URLs as values
	str += '<datalist id="' + datalistId + '">';
	for (var name in catoConfig.servers) {
		server = catoConfig.servers[name];
		str += '<option value="' + server + '">' + name + ' - ' + server + '</option>';
	}
	str += '</datalist>';
	return str;
}

function set_renderApiKeyHTML(usrObj){
	var str = '<td class="usrattr description">' + usrObj.description +'</td>';
	// Display the endpoint - convert server names to URLs
	var displayEndpoint = usrObj.endpoint;
	if (!displayEndpoint) {
		// No endpoint stored, use default
		displayEndpoint = 'https://api.catonetworks.com/api/v1/graphql2';
	} else if (catoConfig.servers[displayEndpoint]) {
		// It's a known server name, convert to URL
		displayEndpoint = catoConfig.servers[displayEndpoint];
	}
	// Otherwise it's already a custom URL, use as-is
	str += '<td class="usrattr endpoint">' + displayEndpoint +'</td>';
	str += '<td class="usrattr account_id">'+usrObj.account_id+'</td>';
	str += '<td class="usrattr api_key">'+starStr.substr(0,usrObj.api_key.length)+'</td>';
	str += '<td id="td_' + usrObj.description + ';|;' + usrObj.account_id + ';|;' + usrObj.api_key + '">';
	str += '  <button id="edit;|;' + usrObj.description + ';|;' + usrObj.account_id + ';|;' + usrObj.api_key +'" class="settings_btn cato_edit_api_key api-action-btn cancel-btn" title="Edit"><span class="ui-icon ui-icon-pencil"></span>Edit</button>';
	str += '  <button id="del;|;' + usrObj.description + ';|;' + usrObj.account_id + ';|;' + usrObj.api_key +'" class="settings_btn cato_delete_api_key api-action-btn delete-btn" title="Delete"><span class="ui-icon ui-icon-trash"></span>Delete</button>';
	str += '</td>';
	return str;
}

function set_saveApiKey(obj) {
	$(obj).parent().parent().addClass("current");
	var query = fmtQuery(`{
		"query":"query accountSnapshot( $accountID:ID! ) {
			accountSnapshot( accountID:$accountID ){ 
				id 
			}
		}",
		"variables":{
			"accountID":` + $('#cato_api_keys_tbl tr.current .account_id').val() +`
		},
		"operationName":"accountSnapshot"
	}`);
	
	// var query = fmtQuery(`{"query":"{ 
	// 	accountSnapshot( 
	// 		accountID: ` + $('#cato_api_keys_tbl tr.current .account_id').val() +` 
	// 	){ id } 
	// }"}`);
	$.gritter.add({ title: 'Saving User', text: 'Testing credentials on account ID "'+$('#cato_api_keys_tbl tr.current .account_id').val()+'".'});
	makeCall(set_saveApiKeyResponse, query, 'set', $('#cato_api_keys_tbl tr.current .api_key').val(),$('#cato_api_keys_tbl tr.current .account_id').val(),$('#cato_api_keys_tbl tr.current .endpoint').val());
}

function set_saveApiKeyResponse(response){
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });		
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		CATO_API_KEYS = JSON.parse(localStorage.getItem('CATO_API_KEYS'));
		// Get the endpoint value from the text input (which is now always a URL)
		var endpointValue = $('#cato_api_keys_tbl tr.current .endpoint').val();
		// Check if the URL matches a known server, store the name if so, otherwise store the custom URL
		var endpointToStore = endpointValue;
		for (var name in catoConfig.servers) {
			if (catoConfig.servers[name] === endpointValue) {
				// Store the server name for known servers
				endpointToStore = name;
				break;
			}
		}
		var usrObj = {
			"endpoint": endpointToStore,
			"description": $('#cato_api_keys_tbl tr.current .description').val(),
			"account_id":$('#cato_api_keys_tbl tr.current .account_id').val(),
			"api_key":$('#cato_api_keys_tbl tr.current .api_key').val()
		}
		var api_key_id = $('#cato_api_keys_tbl tr.current .account_id').val() + ";|;" + $('#cato_api_keys_tbl tr.current .api_key').val();
		CATO_API_KEYS[api_key_id] = usrObj;
		localStorage.setItem('CATO_API_KEYS', JSON.stringify(CATO_API_KEYS));
		$.gritter.add({ title: 'SUCCESS', text: 'API Key "'+$('#cato_api_keys_tbl tr.current .description').val()+'" successfully saved'});
		renderApiKeys();
	}
}
function set_deleteApiKey(obj){
	var idsAry = obj.id.split(";|;");
	CATO_API_KEYS = JSON.parse(localStorage.getItem('CATO_API_KEYS'));
	if (confirm('Are you sure you want delete the "' + idsAry[1] +'" api_key on account_id '+idsAry[2]+'?')) {
		if (CATO_API_KEYS[idsAry[2] + ';|;' + idsAry[3]]!=undefined) {
			delete CATO_API_KEYS[idsAry[2] + ';|;' + idsAry[3]];
			localStorage.setItem('CATO_API_KEYS', JSON.stringify(CATO_API_KEYS));
			renderApiKeys();
		} else {
			$.gritter.add({ title: 'API Key not found', text: "User with api_id: "+idsAry[1]+" currently not stored locally."});
		}
	}
}