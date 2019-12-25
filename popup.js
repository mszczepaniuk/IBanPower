chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    let matchId = getMatchIdFromURL(tabs[0].url);
    chrome.storage.sync.get(['userNickname'], x => {
        var builder = new PlayerDataApiBuilder(matchId, x.userNickname);
        var playerData = builder.build();
        $(document).ajaxStop(function () {
            createDataTable(playerData);
            chrome.storage.sync.get(['mapPriority'], x => {
                var playerMapPriority = createMapPriorityArray(playerData);
                var banArrayFactory = new BanArrayFactory(x.mapPriority, playerMapPriority);
                console.log(x.mapPriority);
                console.log(playerMapPriority);
                createBanTable(banArrayFactory.Create());
            });

        });
    });
});
// TODO: Error managment in general.
function getMatchIdFromURL(url) {
    let matchIdFormat = new RegExp('.-.{8}-.{4}-.{4}-.{4}-.{12}');
    let matchId = matchIdFormat.exec(url);
    return matchId;
}
// TODO: Sorting.
function createDataTable(playerData) {
    $('#info').html('');
    var tableHtmlString = 'Enemy captain map data';
    tableHtmlString += `<table><tr><th>Map</th><th>TMR(${playerData.totalMatches})</th><th>RMR(${playerData.recentMatches})</th></tr>`;
    Object.keys(playerData.totalMapRatio).forEach(x => {

        tableHtmlString += `<tr><td>${x}</td><td>${parseFloat(playerData.totalMapRatio[x] * 100).toFixed(2)}%</td><td>${parseFloat(playerData.recentMapRatio[x] * 100).toFixed(2)}%</td></tr>`;
    });
    tableHtmlString += "</table>";
    $('#dataTable').append(tableHtmlString);
}

function createBanTable(maps) {
    var tableHtmlString = 'Suggested ban priority<table>';
    maps.forEach(x => {
        tableHtmlString += `<tr><td>${x}</td></tr>`;
    });
    tableHtmlString += '</table>';
    $('#banTable').append(tableHtmlString);

}

function createMapPriorityArray(playerData) {
    var recentMatchesWeight = playerData.recentMatches / 100;
    if (recentMatchesWeight > 0.9) { recentMatchesWeight = 0.9; }
    if (recentMatchesWeight < 0.2) { recentMatchesWeight = 0.2; }
    var totalMatchesWeight = 1 - recentMatchesWeight;
    var maps = [];
    Object.keys(playerData.totalMapRatio).forEach(x => {
        var tempMapRatio = playerData.totalMapRatio[x] * totalMatchesWeight + playerData.recentMapRatio[x] * recentMatchesWeight;
        maps.push([x, tempMapRatio]);
    });
    maps.sort((x, y) => {
        return y[1] - x[1];
    });
    maps = maps.map(x => x[0]);
    return maps;
}