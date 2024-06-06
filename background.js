let requests = {};

chrome.webRequest.onErrorOccurred.addListener(
	function (data) {
		// TODO - filter out irrelevant reuqests (there is still more.)
		if (
			data.error === "net::ERR_BLOCKED_BY_CLIENT" ||
			data.error === "net::ERR_FILE_NOT_FOUND" ||
			data.error === "net::ERR_CACHE_MISS"
		) {
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
