/* BEGIN Manage User Secion */

function renderApiKeys(){
	if (localStorage.getItem('CATO_API_KEYS') == null) localStorage.setItem('CATO_API_KEYS','{}');
	CATO_API_KEYS = JSON.parse(localStorage.getItem('CATO_API_KEYS'));
	var str = '';
	$.each(CATO_API_KEYS, function(id,usrObj) {
		str += '<tr id="tr_' + usrObj.account_id + '_' + usrObj.api_id + '">' + set_renderApiKeyHTML(usrObj) + '</tr>';
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
	str += '<td>'+renderServers('',null)+'</td>';
	str += '<td><input type="text" class="description" value="" /></td>';
	str += '<td><input type="text" class="account_id" value="" /></td>';
	str += '<td><input type="password" class="api_key" value="" /></td>';
	str += '<td class="td_new_api_key">';
	str += '  <a class="cato_save_api_key ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a class="cato_cancel_api_key ui-icon ui-icon-cancel" title="Cancel"></a>';
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
	var str = '<td>'+renderServers(obj.id+';|;endpoint',usrObj.endpoint)+'</td>';
	str += '<td><input type="text" class="description" name="'+obj.id+';|;description" id="'+obj.id+';|;description" value="'+usrObj.description+'" /></td>';
	str += '<td><input type="text" class="account_id" name="'+obj.id+';|;account_id" id="'+obj.id+';|;account_id" value="'+usrObj.account_id+'" readonly="readonly" /></td>';	
	str += '<td><input type="password" class="api_key" name="' + obj.id + ';|;api_key" id="' + obj.id + ';|;api_key" value="' + usrObj.api_key +'" readonly="readonly" /></td>';	
	str += '<td class="nobr">';
	str += '  <a id="save;|;'+obj.id+'" class="cato_save_api_key ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a id="cancel;|;'+obj.id+'" class="cato_cancel_api_key ui-icon ui-icon-cancel" title="Cancel"></a>';
	str += '</td>';
	$(obj).parent().parent().html(str);
	initApiKeySettingsButtons();
}

function set_cancelApiKey(obj) {
    renderApiKeys();
}

function renderServers(id, selectedServer){
	var str = '<select class="endpoint" name="'+id+'" id="'+id+'">';
	for (var name in catoConfig.servers) {
		server = catoConfig.servers[name];
		str += '<option title="'+name+'" value="'+server+'"';
		if (name == selectedServer) {
			str += ' selected="selected"';
		}
		str += '>'+name+' - '+server+'</option>';
	}
	str += '</select>';
	return str;
}

function set_renderApiKeyHTML(usrObj){
	var str = '<td class="usrattr endpoint">' + (usrObj.endpoint!=undefined ? usrObj.endpoint : "Ireland") +'</td>';
	str += '<td class="usrattr description">' + usrObj.description +'</td>';
	str += '<td class="usrattr account_id">'+usrObj.account_id+'</td>';
	str += '<td class="usrattr api_key">'+starStr.substr(0,usrObj.api_key.length)+'</td>';
	str += '<td id="td_' + usrObj.description + ';|;' + usrObj.account_id + ';|;' + usrObj.api_key + '">';
	str += '  <a id="edit;|;' + usrObj.description + ';|;' + usrObj.account_id + ';|;' + usrObj.api_key +'" class="settings_btn cato_edit_api_key ui-icon ui-icon-pencil" title="Edit"></a>';
	str += '  <a id="del;|;' + usrObj.description + ';|;' + usrObj.account_id + ';|;' + usrObj.api_key +'" class="settings_btn cato_delete_api_key ui-icon ui-icon-trash" title="Delete"></a>';
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
		var usrObj = {
			"endpoint": $('#cato_api_keys_tbl tr.current .endpoint option:selected').attr('title'),
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