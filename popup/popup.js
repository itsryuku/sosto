document.addEventListener("DOMContentLoaded", function () {
	const noData = document.getElementById("no-data");
	const dataTable = document.getElementById("data-table");
	const tableBody = document.querySelector("#data-table tbody");
	const badge = document.getElementById("badge");

	function updateTabData(tabId) {
		chrome.runtime.sendMessage(
			{ action: "getfRequests", tabId: tabId },
			function (response) {
				updateTable(response);
			}
		);
	}

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const tabId = tabs[0].id;
		updateTabData(tabId);
		updateBadge(tabId);
	});

	function updateTable(requests) {
		tableBody.innerHTML = "";
		if (requests.length > 0) {
			noData.style.display = "none";
			dataTable.style.display = "table";
			requests.forEach((item) => {
				const row = document.createElement("tr");
				const urlCell = document.createElement("td");
				const statusCell = document.createElement("td");

				urlCell.textContent = item.url;
				statusCell.textContent = item.error;

				row.appendChild(urlCell);
				row.appendChild(statusCell);
				tableBody.appendChild(row);
			});
		} else {
			badge.style.display = "none";
			badge.textContent = 0;
			dataTable.style.display = "none";
			noData.style.display = "block";
			document.body.style.width = "100px";
			document.body.style.height = "50px";
		}
	}

	function updateBadge(tabId) {
		chrome.action.getBadgeText({ tabId: tabId }, (text) => {
			if (text && parseInt(text) > 0) {
				badge.style.display = "block";
				badge.textContent = text;
			} else {
				badge.style.display = "none";
			}
		});
	}
});
