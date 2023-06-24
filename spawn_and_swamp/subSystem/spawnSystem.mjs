import { getObjectsByPrototype } from 'game/utils';
import { StructureSpawn } from 'game/prototypes';
import { } from 'game/constants';
import { newCustomCreep } from '../customPrototypes/CustomCreep.mjs';

// determine what type of creep should be generated
function shouldGenerate(creepType, creepTypeRatio, actualCreepCount) {
    if (creepTypeRatio[creepType] == 0) {
        return false;
    }

    let rangedTimes = actualCreepCount[creepType] / creepTypeRatio[creepType];
    rangedTimes = Math.floor(rangedTimes);

    // for other creep types, check if their count is less than the ratio
    for (let type in actualCreepCount) {
        if (type != creepType) {
            if (actualCreepCount[type] < rangedTimes * creepTypeRatio[type]) {
                return false;
            }
        }
    }

    return true;
}

export function spawnCreeps({ workCreepManager, attackCreepManager, healCreepManager, groupHandler }) {
    let allySpawns = getObjectsByPrototype(StructureSpawn).filter(spawn => spawn.my);
    allySpawns.forEach(spawn => {

        if (spawn.spawning) {
            return;
        }

        let BASE_WORK_CREEP = 3

        /*
        Make sure there are enough workable creeps.
        Next, produce external creeps with predetermined proportion.
        */
        let workCreeps = workCreepManager.getAllWorkCreeps();
        let meleeCreeps = attackCreepManager.getAllMeleeCreep();
        let rangedCreeps = attackCreepManager.getAllRangedCreep();
        let healCreeps = healCreepManager.getAllHealCreep();


        let actualCreepCount = {
            melee: meleeCreeps.length,
            range: rangedCreeps.length,
            work: workCreeps.length - BASE_WORK_CREEP,
            heal: healCreeps.length
        }

        /*
        // ranged attack party
        let creepTypeRatio = {
            melee: 0,
            range: 300,
            work: 0,
            heal: 0
        }
        */


        // melee attack party
        let creepTypeRatio = {
            melee: 2,
            range: 0,
            work: 1,
            heal: 1
        }



        if (workCreeps.length < BASE_WORK_CREEP) {
            let spawnCreep = spawn.spawnCreep(workCreepManager.getBodyType()).object;
            if (spawnCreep)
                workCreepManager.addWorkCreep(spawnCreep);

            return;
        }

        if (shouldGenerate("range", creepTypeRatio, actualCreepCount)) {
            let spawnCreep = spawn.spawnCreep(attackCreepManager.getRangedBodyType()).object;
            if (spawnCreep) {
                newCustomCreep({ groupId: groupHandler.assignWorriorCreepGroup(spawnCreep), creep: spawnCreep });
                attackCreepManager.addRangedCreep(spawnCreep);
            }
        }
        else if (shouldGenerate("melee", creepTypeRatio, actualCreepCount)) {
            let spawnCreep = spawn.spawnCreep(attackCreepManager.getMeleeBodyType()).object;
            if (spawnCreep) {
                newCustomCreep({ groupId: groupHandler.assignWorriorCreepGroup(spawnCreep), creep: spawnCreep });
                attackCreepManager.addMeleeCreep(spawnCreep);
            }
        }
        else if (shouldGenerate("heal", creepTypeRatio, actualCreepCount)) {
            let spawnCreep = spawn.spawnCreep(healCreepManager.getBodyType()).object;
            if (spawnCreep) {
                newCustomCreep({ groupId: groupHandler.assignWorriorCreepGroup(spawnCreep), creep: spawnCreep });
                healCreepManager.addHealCreep(spawnCreep);
            }
        }
        else if (shouldGenerate("work", creepTypeRatio, actualCreepCount)) {
            let spawnCreep = spawn.spawnCreep(workCreepManager.getBodyType()).object;
            if (spawnCreep) {
                newCustomCreep({ groupId: -1, creep: spawnCreep });
                workCreepManager.addWorkCreep(spawnCreep);
            }
        }

    });

}
