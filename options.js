chrome.storage.sync.get(['userNickname'], x => {
    $("#nickname").val(x.userNickname);
});

$("#saveButton").click(function () {
    chrome.storage.sync.set({ userNickname: $("#nickname").val() });
});