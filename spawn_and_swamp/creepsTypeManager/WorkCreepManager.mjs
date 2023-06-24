import { MOVE, CARRY, WORK } from 'game/constants';

export class WorkCreepManager {
    // constructor
    constructor() {
        this.creeps = [];
        this.creepsQueue = [];
        this.workTargetBanList = [];
        this.banCD = 0;
        this.BAN_THRESHOLD = 20;
    }

    canHarvest(creep) {
        return creep.body.some(bodyPart => bodyPart.type === WORK);
    }

    addWorkCreep(creep) {
        if (creep.isSpawning()) {
            this.creepsQueue.push(creep);
            return;
        }
        this.creeps.push(creep);
    }

    getAllWorkCreeps() {
        return this.creeps;
    }

    getBodyType() {
        // return [MOVE, CARRY, WORK] 
        return [MOVE, MOVE, CARRY, CARRY]
    }

    updateSpawnQueue() {
        let haveSpawnedCreep = this.creepsQueue.filter(creep => !creep.isSpawning());
        this.creeps = this.creeps.concat(haveSpawnedCreep);
        this.creepsQueue = this.creepsQueue.filter(creep => creep.isSpawning());

        // remove dead creeps
        this.creeps = this.creeps.filter(creep => !creep.isDead());

        // ban work target
        if (this.banCD > 0) {
            if (this.banCD == this.BAN_THRESHOLD) {
                this.banCD = 0
            }
            this.banCD++;
        }
    }

    /*
    Some resources are not available for work creeps to get energy,
    because their are enemy worrior creeps in the way.
    Ban these resources for a while. (currently is banning permanent)
    */
    banWorkTarget(workTarget) {
        if (this.banCD == 0) {
            this.banCD = 1;
            this.workTargetBanList.push(workTarget);
        }
    }

    getWorkTargetBanList(){
        return this.workTargetBanList;
    }
}
