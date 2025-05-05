var curOperationObj = {};
var catoApiIntrospection = {
	enums: {},
	scalars: {},
	objects: {},
	input_objects: {},
	unions: {},
	interfaces: {},
	unknowns: {}
}
var catoApiSchema = {
	"Query Operations": {},
	"Mutation Operations": {}
};
var CATO_API_KEYS;

$().ready(function () {
	$("#mainNav").tabs();
	$('#version').html(catoConfig.version);
	init();
});

function init() {
	$.each(catoConfig.servers, function(name, endpoint) {
		$('#catoServer').append(
			$('<option></option>').val(endpoint).text(name+" - "+endpoint)
		);
	});
	$('#catoApiKeys').change(function () { loadApiSchema(); });
	$('#catoOperations').change(function () { changeOperation(); });
	$('#execute').click(function () { makeCall(); });
	// Cato API credential management
	$('#catoSaveCredentials').click(function () { set_saveApiKey(); });
	$('#catoDeleteCredentials').click(function () { set_deleteApiKey(); });
	$('#catoDeleteAllCredentials').click(function () { set_deleteAllApiKeys(); });
	$('#cato_configMaskSecretKey').click(function () { generateCodeExamples() });
	$('#catoQuery').blur(function () { generateCodeExamples() });
	catoLoadAll();
}

function catoLoadAll() {
	renderApiKeys();
	$("#catoActions option:eq(0)").removeAttr('disabled').attr('selected', 'selected');
	$('#catoResult').val('');
}

// Cato api key management
function loadCredentials() {
	if (localStorage.getItem('CATO_API_KEYS') == null) localStorage.setItem('CATO_API_KEYS', '{}');
	CATO_API_KEYS = JSON.parse(localStorage.getItem('CATO_API_KEYS'));
	$('#catoApiKeys').html('').removeClass('highlight');
	$('#catoOperations').html('').removeClass('highlight');
	$('.cato_account_input').val('').removeClass('highlight').attr('placeholder', '');
	$('#cato_add_new_api_key').removeClass('highlight');
	$.each(CATO_API_KEYS, function (index_id, usrObj) {
		$("#catoApiKeys").append('<option title="account_id: ' + usrObj.account_id + ' | api_id: ' + usrObj.api_id + '" value="' + index_id + '">' + usrObj.description + ' (' + usrObj.account_id + ')</option>');
	});
	if ($('#catoApiKeys').children('option').length == 0) {
		$("#catoApiKeys").addClass('highlight').html('<option value="">Add api_key under Settings tab</option>');
		$("#catoOperation").addClass('highlight').html('<option value="">Add api_key under Settings tab</option>');
		$('#cato_add_new_api_key').addClass('highlight');
	} else {
		loadApiSchema();
	}
	changeOperation();
}

function loadApiSchema() {
	$('#catoOperations').html('<option value="">loading...</option>');
	var query = fmtQuery(`{"query":"query IntrospectionQuery { __schema { description } }","operationName":"IntrospectionQuery"}`);
	$.gritter.add({ title: 'Initializing', text: 'Retrieving intropspection API schema.' });
	makeCall(parseApiSchema, query, 'set');
}

function parseApiSchema(schema) {
	var mutationOperationsTMP = {}
	var queryOperationsTMP = {}
	for (i in schema.data.__schema.types) {
		var type = schema.data.__schema.types[i];
		if (type.kind == "ENUM") {
			catoApiIntrospection.enums[type.name] = copy(type);
		} else if (type.kind == "SCALAR") {
			catoApiIntrospection.scalars[type.name] = copy(type);
		} else if (type.kind == "OBJECT") {
			if (type.name == "Query") {
				for (j in type.fields) {
					if (childOperationParent[type.fields[j].name] != undefined) {
						// console.log(type.fields[j]);
						queryOperationsTMP[type.fields[j].name] = copy(type.fields[j]);
					} else {
						catoApiSchema["Query Operations"]["query." + type.fields[j].name] = copy(type.fields[j]);
					}
				}
			} else if (type.name == "Mutation") {
				for (j in type.fields) {
					mutationOperationsTMP[type.fields[j].name] = copy(type.fields[j]);
				}
			} else {
				catoApiIntrospection.objects[type.name] = copy(type);
			}
		} else if (type.kind == "INPUT_OBJECT") {
			catoApiIntrospection.input_objects[type.name] = copy(type);
		} else if (type.kind == "INTERFACE") {
			catoApiIntrospection.interfaces[type.name] = copy(type);
		} else if (type.kind == "UNION") {
			catoApiIntrospection.unions[type.name] = copy(type);
		} else {
			catoApiIntrospection.unknowns[type.name] = copy(type);
		}
	}

	for (queryType in queryOperationsTMP) {
		var parentQueryOperationType = copy(queryOperationsTMP[queryType]);
		getChildOperations("Query Operations", parentQueryOperationType, parentQueryOperationType, "query." + queryType);
	}

	// Map sub mutation operations by type
	for (mutationType in mutationOperationsTMP) {
		var parentMutationOperationType = copy(mutationOperationsTMP[mutationType]);
		getChildOperations("Mutation Operations", parentMutationOperationType, parentMutationOperationType, "mutation." + mutationType);
	}
	renderApiOperations();
}

function getChildOperations(operationType, curType, parentType, parentPath) {
	if (parentType.childOperations==undefined) parentType.childOperations = {};
	var curOfType = null;
	if (curType.kind) {
		curOfType = copy(catoApiIntrospection[curType.kind.toLowerCase() + "s"][curType.name]);
	} else if (curType.type.ofType == null) {
		curOfType = copy(catoApiIntrospection[curType.type.kind.toLowerCase() + "s"][curType.type.name]);
	} else {
		curOfType = copy(catoApiIntrospection[curType.type.ofType.kind.toLowerCase() + "s"][curType.type.ofType.name]);
	}
	var hasChildren = false;
	for (i in curOfType.fields) {
		var curFieldObject = copy(curOfType.fields[i]);
		// console.log(curFieldObject.name);
		if ((curFieldObject.args != null && curFieldObject.args.length > 0) || childOperationObjects[curFieldObject.name]!=undefined || childOperationObjects[curOfType.name]!=undefined) {
			hasChildren = true;
			curParentType = copy(parentType);
			curFieldObject.args = getNestedArgDefinitions(curFieldObject.args, curFieldObject.name);
			curParentType.childOperations[curFieldObject.name] = curFieldObject;
			getChildOperations(operationType, curFieldObject, curParentType, parentPath + "." + curFieldObject.name);
		}
	}
	if (!hasChildren) {
		catoApiSchema[operationType][parentPath] = parentType;
	}
}

function getNestedArgDefinitions(argsAry, parentParamPath) {
	newArgsList = {};
	if (curOperationObj.operationArgs == undefined) curOperationObj.operationArgs = {};
	for (i in argsAry) {
		var arg = copy(argsAry[i]);
		var curParamPath = (parentParamPath == null) ? arg.name : parentParamPath.replaceAll("___",".") + "." + arg.name;
		if (arg.path && !arg.path.search('.')) {
			arg.child = true;
			arg.parent = arg.path;
		}
		arg.type = getOfType(arg.type, { non_null: false, kind: [], name: null }, curParamPath);
		arg.path = curParamPath.replaceAll("___", ".");
		arg.id_str = curParamPath.replaceAll(".", "___");
		if (Array.isArray(arg.type.kind)) {
			arg.required = (arg.type.kind[0] == "NON_NULL") ? true : false;
		} else {
			arg.required = (arg.type.kind == "NON_NULL") ? true : false;
		}
		var required1 = (arg.required) ? "!" : "";
		var required2 = (arg.type.kind.slice(1, arg.type.kind.length).includes("NON_NULL")) ? "!" : "";
		if (arg.type.kind.includes("SCALAR") || arg.type.kind.includes("ENUM")) {
			arg.varName = renderCamelCase(arg.name);
			arg.id_str = arg.varName
		} else {
			arg.varName = renderCamelCase(arg.type.name);
		}
		arg.responseStr = arg.name + ":$" + arg.varName + " ";
		if (arg.type.kind.includes("LIST")) {
			arg.requestStr = "$" + arg.varName + ":" + "[" + arg.type.name + required2 + "]" + required1 + " ";
		} else {
			arg.requestStr = "$" + arg.varName + ":" + arg.type.name + required1 + " ";
		}

		if ($('#catoOperations').val() != null) {
			curOperationObj.operationArgs[arg.varName] = copy(arg);
		}
		newArgsList[arg.id_str] = arg;
	}
	return newArgsList;
}

function renderApiOperations() {
	$('#catoOperations').html("");
	for (type in catoApiSchema) {
		$('#catoOperations').append('<optgroup label="' + type + '">');
		var operations = Object.keys(catoApiSchema[type]).sort();
		for (i in operations) {
			var operation = operations[i];
			$('#catoOperations').append('<option value="' + operation + '">' + operation + '()</option>');
		}
		$('#catoOperations').append('</optgroup>');
	}
	changeOperation();
}

function changeOperation() {
	if ($('#catoOperations').val() != null && $('#catoOperations').val() != '') {
		userObj = getCurApiKey();
		endpoint = userObj.endpoint!=undefined ? catoConfig.servers[userObj.endpoint] : catoConfig.servers.Ireland;
		$('#catoServer').val(endpoint);
		// if (endpoint!=$('#catoServer').val()) {
		// 	loadApiSchema();
		// } else {
			$('#catoServer').val(endpoint);
			$('#catoQuery').val('');
			$('#catoVariables').val('');
			$('#catoResult').val('');
			$('#responseObject').val('');
			$('#catoBodyParams_tbl').html("");
			$('.codeExample textarea').html("");
			var operation = getCurrentOperation();
			curOperationObj = copy(operation);
			curOperationObj.operationArgs = {};
			curOperationObj.fieldTypes = {};
			var curOfType = getOfType(curOperationObj.type, { non_null: false, kind: [], name: null }, null);
			curOperationObj.type = copy(curOfType);
			if (curOfType.name in catoApiIntrospection.objects) {
				curOperationObj.args = getNestedArgDefinitions(curOperationObj.args, null);
				curOperationObj.type.definition = copy(catoApiIntrospection.objects[curOperationObj.type.name]);
				if (curOperationObj.childOperations) {
					curOperationObj.type.definition.fields = copy(checkForChildOperation(curOperationObj.type.definition.fields));
				}
				if (curOperationObj.type.definition.fields != undefined) {
					var fields = getNestedFieldDefinitions(curOperationObj.type.definition.fields, null);
					curOperationObj.type.definition.fields = copy(fields);
				}
				if (curOperationObj.type.definition.inputFields != undefined) {
					var inputFields = getNestedFieldDefinitions(curOperationObj.type.definition.inputFields, null);
					curOperationObj.type.definition.inputFields = copy(inputFields);
				}
			} else {
				$.gritter.add({ title: 'ERROR', text: "No object definition for '" + curOperationObj.curOfType.name + "' in schema for operation '" + curOperationObj.name + "'." });
			}
			renderParamsHtml();
		// }
	}
}

function getOfType(curType, ofType, parentParamPath) {
	ofType.kind.push(copy(curType.kind));
	if (curType.ofType != null) {
		ofType = getOfType(copy(curType.ofType), ofType, parentParamPath);
	} else {
		ofType.name = curType.name;
	}
	if (ofType.kind.includes("INPUT_OBJECT")) {
		var curParamPath = (parentParamPath == null) ? "" : parentParamPath + "___";
		ofType.indexType = "input_object";
		ofType.definition = copy(catoApiIntrospection.input_objects[ofType.name]);
		if (ofType.definition.inputFields != undefined) ofType.definition.inputFields = getNestedFieldDefinitions(copy(ofType.definition.inputFields), curParamPath);
	} else if (ofType.kind.includes("UNION")) {
		var curParamPath = (parentParamPath == null) ? "" : parentParamPath + "___";
		ofType.indexType = "interface";
		ofType.definition = copy(catoApiIntrospection.unions[ofType.name]);
		if (ofType.definition.possibleTypes != undefined) {
			ofType.definition.possibleTypes = getNestedInterfaceDefinitions(copy(ofType.definition.possibleTypes), curParamPath);
			// strip out each nested interface attribute from parent oftype fields
			$.each(ofType.definition.possibleTypes, function (interfaceName, possibleType) {
				$.each(ofType.definition.fields, function (i, field) {
					var nestedFieldPath = parentParamPath + "___" + interfaceName + "___" + field.name;
					if (possibleType.fields[nestedFieldPath]) delete possibleType.fields[nestedFieldPath];
				});
			});
		}
	} else if (ofType.kind.includes("OBJECT")) {
		var curParamPath = (parentParamPath == null) ? "" : parentParamPath + "___";
		ofType.indexType = "object";
		ofType.definition = copy(catoApiIntrospection.objects[ofType.name]);
		if (ofType.definition.fields != undefined) {
			ofType.definition.fields = getNestedFieldDefinitions(copy(ofType.definition.fields), curParamPath);
		}

		if (ofType.definition.interfaces) ofType.definition.interfaces = getNestedInterfaceDefinitions(copy(ofType.definition.interfaces), curParamPath);
	} else if (ofType.kind.includes("INTERFACE")) {
		var curParamPath = (parentParamPath == null) ? "" : parentParamPath + "___";
		ofType.indexType = "interface";
		ofType.definition = copy(catoApiIntrospection.interfaces[ofType.name]);
		if (ofType.definition.fields != undefined) ofType.definition.fields = getNestedFieldDefinitions(copy(ofType.definition.fields), curParamPath);
		if (ofType.definition.possibleTypes) {
			ofType.definition.possibleTypes = getNestedInterfaceDefinitions(copy(ofType.definition.possibleTypes), curParamPath);
			$.each(ofType.definition.possibleTypes, function (interfaceName, possibleType) {
				$.each(ofType.definition.fields, function (i, field) {
					var nestedFieldPath = parentParamPath + "___" + interfaceName + "___" + field.name;
					if (possibleType.fields[nestedFieldPath]) delete possibleType.fields[nestedFieldPath];
				});
			});
		}
	} else if (ofType.kind.includes("ENUM")) {
		ofType.indexType = "enum";
		ofType.definition = copy(catoApiIntrospection.enums[ofType.name]);
	}
	return ofType;
}

function getNestedInterfaceDefinitions(possibleTypes, parentParamPath) {
	var curInterfaces = {};
	$.each(possibleTypes, function (i, possibleType) {
		if (possibleType.kind.includes("OBJECT")) {
			curInterfaces[possibleType.name] = copy(catoApiIntrospection.objects[possibleType.name]);
		}
	});
	$.each(curInterfaces, function (i, curInterface) {
		var curParamPath = (parentParamPath == null) ? "" : parentParamPath + curInterface.name + "___";
		if (curInterface.fields && curInterface.name != "CatoEndpointUser") curInterface.fields = getNestedFieldDefinitions(copy(curInterface.fields), curParamPath);
		if (curInterface.inputFields) curInterface.inputFields = getNestedFieldDefinitions(copy(curInterface.inputFields), curParamPath);
		if (curInterface.interfaces) curInterface.interfaces = getNestedInterfaceDefinitions(copy(curInterface.interfaces), parentParamPath);
		if (curInterface.possibleTypes) curInterface.possibleTypes = getNestedInterfaceDefinitions(copy(curInterface.possibleTypes), parentParamPath);
	});
	return curInterfaces;
}

function getNestedFieldDefinitions(fieldsAry, parentParamPath) {
	if (curOperationObj.childOperations) {
		fieldsAry = checkForChildOperation(fieldsAry);
	}
	var newFieldList = {};
	for (i in fieldsAry) {
		var field = copy(fieldsAry[i]);
		if (field != null) {
			if (parentParamPath == null) {
				field.path = field.name;
				field.id_str = field.name;
			} else {
				field.path = parentParamPath + field.name;
				field.id_str = parentParamPath.replaceAll(".", "___") + field.name;
			}
			if (Array.isArray(field.type.kind)) {
				field.required = (field.type.kind[0] == "NON_NULL") ? true : false;
			} else { 
				field.required = (field.type.kind == "NON_NULL") ? true : false;
			}
			if (field.args && field.args.length > 0) {
				field.args = getNestedArgDefinitions(field.args, field.path);
			}
			if (field.id_str!='records___fields') newFieldList[field.path] = field;
		}
	}
	for (fieldPath in newFieldList) {
		var field = newFieldList[fieldPath];
		if (curOperationObj.fieldTypes && field.type.name != null) curOperationObj.fieldTypes[field.type.name] = true;
		field.type = getOfType(field.type, { non_null: false, kind: [], name: null }, field.path);
	}
	return newFieldList;
}

// Update UI display/fields based on selected action
function renderParamsHtml() {
	$('#catoQuery').val('');
	$('#catoVariables').val('');
	$('#catoResult').val('');

	var paramKeys = [];
	$.each(curOperationObj.operationArgs, function (type, arg) {
		paramKeys.push(arg.varName+":|:"+type);
	});
	paramKeys.sort();
	for (i in paramKeys) { 
		param = curOperationObj.operationArgs[renderCamelCase(paramKeys[i].split(":|:")[1].replaceAll("___","."))];
		if (param.type.kind.includes("INPUT_OBJECT") && param.type.definition.inputFields) {
			renderInputNestedFieldsHtml(param, "catoBodyParams");
		} else if (param.type.kind.includes("OBJECT") && param.type.definition.fields) {
			renderInputNestedFieldsHtml(param, "catoBodyParams");
		} else {
			$("#catoBodyParams_tbl").append(renderParamHTML(param));
		}
	}

	// Now that all parameters are rendered, populate dynamic ENUMs
	$.each($('#catoBodyParams .dynamic'), function (i, input) {
		var paramActionObj = null;
		if (catoGetObjectActionMapping[input.name]) {
			if (catoGetObjectActionMapping[input.name][curOperationObj.name]) {
				paramActionObj = catoGetObjectActionMapping[input.name][curOperationObj.name];
			} else {
				paramActionObj = catoGetObjectActionMapping[input.name].default;
			}
		}
		if (paramActionObj && paramActionObj != null) {
			if (paramActionObj.function) {
				paramActionObj.function(paramActionObj, input.name);
			} else {
				$.gritter.add({ title: 'ERROR', text: "No function defined for '" + param.name + "' in operation '" + curOperationObj.name + "'." });
			}
		}
	});

	// // toggleDcId();
	$('.param_link').button();
	$('.toggle_param_link, .cancel_param_link').button().unbind("click").click(function () { toggleShowNestedParams(this.id.replace("_toggle", "").replace("_cancel", "")); })
	$('#catoBodyParams input.param1:not(.parent), #catoBodyParams textarea.param1').unbind().blur(function () { updateRequestData(); });
	$('#catoBodyParams textarea.parent:not(.parent1,.parent)').unbind().blur(function () { updateRequestData(); });
	$('#catoBodyParams select.param1:not(.parent)').unbind().change(function () { updateRequestData(); });
	$('#catoBodyParams select.dynamic').unbind().change(function () { updateRequestData(); });
	$('#catoBodyParams select.template').unbind().change(function () { populateFieldsFromTemplateSelect(this); });
	$('#catoBodyParams a.toggleField').unbind().click(function () { toggleResponseArgParam(this); }).click();
	$('#responseObject').unbind().blur(function () { renderResponseArguments(); });
	$('.add_param_link').unbind().click(function () { addObjectToParent(this); updateRequestData(); });
	initSiteLocationAutocomplete();
	initSearch();
	// $(".datepicker").parent().click(function(){ $(".datepicker").trigger('blur'); });
	// $(".datepicker").datetimepicker();
	renderResponseArguments();
}

function renderParamHTML(param) {
	str = "";
	var isParent = "";
	var paramActionObj = null;
	if (catoGetObjectActionMapping[param.name] != undefined) {
		var paramActionObj = (catoGetObjectActionMapping[param.name][curOperationObj.name] != undefined) ? catoGetObjectActionMapping[param.name][curOperationObj.name] : catoGetObjectActionMapping[param.name].default;
		if (paramActionObj.children != undefined && paramActionObj.children.length > 0) isParent = "parent";
	}
	var isMulti = param.type.kind.includes("LIST");
	
	var level = (param.id_str.split("___").length - 1);
	var parentIdAry = param.id_str.split("___");
	parentIdAry.pop();
	if ((param.required == true && param.type.kind[0] != ("NON_NULL")) || curOperationObj.operationArgs[param.varName]) {
		level = 1;
	} else if ($("#" + parentIdAry.join("___")).length>0) {
		var parentClasses = $("#" + parentIdAry.join("___")).attr("class").split(" ");
		var parentLevel = parentClasses[parentClasses.findIndex(element => element.startsWith("param"))];
		level = (String(parseInt(parentLevel.substr(parentLevel.length - 1, parentLevel.length), 10) +1));
	}
	
	var paramLevel = (param.id_str.includes("___") ? 'bodyParams child param' + level : 'bodyParams param1');
	var paramName = param.name;
	var paramValType = param.type.name.toLowerCase();
	var required = (param.required == true) ? ' required ' : '';
	var optionalClass = (param.required==true) ? 'optionalArg' : '';
	if (paramActionObj != null) {
		if (paramActionObj.search && (isMulti || paramActionObj.singleValue)) {
			str += renderDynamicParamHTML(paramActionObj, param, paramLevel, isParent, optionalClass);
		} else {
			var str = '<tr id="' + param.id_str + 'tr" class="fieldwrapper ' + optionalClass + '">';
			str += '<td align="right"><label title="' + param.path.replaceAll("___",".") +'" for="' + param.path + '">';
			if (param.description != undefined) str += '<span class="info" title="' + filterStr(param.description) + '"> </span> ';
			str += ((param.required == true) ? '<span title="Required field" class="required">*</span> ' : '') + (param.varName ? param.varName : param.name) + ': </label></td>';
			str += '<td id="' + param.id_str + '_field_td" class="' + ((isMulti) ? "array_" + paramValType : paramValType) + '">';
			str += '<select name="' + paramName + '" title="' + (param.varName ? param.varName : param.name) +'" class="dynamic ' + optionalClass + ' ' + ((isMulti) ? "array_" + paramValType : paramValType) + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + ' ' + ((isMulti) ? ' multiple' : '') + '><option value="">loading...</option></select>';
			str += '</td>';
			str += ((param.required != true)) ? '<td valign="top"><a id="' + param.id_str + '_toggle" title="Remove this argument from request variables and response." class="toggleField button ui-button-icon ui-icon ui-icon-cancel"></a></td>' : "<td></td>";
			str += '</tr>';
		}
	} else {
		var str = '<tr id="' + param.id_str + 'tr" class="fieldwrapper optionalArg' + optionalClass + '">';
		str += '<td align="right"><label title="' + param.path.replaceAll("___", ".") +'" for="' + param.path + '">';
		if (param.description != undefined) str += '<span class="info" title="' + filterStr(param.description) + '"> </span> ';
		str += ((param.required == true) ? '<span title="Required field" class="required">*</span> ' : '') + (param.varName ? param.varName : param.name) + ': </label></td>';
		str += '<td id="' + param.id_str + '_field_td" class="' + ((isMulti) ? "array_" + paramValType : paramValType) + '">';
		if (param.name == "timezone") {
			str += '<select name="' + paramName + '" title="' + param.varName +'" class="' + optionalClass + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + '>';
			$.each(timezones, function (i, timezone) { str += '<option value="' + timezone + '">' + timezone + '</option>'; });
			str += '</select>';
		} else if (param.type.indexType != undefined && param.type.indexType == "enum") {
			str += '<select name="' + paramName + '" title="' + (param.varName ? param.varName : param.name) +'" class="' + optionalClass + ' ' + ((isMulti) ? "array_" + paramValType : paramValType) + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + ' ' + ((isMulti) ? ' multiple' : '') + '>';
			if (!param.required && !isMulti) str += '<option value="">-- select --</option>';
			var paramValIndex = []
			$.each(param.type.definition.enumValues, function (i, val) { paramValIndex.push(val.name); });
			paramValIndex.sort();
			$.each(paramValIndex, function (i, val) { str += '<option value="' + val + '">' + val + '</option>'; });
			str += '</select>';
		} else if (paramValType == "timeframe") {
			str += '<select name="' + paramName + '" title="' + param.varName +'" class="' + optionalClass + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + '>';
			str += '<option value="last.PT5M">Previous 5 minutes</option>';
			str += '<option value="last.PT15M">Previous 15 minutes</option>';
			str += '<option value="last.PT30M">Previous 30 minutes</option>';
			str += '<option value="last.PT45M">Previous 45 minutes</option>';
			str += '<option value="last.PT1H">Previous 1 hour</option>';
			str += '<option value="last.PT2H">Previous 2 hours</option>';
			str += '<option value="last.PT4H">Previous 4 hours</option>';
			str += '<option value="last.PT6H">Previous 6 hours</option>';
			str += '<option value="last.PT8H">Previous 8 hours</option>';
			str += '<option value="last.PT10H">Previous 10 hours</option>';
			str += '<option value="last.P1D">Previous 1 day</option>';
			str += '<option value="last.P1D">Previous 2 day</option>';
			str += '<option value="last.P7D">Previous 7 day</option>';
			str += '<option value="last.P14D">Previous 14 day</option>';
			str += '<option value="last.P21D">Previous 21 day</option>';
			str += '<option value="last.P1M">Previous 1 months</option>';
			str += '<option value="last.P2M">Previous 2 months</option>';
			str += '<option value="last.P89D">Previous 3 months</option>';
			str += '<option value="custom">Custom</option>';
			str += '</select>';
		} else if (paramValType == "boolean") {
			str += '<select name="' + paramName + '" title="' + param.varName +'" class="' + optionalClass + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + '>';
			str += ((param.required) ? '' : '<option value="">-- select --</option>') + '<option value="true">true</option><option value="false">false</option>';
			str += '</select>';
		} else if (paramValType == "map") {
			str += '<textarea class="' + optionalClass + ' ' + paramLevel + ' ' + isParent + '"  name="' + paramName + '" id="' + param.id_str + '" title="' + param.varName +'" style="width:200px; height: 50px;"' + required + '>' + param.jsonStr + '</textarea>';
		} else {
			if (param.type.kind.includes("LIST")) {
				str += '<input type="text" title="' + param.varName +'" class="' + optionalClass + ' ' + paramLevel + ' ' + isParent + ' list" name="' + paramName + '" id="' + param.id_str + '" value="" placeholder="' + paramValType + "1," + paramValType + '2"' + required + ' />';
			} else {
				str += '<input type="text" title="' + param.varName +'" class="' + optionalClass + ' ' + paramLevel + ' ' + isParent + '" name="' + paramName + '" id="' + param.id_str + '" value="" placeholder="' + paramValType + '"' + required + ' />';
			}
		}
		str += '</td>'
		str += (!param.required) ? '<td valign="top"><a id="' + param.id_str + '_toggle" title="Remove this argument from response." class="toggleField ui-button-icon ui-icon ui-icon-cancel"></a></td>' : "<td></td>"
		str += '</tr>';
	}
	return str;
}

function renderDynamicParamHTML(paramActionObj, param, paramLevel, isParent, optionalClass) {
	var required = (param.required == true) ? ' required ' : '';
	var str = `<tr id="` + param.id_str + `searchtr" class="fieldwrapper">
		<td align="right"><label title="` + param.path.replaceAll("___",".") +`" for="` + param.path + `">
		` + ((param.description != undefined) ? `<span class="info" title="` + filterStr(param.description) + `"> </span> ` : ``) +
		((param.required == true) ? `<span title="Required field" class="required">*</span> ` : ``) +
		(param.varName ? param.varName : param.name) +
		`: </label></td>
			<td id="` + param.id_str + `_field_td">
				<input type="text" id="`+ param.id_str + `xxsearch" placeholder="Search" class="searchParam" />
				<a id="`+ param.id_str + `xxbtn" class="searchBtn param_link">search</a><br clear="all" />
			</td> `+
		((!param.required) ? `<td valign="top"><a id="` + param.id_str + `_toggle" title="Remove this argument from response." class="toggleField ui-button-icon ui-icon ui-icon-cancel"></a></td>` : `<td></td>`) + `
		</tr>
		<tr id = "` + param.id_str + `tr" class="fieldwrapper ` + optionalClass + `" >
			<td colspan="3">
				<table class="tableColL" id="` + param.id_str + `_tbl">
					<tr>`;
	if (paramActionObj.singleValue != true) {
		str += `		<td>
							<select id="`+ param.id_str + `xxleft" class="dynamic searchParam array_` + param.type.name + `" multiple="multiple"></select>
						</td>
						<td>
							<a id="`+ param.id_str + `xxmoveLeft" class="moveLeft param_link">&nbsp;&lt;&nbsp;</a><br clear="all" />
							<a id="`+ param.id_str + `xxmoveRight" class="moveRight param_link">&nbsp;&gt;&nbsp;</a><br clear="all" />
							<a id="`+ param.id_str + `xxleftAll" class="moveLeftAll param_link">&lt;&lt;</a><br clear="all" />
							<a id="`+ param.id_str + `xxrightAll" class="moveRightAll param_link">&gt;&gt;</a> 
						</td>
						<td id="` + param.id_str + `_field_td" class="array_` + param.type.name + `">
						    <select name="`+ param.name + `" title="` + (param.varName ? param.varName : param.name) +`" id="` + param.id_str + `" class="searchParam ` + optionalClass + ` ` + paramLevel + `"  ` + required + ` multiple="multiple"></select>
						</td>`;
	} else {
		str += `		<td style="width:50px;"></td>
						<td id="` + param.id_str + `_field_td" class="array_` + param.type.name + `">
						    <select name="`+ param.name + `" title="` + (param.varName ? param.varName : param.name) +`" id="` + param.id_str + `" class="searchParam singleValue ` + optionalClass + ` ` + paramLevel + `"  ` + required + ` multiple="multiple"></select>
						</td>`;
	}
	str += `		</tr>
				</table>
			</td>
		</tr>`;
	return str;
}

function renderInputNestedFieldsHtml(param, parentContainerId) {
	var optionalClass = (curOperationObj.operationArgs[param.varName] && curOperationObj.operationArgs[param.varName].required==true) ? 'optionalArg' : '';
	var required = (param.required == true) ? ' required ' : '';
	var paramDataType = (param.type.kind.includes("LIST")) ? "array" : 'object';
	var level = (parentContainerId == "catoBodyParams" || curOperationObj.operationArgs[param.varName]) ? 1 : param.id_str.split("___").length;
	if (parentContainerId != "catoBodyParams" && $("#" + parentContainerId).length > 0) {
		var parentClasses = $("#" + parentContainerId).attr("class").split(" ");
		var parentLevel = parentClasses[parentClasses.findIndex(element => element.startsWith("param"))];
		level = (String(parseInt(parentLevel.substr(parentLevel.length - 1, parentLevel.length), 10) + 1));
	}
	var str = '<tr id="' + param.id_str + '_tbltr" class="fieldwrapper ' + param.id_str + '_tbltr">';
	str += '<td valign="top" align="right" width><label title="' + param.type.definition.name + '" for="">';
	str += ((param.description != undefined) ? '<span class="info" title="' + param.description + '"> </span> ' : '');
	str += ((param.required == true) ? '<span title="Required field" class="required">*</span> ' : '');
	str += (param.varName ? param.varName : param.name) + ': </label></td>';
	str += '<td align="left" class="' + ((paramDataType == 'object') ? paramDataType : paramDataType + '_object') + '">';
	str += '<textarea title="' + (param.varName ? param.varName : param.name) + '" class="' + optionalClass + ' ' + param.id_str + ' bodyParams parent param' + level + ' type_' + paramDataType + '" name="' + param.name + '" id="' + param.id_str + '" placeholder="' + paramDataType + '"' + required + '>';
	str += ((paramDataType == 'object') ? '{}' : '[]') + '</textarea>';
	str += '<br clear="all" /><a href="javascript:void(0);" id="' + param.id_str + '_toggle" class="toggle_param_link param_link">Edit</a>';
	str += '<fieldset id="' + param.id_str + '_fieldset" class="nested_param"><legend>' + param.type.name +' Parameters</legend>';
	str += '<table id="' + param.id_str + '_tbl" class="toggle_param param_tbl_level' + level + '">';

	if (catoGetObjectActionMapping[param.name] != null && catoGetObjectActionMapping[param.name].default && catoGetObjectActionMapping[param.name].default.renderValuesFromObject) {
		if (param.name=="siteLocation") {
			str += '<tr id="' + param.id_str + '_templatetr" class=""><td align="right"></td>';
			str += '<td id="' + param.id_str + '_template_td" class="">';
			str += '<input name="' + param.name + '_searchLocal" title="' + param.varName +'" class="autocomplete" id="' + param.id_str + '_template" value="" placeholder="seach: country, state, or city" /> <hr />';
			str += '</td>';
			// str += (argType == "responseArg") ? '<td valign="top"><a id="' + param.id_str + '_toggle" title="Remove this argument from response." class="toggleField ui-button-icon ui-icon ui-icon-cancel"></a></td>' : "<td></td>";
			str += '</tr>';
		} else {
			str += '<tr id="' + param.id_str + '_templatetr" class="">';
			str += '<td align="right"><label for="' + param.path + '_template">Available ' + param.varName + '(s): </label></td>';
			str += '<td id="' + param.id_str + '_template_td" class="">';
			str += '<select name="' + param.name + '_template" title="' + param.varName +'" class="template" id="' + param.id_str + '_template"><option value="">loading...</option></select>';
			str += '</td>';
			// str += (argType == "responseArg") ? '<td valign="top"><a id="' + param.id_str + '_toggle" title="Remove this argument from response." class="toggleField ui-button-icon ui-icon ui-icon-cancel"></a></td>' : "<td></td>";
			str += '</tr>';
			}
	}

	str += '</table><br clear="all" />';
	str += '<a href="javascript:void(0);" id="' + param.id_str + '_cancel" class="cancel_param_link param_link">Close</a>';
	str += '<a href="javascript:void(0);" id="' + param.id_str + '_add" class="add_param_link param_link">Add</a>';
	str += '</fieldset>';
	str += '</td><td></td>';
	// str += (argType == "responseArg") ? '<td valign="top"><a id="' + param.id_str + '_toggle" title="Remove this argument from response." class="toggleField ui-button-icon ui-icon ui-icon-cancel"></a></td>' : "<td></td>";
	str += '</tr>';
	$("#" + parentContainerId + "_tbl").append(str);

	if (catoGetObjectActionMapping[param.name] != null && catoGetObjectActionMapping[param.name].function) {
		catoGetObjectActionMapping[param.name].function(catoGetObjectActionMapping[param.name], param.id_str);
	}

	if (param.type.definition.inputFields) {
		var inputFieldKeys = Object.keys(param.type.definition.inputFields).sort();
		for (i in inputFieldKeys) {
			field = param.type.definition.inputFields[inputFieldKeys[i]];
			if (field.type.definition && field.type.definition.inputFields) {
				renderInputNestedFieldsHtml(field, param.id_str);
			} else {
				$("#" + param.id_str + "_tbl").append(renderParamHTML(field));
			}
		}
	}

	if (param.type.definition.fields) {
		var fieldKeys = Object.keys(param.type.definition.fields).sort();
		for (i in fieldKeys) {
			field = param.type.definition.fields[fieldKeys[i]];
			if (field.type.definition && field.type.definition.fields) {
				// console.log("field.path render nested", field.path);
				renderInputNestedFieldsHtml(field, param.id_str);
			} else {
				// console.log("field.path render field", field.path);
				$("#" + param.id_str + "_tbl").append(renderParamHTML(field));
			}
		}
	}
}

function renderResponseArguments() {
	// checkCatoForm mark
	// if (checkCatoForm("#catoBodyParams .param1")) updateRequestData();
	updateRequestData();
}

function addObjectToParent(input) {
	var parentId = input.id.slice(0, -4);
	var parentClasses = $("#" + parentId).attr("class").split(" ");
	var level = parentClasses[parentClasses.findIndex(element => element.startsWith("param"))];
	var childLevel = "param" + (String(parseInt(level.substr(level.length - 1, level.length), 10) + 1));
	if (checkCatoForm('#' + parentId + "_fieldset ." + childLevel)) {
		var curObject = {};
		if (!IsJsonString($('#' + parentId).val())) {
			$.gritter.add({ title: 'ERROR', text: "Malformed parameter: '" + $('#' + parentId).attr("title") + "' is not valid '" + $('#' + parentId).parent().prop("class") + "' syntax. Clearing field." });
		}
		$.each($('#' + parentId + "_fieldset ." + childLevel), function (i, param) {
			if (param.value != '') {
				var val = parseParamValue($('#' + param.id));
				if (typeof val === "object") {
					if (String(JSON.stringify(val)) != String("{}")) curObject[param.name] = val;
				// } else if (typeof val === "array") {
				} else if ((val != null && val != "") || val == 0) {
					curObject[param.name] = val;
				}
			}
		});
		if (String(JSON.stringify(curObject)) != String("{}")) {
			if ($('#' + parentId).parent().prop("class") == 'object') {
				$('#' + parentId).val(JSON.stringify(curObject));
			} else {
				var parentParamAry = JSON.parse($('#' + parentId).val());
				parentParamAry.push(curObject);
				$('#' + parentId).val(JSON.stringify(parentParamAry));
			}
		}
	}
	checkCatoForm("#catoBodyParams .parent");
}

function parseParamValue(input) {
	var val = "";
	if ($(input).prop("multiple")) {
		val = [];
		var paramType = $(input).parent().attr("class");
		var inputIdSelect = "#" + $(input).attr("id") + " option:checked"
		$.each($(inputIdSelect), function (i, option) {
			if (paramType == "array_string") {
				val.push(option.value);
			} else if (["array_integer", "array_id", "array_int"].includes(paramType)) {
				val.push(parseInt(option.value, 10));
			} else {
				val.push(option.value);
			}
		});
		if ($(input).hasClass("singleValue")) {
			val = val[0];
		}
	} else {
		var val = input.val();
		switch (input.parent().attr("class")) {
			case "object":
				val = (IsJsonString(val) ? JSON.parse(val) : null);
				break;
			case "array_object":
				val = (IsJsonString(val) ? JSON.parse(val) : null);
				break;
			case "array_string":
				val = (val != null) ? val.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").replaceAll("'", "").split(",") : '';
				break;
			case "array_integer" || "array_id" || "array_int":
				valAry = [];
				if (val != null) {
					if (!Array.isArray(val)) val = val.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").replaceAll("'", "").split(",")
					$.each(val, function (i, paramVal) {
						valAry.push((!isNaN(parseInt(val, 10))) ? parseInt(paramVal, 10) : parseInt(paramVal, 10));
					});
				}
				val = valAry;
				break;
			// case "id":
			case "int":
			case "integer":
				if (intStringParams[input.attr("name")]==undefined) val = (!isNaN(parseInt(val, 10))) ? parseInt(val, 10) : 0;
				break;
			case "boolean":
				val = (val == 'true') ? true : false;
				break;
			case "parent":
				val = JSON.parse(val);
				break;
		}
	}
	return val;
}

function updateRequestData() {
	indent = '	';
	var queryStr = "";
	// checkCatoForm mark
	// if (checkCatoForm()) {
		// Construct variable string to determine to render parent wrapper function
		var variableStr = "";
		var bodyParamsStr = "#catoBodyParams .bodyParams";
		// construct top level operation variable string
		$.each(curOperationObj.operationArgs, function (i, arg) {
			var param = $("#" + arg.id_str);
			if (!$(param).hasClass("hidden") && !$(param).hasClass("disabled") && $(param).val() != "") {
				if ($(param).hasClass("type_object") && String($(param).val().trim()) != String("{}")) {
					variableStr += arg.requestStr;
				// } else if ($(param).hasClass("type_array") && String($(param).val().trim()) != String("[]")) {
				} else if ($(param).hasClass("type_array")) {
					variableStr += arg.requestStr;
				} else if (!$(param).hasClass("type_object") && !$(param).hasClass("type_array")) {
					variableStr += arg.requestStr;
				}
			}
		});
		
		var queryStr = renderParentPath($('#catoOperations').val());
		queryStr += " ( " + variableStr + ") {\n";
		queryStr += indent + curOperationObj.name + " ( ";
		
		$.each(curOperationObj.args, function (i, arg) {
			var param = $("#" + arg.id_str);
			if (!$(param).hasClass("hidden") && !$(param).hasClass("disabled") && $(param).val() != "") {
				if ($(param).hasClass("type_object") && String($(param).val().trim()) != String("{}")) {
					queryStr += arg.responseStr + " ";
				} else if ($(param).hasClass("type_array")) {
				// } else if ($(param).hasClass("type_array") && String($(param).val().trim()) != String("[]")) {
					queryStr += arg.responseStr + " ";
				} else if (!$(param).hasClass("type_object") && !$(param).hasClass("type_array")) {
					queryStr += arg.responseStr + " ";
				}
			}
		});
		queryStr += ") {\n" + renderArgsAndFields("", curOperationObj, curOperationObj.type.definition, "		") + "	}" + indent + "\n}";
		$('#catoQuery').val(queryStr);
		var variablesObj = {};
		$.each($(bodyParamsStr + '.param:not(".hidden, .disabled"), ' + bodyParamsStr + '.param1:not(".hidden, .disabled"), ' + bodyParamsStr + '.searchParam:not(".hidden, .disabled")'), function (i, param) {
			var inputObj = $('#' + param.id);
			// console.log("param", param);
			// console.log("var", [curOperationObj.operationArgs[$(param).attr("title")].varName]);
			// debugger
			if (inputObj.attr("multiple") == "multiple") {
				if (inputObj.attr("required") == "required" || inputObj.find(":selected").length > 0) {
					variablesObj[curOperationObj.operationArgs[$(param).attr("title")].varName] = parseParamValue(inputObj);
				}
			} else if (inputObj.val() != '' || inputObj.attr("required") == "required") {
				if ($(param).hasClass("type_object") && String($(param).val().trim()) != String("{}")) {
					variablesObj[curOperationObj.operationArgs[$(param).attr("title")].varName] = parseParamValue(inputObj);
				// } else if ($(param).hasClass("type_array") && String($(param).val().trim()) != String("[]")) {
				} else if ($(param).hasClass("type_array")) {
					variablesObj[curOperationObj.operationArgs[$(param).attr("title")].varName] = parseParamValue(inputObj);
				} else if (!$(param).hasClass("type_object") && !$(param).hasClass("type_array")) {
					variablesObj[curOperationObj.operationArgs[$(param).attr("title")].varName] = parseParamValue(inputObj);
				}
			}
		});
		$('#catoVariables').val(JSON.stringify(variablesObj, null, 4));
	// }
	generateCodeExamples();
}

function renderArgsAndFields(responseArgStr, curOperation, definition, indent) {
	$.each(definition.fields, function (fieldIndex, field) {
		responseArgStr += indent + field.name + " ";
		if (field.args != undefined && !Array.isArray(field.args)) {
			argsPresent = false;
			var argStr = "( ";
			$.each(copy(field.args), function (argIndex, arg) {
				if (Array.isArray(arg.type.kind)) {
					arg.required = (arg.type.kind[0] == "NON_NULL") ? true : false;
				} else {
					arg.required = (arg.type.kind == "NON_NULL") ? true : false;
				}
				var required1 = (arg.required) ? "!" : "";
				var required2 = (arg.type.kind.slice(1, arg.type.kind.length).includes("NON_NULL")) ? "!" : "";
				if (arg.type.kind.includes("SCALAR") || arg.type.kind.includes("ENUM")) {
					arg.varName = renderCamelCase(arg.name);
					arg.id_str = arg.varName
				} else {
					arg.varName = renderCamelCase(arg.type.name);
				}
				arg.responseStr = arg.name + ":$" + arg.varName + " ";
				if (arg.type.kind.includes("LIST")) {
					arg.requestStr = "$" + arg.varName + ":" + "[" + arg.type.name + required2 + "]" + required1 + " ";
				} else {
					arg.requestStr = "$" + arg.varName + ":" + arg.type.name + required1 + " ";
				}
				curOperation.operationArgs[arg.varName] = arg;
				var param = $("#" + arg.id_str);
				if ($(param).length > 0 && !$(param).hasClass("hidden") && !$(param).hasClass("disabled") && $(param).val() != "") {
					if ($(param).hasClass("type_object") && String($(param).val().trim()) != String("{}")) {
						argStr += arg.responseStr + " ";
						argsPresent = true;
					} else if (!$(param).hasClass("type_object")) {
						argStr += arg.responseStr + " ";
						argsPresent = true;
					}
				}
			});
			argStr += ") ";
			if (argsPresent==true) responseArgStr += argStr;
		}
		if (field.type && field.type.definition && field.type.definition.fields != null) {
			responseArgStr += " {\n";
			$.each(field.type.definition.fields, function (subFieldIndex, subfield) {
				var subfieldName = (curOperationObj.fieldTypes[subfield.type.name] && !subfield.type.kind.includes("SCALAR")) ? (subfield.name + field.type.definition.name + ": " + subfield.name) : subfield.name;
				responseArgStr += indent + "	" + subfieldName;
				if (Object.keys(subfield.args).length > 0) {
					argsPresent = false;
					var argStr = " ( ";
					$.each(subfield.args, function (i, arg) {
						var param = $("#" + arg.id_str);
						if ($(param).length > 0 && !$(param).hasClass("hidden") && !$(param).hasClass("disabled") && $(param).val() != "") {
							if ($(param).hasClass("type_object") && String($(param).val().trim()) != String("{}")) {
								argStr += arg.responseStr + " ";
								argsPresent = true;
							} else if (!$(param).hasClass("type_object")) {
								argStr += arg.responseStr + " ";
								argsPresent = true;
							}
						}
					});
					argStr += " )";
					if (argsPresent==true) responseArgStr += argStr;
				}
				if (subfield.type && subfield.type.definition && (subfield.type.definition.fields != null || subfield.type.definition.inputFields != null)) {
					responseArgStr += " {\n";
					responseArgStr = renderArgsAndFields(responseArgStr, curOperation, subfield.type.definition, indent + "		");						
					if (subfield.type.definition.possibleTypes != null) {
						$.each(subfield.type.definition.possibleTypes, function (possibleTypeIndex, possibleType) {
							if ((possibleType.fields != null && Object.keys(possibleType.fields).length > 0) || (possibleType.inputFields != null && Object.keys(possibleType.inputFields).length > 0)) {
								responseArgStr += indent + "		... on " + possibleType.name + " {\n";
								responseArgStr = renderArgsAndFields(responseArgStr, curOperation, possibleType, indent + "			");
								responseArgStr += indent + "		}\n";
							}
						});
					}
					responseArgStr += indent + "	}";
				} else if (subfield.type && subfield.type.definition && subfield.type.definition.possibleTypes != null) {
					responseArgStr += " {\n";
					responseArgStr += indent + "		__typename\n";
					$.each(subfield.type.definition.possibleTypes, function (possibleTypeIndex, possibleType) {
						if ((possibleType.fields != null && Object.keys(possibleType.fields).length > 0) || (possibleType.inputFields != null && Object.keys(possibleType.inputFields).length > 0)) {
							responseArgStr += indent + "		... on " + possibleType.name + " {\n";
							responseArgStr = renderArgsAndFields(responseArgStr, curOperation, possibleType, indent + "			");
							responseArgStr += indent + "		}\n";
						}
					});
					responseArgStr += indent + " 	}\n";
				}
				responseArgStr += "\n";
			});
			if (field.type && field.type.definition && field.type.definition.possibleTypes != null) {
				$.each(field.type.definition.possibleTypes, function (possibleTypeIndex, possibleType) {
					if ((possibleType.fields != null && Object.keys(possibleType.fields).length > 0) || (possibleType.inputFields != null && Object.keys(possibleType.inputFields).length > 0)) {
						responseArgStr += indent + "	... on " + possibleType.name + " {\n";
						responseArgStr = renderArgsAndFields(responseArgStr, curOperation, possibleType, indent + "		");
						responseArgStr += indent + "	}\n";
					}
				});
			}
			responseArgStr += indent + "}\n";
		}
		if (field.type && field.type.definition && field.type.definition.inputFields != null) {
			responseArgStr += " {\n";
			$.each(field.type.definition.inputFields, function (subFieldIndex, subfield) {
				responseArgStr += indent + "	" + subfield.name;
				if (subfield.type && subfield.type.definition && ((subfield.type.definition.fields != null && Object.keys(subfield.type.definition.fields).length > 0) || (subfield.type.definition.inputFields != null && Object.keys(subfield.type.definition.inputFields).length > 0))) {
					responseArgStr += " {\n";
					responseArgStr = renderArgsAndFields(responseArgStr, curOperation, subfield.type.definition, indent + "		");
					responseArgStr += indent + "	}\n";
				}
				// responseArgStr += "\n";
			});
			if (field.type && field.type.definition && field.type.definition.possibleTypes != null) {
				$.each(field.type.definition.possibleTypes, function (possibleTypeIndex, possibleType) {
					if (possibleType.fields != null || possibleType.inputFields != null) {
						responseArgStr += indent + "... on " + possibleType.name + " {\n";
						responseArgStr = renderArgsAndFields(responseArgStr, curOperation, possibleType, indent + "		");
						responseArgStr += indent + "	}\n";
					}					
				});
			}
			responseArgStr += indent + "}\n";
		}
		responseArgStr += "\n";
	});
	return responseArgStr;
}

function renderCamelCase(pathStr){
	var str = "";
	var pathAry = pathStr.split("."); 
	$.each(pathAry, function (i, path) {
		if (i == 0) {
			str += path.charAt(0).toLowerCase() + path.slice(1);
		} else {
			str += path.charAt(0).toUpperCase() + path.slice(1);
		}
	});
	return str;
}
	
function renderParentPath(pathStr) {
	var str = "";
	var operationAry = pathStr.split(".");
	var operationType = operationAry.shift();
	str += operationType + " "
	if (operationType == "query") {
		str += operationAry[0];
	} else {
		$.each(operationAry, function (i, operation) {
			if (i == 0) {
				str += operation;
			} else {
				str += operation.charAt(0).toUpperCase() + operation.slice(1);
			}
		});
	}
	return str;
}


function formatJSONParamObj(param) {
	if ($(param).attr("type").substr(0, 3) == "xs:") $(param).attr("type", $(param).attr("type").substr(3));
	if (catoJsonParamMapping[$(param).attr("name")] != undefined) { param = catoJsonParamMapping[$(param).attr("name")]; } else { $(param).attr("values", $(param).attr("type")); }
	return param;
}

function loadParamValuesByName(paramName, paramActionObj) {
	if (paramActionObj.function != undefined) {
		paramActionObj.function(paramActionObj);
		// updateRequestData();
		// if (paramActionObj.children != undefined && paramActionObj.children.length != 0) {
		// 	loadParamChildValues(paramName);
		// }
	}
	//  else {
	// 	var auth = getCurApiKey($('#catoApiKeys').val())
	// 	auth.method = "headers";
	// 	$("#"+paramName).addClass('processing').html('<option value="">loading...</option>');
	// 	var contentType = (paramActionObj.definition!=undefined && catoAPIDefinitions[paramActionObj.definition].definition.consumes!=undefined) ? catoAPIDefinitions[paramActionObj.definition].definition.consumes[0] : "application/json";
	// 	var reqObj = (contentType=="application/json") ? {"jsonData":{}} : {"postData":{}};
	// 	var postData = (contentType=="application/json") ? reqObj["jsonData"] : reqObj["postData"] ;
	// 	var queryParams = [];
	// 	var curApiAction = paramActionObj.action;

	// 	if (paramActionObj.parents!=undefined) {
	// 		$.each(paramActionObj.parents, function(i,parentParam) {
	// 			var curParentName = (parentParam.renameLookupParam==undefined) ? parentParam.id.split("___").pop() : parentParam.renameLookupParam;
	// 			if ($('#'+parentParam.id).length!=0) {
	// 				if (parentParam.in=="query") {
	// 					queryParams.push(curParentName+"="+$('#'+parentParam.id).val());
	// 				} else if (parentParam.in=="path") {
	// 					curApiAction = curApiAction.replace("{"+curParentName+"}",$('#'+parentParam.id).val());
	// 				} else {
	// 					postData[curParentName] = $('#'+parentParam.id).val();
	// 				}
	// 			}
	// 		});
	// 	}
	// 	if (paramActionObj.addedLookupParams!=undefined) {
	// 		$.each(paramActionObj.addedLookupParams, function(i,addedParam) {
	// 			var curParentName = (addedParam.renameLookupParam==undefined) ? addedParam.id.split("___").pop() : addedParam.renameLookupParam;
	// 			var curParentVal = (addedParam.value!=undefined) ? addedParam.value : $('#'+addedParam.id).val();
	// 			if (addedParam.in=="query") {
	// 				queryParams.push(curParentName+"="+curParentVal);
	// 			} else if (addedParam.in=="path") {
	// 				curApiAction = curApiAction.replace("{"+curParentName+"}",curParentVal);
	// 			} else {
	// 				postData[curParentName] = curParentVal;
	// 			}
	// 		});
	// 	}
	// 	curApiAction += (queryParams.length!=0) ? '?'+queryParams.join("&") : '';
	// 	makeIncapCall((paramActionObj.loadFromLocal ? "" : getSwHost(paramActionObj.definition))+curApiAction,paramActionObj.method,auth,renderParamListValues,reqObj,paramName,contentType);
	// }
}

function loadParamChildValues(paramName) {
	var paramActionObj = (catoGetObjectActionMapping[paramName][$('#catoActions').val()] != undefined) ? catoGetObjectActionMapping[paramName][$('#catoActions').val()] : catoGetObjectActionMapping[paramName].default;
	if (paramActionObj != undefined) {
		if (paramActionObj.children != undefined && paramActionObj.children.length != 0) {
			$.each(paramActionObj.children, function (i, childParamName) {
				if ($('#' + childParamName).length > 0) {
					loadParamValuesByName(childParamName);
				}
			});
		}
	}
}

function renderParamListValues(response, input_id) {
	var paramActionObj = (catoGetObjectActionMapping[input_id][$('#catoActions').val()] != undefined) ? catoGetObjectActionMapping[input_id][$('#catoActions').val()] : catoGetObjectActionMapping[input_id].default;
	$("#" + input_id).removeClass('processing').html(($("#" + input_id).attr("required") == "required" || $("#" + input_id).prop("multiple")) ? '' : '<option value="">-- select --</option>');
	var paramActionObjIndex = [];
	var paramActionObjAry = {};
	if (paramActionObj.listName != undefined) {
		$.each(response[paramActionObj.listName], function (i, subGroupObj) {
			var displayText = getParamDisplayText(subGroupObj, paramActionObj);
			paramActionObjIndex.push(displayText + '_' + subGroupObj[paramActionObj.id]);
			paramActionObjAry[displayText + '_' + subGroupObj[paramActionObj.id]] = subGroupObj;
		});
		paramActionObjIndex.sort();
		$.each(paramActionObjIndex, function (i, paramActionIdStr) {
			var subGroupObj = paramActionObjAry[paramActionIdStr];
			var displayText = getParamDisplayText(subGroupObj, paramActionObj);
			var displayValue = subGroupObj[paramActionObj.id];
			$("#" + input_id).append('<option title="' + displayText + ' (' + subGroupObj[paramActionObj.id] + ')" value="' + subGroupObj[paramActionObj.id] + '">' + displayText + ' (' + displayValue + ')</option>');
		});
	} else if (paramActionObj.objectName != undefined) {
		$("#" + input_id).append('<option value="' + response[paramActionObj.objectName][paramActionObj.id] + '">' + response[paramActionObj.objectName][paramActionObj.displayText] + ' (' + response[paramActionObj.objectName][paramActionObj.id] + ')</option>');
	} else if (Array.isArray(response)) {
		$.each(response, function (i, subGroupObj) {
			var displayText = getParamDisplayText(subGroupObj, paramActionObj);
			paramActionObjIndex.push(displayText + '_' + subGroupObj[paramActionObj.id]);
			paramActionObjAry[displayText + '_' + subGroupObj[paramActionObj.id]] = subGroupObj;
		});
		paramActionObjIndex.sort();
		$.each(paramActionObjIndex, function (i, paramActionIdStr) {
			var subGroupObj = paramActionObjAry[paramActionIdStr];
			var displayText = getParamDisplayText(subGroupObj, paramActionObj);
			var displayValue = subGroupObj[paramActionObj.id];
			$("#" + input_id).append('<option title="' + displayText + ' (' + subGroupObj[paramActionObj.id] + ')" value="' + subGroupObj[paramActionObj.id] + '">' + displayText + ' (' + displayValue + ')</option>');
		});
	} else {
		if (response[paramActionObj.id] != undefined) $("#" + input_id).append('<option value="' + response[paramActionObj.id] + '">' + response[paramActionObj.displayText] + ' (' + response[paramActionObj.id] + ')</option>');
	}
	if (paramActionObj.children != undefined && paramActionObj.children.length != 0) {
		loadParamChildValues(input_id);
	}
	if ($("#" + input_id).html() == '') $("#" + input_id).html('<option value="">No Value Available</option>');
	$('#' + input_id).unbind().change(function () { loadParamChildValues(this.id); updateRequestData(); });
	updateRequestData();
}

// Main AJAX function to proxy API calls
function makeCall(callback, query, input_id, api_key, account_id, endpoint) {
	var operationName = "introspectionQuery";
	var url = "/ajax/cato_api_post.php?server=" + (endpoint!=undefined ? endpoint : $('#catoServer').val()) + "&operation=" + operationName;
	var method = "POST";
	if ($('#catoOperations').val()!=null) {
		var operationAry = $('#catoOperations').val().split(".");
		operationName = (!$('#catoOperations').val() == '') ? operationAry[1] : "introspectionQuery";
	}
	if (operationName=="introspectionQuery") {
		if (catoConfig.schema.loadFromLocal==true) {
			url = catoConfig.schema.fileName;
			method = "GET";
		}
	}
	if (api_key == null || api_key == undefined) {
		var usrObj = getCurApiKey();
		api_key = usrObj.api_key;
		account_id = usrObj.account_id;
	}
	operationAry = operationName.split(".")
	operationType = operationAry.pop(0)
	if (query == undefined) {
		query = fmtQuery(`{
			"query":"`+ $('#catoQuery').val() + `",
			"variables":`+ $('#catoVariables').val() + `,
			"operationName":"`+ renderParentPath($('#catoOperations').val()).split(" ").pop()+`"
		}`);
		// "operationName":"`+ renderCamelCase($('#catoOperations').val().split(".").slice(1).join(".")) + `"
	} else {
		var queryJson = JSON.parse(query);
		if (queryJson.operationName) operationName = "/"+queryJson.operationName;
	}	
	$.ajax({
		url: url,
		type: method,
		contentType: 'application/json',
		data: JSON.stringify(query),
		headers: {
			"Accept": "application/json",
			"x-api-key": api_key,
			"x-account-id": account_id,
			"User-Agent": "Cato-API-Explorer/v"+catoConfig.version
		},
		success: function (data) {
			if (data.data==undefined){
				data = {"data":data}
			}
			if (data != null) {
				responseObj = data;
				if (input_id == undefined || input_id == null) $('#catoResult').val(JSON.stringify(data));
				if (callback != undefined) {
					if (input_id != null && input_id != undefined && input_id != 'dest') {
						return callback(data, input_id);
					} {
						return callback(data);
					}
				}
			} else {
				$.gritter.add({ title: 'ERROR', text: "API response error, unable to connect to Cato." });
			}
		},
		error: function (xhr, status, error) {
			$.gritter.add({ title: 'ERROR', text: JSON.stringify(error) });
		}
	});
}

function checkCatoForm(parentId) {
	if (parentId == undefined) parentId = '#catoBodyParams .param1';
	var isok = true;
	if ($(parentId + ':not(".hidden"):not(".disabled")').length == 0 || $(parentId + ' .loading').length>0) {
		isok = false
	} else {
		$.each($(parentId + ':not(".hidden"):not(".disabled")'), function (i, input) {
			var paramok = true;
			var inputObj = $('#' + input.id);
			if (inputObj.val() == '' && inputObj.hasClass("parent")) {
				inputObj.val((inputObj.parent().prop("class") == 'object') ? "{}" : "[]");
			}
			if (inputObj.prop("required") && inputObj.val() == '') {
				inputObj.addClass('errors');
				paramok = false; isok = false;
			// } else if (inputObj.prop("required") && inputObj.prop("type") == "select-multiple" && inputObj.find(":selected").length == 0) {
			// 	inputObj.addClass('errors');
			// 	paramok = false; isok = false;
			} else if (inputObj.parent().attr("class") == "object" || inputObj.parent().attr("class") == "array_object") {
				// debugger
				var val = inputObj.val();
				if (!IsJsonString(val)) {
					paramok = false;
					isok = false;
					inputObj.addClass('errors');
				}
				// if (inputObj.prop("required")) {
				// 	if (String(inputObj.val().trim()) == String("{}") || !IsJsonString(val)) {
				// 		paramok = false;
				// 		isok = false;
				// 		inputObj.addClass('errors');
				// 	}
				// } else if (!IsJsonString(val)) {
				// 	paramok = false;
				// 	isok = false;
				// 	inputObj.addClass('errors');
				// }
			} else if (inputObj.val() != '') {
				var val = inputObj.val();
				switch (inputObj.parent().attr("class")) {
					case "id":
					case "text":
						if (inputObj.hasClass("list")) {
							var strAry = val.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").replaceAll("'", "").split(",");
							for (i in strAry) {
								if (strAry[i] instanceof String) { paramok = false; isok = false; inputObj.addClass('errors'); }
							}
						}
						break;
					case "ipsubnet":
						if (!isValidSubnet(val)) { paramok = false; isok = false; inputObj.addClass('errors'); }
						break;
					case "ipaddress":
						if (!isValidIP(val)) { paramok = false; isok = false; inputObj.addClass('errors'); }
						break;
					case "iprange":
						if (!isValidIPRange(val)) { paramok = false; isok = false; inputObj.addClass('errors'); }
						break;
					case "int":
					case "integer":
						if (intStringParams[inputObj.attr("name")]==undefined) {
							if (inputObj.hasClass("list")) {
								valAry = [];
								if (val != null) {
									var intAry = val.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").replaceAll("'", "").split(",");
									for (i in intAry) {
										if (isNaN(intAry[i])) { paramok = false; isok = false; inputObj.addClass('errors'); }
									}
								}
							} else {
								if (isNaN(val)) { paramok = false; isok = false; inputObj.addClass('errors'); }
							}
						}
						break;
					case "boolean":
						if (!(val === 'false' || val === 'true')) { paramok = false; isok = false; inputObj.addClass('errors'); }
						break;
				}
			}
			if (paramok) { inputObj.removeClass('errors'); }
		});
	}
	if (isok == false) {
		$('#catoQuery').val(""); $('#catoVariables').val("");
		$("#execute").attr("disabled", true).addClass("disabled");
	} else {
		$("#execute").attr("disabled", false).removeClass("disabled");
	}
	return isok;
}


function getParamDisplayText(record, paramActionObj) {
	var displayText = '';
	if (Array.isArray(paramActionObj.displayText)) {
		$.each(paramActionObj.displayText, function (i, attrName) {
			if (displayText != '') displayText += ' - '
			displayText += record[attrName];
		});
	} else {
		displayText = record[paramActionObj.displayText];
	}
	return displayText;
}

function openFilterDialog() {
	$('#filterDialog').dialog({ width: "auto", height: "auto" });
}

// Settings, object management
function removeMemberAndIndexById(objAry, cur_id) {
	delete objAry.members[cur_id];
	objAry.index = [];
	$.each(objAry.members, function (id, subObj) { objAry.index.push(id); });
	objAry.index.sort();
	return objAry;
}

function getCurApiKey() {
	var indexId = $("#catoApiKeys").val();
	CATO_API_KEYS = JSON.parse(localStorage.getItem('CATO_API_KEYS'));
	var userObj = CATO_API_KEYS[indexId];
	if (userObj != undefined) {
		return userObj;
	} else {
		return null;
	}
}

function isValidURL(str) {
	var a = document.createElement('a');
	a.href = str;
	return (a.host && a.host != window.location.host);
}

function renderPageNumberOptions() {
	var str = '';
	for (var i = 0; i < catoDefConfig.sitePageNum; i++) {
		str += '<option value="' + i + '">' + i + '</option>';
	}
	return str;
}

function copy(obj) {
	// try {
	var newObj = JSON.parse(JSON.stringify(obj));
	// }
	// catch (error) {
	// 	console.log(error,obj);
	// }
	return newObj;
}

function getCurrentOperation() {
	var operationType = $('#catoOperations option:selected').prevAll('optgroup').attr('label');
	var operationName = $('#catoOperations').val();
	return catoApiSchema[operationType][operationName];
}

function initSearch() {
	$('.searchBtn').unbind("click").click(function () {
		var id_str = this.id.split("xx")[0];
		var param = $("#" + id_str);
		var searchStr = $('#' + id_str + 'xxsearch').val().trim();
		$('#' + id_str + 'xxsearch').addClass('loading');
		if (catoGetObjectActionMapping[$(param).attr("name")]) {
			var paramActionObj = null;
			if (catoGetObjectActionMapping[$(param).attr("name")][curOperationObj.name]) {
				paramActionObj = catoGetObjectActionMapping[$(param).attr("name")][curOperationObj.name];
			} else {
				paramActionObj = catoGetObjectActionMapping[$(param).attr("name")].default;
			}
			paramActionObj.searchStr = searchStr;
			if (paramActionObj.function) {
				paramActionObj.function(paramActionObj, id_str);
			} else {
				$.gritter.add({ title: 'ERROR', text: "No function defined for '" + param.name + "' in operation '" + curOperationObj.name + "'." });
			}
		}
	}).click();

	$('.singleValue').unbind("change").change(function () {
		if ($(this).find("option:selected").length > 1) {
			$(this).find("option:selected").each(function (i, option) {
				if (i > 0) $(option).prop("selected", false);
			});
			$.gritter.add({ title: 'Error', text: "'" + this.id + "' is limited to a single record." });
		}
		updateRequestData();
	});

	$('.moveLeft').unbind("click").click(function () {
		if (!$('#' + this.id).hasClass("disabled")) moveItems('#' + this.id.split("xx")[0], '#' + this.id.split("xx")[0] + 'xxleft');
	});

	$('.moveRight').unbind("click").click(function () {
		if (!$('#' + this.id).hasClass("disabled")) {
			moveItems('#' + this.id.split("xx")[0] + 'xxleft', '#' + this.id.split("xx")[0]);
			$('#' + this.id.split("xx")[0] + " option").prop("selected", "selected");
		}
	});

	$('.moveLeftAll').unbind("click").click(function () {
		if (!$('#' + this.id).hasClass("disabled")) moveAllItems('#' + this.id.split("xx")[0], '#' + this.id.split("xx")[0] + 'xxleft');
	});

	$('.moveRightAll').unbind("click").click(function () {
		if (!$('#' + this.id).hasClass("disabled")) {
			moveAllItems('#' + this.id.split("xx")[0] + 'xxleft', '#' + this.id.split("xx")[0]);
			$('#' + this.id.split("xx")[0] + " option").prop("selected", "selected");
		}
	});
}
function moveItems(origin, dest) {
	var desOptions = $.map($(dest).find("option"), function (option) { return option.value; });
	$.each($(origin).find(':selected'), function (i, option) {
		if (!desOptions.includes(option.value)) { $(option).appendTo(dest); } else { $(option).remove(); }
	});
	updateRequestData();
}
function moveAllItems(origin, dest) {
	var desOptions = $.map($(dest).find("option"), function (option) { return option.value; });
	$.each($(origin).children(), function (i, option) {
		if (!desOptions.includes(option.value)) { $(option).appendTo(dest); } else { $(option).remove(); }
	});
	updateRequestData();
}

function populateFieldsFromTemplateSelect(select) {
	if ($(select).val() != '') {
		var fieldObj = JSON.parse($(select).val().replaceAll('|;|', '"'));
		$.each(fieldObj, function (fieldName, fieldVal) {
			$('#' + $(select).attr("id").replace("_template", "___") + fieldName).val(fieldVal);
		});
	}
}

function toggleResponseArgParam(input) {
	// console.log(input);
	// var input_id = $(input).attr("id")
	// var tr = ($("#" + input_id.replace("_toggle", "tr")).length > 0) ? $("#" + input_id.replace("_toggle", "tr")) : $("#" + input_id.replace("_toggle", "_tbltr"));	
	var tr = $("#" + $(input).attr("id").replace("_toggle", "tr"));
	var searchtr = $("#" + $(input).attr("id").replace("_toggle", "searchtr"));
	var inputstr = "input, select, textarea, a:not(.toggleField), label";
	if ($(input).hasClass("ui-icon-cancel")) {
		$(input).removeClass("ui-icon-cancel").addClass("ui-icon-circle-plus");
		$.each(tr.find(inputstr), function (i, input) {
			$(input).removeClass("errors").addClass("disabled").attr('disabled', true);
		});
		$.each(searchtr.find(inputstr), function (i, input) {
			$(input).removeClass("errors").addClass("disabled").attr('disabled', true);
		});
	} else {
		$(input).removeClass("ui-icon-circle-plus").addClass("ui-icon-cancel");
		tr.find(inputstr).attr('disabled', false).removeClass("disabled");
		if (searchtr.length > 0) searchtr.find(inputstr).attr('disabled', false).removeClass("disabled");
	}
	renderResponseArguments();
}

function checkForChildOperation(fieldsAry) {
	var newFieldList = {};
	subOperation = false;
	$.each(fieldsAry, function (i, field) {
		if (curOperationObj.childOperations && curOperationObj.childOperations[field.name]) {
			subOperation = field;
		}
		newFieldList[field.name] = copy(field);
	});
	if (subOperation != false) {
		newFieldList = {};
		newFieldList[subOperation.name] = subOperation;
	}
	return newFieldList;
}

function renderParamDisplayName(param) {
	console.log(param.name, param.id_str, param.path);
	str = (param.id_str.includes("___") ? param.id_str.split("___").pop() : param.path);
	return str;
}