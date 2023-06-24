import { findClosestByPath } from "game/utils";
import { ERR_NOT_IN_RANGE } from "game/constants";

import { AttackCreepManager } from "./creepsTypeManager/AttackCreepManager.mjs";
import { HealCreepManager } from "./creepsTypeManager/HealCreepManager.mjs";

export function rangedMeleeAttack(creep, target) {
    let attackCreepManager = new AttackCreepManager();
    let healCreepManager = new HealCreepManager();

    // melee attack
    if (attackCreepManager.isMeleeAttackableCreep(creep) && creep.attack(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }

    // ranged attack
    if (attackCreepManager.isRangedAttackableCreep(creep) && creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }

    // heal damaged ally attack creep in range or self
    if (healCreepManager.isHealableCreep(creep)) {
        let closestDamagedAllyAttackCreep = findClosestByPath(creep, attackCreepManager.getAllAttackableCreep().filter(allyCreep => allyCreep.hits < allyCreep.hitsMax));
        if (closestDamagedAllyAttackCreep) {
            creep.heal(closestDamagedAllyAttackCreep)
        }
        // if heal other fail, heal self
        creep.heal(creep);
    }

}

export function findMode(arr) {
    const mode = {};
    let max = 0, count = 0;

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];

        if (mode[item])
            mode[item]++;
        else
            mode[item] = 1;

        if (count < mode[item]) {
            max = item;
            count = mode[item];
        }
    }

    return max;
};