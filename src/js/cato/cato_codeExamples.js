function generateCodeExamples(){
	$('#catoCLIUnixExample').html(transformToCLI());
    $('#catoCLIWinExample').html(String(transformToCLI()).replaceAll('"','\\"'));
    $('#catoCurlExample').html(transformToCURL());
    $('#catoPythonExample').html(transformToPython());
    
    var curTabInput = $("#catoExamplesNav .ui-state-active a").prop("id");
	$("#"+curTabInput.substr(0,curTabInput.length-3)).height("5px").height((5+$("#"+curTabInput.substr(0,curTabInput.length-3)).prop('scrollHeight'))+"px")		
}

function transformToCLI(auth = getCurApiKey($('#catoApiKeys').val())){
    var cliStr = '';
	if (checkCatoForm()) {
        var variables = JSON.parse($('#catoVariables').val());
        delete variables.accountID;
        delete variables.accountId;
	// Get selected operation from either searchable dropdown or regular input
	var selectedOperation = '';
	if (typeof searchableDropdown !== 'undefined' && searchableDropdown.getValue) {
		selectedOperation = searchableDropdown.getValue();
	} else {
		selectedOperation = $('#catoOperations').val();
	}
	cliStr = "catocli " + selectedOperation.replaceAll("."," ")+" -accountID="+auth.account_id+" '"+JSON.stringify(variables)+"'";
	}
	return cliStr;
}

function transformToCURL(requestUrl = $('#catoServer').val(), auth = getCurApiKey($('#catoApiKeys').val()), reqObj = $('#catoQuery').val(), maskSecretKey = $('#cato_configMaskSecretKey').is(":checked")){
    var curlStr = '';
	if (checkCatoForm()) {
	    if (auth.api_key==undefined) auth.api_key="************************************'"
		var headersStr = ' -H "Accept: application/json" -H "Content-Type: application/json" ';
		var paramsAry = [];
		headersStr += ' -H "x-API-Key: '+((maskSecretKey) ? starStr.substr(0,auth.api_key.length) : auth.api_key)+'" ';
		
		// Check for content type and format
	    var query = JSON.stringify({ 
			"query": fmtQuery(reqObj), 
			"variables": JSON.parse($('#catoVariables').val()),
		"operationName": renderParentPath((typeof searchableDropdown !== 'undefined' && searchableDropdown.getValue) ? searchableDropdown.getValue() : $('#catoOperations').val()).split(" ").pop()
		});
		curlStr = "curl -k -X POST" + headersStr + "'" + requestUrl +"' --data '"+query+"'";
	}
	return curlStr;
}

function transformToPython(){
	var str = '';
    if (checkCatoForm()) {
        var url=$('#catoServer').val();
        var maskSecretKey=$('#cato_configMaskSecretKey').is(":checked");
        var auth=getCurApiKey();
        str = `
########################################################################################
# Usage: `+curOperationObj.name+`.py [options]
#
# Create CATO_TOKEN environment variable with your API key
# 'export CATO_TOKEN=ABCDE12345'
#
# Options:
#  -h, --help  show this help message and exit
#  -I ID       Account ID
#  -P          Prettify output
#  -p          Print account snapshot data
#  -v          Print debug info
#  -V          Print detailed debug info
#
# Examples:
#
# To run the script with key=YOURAPIKEY for account ID 1714, displaying the data in raw format:
#   python3 `+ curOperationObj.name +`.py -p
#
# Running the script with debug enabled:
#   python3 `+ curOperationObj.name +`.py -v
#
# For more human readable output, use -pP
#   python3 `+ curOperationObj.name +`.py -pP
#
# This script is supplied as a demonstration of how to access the Cato API with Python. It
# is not an official Cato release and is provided with no guarantees of support. Error handling
# is restricted to the bare minimum required for the script to work with the API, and may not be
# sufficient for production environments.
#
# All questions or feedback should be sent to api@catonetworks.com

import os
import datetime
import json
import ssl
import sys
import time
import urllib.parse
import urllib.request
from optparse import OptionParser

# Initialize env variable, parser and log settings
api_call_count = 0
if 'CATO_TOKEN' in os.environ:
    CATO_TOKEN = os.environ['CATO_TOKEN']
else:
    print("Please set the CATO_TOKEN environment variable to your API key.\\\nExample: export CATO_TOKEN=ABCDE12345")
    sys.exit()
parser = OptionParser()
parser.add_option("-P", dest="prettify", action="store_true", help="Prettify output")
parser.add_option("-p", dest="print_snapshot", action="store_true", help="Print snapshot data")
parser.add_option("-v", dest="verbose", action="store_true", help="Print debug info")
parser.add_option("-V", dest="veryverbose", action="store_true", help="Print detailed debug info")
(options, args) = parser.parse_args()

########################################################################################
# Start of the main program

def run():
    start = datetime.datetime.now()

    query = '''`+ fmtQuery($('#catoQuery').val())+`'''
    variables = `+fmtQuery($('#catoVariables').val())+`
    operationName = "`+ curOperationObj.name+`"

    success,resp = send(query, variables, operationName)
    print(json.dumps(resp, sort_keys=True, indent=4))

    # print output
    if not success:
        print(resp)
        sys.exit(1)
    elif options.print_snapshot:
        if options.prettify:
            print(json.dumps(resp["data"],indent=2, ensure_ascii=False))
        else:
            print(json.dumps(resp["data"], ensure_ascii=False))

########################################################################################
# Helper functions and globals

# log debug output
def log(text):
    if options.verbose or options.veryverbose:
        print(f"LOG {datetime.datetime.now(datetime.UTC)}> {text}")

# log detailed debug output
def logd(text):
    if options.veryverbose:
        log(text)

# send GQL query string to API, return JSON
# if we hit a network error, retry ten times with a 2 second sleep
def send(query,variables,operation):
    global api_call_count
    retry_count = 0
    data = {
        "operationName": operation,
        "variables": variables,
        "query": query.strip()
    }
    headers = { 'x-api-key': CATO_TOKEN,'Content-Type':'application/json'}
    no_verify = ssl._create_unverified_context()
    while True:
        if retry_count > 10:
            print("FATAL ERROR retry count exceeded")
            sys.exit(1)
        try:
            request = urllib.request.Request(url='https://api.catonetworks.com/api/v1/graphql2',
                data=json.dumps(data).encode("ascii"),headers=headers)
            response = urllib.request.urlopen(request, context=no_verify, timeout=30)
            api_call_count += 1
        except Exception as e:
            log(f"ERROR {retry_count}: {e}, sleeping 2 seconds then retrying")
            time.sleep(2)
            retry_count += 1
            continue
        result_data = response.read()
        if result_data[:48] == b'{"errors":[{"message":"rate limit for operation:':
            log("RATE LIMIT sleeping 5 seconds then retrying")
            time.sleep(5)
            continue
        break
    result = json.loads(result_data.decode('utf-8','replace'))
    if "errors" in result:
        log(f"API error: {result_data}")
        return False,result
    return True,result
########################################################################################

# Main entry to the script as the run() function:
if __name__ == '__main__':
    run()
`;
    }
    return str;
}
// function incap_transformToRuby(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToRuby';
//     return str;
// }
// function incap_transformToJavaScript(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToJavaScript';
//     return str;
// }
// function incap_transformToPerl(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToPerl';
//     return str;
// }
// function incap_transformToPowershell(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToPowershell';
//     return str;
// }
