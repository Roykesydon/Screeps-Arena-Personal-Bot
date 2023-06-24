import { Creep } from 'game/prototypes';
import { getObjectsByPrototype } from 'game/utils';
import { StructureSpawn } from 'game/prototypes';


Object.defineProperty(Creep.prototype, 'groupId', {
    value: -1,
    writable: true,
});

Object.defineProperty(Creep.prototype, 'workTarget', {
    value: null,
    writable: true,
});

Object.defineProperty(Creep.prototype, 'extraInfo', {
    value: {},
    writable: true,
});


Creep.prototype.getGroupId = function () {
    return this.groupId;
}

Creep.prototype.setGroupId = function (groupId) {
    this.groupId = groupId;
}

Creep.prototype.isSpawning = function () {
    // if creep's pos is same as some of spawn's pos, then creep is spawning

    let spawns = getObjectsByPrototype(StructureSpawn);
    let isSpawning = false;

    if (this.x == undefined || this.y == undefined) {
        return true;
    }

    for (let spawn of spawns) {
        if (spawn.x == this.x && spawn.y == this.y) {
            isSpawning = true;
            break;
        }
    }
    return isSpawning;
}

Creep.prototype.isDead = function () {
    if (this.x == undefined || this.y == undefined) {
        return true;
    }
    return false;
}


export function newCustomCreep({ creep = undefined, groupId = -1 } = {}) {
    Object.defineProperty(creep, 'groupId', {
        value: groupId,
        writable: true,
    });
}

