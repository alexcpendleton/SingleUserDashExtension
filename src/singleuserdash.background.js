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

function isSingleUserDashAlready(currentUrl) {
	return currentUrl.match(/singleuserdash\.joe\.im/i);
}

// Called when a message is passed.  We assume that the content script
// wants to show the page action.
function onRequest(request, sender, sendResponse) {	
	var currentUrl = sender.tab.url,
		currentTabId = sender.tab.id;
	if(currentUrl.match(/www\.tumblr\.com/i)) {
		// If we're on www.tumblr.com then don't show the button	
		return;
	}
	if(isSingleUserDashAlready(currentUrl)) {
		var details = {
			title:"View with normal theme",
			tabId: currentTabId
		}
		chrome.pageAction.setTitle(details);
	}
	chrome.pageAction.show(currentTabId);	
	sendResponse({});   
};
// end parseuri 
function buildSingleUserDashUrl(username) {
	return "http://singleuserdash.joe.im/" + username;
}

function buildTumblrUrl(username) {
	return "http://" + username + ".tumblr.com";
}

function withCurrentTab(callback) {
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		callback(tabs[0]);
	});
}

function navigate(tab, url) {		
	chrome.tabs.update(tab.id, { "url": url }, function() { });	
}
function parseUsernameFromUrl(toParse) {
	var url = parseUri(toParse);
	var hostname = url["host"];
	return hostname.slice(0, hostname.indexOf("."));		
}

function parseUsernameFromDashUrl(toParse) {
	var url =  parseUri(toParse);
	var username = url["file"].slice(1);
	return username;
}

function onPageActionClicked(tab) {
	withCurrentTab(function(ctab) {
		var currentUrl = ctab.url,
			finalUrl = "";
		// TODO: Make this less smelly
		if(isSingleUserDashAlready(currentUrl)) {
			var username = parseUsernameFromDashUrl(currentUrl);
			finalUrl = buildTumblrUrl(username);
		} else {
			var username = parseUsernameFromUrl(currentUrl);
			finalUrl = buildSingleUserDashUrl(username);
		}
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

chrome.omnibox.onInputEntered.addListener(onOmniboxInputEntered)