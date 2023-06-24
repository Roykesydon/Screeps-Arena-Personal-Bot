import { getObjectsByPrototype, findClosestByPath, getRange } from 'game/utils';
import { Creep } from 'game/prototypes';

import { SpawnManager } from '../structureManager/SpawnManager.mjs';

import { GROUP_TYPE } from '../handler/GroupHandler.mjs';

import { findMode, rangedMeleeAttack } from "../utils.mjs"


// This system need update, use it at your own risk
export function handleDefenseCreeps({ attackCreepManager, healCreepManager, groupHandler }) {
    let spawnManager = new SpawnManager();

    // only handle defense group creeps
    let allyAttackCreeps = attackCreepManager.getAllAttackableCreep().filter(creep => creep.getGroupId() == groupHandler.getGroupIdByType(GROUP_TYPE.DEFENSE));

    let enemyAttackCreeps = attackCreepManager.getAllAttackableCreep({ ally: false });
    let enemyHealCreeps = healCreepManager.getAllHealCreep({ ally: false });
    let enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

    let allySpawns = spawnManager.getAllSpawn();

    let enemySpawns = spawnManager.getAllSpawn({ ally: false });

    // calc group info
    let attackGroupMember = {}
    allyAttackCreeps.forEach(creep => {
        let groupId = creep.getGroupId();
        if (!attackGroupMember[groupId]) {
            attackGroupMember[groupId] = {};
            attackGroupMember[groupId]["member"] = [];
            attackGroupMember[groupId]["closestEnemyWorriorOrSpawn"] = [];
            attackGroupMember[groupId]["closestEnemyWorrior"] = [];
            attackGroupMember[groupId]["closestEnemyOrSpawn"] = [];
        }

        attackGroupMember[groupId]["member"].push(creep);


        // closest enemy attack/heal creep or spawn
        let closestEnemyWorriorCreepSpawn = findClosestByPath(creep, [].concat(enemyAttackCreeps).concat(enemyHealCreeps).concat(enemySpawns));
        if (closestEnemyWorriorCreepSpawn) {
            attackGroupMember[groupId]["closestEnemyWorriorOrSpawn"].push(closestEnemyWorriorCreepSpawn);
        }

        /*
        // closest enemy attack/heal creep
        let closestEnemyWorriorCreep = findClosestByPath(creep, [].concat(enemyAttackCreeps).concat(enemyHealCreeps));
        if (closestEnemyWorriorCreep) {
            attackGroupMember[groupId]["closestEnemyWorrior"].push(closestEnemyWorriorCreep);
        }
        */

        // closest enemy creep or spawn
        let closestEnemyCreepSpawn = findClosestByPath(creep, [].concat(enemyCreeps).concat(enemySpawns));
        if (closestEnemyCreepSpawn) {
            attackGroupMember[groupId]["closestEnemyOrSpawn"].push(closestEnemyCreepSpawn);
        }

    });


    allyAttackCreeps.forEach((creep) => {
        let groupId = creep.getGroupId();

        /*
        // retreat if low health
        if (creep.hits < creep.hitsMax * 0.5) {
            let closestAllySpawn = findClosestByPath(creep, getObjectsByPrototype(StructureSpawn).filter(spawn => spawn.my));
            creep.moveTo(closestAllySpawn);
            return;
        }
        */

        // if range between creep and spawn is too far, then back to spawn
        let closestAllySpawn = findClosestByPath(creep, allySpawns);

        if (getRange(creep, closestAllySpawn) > 7) {
            creep.moveTo(closestAllySpawn);
            return;
        }

        // calculate count of neighbor group member
        let neighborGroupMemberCount = attackGroupMember[groupId]["member"].filter(groupCreep => getRange(creep, groupCreep) <= 5).length;

        // find group member if not enough
        if (neighborGroupMemberCount < attackGroupMember[groupId]["member"].length * 0.5) {
            let cloestFarAllyGroupCreep = findClosestByPath(creep, attackGroupMember[groupId]["member"].filter(groupCreep => getRange(creep, groupCreep) > 5));
            if (cloestFarAllyGroupCreep) {
                creep.moveTo(cloestFarAllyGroupCreep);
                return;
            }
            else {
                let closestAllyGroupCreep = findClosestByPath(creep, attackGroupMember[groupId]["member"].filter(groupCreep => groupCreep.id != creep.id));
                creep.moveTo(closestAllyGroupCreep);
                return;
            }
        }

        // find mode in closestEnemyWorriorOrSpawn
        if (attackGroupMember[groupId]["closestEnemyWorriorOrSpawn"].length > 0) {
            rangedMeleeAttack(creep, findMode(attackGroupMember[groupId]["closestEnemyWorriorOrSpawn"]));
            return;
        }

        /*
        // find mode in closestEnemyWorrior
        if (attackGroupMember[groupId]["closestEnemyWorrior"].length > 0) {
            rangedMeleeAttack(creep, findMode(attackGroupMember[groupId]["closestEnemyWorrior"]));
            return;
        }
        */


        // find mode in closestEnemyOrSpawn
        if (attackGroupMember[groupId]["closestEnemyOrSpawn"].length > 0) {
            rangedMeleeAttack(creep, findMode(attackGroupMember[groupId]["closestEnemyOrSpawn"]));
            return;
        }

        /* Temporarily abandoned
        // back to closest spawn if no path to enemy
        let closestSpawn = findClosestByPath(creep, getObjectsByPrototype(StructureSpawn));
        creep.moveTo(closestSpawn);
        */
    });
}
