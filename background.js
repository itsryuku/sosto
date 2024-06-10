let requests = {};

chrome.webRequest.onErrorOccurred.addListener(
	function (data) {
		// A better approach would be to use "match"
		// but this is experimental until i am ware of all the match cases.
		const ignore = new Set([
			"net::ERR_BLOCKED_BY_CLIENT",
			"net::ERR_FILE_NOT_FOUND",
			"net::ERR_CACHE_MISS",
			"net::ERR_ABORTED",
			"net::ERR_CERT_COMMON_NAME_INVALID",
			"net::ERR_CONNECTION_REFUSED",
			"net::ERR_CERT_AUTHORITY_INVALID",
			"net::ERR_FAILED",
			"net::ERR_BLOCKED_BY_RESPONSE",
			"net::ERR_BLOCKED_BY_ORB",
			"net::ERR_SSL_PROTOCOL_ERROR",
			"net::ERR_INVALID_CHUNKED_ENCODING",
		]);

		if (ignore.has(data.error)) {
			return;
		}

		if (!requests[data.tabId]) {
			requests[data.tabId] = [];
		}
		requests[data.tabId].push({
			url: data.url,
			error: data.error,
			tabId: data.tabId,
		});
		updateBadge(data.tabId);
		chrome.storage.local.set({ requests: requests });
	},
	{ urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	if (request.action === "getfRequests") {
		const tabId = request.tabId;
		const tabRequests = requests[tabId] || [];
		sendResponse(tabRequests);
	}
});

function updateBadge(tabId) {
	const count = requests[tabId] ? requests[tabId].length : 0;
	if (count > 0) {
		chrome.action.setBadgeText({ text: count.toString(), tabId: tabId });
		chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
	} else {
		chrome.action.setBadgeText({ text: "", tabId: tabId });
	}
}
