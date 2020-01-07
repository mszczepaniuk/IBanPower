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
                createBanTable(banArrayFactory.Create());
            });

        });
    });
});

$(document).ready(function () {
    $(document).on('click', '.dataTableHeader', x => {
        var id = x.target.id.replace('col', '');
        sortDataTable(id);
    });
});




function getMatchIdFromURL(url) {
    let matchIdFormat = new RegExp('.-.{8}-.{4}-.{4}-.{4}-.{12}');
    let matchId = matchIdFormat.exec(url);
    if (matchId === null) {
        throw new Error("Couldn't find match id");
    }
    return matchId;
}

function sortDataTable(columnId) {
    var playerData = new PlayerData();
    var mapsArray = [];
    var htmlCollection = $("#dataTable").children().children()[0].children;

    playerData.recentMatches = $(htmlCollection[0]).children()[2].innerText.replace('RMR(', '').replace(')', '');
    playerData.totalMatches = $(htmlCollection[0]).children()[1].innerText.replace('TMR(', '').replace(')', '');
    
    for (var i = 1; i < htmlCollection.length; i++) {
        var temp = [];
        for (var j = 0; j < $(htmlCollection[i]).children().length; j++) {
            var textInCell = $(htmlCollection[i]).children()[j].textContent;
            if (j === 0) {
                temp.push(textInCell);
            }
            else {
                temp.push(parseFloat(textInCell.replace('%', ''))/100);
            }
        }
        mapsArray.push(temp);
    }
    mapsArray.sort((x, y) => {
        return y[columnId] - x[columnId];
    });
    var totalMapRatio = {};
    var recentMapRatio = {};
    mapsArray.forEach(x => {
        totalMapRatio[x[0]] = x[1];
        recentMapRatio[x[0]] = x[2];
    });
    playerData.totalMapRatio = totalMapRatio;
    playerData.recentMapRatio = recentMapRatio;
    createDataTable(playerData);
}

function createDataTable(playerData) {
    $(`#dataTable`).html('');
    $('#info').html('');
    var tableHtmlString = 'Enemy captain map data';
    tableHtmlString += `<table><tr><th id="col0" class="dataTableHeader">Map</th><th id="col1" class="dataTableHeader">TMR(${playerData.totalMatches})</th><th id="col2" class="dataTableHeader">RMR(${playerData.recentMatches})</th></tr>`;
    Object.keys(playerData.totalMapRatio).forEach(x => {

        tableHtmlString += `<tr><td>${x}</td><td>${parseFloat(playerData.totalMapRatio[x] * 100).toFixed(2)}%</td><td>${parseFloat(playerData.recentMapRatio[x] * 100).toFixed(2)}%</td></tr>`;
    });
    tableHtmlString += "</table>";
    $('#dataTable').append(tableHtmlString);
}

function createBanTable(maps) {
    $('#banTable').html('');
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