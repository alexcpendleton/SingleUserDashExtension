// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

// Called when a message is passed.  We assume that the content script
// wants to show the page action.
function onRequest(request, sender, sendResponse) {
	// If we're on www.tumblr.com then don't show it
	
	// This should probably be a regex or something less strict
	/*
	if(sender.tab.url.indexOf("//www.tumblr") > -1) { 
		return;
	}
	*/
	chrome.pageAction.show(sender.tab.id);	
	sendResponse({});   
};
// end parseuri 

function buildSingleUserDashUrl(username) {
	return "http://singleuserdash.joe.im/" + username;
}

function withCurrentTab(callback) {
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		callback(tabs[0]);
	}
}

function navigate(tab, url) {		
	chrome.tabs.update(tab.id, { "url": url }, function() { });	
}
function parseUsernameFromUrl(toParse) {
	var url = parseUri(toParse);
	var hostname = url["host"];
	return hostname.slice(0, hostname.indexOf("."));		
}

function onPageActionClicked(tab) {
	withCurrentTab(function(ctab) {	
		var username = parseUsernameFromUrl(ctab.url);
		var finalUrl = buildSingleUserDashUrl(username);
		navigate(ctab, finalUrl);
	});
}

function onOmniboxInputEntered(text, disposition) {
	var url = buildSingleUserDashUrl(text);
	withCurrentTab(function(ctab) {
		navigate(ctab, url);
	});
}

// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);

chrome.pageAction.onClicked.addListener(onPageActionClicked);

chrome.omnibox.onInputChanged.addListener(onOmniboxInputEntered)