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
        this.color = '#4A4A4A'; // Change to green
    }
}

export { City, Block };