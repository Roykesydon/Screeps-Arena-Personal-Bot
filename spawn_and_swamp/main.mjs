import { } from 'game/utils';
import { } from 'game/prototypes';
import { } from 'game/constants';

import { spawnCreeps } from './subSystem/spawnSystem.mjs';
import { handleWorkCreeps } from './subSystem/workSystem.mjs';
import { handleAttackCreeps } from './subSystem/attackSystem.mjs';
import { handleHealCreeps } from './subSystem/healSystem.mjs';
import { handleDefenseCreeps } from './subSystem/defenseSystem.mjs';

import { WorkCreepManager } from './creepsTypeManager/WorkCreepManager.mjs';
import { AttackCreepManager } from './creepsTypeManager/AttackCreepManager.mjs';
import { HealCreepManager } from './creepsTypeManager/HealCreepManager.mjs';

import { GroupHandler } from './handler/GroupHandler.mjs';
import { MoveHandler } from './handler/MoveHandler.mjs';

let workCreepManager = new WorkCreepManager();
let attackCreepManager = new AttackCreepManager();
let healCreepManager = new HealCreepManager();

let groupHandler = new GroupHandler({ attackCreepManager: attackCreepManager, healCreepManager: healCreepManager });
let moveHandler = new MoveHandler({attackCreepManager: attackCreepManager});

function updateStatus() {
    attackCreepManager.updateSpawnQueue();
    workCreepManager.updateSpawnQueue();
    healCreepManager.updateSpawnQueue();
}

export function loop() {
    updateStatus();
    spawnCreeps({ workCreepManager: workCreepManager, attackCreepManager: attackCreepManager, healCreepManager: healCreepManager, groupHandler: groupHandler });
    handleWorkCreeps({ workCreepManager: workCreepManager, attackCreepManager: attackCreepManager, moveHandler: moveHandler });
    handleAttackCreeps({ attackCreepManager: attackCreepManager, healCreepManager: healCreepManager, groupHandler: groupHandler });
    handleHealCreeps({ healCreepManager: healCreepManager, attackCreepManager: attackCreepManager, moveHandler: moveHandler, groupHandler: groupHandler });
    handleDefenseCreeps({ attackCreepManager: attackCreepManager, healCreepManager: healCreepManager, groupHandler: groupHandler });
    
}
