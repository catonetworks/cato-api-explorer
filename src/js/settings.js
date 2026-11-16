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
	"networkConfig":true,
	"posture":true,
	"ztnaAppConnector":true,
	"aiSecurity":true,
	"devices":true,
	"notification":true,
	"object":true,
	"popLocations":true,
	"user":true,
	"businessPlatform":true,
	"rbac":true
}
// Add ofType name here to force child operations
var childOperationObjects = {
	"ipAddressRange":true,
	"fqdn":true,
	"PolicyQueries":true,
	"GroupsQueries":true,
	"ContainerQueries":true,
	"SiteQueries":true,
	"firewall":true,
	// networkConfig: the dhcp/dns namespace fields take no args, so recursion
	// stops and networkConfig collapses into one flat top-level operation.
	// Forcing these container types splits it into per-operation children.
	"NetworkConfigMutations":true,
	"NetworkConfigQueries":true,
	"NetworkConfigDhcpQueries":true,
	"NetworkConfigDnsQueries":true,
	// posture: query.posture is gated by childOperationParent above; PostureQueries
	// keeps the no-arg complianceFrameworkList reachable and PostureMutations exposes
	// the no-arg reevaluateChecks mutation. Arg-bearing leaf ops split automatically.
	"PostureQueries":true,
	"PostureMutations":true,
	// aiSecurity: query.aiSecurity is gated by childOperationParent above. Its
	// apps/endUsers/agents namespace fields take no args, so recursion stops and
	// aiSecurity collapses into one flat op demanding all four inputs at once.
	// Forcing the AiSecurityQueries container splits it into per-operation children
	// (apps.invocation, endUsers.sessionConversation, agents.session, agents.event).
	"AiSecurityQueries":true,
	// notification: query.notification is gated by childOperationParent above. Its
	// return type (NotificationSubscriptionQueries) and the nested integration wrapper
	// (IntegrationQueries) both expose no-arg list/namespace fields; forcing both
	// container types deep-splits notification into per-operation children
	// (mailingList, subscriptionGroup, integration.webhook, integration.referenceBodyTemplate,
	// plus the no-arg list ops) instead of one flat op demanding every *RefInput at once.
	"NotificationSubscriptionQueries":true,
	"IntegrationQueries":true,
	// notification (mutation side): mutation.notification's createMailingList/update.../
	// delete.../createSubscriptionGroup/update.../delete... all carry args and split on
	// their own, but the nested "integration" field (-> IntegrationMutations) takes no
	// args, so recursion stopped there and the four webhook mutations (createWebhook/
	// updateWebhook/deleteWebhook/testWebhook -- each of which does carry args and would
	// split fine once reached) were unreachable. Forcing NotificationSubscriptionMutations
	// deep-splits into mutation.notification.integration.{createWebhook,updateWebhook,
	// deleteWebhook,testWebhook}. Mirrors enabling NotificationSubscriptionMutations in
	// cato-cli/catocli/clisettings.json (same underlying GraphQL type).
	"NotificationSubscriptionMutations":true,
	// popLocations: query.popLocations is gated by childOperationParent above. Most of
	// PopLocationQueries' fields carry args (popLocationList/allocatedIpList/bgpProfile)
	// and split on their own, but bgpProfileList takes no args; forcing the container
	// type keeps it as its own sub-operation instead of dropping it. (object needs no
	// container forcing — both ObjectQueries fields carry args.)
	"PopLocationQueries":true,
	// user: query.user is gated by childOperationParent above. Most UserQueries
	// fields carry args (userList/usersGroup/usersGroupList) and split on their own,
	// but dynamicUserGroupsConfiguration takes no args; forcing the container type
	// keeps it as its own sub-operation instead of dropping it.
	"UserQueries":true,
	// businessPlatform: query.businessPlatform is gated by childOperationParent above.
	// accountList/countAccountByPlan/partnerList carry args and split on their own,
	// but settings and accountOverview take no args; forcing the container type keeps
	// them reachable as their own sub-operations instead of collapsing businessPlatform
	// into one flat op demanding every list input at once.
	"BusinessPlatformQueries":true,
	// rbac: query.rbac/mutation.rbac are gated by childOperationParent above. The
	// roleManagement wrapper field takes no args, so recursion would stop without
	// forcing the RBAC container types; the RoleManagement* types keep their no-arg
	// fields (e.g. permissionCatalog) reachable as their own sub-operations.
	"RBACQueries":true,
	"RBACMutations":true,
	"RoleManagementQueries":true,
	"RoleManagementMutations":true
}
// Add a wrapper field (or its ofType name) here to make it a TERMINAL child operation:
// it is forced into the operation path as a child, but recursion STOPS there so all of
// its sub-fields render together inside one query instead of each splitting into its own
// operation. devices.attributesCatalog -> one op selecting category/type/os/model/
// manufacturer/compliance/risk together.
var childOperationLeafObjects = {
	"attributesCatalog":true
}
// Field names stripped from a specific operation's selection (and therefore from
// its hoisted arguments), keyed by full dotted operation path. groups.groupList:
// the API rejects the members field inside groupList ("The 'members' field cannot
// be requested in the 'groupList' query"); members are fetched separately via
// query.groups.group.members. Mirrors operationFieldExclusions in
// cato-cli/catocli/clisettings.json.
var operationFieldExclusions = {
	"query.groups.groupList": ["members"],
	"query.newGroups.groupList": ["members"],
	// deleteSubscriptionGroup echoes back the DELETED group's nested mailingList
	// (incl. audit.updatedBy, a non-null ActorRef the API returns null for) and
	// integration.webhookList -- resolving those for a just-deleted group makes the
	// notification service return DOWNSTREAM_SERVICE_ERROR / "Response is not valid",
	// failing the whole response even though the delete succeeded. Trim the response
	// to subscriptionGroup { id name } until the schema/service bug is fixed.
	"mutation.notification.deleteSubscriptionGroup": ["mailingList", "integration"]
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
	// siteRefInput: an ObjectRef-shaped input { by: ID|NAME, input: String }. Instead of a
	// free-text `input`, render an "Available site(s):" picker whose options each carry BOTH
	// the id and the name; the value written into `input` follows the `by` dropdown (ID -> id,
	// NAME -> name) and is re-written whenever `by` changes. refPicker/byField/inputField/
	// entityType drive the generic plumbing in renderInputNestedFieldsHtml + populateRefFromSelect
	// + getObjectRefs; the shared getObjectRefs query is parameterized by entityType. Keyed like
	// sessionId, so a per-operation override (curOperationObj._loadedOpName) can be added later.
	"siteRefInput": {
		"default": {
			refPicker: true,
			byField: "by",
			inputField: "input",
			entityType: "site",
			function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) },
			callback: function (response, paramName) { getObjectRefsResponse(response, paramName) }
		}
	},
	// entityLookup-backed ObjectRef pickers for the {by: ID|NAME, input: String}-shaped *RefInput
	// types. Each RefInput maps to an EntityType enum value (intrinsic to the type, not the
	// operation), so a single ".default" entry safely covers every operation that nests the type:
	// renderInputNestedFieldsHtml resolves the mapping by the field's camelCased TYPE name, and
	// getObjectRefs is parameterized by entityType. The picker populates the current row's by/input;
	// for list fields the existing "Add" button (addObjectToParent) pushes each {by,input} onto the
	// array. To add a new one: confirm the RefInput is {by,input}-shaped and has a matching
	// EntityType, then add a ".default" entry below. NOTE: serviceRefInput -> simpleService is
	// pending live confirmation that entityLookup("simpleService") returns usable id+name options.
	"countryRefInput":                 { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "country",                function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"hostRefInput":                    { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "host",                   function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"allocatedIpRefInput":             { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "allocatedIP",            function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"userRefInput":                    { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "vpnUser",                function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"adminRefInput":                   { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "admin",                  function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"accountRefInput":                 { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "account",                function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"networkInterfaceRefInput":        { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "networkInterface",       function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"serviceRefInput":                 { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "simpleService",          function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"subscriptionGroupRefInput":       { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "groupSubscription",       function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"subscriptionMailingListRefInput": { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "mailingListSubscription", function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"subscriptionWebhookRefInput":     { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "webhookSubscription",     function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	"networkConfigDhcpRelayGroupRefInput": { "default": { refPicker: true, byField: "by", inputField: "input", entityType: "dhcpRelayGroup",      function: function (paramActionObj, paramName) { getObjectRefs(paramActionObj, paramName) }, callback: function (response, paramName) { getObjectRefsResponse(response, paramName) } } },
	// Tier 2: *RefInput types with no EntityType, sourced from a dedicated list query via getRefList/
	// getRefListResponse (refQuery builds the request; the callback's dot-path locates items[]). All
	// are {by: ID|NAME, input: String}-shaped, so the same refPicker UI + populateRefFromSelect apply.
	// Minimal inputs: GroupListInput and the policy list inputs require sort + paging (both non-null);
	// usersGroup/customApplication inputs take paging only. accountId casing matches each query.
	"groupRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query groupsGroupList ( $accountId:ID! $groupListInput:GroupListInput ) { groups ( accountId:$accountId ) { groupList ( input:$groupListInput ) { items { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "groupListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"groupsGroupList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "groups.groupList.items") } } },
	"usersGroupRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query userUsersGroupList ( $accountId:ID! $usersGroupListInput:UsersGroupListInput! ) { user ( accountId:$accountId ) { usersGroupList ( input:$usersGroupListInput ) { items { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "usersGroupListInput": { "paging": { "from": 0, "limit": 1000 } } }, "operationName":"userUsersGroupList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "user.usersGroupList.items") } } },
	"customApplicationRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query customAppDataCustomApplicationList ( $accountId:ID! $customApplicationListInput:CustomApplicationListInput! ) { customAppData ( accountId:$accountId ) { customApplicationList ( input:$customApplicationListInput ) { items { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "customApplicationListInput": { "paging": { "from": 0, "limit": 1000 } } }, "operationName":"customAppDataCustomApplicationList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "customAppData.customApplicationList.items") } } },
	"internetFirewallPolicyRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query policyInternetFirewallPolicyList ( $accountId:ID! $internetFirewallPolicyListInput:InternetFirewallPolicyListInput! ) { policy ( accountId:$accountId ) { internetFirewall { policyList ( input:$internetFirewallPolicyListInput ) { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "internetFirewallPolicyListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"policyInternetFirewallPolicyList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "policy.internetFirewall.policyList.items") } } },
	"wanFirewallPolicyRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query policyWanFirewallPolicyList ( $accountId:ID! $wanFirewallPolicyListInput:WanFirewallPolicyListInput! ) { policy ( accountId:$accountId ) { wanFirewall { policyList ( input:$wanFirewallPolicyListInput ) { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "wanFirewallPolicyListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"policyWanFirewallPolicyList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "policy.wanFirewall.policyList.items") } } },
	"socketLanPolicyRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query policySocketLanPolicyList ( $accountId:ID! $socketLanPolicyListInput:SocketLanPolicyListInput! ) { policy ( accountId:$accountId ) { socketLan { policyList ( input:$socketLanPolicyListInput ) { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "socketLanPolicyListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"policySocketLanPolicyList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "policy.socketLan.policyList.items") } } },
	// Tier 2 batch 2 (firewall-rule-adjacent object refs). NOTE: applicationRefInput sources the full
	// app catalog (capped at limit 1000, no in-picker search yet — large accounts may not see every
	// app). The three container ref types all list via container.list, differing only by the `types`
	// filter (the searchFqdn/searchIpAddressRange queries require a specific fqdn/IP, so they can't
	// list all). Catalog items live under `application` (not `items`); container items under `containers`.
	"applicationRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query catalogsCatalogApplicationList ( $accountId:ID! $catalogApplicationListInput:CatalogApplicationListInput! ) { catalogs ( accountId:$accountId ) { catalogApplicationList ( input:$catalogApplicationListInput ) { application { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "catalogApplicationListInput": { "paging": { "from": 0, "limit": 1000 } } }, "operationName":"catalogsCatalogApplicationList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "catalogs.catalogApplicationList.application") } } },
	"globalIpRangeRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query objectGlobalIpRangeList ( $accountId:ID! $globalIpRangeListInput:GlobalIpRangeListInput ) { object ( accountId:$accountId ) { globalIpRangeList ( input:$globalIpRangeListInput ) { items { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "globalIpRangeListInput": {} }, "operationName":"objectGlobalIpRangeList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "object.globalIpRangeList.items") } } },
	"containerRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query containerList ( $accountId:ID! $containerSearchInput:ContainerSearchInput! ) { container ( accountId:$accountId ) { list ( input:$containerSearchInput ) { containers { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "containerSearchInput": { "refs": [], "types": ["FQDN","IP_RANGE"] } }, "operationName":"containerList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "container.list.containers") } } },
	"fqdnContainerRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query containerList ( $accountId:ID! $containerSearchInput:ContainerSearchInput! ) { container ( accountId:$accountId ) { list ( input:$containerSearchInput ) { containers { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "containerSearchInput": { "refs": [], "types": ["FQDN"] } }, "operationName":"containerList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "container.list.containers") } } },
	"ipAddressRangeContainerRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query containerList ( $accountId:ID! $containerSearchInput:ContainerSearchInput! ) { container ( accountId:$accountId ) { list ( input:$containerSearchInput ) { containers { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "containerSearchInput": { "refs": [], "types": ["IP_RANGE"] } }, "operationName":"containerList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "container.list.containers") } } },
	// Tier 2 batch 3 (remaining entityLookup-less object refs). SKIPPED: bgpPeerRefInput and
	// wifiSsidRefInput — their list queries require a `site` ref in the input (site-scoped), so a
	// global list picker can't populate them without first choosing a site. Note item field names
	// vary: privateApp -> `applications`, contentTypeGroup -> `contentTypeGroup`, ztna ->
	// `ztnaAppConnector`; the rest use `items`. RBACRoleRefInput camelCases to "rBACRoleRefInput".
	"privateApplicationRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query privateApplicationPrivateApplicationList ( $accountId:ID! $privateApplicationListInput:PrivateApplicationListInput ) { privateApplication ( accountId:$accountId ) { privateApplicationList ( input:$privateApplicationListInput ) { applications { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "privateApplicationListInput": { "paging": { "from": 0, "limit": 1000 } } }, "operationName":"privateApplicationPrivateApplicationList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "privateApplication.privateApplicationList.applications") } } },
	"mailingListRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query notificationMailingListList ( $accountId:ID! ) { notification ( accountId:$accountId ) { mailingListList { items { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +` }, "operationName":"notificationMailingListList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "notification.mailingListList.items") } } },
	"rBACRoleRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query rbacRoleManagementRoleList ( $accountId:ID! $roleManagementRoleListInput:RoleManagementRoleListInput! ) { rbac ( accountId:$accountId ) { roleManagement { roleList ( input:$roleManagementRoleListInput ) { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "roleManagementRoleListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"rbacRoleManagementRoleList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "rbac.roleManagement.roleList.items") } } },
	"webhookIntegrationRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query notificationIntegrationWebhookList ( $accountId:ID! ) { notification ( accountId:$accountId ) { integration { webhookList { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +` }, "operationName":"notificationIntegrationWebhookList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "notification.integration.webhookList.items") } } },
	"webhookTemplateRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query notificationIntegrationReferenceBodyTemplateList ( $accountId:ID! ) { notification ( accountId:$accountId ) { integration { referenceBodyTemplateList { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +` }, "operationName":"notificationIntegrationReferenceBodyTemplateList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "notification.integration.referenceBodyTemplateList.items") } } },
	"ztnaAppConnectorRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query ztnaAppConnectorZtnaAppConnectorList ( $accountId:ID! $ztnaAppConnectorListInput:ZtnaAppConnectorListInput! ) { ztnaAppConnector ( accountId:$accountId ) { ztnaAppConnectorList ( input:$ztnaAppConnectorListInput ) { ztnaAppConnector { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "ztnaAppConnectorListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"ztnaAppConnectorZtnaAppConnectorList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "ztnaAppConnector.ztnaAppConnectorList.ztnaAppConnector") } } },
	"networkConfigDnsServerSetRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query networkConfigDnsServerSetList ( $accountId:ID! $networkConfigDnsServerSetListInput:NetworkConfigDnsServerSetListInput! ) { networkConfig ( accountId:$accountId ) { dns { serverSetList ( input:$networkConfigDnsServerSetListInput ) { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "networkConfigDnsServerSetListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"networkConfigDnsServerSetList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "networkConfig.dns.serverSetList.items") } } },
	"networkConfigDnsSuffixSetRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query networkConfigDnsSuffixSetList ( $accountId:ID! $networkConfigDnsSuffixSetListInput:NetworkConfigDnsSuffixSetListInput! ) { networkConfig ( accountId:$accountId ) { dns { suffixSetList ( input:$networkConfigDnsSuffixSetListInput ) { items { id name } } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "networkConfigDnsSuffixSetListInput": { "paging": { "from": 0, "limit": 1000 }, "sort": { "name": { "direction": "ASC", "priority": 1 } } } }, "operationName":"networkConfigDnsSuffixSetList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "networkConfig.dns.suffixSetList.items") } } },
	"applicationControlContentTypeGroupRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query catalogsContentTypeGroupList ( $accountId:ID! $catalogApplicationContentTypeGroupListInput:CatalogApplicationContentTypeGroupListInput! ) { catalogs ( accountId:$accountId ) { contentTypeGroupList ( input:$catalogApplicationContentTypeGroupListInput ) { contentTypeGroup { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "catalogApplicationContentTypeGroupListInput": { "paging": { "from": 0, "limit": 1000 } } }, "operationName":"catalogsContentTypeGroupList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "catalogs.contentTypeGroupList.contentTypeGroup") } } },
	"popLocationRefInput": { "default": { refPicker: true, byField: "by", inputField: "input",
		refQuery: function (u) { return `{ "query":"query popLocationsPopLocationList ( $accountId:ID! $popLocationFilterInput:PopLocationFilterInput ) { popLocations ( accountId:$accountId ) { popLocationList ( input:$popLocationFilterInput ) { items { id name } } } }", "variables":{ "accountId": `+ filterStr(u.account_id) +`, "popLocationFilterInput": {} }, "operationName":"popLocationsPopLocationList" }`; },
		function: function (p, n) { getRefList(p, n) },
		callback: function (r, n) { getRefListResponse(r, n, "popLocations.popLocationList.items") } } },
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
	},
	// sessionId: scoped to the aiSecurity operations ONLY (no default) so other
	// operations' sessionId inputs are unaffected. Each operation populates the
	// dropdown from the last 30 days of `events`, filtered to its AI event sub-type.
	// Resolution is by full operation path (curOperationObj._loadedOpName) via
	// resolveParamAction() in cato_common.js.
	"sessionId": {
		"query.aiSecurity.agents.event": {
			subTypes: ["Agent Interaction"],
			function: function (paramActionObj, paramName) { getSessionIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getSessionIDsResponse(response, paramName) }
		},
		"query.aiSecurity.agents.session": {
			subTypes: ["Agent Interaction"],
			function: function (paramActionObj, paramName) { getSessionIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getSessionIDsResponse(response, paramName) }
		},
		"query.aiSecurity.endUsers.sessionConversation": {
			subTypes: ["AI User Interaction"],
			function: function (paramActionObj, paramName) { getSessionIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getSessionIDsResponse(response, paramName) }
		}
	},
	// id: scoped to aiSecurity.apps.invocation ONLY (no default). `id` is a ubiquitous
	// field name, so a default here would hijack every operation's id input. Populates
	// from Generative-AI apps seen in the last 30 days of `appStats`.
	"id": {
		"query.aiSecurity.apps.invocation": {
			function: function (paramActionObj, paramName) { getGenAiAppIDs(paramActionObj, paramName) },
			callback: function (response, paramName) { getGenAiAppIDsResponse(response, paramName) }
		}
	}
}