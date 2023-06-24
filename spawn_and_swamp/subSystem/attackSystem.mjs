import { getObjectsByPrototype, findClosestByPath, getRange, getDirection } from 'game/utils';
import { Creep } from 'game/prototypes';
import { Visual } from 'game/visual';

import { SpawnManager } from '../structureManager/SpawnManager.mjs';

import { GROUP_TYPE } from '../handler/GroupHandler.mjs';

import { findMode, rangedMeleeAttack } from "../utils.mjs"


export function handleAttackCreeps({ attackCreepManager, healCreepManager, groupHandler }) {
    let spawnManager = new SpawnManager();

    // only handle attack group creeps
    let allyHealAttackCreeps = healCreepManager.getAllHealCreep().filter(creep => creep.getGroupId() == GROUP_TYPE.ATTACK);
    let allyAttackCreeps = attackCreepManager.getAllAttackableCreep().concat(allyHealAttackCreeps).filter(creep => creep.getGroupId() == GROUP_TYPE.ATTACK);

    let enemyAttackCreeps = attackCreepManager.getAllAttackableCreep({ ally: false });
    let enemyHealCreeps = healCreepManager.getAllHealCreep({ ally: false });
    let enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

    let enemySpawns = spawnManager.getAllSpawn({ ally: false });

    let SECURE_THRESHOLD = 10;
    let DANGER_THRESHOLD = 4;

    let GROUP_RANGE = 3;

    let ALERT_RANGE = 20;

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
            attackGroupMember[groupId]["creepHasMostGroupNeighbor"] = { creep: null, count: -1 };
        }

        attackGroupMember[groupId]["member"].push(creep);

        /* Info not used currently
        // closest enemy attack/heal creep or spawn
        let closestEnemyWorriorCreepSpawn = findClosestByPath(creep, [].concat(enemyAttackCreeps).concat(enemyHealCreeps).concat(enemySpawns));
        creep.extraInfo["closestEnemyWorriorCreepSpawn"] = closestEnemyWorriorCreepSpawn;
        if (closestEnemyWorriorCreepSpawn) {
            attackGroupMember[groupId]["closestEnemyWorriorOrSpawn"].push(closestEnemyWorriorCreepSpawn);
        }
        */

        // closest enemy attack/heal creep
        let closestEnemyWorriorCreep = findClosestByPath(creep, [].concat(enemyAttackCreeps).concat(enemyHealCreeps));
        creep.extraInfo["closestEnemyWorriorCreep"] = closestEnemyWorriorCreep;
        if (closestEnemyWorriorCreep) {
            attackGroupMember[groupId]["closestEnemyWorrior"].push(closestEnemyWorriorCreep);
        }

        // closest enemy creep or spawn
        let closestEnemyCreepSpawn = findClosestByPath(creep, [].concat(enemyCreeps).concat(enemySpawns));
        creep.extraInfo["closestEnemyCreepSpawn"] = closestEnemyCreepSpawn;
        if (closestEnemyCreepSpawn) {
            attackGroupMember[groupId]["closestEnemyOrSpawn"].push(closestEnemyCreepSpawn);
        }

        // neighbor group creeps
        let neighborGroupCreeps = attackGroupMember[groupId]["member"].filter(groupCreep => groupCreep.id != creep.id && getRange(creep, groupCreep) <= GROUP_RANGE);
        creep.extraInfo["neighborGroupCreeps"] = neighborGroupCreeps;

        if (attackCreepManager.isAttackableCreep(creep) && neighborGroupCreeps.length > attackGroupMember[groupId]["creepHasMostGroupNeighbor"].count) {
            attackGroupMember[groupId]["creepHasMostGroupNeighbor"].creep = creep;
            attackGroupMember[groupId]["creepHasMostGroupNeighbor"].count = neighborGroupCreeps.length;
        }

    });

    // choose a leader for each group
    // the creep with most neighbor group creeps is the leader
    for (let groupId in attackGroupMember) {
        groupHandler.setGroupLeader(groupId, attackGroupMember[groupId]["creepHasMostGroupNeighbor"].creep);

        // check leader
        new Visual().circle(groupHandler.getGroupLeader(GROUP_TYPE.ATTACK), { fill: "transparent", radius: 0.7, stroke: "yellow" });
    }

    allyAttackCreeps.forEach((creep) => {
        let groupId = creep.getGroupId();

        let closestEnemyWorriorCreepSpawn = creep.extraInfo["closestEnemyWorriorCreepSpawn"];
        let closestEnemyCreepSpawn = creep.extraInfo["closestEnemyCreepSpawn"];
        let closestEnemyWorriorCreep = creep.extraInfo["closestEnemyWorriorCreep"];
        let neighborGroupCreeps = creep.extraInfo["neighborGroupCreeps"];


        // if enemy in danger range (very close), notify neighbor group creeps attack
        if (closestEnemyWorriorCreep && getRange(creep, closestEnemyWorriorCreep) <= DANGER_THRESHOLD) {
            let alertNeighborGroupCreeps = attackCreepManager.getAllAttackableCreep().filter(neighborGroupCreep => getRange(neighborGroupCreep, creep) <= ALERT_RANGE);

            alertNeighborGroupCreeps.forEach(alertNeighborGroupCreep => {
                if (alertNeighborGroupCreep != creep) {
                    alertNeighborGroupCreep.extraInfo["fightingCount"] = 5;
                }
            });
        }

        /* Not completed
        // retreat if low health
        if (creep.hits < creep.hitsMax * 0.5) {
            let closestAllySpawn = findClosestByPath(creep, getObjectsByPrototype(StructureSpawn).filter(spawn => spawn.my));
            creep.moveTo(closestAllySpawn);
            return;
        }
        */

        // forcing creep attack enemy
        // it will happen in situation like neighbor group creeps are fighting with enemy
        if (creep.extraInfo["fightingCount"] > 0) {
            if (closestEnemyWorriorCreep)
                rangedMeleeAttack(creep, closestEnemyWorriorCreep);
            if (closestEnemyCreepSpawn)
                rangedMeleeAttack(creep, closestEnemyCreepSpawn);
            creep.extraInfo["fightingCount"]--;
            return;
        }

        // if no enemy worrior, attack all enemy creep or spawn
        if (!closestEnemyWorriorCreep) {
            rangedMeleeAttack(creep, closestEnemyCreepSpawn);
            return;
        }

        // find group member if creep need gather together
        if (groupHandler.attackNeedGather(creep, attackGroupMember[groupId]["member"])) {

            // if enemy worrior is too close, attack it
            if (closestEnemyWorriorCreep && getRange(creep, closestEnemyWorriorCreep) <= DANGER_THRESHOLD) {
                rangedMeleeAttack(creep, closestEnemyWorriorCreep);
                return;
            }

            // if enemy (include worker and spawn) is too close, attack it
            if (closestEnemyCreepSpawn && getRange(creep, closestEnemyCreepSpawn) <= DANGER_THRESHOLD) {
                rangedMeleeAttack(creep, closestEnemyCreepSpawn);
                return;
            }

            // too far with main group
            // get close to group leader
            if (creep != groupHandler.getGroupLeader(groupId)) {
                creep.moveTo(groupHandler.getGroupLeader(groupId));
            }
            return;

        }

        /* Not completed
        // hit and run
        // if creep has RANGED_ATTACK and there is close enemy has ATTACK, move away
        let enemyMeleeCreeps = attackCreepManager.getAllAttackableCreep({ ally: false });
        else if (attackCreepManager.isRangedAttackableCreep(creep) && attackCreepManager.isAttackableCreep(creep)) {
        .getActiveBodyparts(RANGED_ATTACK) > 0) {
        */



        /* NEED UPDATED !!!!
        // for ranged attack, find mode in closestEnemyWorriorOrSpawn. for others, just find closest
        if (attackCreepManager.isRangedAttackableCreep(creep)) {
            if (attackGroupMember[groupId]["closestEnemyWorriorOrSpawn"].length > 0) {
                rangedMeleeAttack(creep, findMode(attackGroupMember[groupId]["closestEnemyWorriorOrSpawn"]));
                return;
            }
        }
        else if (attackCreepManager.isMeleeAttackableCreep(creep)) {
            rangedMeleeAttack(creep, closestEnemyWorriorCreepSpawn);
        }
        */



        // for ranged attack or not enemy worrior in SECURE_THRESHOLD, find mode in closestEnemyWorrior. 
        // for others, just find closest
        if (attackCreepManager.isRangedAttackableCreep(creep) || (closestEnemyWorriorCreep && getRange(creep, closestEnemyWorriorCreep) >= SECURE_THRESHOLD)) {
            if (attackGroupMember[groupId]["closestEnemyWorrior"].length > 0) {
                rangedMeleeAttack(creep, findMode(attackGroupMember[groupId]["closestEnemyWorrior"]));
                return;
            }
        }
        else if (attackCreepManager.isMeleeAttackableCreep(creep)) {
            rangedMeleeAttack(creep, closestEnemyWorriorCreep);
            return;
        }



        // for ranged attack or not enemy (include worker and spawn) in SECURE_THRESHOLD,, find mode in closestEnemyOrSpawn. for others, just find closest
        if (attackCreepManager.isRangedAttackableCreep(creep) || (closestEnemyCreepSpawn && getRange(creep, closestEnemyCreepSpawn) >= SECURE_THRESHOLD)) {
            if (attackGroupMember[groupId]["closestEnemyOrSpawn"].length > 0) {
                rangedMeleeAttack(creep, findMode(attackGroupMember[groupId]["closestEnemyOrSpawn"]));
                return;
            }
        }
        else if (attackCreepManager.isMeleeAttackableCreep(creep)) {
            rangedMeleeAttack(creep, closestEnemyCreepSpawn);
            return;
        }

        /* Temporarily abandoned
        // back to closest spawn if no path to enemy
        let closestSpawn = findClosestByPath(creep, getObjectsByPrototype(StructureSpawn));
        creep.moveTo(closestSpawn);
        */
    });
}
