$(document).ready(function () {
    chrome.storage.sync.get(['mapPriority'], x => {
        drawMapBox(x.mapPriority);
    });

    chrome.storage.sync.get(['userNickname'], x => {
        $("#nickname").val(x.userNickname);
    });

    $("#saveButton").click(() => {
        chrome.storage.sync.set({ userNickname: $("#nickname").val() });
        chrome.storage.sync.set({ mapPriority: getMapsArray() });
    });

    $(document).on('click', '.mapBox', function () {
        if ($(this).hasClass("selected")) {

            $(this).removeClass("selected");
        }
        else {
            $("#mapPriority").children().removeClass("selected");
            $(this).addClass("selected");
        }
    });

    $(document).keydown(x => {
        var selectedMapDiv = $(document).find(".selected", ".mapBox")[0];
        var mapBelowDiv = $(selectedMapDiv).next()[0];
        var mapAboveDiv = $(selectedMapDiv).prev()[0];
        // Check if map is selected and is there map below and is the pressed key was arrow down
        if (typeof selectedMapDiv !== 'undefined' && typeof mapBelowDiv !== 'undefined' && x.key === 'ArrowDown') {
            switchMaps(selectedMapDiv, mapBelowDiv);
        }
        // Similiar to conditions above
        else if (typeof selectedMapDiv !== 'undefined' && typeof mapAboveDiv !== 'undefined' && x.key === 'ArrowUp') {
            switchMaps(selectedMapDiv, mapAboveDiv);
        }
        function switchMaps(map1, map2) {
            var temp = map1.innerText;
            map1.innerText = map2.innerText;
            map2.innerText = temp;
            $(map1).removeClass('selected');
            $(map2).addClass('selected');
        }
    });
});

function drawMapBox(maps) {
    var mapBoxHtml = '';
    for (var i = 0; i < maps.length; i++) {
        mapBoxHtml += `<div class = "mapBox">${maps[i]}</div>`;
    }
    $("#mapPriority").append(mapBoxHtml);
}

function getMapsArray() {
    var maps = [];
    for (var i = 0; i < $("#mapPriority").children().length; i++) {
        var mapName = $("#mapPriority").children()[i].innerText;
        maps.push(mapName);
    }
    return maps;
}