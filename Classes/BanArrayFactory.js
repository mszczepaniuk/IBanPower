class BanArrayFactory {
    constructor(userMaps, enemyMaps) {
        this.userMaps = userMaps;
        this.enemyMaps = enemyMaps;
        if (userMaps.length !== enemyMaps.length) {
            throw new Error("Inputs sizes don't match");
        }
    }
    maps = [];

    Create() {
        // Algorith searches for lowest map in user priorities to be in top n enemy priorities. 
        // Then it pushes it to to BanArray, and removes this map from user and enemy initial maps.
        // It does this until all the maps were pushed from initial maps.
        var n = 3;
        while (this.userMaps.length > n) {
            loop:
            for (var i = this.userMaps.length - 1; i >= 2; i--) {
                for (var j = 0; j < n; j++) {
                    if (this.userMaps[i] === this.enemyMaps[j]) {
                        this.maps.push(this.userMaps[i]);
                        this.userMaps.splice(i, 1);
                        this.enemyMaps.splice(j, 1);

                        break loop;
                    }
                }
            }
        }
        for (var k = n - 1; k >= 0; k--) {
            this.maps.push(this.userMaps[k]);
            this.userMaps.splice(k, 1);
        }
        this.enemyMaps = [];

        return this.maps;
    }
}