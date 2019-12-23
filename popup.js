chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    let matchId = getMatchIdFromURL(tabs[0].url);
    document.getElementById("test").innerText = matchId;
    var builder = new PlayerDataApiBuilder(matchId, "asd2ws");
    var playerData = builder.build();
    console.log(playerData);


});

function getMatchIdFromURL(url) {
    let matchIdFormat = new RegExp('.-.{8}-.{4}-.{4}-.{4}-.{12}');
    let matchId = matchIdFormat.exec(url);
    return matchId;
}