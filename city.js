class City {
    constructor(size) {
        this.size = size;
        this.grid = Array.from({ length: size }, () => Array.from({ length: size }, () => new Block()));
    }
}

class Block {
    constructor() {
       this.oxygen = 0;
       this.water = 0;
       this.food = 0;
       this.population = 0;
       this.energy = 0;
    }
    changeGrass() {
        this.oxygen = 10;
        this.water = 0;
        this.food = 10;
        this.energy = 0;
        this.population = 0;
    }
    changeBuilding() {  
        this.oxygen = 0;
        this.water = 0;
        this.food = 0;
        this.energy = -10;
        this.population = 1;
    }
    changeWater() {
        this.oxygen = 0;
        this.water = 10;
        this.food = 0;
        this.energy = 10;
        this.population = 0;
    }
}

export { City };