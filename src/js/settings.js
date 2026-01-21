var catoConfig = {
	"servers":{
		"Ireland":"https://api.catonetworks.com/api/v1/graphql2",
		"Japan":"https://api.jp1.catonetworks.com/api/v1/graphql2",
		"India":"https://api.in1.catonetworks.com/api/v1/graphql2",
		"US1":"https://api.us1.catonetworks.com/api/v1/graphql2"
	},
	"version": window.DOCKER_VERSION,
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

var developmentServers = {
	"https://api.cc.sta.catonet.works/api/v1/graphql2":true
}

// Add parent field name here to force child operations
var childOperationParent = {
	"xdr":true,
	"policy":true,
	"groups":true,
	"groupList":true,
	"newGroups":true,
	"site":true,
	"container":true,
	"catalogs":true,
	"ztnaAppConnector":true
}
// Add ofType name here to force child operations
var childOperationObjects = {
	"ipAddressRange":true,
	"fqdn":true,
	"PolicyQueries":true,
	"GroupsQueries":true,
	"ContainerQueries":true,
	"SiteQueries":true
}

var catoGetObjectActionMapping = {
	"accountID":{
	  	"default": {
			function: function (paramActionObj, paramName) { getAccountIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getAccountIDsResponse(response, paramName) }
	  	}
	},
	"accountIDs": {
		"default": {
			function: function (paramActionObj, paramName) { getAccountIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getAccountIDsResponse(response, paramName) }
		}
	},
	"accountId": {
		"default": {
			function: function (paramActionObj, paramName) { getAccountIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getAccountIDsResponse(response, paramName) }
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
	// "ref": {
	// 	"mutation.container.fqdn.updateFromFile": {
	// 		function: function (paramActionObj, paramName) { getContainerFQDN(paramActionObj, paramName) },
	// 		callback: function (response, paramName) { getContainerFQDNResponse(response, paramName) }
	// 	}
	// },
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