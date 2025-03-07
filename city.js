class City {
    constructor(size) {
        this.size = size;
        this.grid = Array.from({ length: size }, () => Array.from({ length: size }, () => new Block()));
    }
}

class Block {
}

export { City };