class BanArrayFactory {
    constructor(userMaps, enemyMaps) {
        this.userMaps = userMaps;
        this.enemyMaps = enemyMaps;
        if (userMaps.length !== enemyMaps.length) {
            throw new Error("Inputs sizes don't match");
        }
    }
    maps = [];

    // Before proper algorith starts, first map from user priority is taken from initial arrays
    // since at no point user will want to ban it.
    // Algorith searches for lowest map in user priorities to be in upper half of enemy priorities. 
    // Then it pushes it to BanArray, and removes this map from user and enemy initial map arrays.
    // It does this until all the maps were pushed from initial map arrays.
    Create() {
        console.log(this.userMaps);
        var lastBan = this.userMaps[0];
        this.userMaps.splice(0, 1);
        var lastBanIndexInEnemyMaps = this.enemyMaps.findIndex(x => {
            return x === lastBan;
        });
        this.enemyMaps.splice(lastBanIndexInEnemyMaps, 1);

        var n = Math.round(this.userMaps.length / 2);
        while (this.userMaps.length > 0) {
            loop:
            for (var i = this.userMaps.length - 1; i >= 0; i--) {
                for (var j = 0; j < n; j++) {
                    if (this.userMaps[i] === this.enemyMaps[j]) {
                        this.maps.push(this.userMaps[i]);
                        this.userMaps.splice(i, 1);
                        this.enemyMaps.splice(j, 1);
                        n = Math.round(this.userMaps.length / 2);
                        break loop;
                    }
                }
            }
        }
        this.maps.push(lastBan);
        console.log(this.maps);
        return this.maps;
    }
}