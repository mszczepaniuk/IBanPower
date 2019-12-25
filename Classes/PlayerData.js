class PlayerData {
    id = '';
    totalMatches = 0;
    totalMapRatio = {};
    recentMatches = 0;
    recentMapRatio = {};
}

// TODO: authorization key from storage
// TODO: getting current maps from storage in methods responsible for getting recent and total map ratios
class PlayerDataApiBuilder {
    constructor(matchId, userNickname) {
        this.matchId = matchId;
        this.userNickname = userNickname;
        this.playerData = new PlayerData();
    }
    // My plan for a build() was to look like this:
    // this.buildId();
    // this.buildTotalData();
    // this.buildRecentData();
    // But proper building of this object depends on first answer from FaceIt API, so the latter 2 methods are hidden in AJAX request in buildId().
    build() {
        this.buildId();
        if (this.playerData.recentMatches.length !== this.playerData.totalMatches.length) {
            throw new Error("recentMatches array has to be equal to totalMatches array");
        }
        return this.playerData;
    }

    buildId() {
        var self = this;

        function getId(apiResult, userName) {
            var isUserInFaction1 = apiResult.teams.faction1.roster.some(x => x.nickname === userName);
            var isUserInFaction2 = apiResult.teams.faction2.roster.some(x => x.nickname === userName);
            var opposingCaptainId = '';
            if (isUserInFaction1 === false && isUserInFaction2 === false) {
                throw new Error(`User ${userMame}, wasn't found in any team`);
            }
            else if (isUserInFaction1 === true) {
                opposingCaptainId = apiResult.teams.faction2.leader;
            }
            else if (isUserInFaction2 === true) {
                opposingCaptainId = apiResult.teams.faction1.leader;
            }
            return opposingCaptainId;
        }

        $.ajax({
            url: `https://open.faceit.com/data/v4/matches/${this.matchId}`,
            contentType: "application/json",
            dataType: 'json',
            headers: { 'Authorization': 'Bearer 2824f4f2-53f1-4c43-9972-b00d9e6fb46f' },
            success: function (result) {
                self.playerData.id = getId(result, self.userNickname);
                // Remaining methods needed to create playerData.
                self.buildTotalMatchData();
                self.buildRecentMatchData();
            }
        });
    }

    buildTotalMatchData() {
        var self = this;

        function getTotalMapRatio(apiResult) {
            var maps = ["de_nuke", "de_vertigo", "de_overpass", "de_mirage", "de_cache", "de_dust2", "de_train", "de_inferno"];
            var totalMatchCount = apiResult.lifetime.Matches;
            var dict = {};
            apiResult.segments.forEach(x => {
                if (maps.includes(x.label)) {
                    dict[x.label] = x.stats.Matches / totalMatchCount;
                }
            });
            if (maps.length !== Object.keys(dict).length) {
                let nonPlayedMaps = maps.filter(x => !Object.keys(dict).includes(x));
                nonPlayedMaps.forEach(x => {
                    dict[x] = 0;
                });
            }
            return dict;
        }
        function getTotalMatches(apiResult) {
            return parseInt(apiResult.lifetime.Matches);
        }

        $.ajax({
            url: `https://open.faceit.com/data/v4/players/${self.playerData.id}/stats/csgo`,
            contentType: "application/json",
            dataType: 'json',
            headers: { 'Authorization': 'Bearer 2824f4f2-53f1-4c43-9972-b00d9e6fb46f' },
            success: function (result) {
                self.playerData.totalMapRatio = getTotalMapRatio(result);
                self.playerData.totalMatches = getTotalMatches(result);
            }
        });
    }

    buildRecentMatchData() {
        var self = this;

        // Removes matches older than X months.
        function filterOldMatches(matches, months) {
            var date = new Date();
            date.setMonth(date.getMonth() - months);
            var unixTimeStamp = Math.round(date.getTime());
            var filteredMatches = matches.filter(x => x.created_at > unixTimeStamp);
            return filteredMatches;
        }

        function getRecentMatches(matches) {
            var maps = ["de_nuke", "de_vertigo", "de_overpass", "de_mirage", "de_cache", "de_dust2", "de_train", "de_inferno"];
            var dict = {};
            maps.forEach(function (element) {
                var mapCount = matches.filter(x => x.i1 === element);
                dict[element] = mapCount.length / matches.length;
            });
            return dict;
        }

        $.ajax({
            url: `https://api.faceit.com/stats/api/v1/stats/time/users/${self.playerData.id}/games/csgo`,
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                var filteredResult = filterOldMatches(result, 2);
                self.playerData.recentMatches = filteredResult.length;
                self.playerData.recentMapRatio = getRecentMatches(filteredResult);
            }
        });
    }
}
