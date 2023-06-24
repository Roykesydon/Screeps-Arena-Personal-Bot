import { getObjectsByPrototype } from 'game/utils';
import { Creep } from 'game/prototypes';
import { ATTACK, MOVE, RANGED_ATTACK, HEAL, TOUGH } from 'game/constants';

export class AttackCreepManager {
    // constructor
    constructor() {
        this.meleeCreeps = [];
        this.rangedCreeps = [];
        this.meleeCreepsQueue = [];
        this.rangedCreepsQueue = [];
    }

    /*
    attackable check
    */

    isAttackableCreep(creep) {
        return this.isMeleeAttackableCreep(creep) || this.isRangedAttackableCreep(creep);
    }

    isMeleeAttackableCreep(creep) {
        return creep.body.some(bodyPart => bodyPart.type === ATTACK);
    }

    isRangedAttackableCreep(creep) {
        return creep.body.some(bodyPart => bodyPart.type === RANGED_ATTACK);
    }

    /*
    get attack creeps
    */
    getAllAttackableCreep({ ally = true } = {}) {
        if (ally == false)
            return getObjectsByPrototype(Creep).filter(creep => !creep.my && this.isAttackableCreep(creep));
        else
            return [].concat(this.meleeCreeps, this.rangedCreeps);
    }

    getAllMeleeCreep({ ally = true } = {}) {
        if (ally == false)
            return getObjectsByPrototype(Creep).filter(creep => !creep.my && this.isMeleeAttackableCreep(creep));
        else
            return this.meleeCreeps;
    }
    getAllRangedCreep({ ally = true } = {}) {
        if (ally == false)
            return getObjectsByPrototype(Creep).filter(creep => !creep.my && this.isRangedAttackableCreep(creep));
        else
            return this.rangedCreeps;
    }


    /*
    add attack creeps
    */
    addMeleeCreep(creep) {
        if (creep.isSpawning()) {
            this.meleeCreepsQueue.push(creep);
            return;
        }
        this.meleeCreeps.push(creep);
    }
    addRangedCreep(creep) {
        if (creep.isSpawning()) {
            this.rangedCreepsQueue.push(creep);
            return;
        }
        this.rangedCreeps.push(creep);
    }


    /*
    attack creep body type
    */
    getMeleeBodyType() {
        return [
            TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, ATTACK, 
            MOVE, ATTACK, 
            MOVE, ATTACK,
            MOVE, ATTACK
        ]
    }
    getRangedBodyType() {
        return [
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
            HEAL]
    }

    /*
    update spawn queue for creeps's spawning have done
    */
    updateSpawnQueue() {
        let haveSpawnedCreep = this.meleeCreepsQueue.filter(creep => !creep.isSpawning());
        this.meleeCreeps = this.meleeCreeps.concat(haveSpawnedCreep);
        this.meleeCreepsQueue = this.meleeCreepsQueue.filter(creep => creep.isSpawning());

        haveSpawnedCreep = this.rangedCreepsQueue.filter(creep => !creep.isSpawning());
        this.rangedCreeps = this.rangedCreeps.concat(haveSpawnedCreep);
        this.rangedCreepsQueue = this.rangedCreepsQueue.filter(creep => creep.isSpawning());

        // remove dead creeps
        this.meleeCreeps = this.meleeCreeps.filter(creep => !creep.isDead());
        this.rangedCreeps = this.rangedCreeps.filter(creep => !creep.isDead());
    }
}
