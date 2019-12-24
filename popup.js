chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    let matchId = getMatchIdFromURL(tabs[0].url);
    chrome.storage.sync.get(['userNickname'], x => {
        var builder = new PlayerDataApiBuilder(matchId, x.userNickname);
        var playerData = builder.build();
        $(document).ajaxStop(function () {
            createDataTable(playerData);
            console.log(x);
            $("#userNickname").append(`Current User: ${x.userNickname}`);
        });
    });
});

function getMatchIdFromURL(url) {
    let matchIdFormat = new RegExp('.-.{8}-.{4}-.{4}-.{4}-.{12}');
    let matchId = matchIdFormat.exec(url);
    return matchId;
}
// TODO: Sorting
function createDataTable(playerData) {
    var mapDictLength = Object.keys(playerData.totalMapRatio).length;
    $('#dataTable').html('');
    var tableHtmlString = `<table><tr><th>Map</th><th>TMR(${playerData.totalMatches})</th><th>RMR(${playerData.recentMatches})</th></tr>`;
    Object.keys(playerData.totalMapRatio).forEach(x => {
        console.log(x);
        tableHtmlString += `<tr><td>${x}</td><td>${parseFloat(playerData.totalMapRatio[x] * 100).toFixed(2)}%</td><td>${parseFloat(playerData.recentMapRatio[x] * 100).toFixed(2)}%</td></tr>`;
    });
    tableHtmlString += "</table>";
    $('#dataTable').append(tableHtmlString);
} 