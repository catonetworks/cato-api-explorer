var starStr = '******************************************************************************************************';
var responseObj = {};

$().ready(function() {
	$("#mainNav").tabs();
	$("#catoExamplesNav").tabs();	
	$("#settingsNav").tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
	$("#settingsNav li").removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );

	$(".codeExampleBtn").click(function(){ 
		var curId = this.id.substr(0,this.id.length-3);
		var textarea = $("#"+curId);
		// Allow natural textarea sizing - no auto-height adjustment
		// Users can now manually resize both horizontally and vertically
	});
	$('.param_link').button();
});

function clearAllFields() {
	$('#catoResult').val('');
}

function populateSelect(id,listObj){
	$('#'+id).html('');
	$.each(listObj,function(key, ary){
		if (ary.length!=0 && key!='errors') {
			ary.sort();
			$.each(ary,function(j, val){
				$('#'+id).append('<option value="'+val+'">'+val+'</option>');
			});
		} else {
			$('#'+id).html('<option>Not Currently Available</option>');
		}
	});
}

function transformToCURL(requestUrl,reqObj){
	var data = '';
	$.each(reqObj, function(param,val) {
		if (data!='') data += '&';
		data += param+'='+val;
	});
	return "curl '"+requestUrl+"' --data '"+data+"'";
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function isValidIP(ip) {
	// Regular expression to validate IP address
	const ipRegex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
	return ipRegex.test(ip);
}

function isValidIPRange(ip) {
	// Regular expression to validate IP address
	const ipRegex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])-(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
	return ipRegex.test(ip);
}

function isValidSubnet(subnet) {
	// Regular expression to validate subnet range in CIDR notation
	// const subnetRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]))\/([0-9]|[1-2][0-9]|3[0-2])$/;
	// return subnetRegex.test(subnet);
	return subnet
}

function filterStr(str){
	if (str == undefined) str=""
	str = str.replaceAll("<a href=","");
	str = str.replaceAll("<a href=","");
	str = str.replaceAll("</a>","");
	str = str.replaceAll("<br/>","\n");
	str = str.replaceAll("<ul>","\n").replaceAll("</ul>","");
	str = str.replaceAll("</li>","").replaceAll("<li>","\n • ");
	str = str.replaceAll("<b>","").replaceAll("</b>"," - ");
	str = str.replaceAll("<","");
	str = str.replaceAll(">","");
	str = str.replaceAll("'","");
	str = str.replaceAll('"',"");
	str = str.replaceAll('\t', " ");
	str = str.replaceAll('\n', " ");
	str = str.replaceAll('\r', " ");
	return str;
}

function fmtQuery(str){
	return str.replace(/[\n\r\t]/g, ' ').replace("        ", ' ').replace("    ", ' ').replace("  ", ' ').replace("  ", ' ');
}

function toggleShowNestedParams(id) {
	var fieldset = $('#' + id + '_fieldset');
	var toggleLink = $('#' + id + '_toggle');
	var buttonsRow = $('#' + id + '_buttons_row');
	if (fieldset.length > 0) {
		if (fieldset.css('display') == 'none') {
			// Show the fieldset and buttons, hide the toggle link
			fieldset.show();
			buttonsRow.show();
			toggleLink.hide();
			console.log('Showing fieldset and buttons');
		} else {
			// Hide the fieldset and buttons, show the toggle link
			fieldset.hide();
			buttonsRow.hide();
			toggleLink.show();
			console.log('Hiding fieldset and buttons');
		}
	} else {
		console.error('Fieldset not found for id:', id);
	}
}

function setNestedBodyParams(curObject, curPathAry, param) {
	if (curPathAry.length > 1) {
		var parentName = curPathAry.shift();
		if (curObject[parentName] == undefined) curObject[parentName] = {};
		curObject[parentName] = setNestedBodyParams(curObject[parentName], curPathAry, param);
	} else {
		var paramName = ((param.id.includes("___")) ? param.id.split("___").pop() : param.id);
		var val = parseParamValue($('#' + param.id));
		if (val != null) curObject[paramName] = val;
	}
	return curObject;
}
