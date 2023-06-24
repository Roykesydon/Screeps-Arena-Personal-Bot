import { getDirection, getTerrainAt, findClosestByPath, getObjectsByPrototype } from "game/utils";
import { TERRAIN_WALL } from "game/constants";
import { StructureSpawn } from "game/prototypes";
import { searchPath } from "game/path-finder";

export class MoveHandler {
    constructor({ attackCreepManager }) {
        this.attackCreepManager = attackCreepManager;
    }

    creepEscapeFromTarget({ creep, target, range }) {
        let pathResult = searchPath(
            creep,
            {
                pos: { x: target.x, y: target.y },
                range: range + 5
            },
            { flee: true }
        );
        creep.moveTo({ x: pathResult.path[0].x, y: pathResult.path[0].y });
    }

    creepEscapeFromAttackableEnemy({ creep, range }) {
        let enemyAttackableCreeps = this.attackCreepManager.getAllAttackableCreep({ ally: false });
        let pathResult = searchPath(creep, enemyAttackableCreeps.map(c => { return { pos: { x: c.x, y: c.y }, range: range + 1 } }), { flee: true, swampCost: 2 });
        creep.moveTo({ x: pathResult.path[0].x, y: pathResult.path[0].y });
    }
}