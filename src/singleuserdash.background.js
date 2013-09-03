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
	// Show the page action for the tab that the sender (content script)
	// was on.
	chrome.pageAction.show(sender.tab.id);
	
	// Return nothing to let the connection be cleaned up.
	sendResponse({});   
};

function onPageActionClicked(tab) {
	console.log("single user dash clicked!");
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		var ctab = tabs[0];
		var url = parseUri(ctab.url);
		console.log(url);
		var hostname = url["host"];
		console.log(hostname);
		var username = hostname.slice(0, hostname.indexOf("."));
		
		var finalUrl = "http://singleuserdash.joe.im/" + username;
		
		chrome.tabs.update(ctab.id, { "url": finalUrl }, function() {
		
		});
	});
}

// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);

chrome.pageAction.onClicked.addListener(onPageActionClicked);