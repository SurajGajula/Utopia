class City {
    constructor(size) {
        this.size = size;
        this.grid = Array.from({ length: size }, () => Array.from({ length: size }, () => new Block()));
    }
}

class Block {
    constructor() {
        this.color = '#1A1A1A'; // Default color
    }

    changeColor() {
        this.color = '#00FF00'; // Change to green
    }
}

export { City, Block };