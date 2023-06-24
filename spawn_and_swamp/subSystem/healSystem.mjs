import { getObjectsByPrototype, findClosestByPath, getRange, findClosestByRange } from 'game/utils';
import { StructureSpawn } from 'game/prototypes';
import { ERR_NOT_IN_RANGE } from 'game/constants';

export function handleHealCreeps({ healCreepManager, attackCreepManager, moveHandler, groupHandler }) {
    let allyDamagedAttackCreeps = attackCreepManager.getAllAttackableCreep().filter(creep => creep.hits < creep.hitsMax);

    let allyHealCreeps = healCreepManager.getAllHealCreep();
    let allyAttackCreeps = attackCreepManager.getAllAttackableCreep();

    let attackableEnemyCreeps = attackCreepManager.getAllAttackableCreep({ ally: false });

    let ESCAPE_ENEMY_RANGE = 7;

    allyHealCreeps.forEach((creep) => {
        let closestDamagedAttackCreep = findClosestByPath(creep, allyDamagedAttackCreeps);
        let closestAttackableEnemyCreep = findClosestByPath(creep, attackableEnemyCreeps);

        let sameGroupAllyCreeps = [].concat(allyHealCreeps, allyAttackCreeps).filter(groupCreep => groupCreep.getGroupId() == creep.getGroupId());
        let cloestFarAllyGroupCreep = findClosestByRange(creep, sameGroupAllyCreeps.filter(groupCreep => getRange(creep, groupCreep) > 5));

        // heal closest damaged attack creep first
        if (closestDamagedAttackCreep != null) {
            if (creep.heal(closestDamagedAttackCreep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestDamagedAttackCreep);

                // heal self if damaged
                if (creep.heal(closestDamagedAttackCreep) == ERR_NOT_IN_RANGE) {
                    creep.heal(creep);
                }
            }
            return;
        }

        // if range between self and closest attackble enemy is less than ESCAPE_ENEMY_RANGE, then run away
        if (closestAttackableEnemyCreep && creep.getRangeTo({ x: closestAttackableEnemyCreep.x, y: closestAttackableEnemyCreep.y }) < ESCAPE_ENEMY_RANGE) {
            moveHandler.creepEscapeFromAttackableEnemy({ creep: creep, range: ESCAPE_ENEMY_RANGE })
            creep.heal(creep)
            return;
        }

        // find group member if not enough
        creep.moveTo(groupHandler.getGroupLeader(creep.getGroupId()));
        creep.heal(creep)
    });
}
