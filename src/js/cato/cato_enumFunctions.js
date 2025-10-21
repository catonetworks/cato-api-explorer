// searchField
function getSiteIDs(paramActionObj, paramName) {
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query entityLookup ( $accountID:ID! $type:EntityType! $limit:Int $search:String ) {
				entityLookup ( accountID:$accountID type:$type limit:$limit search:$search  ) {
				items  {
					entity {
						id
						name
						type
					}
					description
					helperFields
				}
				total
			}
		}",
		"variables":{
			"accountID": `+ userObj.account_id + `,
		    "type": "site",
		    "limit": 1000,
		    "search": "`+ paramActionObj.searchStr +`"
		},
		"operationName":"entityLookup"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getSiteIDsResponse(response,paramName){
	$('#' + paramName + '_search').removeClass('loading');
	var source = $("#" + paramName + "_left");
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		$(source).html('');
		var desOptions = $.map($(dest).find("option"), function (option) { return option.value; });
		$.each(response.data.entityLookup.items, function (i, item) {
			if (!desOptions.includes(String(item.entity.id))) { 
				$("#" + paramName + "_left").append('<option value="' + item.entity.id + '">' + item.entity.name + ' - ' + item.helperFields.type + ' (' + item.entity.id + ')</option>');
			}
		});
	}
}

// accountID.default.function()
// function populateAccountID(input_id){
// 	var userObj = getCurApiKey();
// 	if (userObj.account_id){
// 		$("#" + input_id).html('<option value="'+userObj.account_id+'">'+userObj.account_id+'</option>');
// 	}
// }

// subdomains.default.function()
function getAccountIDs(paramActionObj, paramName) {
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query entityLookup ( $accountID:ID! $type:EntityType! ) {
				entityLookup ( accountID:$accountID type:$type  ) {
				items  {
					entity {
						id 
						name 
						type 
					}
					description
					helperFields
				}
				total 
			}	
		}",
		"variables":{
			"accountID": "`+ filterStr(userObj.account_id) + `",
			"from": 0,
			"limit": 1000,
			"type": "account"
		},
		"operationName":"entityLookup"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getAccountIDsResponse(response, paramName) {
	var userObj = getCurApiKey()
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		$(dest).html('<option value="'+userObj.account_id+'">'+userObj.description+' ('+userObj.account_id+')</option>');
		$.each(response.data.entityLookup.items, function (i, item) {
			dest.append('<option value="' + item.entity.id + '">' + item.entity.name+' ('+item.entity.id+')</option>');
		});
	}
	updateRequestData();
}

// adminID.default.function()
function getAdminIDs(paramActionObj, paramName) {
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query entityLookup ( $accountID:ID! $type:EntityType! ) {
				entityLookup ( accountID:$accountID type:$type  ) {
				items  {
					entity {
						id 
						name 
						type 
					}
					description
					helperFields
				}
				total 
			}	
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `,
			"type": "admin",
			"limit": 1000
		},
		"operationName":"entityLookup"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getAdminIDsResponse(response, paramName) {
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		dest.html('<otion value="">-- select --</option>');
		$.each(response.data.entityLookup.items, function (i, item) {
			dest.append('<option value="' + item.entity.id + '">' + item.description + ' - '+item.entity.name+' ('+item.entity.id+')</option>');
		});
	}
	updateRequestData();
}

// lanSocketInterfaceId.default.function()
function getlanSocketInterfaceIds(paramActionObj, paramName) {
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query entityLookup ( $accountID:ID! $type:EntityType! ) {
				entityLookup ( accountID:$accountID type:$type  ) {
				items  {
					entity {
						id 
						name 
						type 
					}
					description
					helperFields
				}
				total 
			}	
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `,
			"type": "networkInterface",
			"limit": 1000
		},
		"operationName":"entityLookup"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getlanSocketInterfaceIdsResponse(response, paramName) {
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$(dest).addClass("error");
	} else {
		var str = (dest.attr("required")) ? "" : '<option value="">-- select --</option>';
		var optionsAry = {};
		$.each(response.data.entityLookup.items, function (i, item) {
			if (!optionsAry[item.helperFields.siteName]) optionsAry[item.helperFields.siteName] = {};
			optionsAry[item.helperFields.siteName][item.helperFields.interfaceName] = {"id":item.entity.id,"subnet":item.helperFields.subnet};	
		});
		$.each(optionsAry, function (siteName, interfaceAry) {
			str += '<optgroup label="Site: ' + siteName + '">';
			$.each(interfaceAry, function (interfaceName, interfaceObj) {
				str += '<option value="' + interfaceObj.id + '">Interface: ' + interfaceName + ' (' + interfaceObj.subnet + ')</option>';
			});
			str += '</optgroup>'
		});
		$(dest).html(str).removeClass("error");
	}
}

// networkRangeId.default.function()
function getNetworkRangeIds(paramActionObj, paramName) {
	$('#' + paramName + 'xxsearch').removeClass('loading');
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query entityLookup ( $accountID:ID! $type:EntityType! ) {
				entityLookup ( accountID:$accountID type:$type  ) {
				items  {
					entity {
						id 
						name 
					}
					helperFields
					description
				}
			}	
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `,
			"type": "siteRange",
			"limit": 1000
		},
		"operationName":"entityLookup"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getNetworkRangeIdsResponse(response, paramName) {
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$(dest).addClass("error");
	} else {
		var str = (dest.attr("required")) ? "" : '<option value="">-- select --</option>';
		var optionsAry = {};
		$.each(response.data.entityLookup.items, function (i, item) {
			if (!optionsAry[item.helperFields.siteName]) optionsAry[item.helperFields.siteName] = {};
			optionsAry[item.helperFields.siteName][item.entity.id] = {"id":item.entity.id,"range":item.description};	
		});
		$.each(optionsAry, function (siteName, rangeAry) {
			str += '<optgroup label="Site: ' + siteName + '">';
			$.each(rangeAry, function (rangeId, rangeObj) {
				str += '<option value="' + rangeId + '">' + rangeObj.range + '</option>';
			});
			str += '</optgroup>'
		});
		$(dest).html(str).removeClass("error").change();
	}
}

// siteIDs.default.function()
function getSiteIDs(paramActionObj, paramName) {
	var userObj = getCurApiKey();
	var query = fmtQuery(`{
		"query":"query entityLookup ( $accountID:ID! $type:EntityType! $limit:Int $search:String ) {
				entityLookup ( accountID:$accountID type:$type limit:$limit search:$search  ) {
				items  {
					entity {
						id
						name
						type
					}
					description
					helperFields
				}
				total
			}
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `,
			"type": "site",
			"limit": 1000,
			"search": "`+ filterStr(paramActionObj.searchStr) + `"
		},
		"operationName":"entityLookup"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getSiteIDsResponse(response, paramName) {
	$('#' + paramName + 'xxsearch').removeClass('loading');
	var source = $("#" + paramName + "xxleft");
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
	} else {
		if (source.length > 0) {
			$(source).html('');
			var desOptions = $.map($(dest).find("option"), function (option) { return option.value; });
			$.each(response.data.entityLookup.items, function (i, item) {
				if (!desOptions.includes(String(item.entity.id))) {
					source.append('<option value="' + item.entity.id + '">' + item.entity.name + ' - ' + item.helperFields.type + ' (' + item.entity.id + ')</option>');
				}
			});
		} else {
			$(dest).html('');
			$.each(response.data.entityLookup.items, function (i, item) {
				dest.append('<option value="' + item.entity.id + '">' + item.entity.name + ' - ' + item.helperFields.type + ' (' + item.entity.id + ')</option>');
			});
		}
	}
}

function getStoryIDs(paramActionObj, paramName) {
	var userObj = getCurApiKey();
	var query = fmtQuery(`{
		"query":"query xdr ( $storyInput:StoryInput! $accountID:ID! ) {
			xdr ( accountID:$accountID  ) {
				stories ( input:$storyInput  )  {
					paging {
						from 
						limit 
						total 
					}
					items {
						id 
						summary 
						incident  {
							id
							firstSignal
							lastSignal		
						}
					}
				}
			}	
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `,
			"storyInput": {
				"filter": [
					{
						"timeFrame": {
							"time": "last.P89D"
						}
					}
				],
				"paging": {
					"from": 0,
					"limit": 100
				},
				"sort": []
			}
		},
		"operationName":"xdr"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getStoryIDsResponse(response, paramName) {
	var dest = $("select[name=" + paramName + "]");	
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		dest.html('<otion value="">-- select --</option>');
		$.each(response.data.xdr.stories.items, function (i, item) {
			dest.append('<option value="' + item.id + '">' + item.summary + ' (' + item.incident.firstSignal + ')</option>');
		});
	}
	updateRequestData();
}

// siteLocation field
function initSiteLocationAutocomplete() {
	$.ui.autocomplete.prototype._renderItem = function( ul, item) {
		var recordStr = item.countryName+(item.countryName!=item.countryCode ? " ("+item.countryCode+")" : "");
		recordStr += (item.stateName ? " - "+item.stateName+(item.stateName!=item.stateCode ? " ("+item.stateCode+")" : "") : "");
		recordStr += " - "+item.city;
		return $('<li></li>')
			.data("item.autocomplete", item)
			.append($('<a>').text(recordStr))
			.appendTo(ul);
	};
	
	$('#catoBodyParams .autocomplete').unbind().autocomplete({
		minLength: 1,
		source: function(request,response) {
			var pattern = new RegExp(request.term.toLowerCase()); 
			var records = [];
			var i=0;
			for (var key in countries) {
				if (i>1000) break;
				if (countries.hasOwnProperty(key) && pattern.test(key.toLowerCase())) {
					countries[key].key = key.replaceAll("___"," ");
					records.push(countries[key]);
					i++;
				}
			}
			return response(records);
		},
		focus: function(event,ui) {
			$(this).val(ui.item.city);
			return false;
		},
		select: function(event,ui) {
			var prefix = event.target.id.replace("_template","");
			$("#"+prefix+"___countryCode").val(ui.item.countryCode);
			if (ui.item.stateCode) { $("#"+prefix+"___stateCode").val(ui.item.stateCode); } else { $("#"+prefix+"___stateCode").val("") }
			$("#"+prefix+"___city").val(ui.item.city);
			$.each(ui.item.timezone, function(i,timezone) {
				$("#"+prefix+"___timezone").val(timezone);
			});
			return false;
		}
	})
}

// role.default.function()
function getRoles(paramActionObj, paramName) {
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query accountRoles ( $accountID:ID! ) {
				accountRoles ( accountID:$accountID  ) {
				items  {
					id
					name
					description
					isPredefined
				}
				total 
			}	
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `
		},
		"operationName":"accountRoles"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getRolesResponse(response, paramName) {
	var dest = $("#" + paramName+"xxtemplate");
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		$(dest).html('<option value="">-- select --</option>');
		$.each(response.data.accountRoles.items, function (i, item) {
			var valueObj = {"id":item.id,"name":item.name};
			dest.append('<option title="' + item.description + '" value="' + JSON.stringify(valueObj).replaceAll('"','|;|') + '">' + item.name + '</option>');
		});
	}
}

// subdomains.default.function()
function getSubdomains(paramActionObj, paramName) {
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query subDomains ( $accountID:ID! ) {
				subDomains ( accountID:$accountID  ) {
				accountId 
				accountName 
				accountType 
				subDomain 
			}	
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `
		},
		"operationName":"subDomains"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getSubdomainsResponse(response, paramName) {
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		$(dest).html('');
		$.each(response.data.subDomains, function (i, item) {
			dest.append('<option value="' + item.subDomain + '">' + item.subDomain + '</option>');
		});
	}
}

// userIDs.default.function()
function getUserIDs(paramActionObj, paramName) {
	var userObj = getCurApiKey()
	var query = fmtQuery(`{
		"query":"query entityLookup ( $accountID:ID! $type:EntityType! $limit:Int $from:Int $search:String ) {
				entityLookup ( accountID:$accountID type:$type limit:$limit from:$from search:$search  ) {
				items  {
					entity {
						id 
						name 
						type 
					}
					description
					helperFields
				}
				total 
			}	
		}",
		"variables":{
			"accountID": `+ filterStr(userObj.account_id) + `,
		    "type": "vpnUser",
		    "from": 0,
		    "limit": 1000,
		    "search": "`+ filterStr(paramActionObj.searchStr) + `"
		},
		"operationName":"entityLookup"
	}`);
	makeCall(paramActionObj.callback, query, paramName);
};

function getUserIDsResponse(response, paramName) {
	$('#' + paramName + 'xxsearch').removeClass('loading');
	var source = $("#" + paramName + "_left");
	var dest = $("#" + paramName);
	if (response.errors != undefined) {
		$.gritter.add({ title: 'ERROR', text: response.errors[0].message });
		$('#cato_api_keys_tbl tr.current input').addClass("error");
	} else {
		$(source).html('');
		var desOptions = $.map($(dest).find("option"), function (option) { return option.value; });
		$.each(response.data.entityLookup.items, function (i, item) {
			if (!desOptions.includes(String(item.entity.id))) {
				$("#" + paramName + "xxleft").append('<option title="email: ' + item.helperFields.type +'" value="' + item.entity.id + '">' + item.entity.name + ' (' + item.entity.id + ')</option>');
			}
		});
	}
}