import { getObjectsByPrototype, findClosestByPath, getDirection, getTerrainAt, findClosestByRange } from 'game/utils';
import { Source, StructureSpawn, StructureContainer, GameObject } from 'game/prototypes';
import { RESOURCE_ENERGY, ERR_NOT_IN_RANGE, OK, TERRAIN_WALL } from 'game/constants';

export function handleWorkCreeps({ workCreepManager, attackCreepManager, moveHandler }) {
    let allyWorkCreeps = workCreepManager.getAllWorkCreeps();
    let allySpawns = getObjectsByPrototype(StructureSpawn).filter(spawn => spawn.my);

    let workTargetBanList = workCreepManager.getWorkTargetBanList();

    let notEmptySources = getObjectsByPrototype(Source).filter(source => source.energy > 0).filter(source => !workTargetBanList.includes(source.id));
    let notEmptyContainers = getObjectsByPrototype(StructureContainer).filter(container => container.store[RESOURCE_ENERGY] > 0).filter(container => !workTargetBanList.includes(container.id));

    let attackableEnemyCreeps = attackCreepManager.getAllAttackableCreep({ ally: false });

    let ESCAPE_ENEMY_RANGE = 20;

    /*
    get energy frome closest source or container and transfer it to closest spawn
    */

    allyWorkCreeps.forEach((creep) => {
        // if range between self and closest attackble enemy is less than ESCAPE_ENEMY_RANGE, then run away
        /**
         * @type {GameObject | null}
         */
        let closestEnemy = findClosestByRange(creep, attackableEnemyCreeps);

        if (closestEnemy && creep.getRangeTo({ x: closestEnemy.x, y: closestEnemy.y }) < ESCAPE_ENEMY_RANGE) {
            moveHandler.creepEscapeFromTarget({ creep: creep, target: closestEnemy, range: ESCAPE_ENEMY_RANGE});

            workCreepManager.ban
            return;
        }


        // creep is spawning
        if (!creep.store)
            return;

        // get energy and transfer it to closest spawn
        if (creep.store[RESOURCE_ENERGY] == 0) {
            if (workCreepManager.canHarvest(creep) && notEmptySources.length > 0) {
                let closestNotEmptySource = findClosestByPath(creep, notEmptySources);
                creep.workTarget = closestNotEmptySource;
                if (creep.harvest(closestNotEmptySource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestNotEmptySource);
                }
            }

            else if (notEmptyContainers.length > 0) {
                let closestContainer = findClosestByPath(creep, notEmptyContainers);
                creep.workTarget = closestContainer;
                if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestContainer);
                }
            }
        }
        else {
            let closestAllySpawn = findClosestByRange(creep, allySpawns);
            if (creep.transfer(closestAllySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestAllySpawn);
            }
        }
    });
}
