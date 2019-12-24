chrome.runtime.onInstalled.addListener(function () {
    var defaultMaps = ["de_nuke", "de_vertigo", "de_overpass", "de_mirage", "de_cache", "de_dust2", "de_train", "de_inferno"];
    chrome.storage.sync.set({ mapPriority: defaultMaps });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            urlMatches: 'https://www.faceit.com/.*/csgo/room/*'
                        }
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});