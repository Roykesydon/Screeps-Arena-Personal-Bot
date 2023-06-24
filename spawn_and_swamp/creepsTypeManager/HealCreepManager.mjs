import { getObjectsByPrototype } from 'game/utils';
import { Creep } from 'game/prototypes';
import { MOVE, HEAL } from 'game/constants';

export class HealCreepManager {
    // constructor
    constructor() {
        this.creeps = [];
        this.creepsQueue = [];
    }

    isHealableCreep(creep) {
        return creep.body.some(bodyPart => bodyPart.type === HEAL);
    }

    getAllHealCreep({ ally = true } = {}) {
        if (ally == false)
            return getObjectsByPrototype(Creep).filter(creep => !creep.my && this.isHealableCreep(creep));
        else
            return [].concat(this.creeps);
    }


    addHealCreep(creep) {
        if (creep.isSpawning()) {
            this.creepsQueue.push(creep);
            return;
        }
        this.creeps.push(creep);
    }


    getBodyType() {
        return [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL]
    }

    updateSpawnQueue() {
        let haveSpawnedCreep = this.creepsQueue.filter(creep => !creep.isSpawning());
        this.creeps = this.creeps.concat(haveSpawnedCreep);
        this.creepsQueue = this.creepsQueue.filter(creep => creep.isSpawning());

        // remove dead creeps
        this.creeps = this.creeps.filter(creep => !creep.isDead());
    }
}
