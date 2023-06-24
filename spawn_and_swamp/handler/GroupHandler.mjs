import { getRange } from "game/utils";
import { Visual } from "game/visual";

export class GROUP_TYPE {
    // Private Fields
    static #_WORK = 0;
    static #_ATTACK = 1;
    static #_DEFENSE = 2;

    static get WORK() { return this.#_WORK; }
    static get ATTACK() { return this.#_ATTACK; }
    static get DEFENSE() { return this.#_DEFENSE; }
}

export class GroupHandler {
    constructor({ attackCreepManager, healCreepManager }) {
        this.attackCreepManager = attackCreepManager;
        this.healCreepManager = healCreepManager;
        this.leaderTable = {};
        this.GROUP_RADIO = 0.67;
    }

    getGroupIdByType(groupType) {
        if (groupType == GROUP_TYPE.WORK) {
            return 0;
        }

        if (groupType == GROUP_TYPE.ATTACK) {
            return 1;
        }
        else if (groupType == GROUP_TYPE.DEFENSE) {
            return 2;
        }
        return -1;
    }

    // choose a group for this creep
    assignWorriorCreepGroup(creep) {
        let DEFENSE_BASE = 0;

        let allyAttackableCreep = this.attackCreepManager.getAllAttackableCreep();

        // make sure there are enough creeps in defense group
        // if not, assign this creep to defense group

        let defenseGroup = allyAttackableCreep.filter(creep => creep.getGroupId() == this.getGroupIdByType(GROUP_TYPE.DEFENSE));
        if (defenseGroup.length < DEFENSE_BASE) {
            return this.getGroupIdByType(GROUP_TYPE.DEFENSE);
        }
        else {
            // assign this creep to attack group
            return this.getGroupIdByType(GROUP_TYPE.ATTACK);
        }
    }

    // determine if this creep should gather with other creeps
    attackNeedGather(creep, groupMember) {
        // calculate count of neighbor group member
        let neighborGroupMemberCount = groupMember.filter(groupCreep => getRange(creep, groupCreep) <= 5).length;

        return neighborGroupMemberCount < groupMember.length * this.GROUP_RADIO;
    }

    setGroupLeader(groupId, creep) {
        let allyAttackableCreep = this.attackCreepManager.getAllAttackableCreep();
        let allyHealCreep = this.healCreepManager.getAllHealCreep();
        let allyBattleCreep = allyAttackableCreep.concat(allyHealCreep);

        let LEADER_THRESHOLD = 7; // make leader change less frequently

        if (!creep) {
            creep = allyBattleCreep[0];
        }

        if (this.leaderTable[groupId] && this.leaderTable[groupId]["creep"] && !this.leaderTable[groupId]["creep"].isDead()) {
            this.leaderTable[groupId]["leaderCount"]++;
            if (this.leaderTable[groupId]["leaderCount"] == LEADER_THRESHOLD)
                this.leaderTable[groupId] = { creep: creep, leaderCount: 0 };

            return;
        }

        this.leaderTable[groupId] = { creep: creep, leaderCount: 0 };
    }

    getGroupLeader(groupId) {
        return this.leaderTable[groupId]["creep"];
    }
}