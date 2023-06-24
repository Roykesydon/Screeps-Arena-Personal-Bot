import { getObjectsByPrototype } from 'game/utils';
import { StructureSpawn } from 'game/prototypes';
import { } from 'game/constants';

export class SpawnManager {
    // constructor
    constructor() {
    }

    getAllSpawn({ ally = true } = {}) {
        let allyFilter = ally ? (spawn) => spawn.my : (spawn) => !spawn.my;
        return getObjectsByPrototype(StructureSpawn).filter(spawn => allyFilter(spawn));
    }
}
