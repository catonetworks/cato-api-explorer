var catoConfig = {
	"server":"https://api.catonetworks.com/api/v1/graphql2",
	"version":"1.0.2",
	"schema":{
		"loadFromLocal":false,
		"fileName":"introspection.json"
	}
}

// https://api.sta.catonet.works/api/v1/graphql2

// Example Param Structure:
// "paramNameHere"
//   "default or /api/action":{
//   "loadFromLocal": true
/********** specify action and responose attributes to parse and populate from api  ************/
//    "action":"/api-security/api/{siteId}",
// 	  "definition":"API (v1)", // see APIDefinitions
// 	  "method":"POST",
// 	  "listName":"resultList", // objectName, listName
// 	  "id":"sub_account_id",
// 	  "displayText":"sub_account_name"
//	  "addedLookupParams":[
//	    {"id":"AccountIDList","in":"body","renameLookupParam":"account_id"},
//		{"id":"page_size","in":"body","value":"100"},
//		{"id":"page_num","in":"body","value":"0"}
//	  ],

// "paramNameHere":{
//   "default or /api/action":{
//   "loadFromLocal": true
// /********** specify action and responose attributes to parse and populate from api  ************/
//    "action":"/api-security/api/{siteId}",
// 	  "definition":"Cloud WAF API (v1)", // see APIDefinitions
// 	  "method":"POST",
// 	  "listName":"resultList", // objectName, listName
// 	  "id":"sub_account_id",
// 	  "displayText":"sub_account_name"
// 	  "addedLookupParams":[
// 	    {"id":"AccountIDList","in":"body","renameLookupParam":"account_id"},
// 		{"id":"page_size","in":"body","value":"100"},
// 		{"id":"page_num","in":"body","value":"0"}
// 	  ],

var intStringParams = {"networkRangeId":true}

var childOperationObjects = {
	"ipAddressRange":true,
	"fqdn":true
}

var catoGetObjectActionMapping = {
	"accountID":{
	  	"default": {
			function: function (paramActionObj, paramName) { populateAccountID(paramName) },
	  	}
	},
	"accountIDs": {
		"default": {
			function: function (paramActionObj, paramName) { populateAccountID(paramName) },
		}
	},
	"accountId": {
		"default": {
			function: function (paramActionObj, paramName) { populateAccountID(paramName) },
		}
	},
	"adminID": {
		"default": {
			function: function (paramActionObj, paramName) { getAdminIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getAdminIDsResponse(response, paramName) }
		}
	},
	"adminIDs": {
		"default": {
			function: function (paramActionObj, paramName) { getAdminIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getAdminIDsResponse(response, paramName) }
		}
	},
	"lanSocketInterfaceId": {
		"default": {
			function: function (paramActionObj, paramName) { getlanSocketInterfaceIds(paramActionObj, paramName) },
			callback: function (response, paramName) { getlanSocketInterfaceIdsResponse(response, paramName) }
		}
	},
	"networkRangeId": {
		"default": {
			function: function (paramActionObj, paramName) { getNetworkRangeIds(paramActionObj, paramName) },
			callback: function (response, paramName) { getNetworkRangeIdsResponse(response, paramName) }
		}
	},
	"siteLocation": {
		"default": {
			renderValuesFromObject: true
			// function: function (searchStr) { getSiteLocation(searchStr) }
		}
	},
	// "role": {
	// 	"default": {
	// 		renderValuesFromObject: true,
	// 		function: function (paramActionObj, paramName) { getRoles(paramActionObj, paramName) },
	// 		callback: function (response, paramName) { getRolesResponse(response, paramName) }
	// 	}
	// },
	"siteId": {
		"default": {
			search: true,
			singleValue: true,
			function: function (paramActionObj, paramName) { getSiteIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getSiteIDsResponse(response, paramName) }
		}
	},
	"siteIDs": {
		"default": {
			search: true,
			function: function (paramActionObj, paramName) { getSiteIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getSiteIDsResponse(response, paramName) }
		}
	},
	"storyId": {
		"default": {
			function: function (paramActionObj, paramName) { getStoryIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getStoryIDsResponse(response, paramName) }
		}
	},
	"subdomains": {
		"default": {
			function: function (paramActionObj, paramName) { getSubdomains(paramActionObj, paramName) },
			callback: function (response, paramName) { getSubdomainsResponse(response, paramName) }
		}
	},
	"userIDs": {
		"default": {
			search: true,
			function: function (paramActionObj, paramName) { getUserIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getUserIDsResponse(response, paramName) }
		}
	}
}



// networkRangeId

// "data": {
// 		"entityLookup": {
// 			"items": [
// 				{
// 					"entity": {
// 						"id": "UzMyODE0MA==",
// 						"name": "SD-Office \\ LAN \\ BA_GUEST",


// "countryCode": {
// 	"default": {
// 		"function": function () { getCountryCodes(this) },
// 	},
// 	"children": ["timezone","stateCode","city"]
// },


// {
// 	"data": {
// 		"entityLookup": {
// 			"items": [
// 				{
// 					"entity": {
// 						"id": "112139",
// 						"name": "IKEv1 Lab \\ Default",

// relayGroupId
// query entityLookup ( $accountID:ID! $type:EntityType! ) {
// 	entityLookup ( accountID:$accountID type:$type  ) {
// 	items  {
// 		entity {
// 			id 
// 			name 
// 			type 
// 		}
// 		description
// 		helperFields
// 	}
// 	total 
// }	
// }
// {
// 	"accountID": 10454,
// 		"type": "dhcpRelayGroup"
// // }
// { "data": { "entityLookup": { "items": [], "total": 0 } } }

// host
// query entityLookup($accountID: ID! $type: EntityType!) {
// 		entityLookup(accountID: $accountID type: $type) {
// 	items  {
// 		entity {
// 					id
// 					name
// 					type
// 				}
// 				description
// 				helperFields
// 			}
// 			total
// 		}
// 	}
// {
//     "accountID": 10454,
// 	"type": "host"
// }
// "data": {
// 		"entityLookup": {
// 			"items": [
// 				{
// 					"entity": {
// 						"id": "1286757",
// 						"name": "AvertX (proconnect-G50636356)",
// 						"type": "host"
// 					},
// 					"description": "192.168.1.110 (SD-Office: LAN)",
