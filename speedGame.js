/* eslint-disable no-unused-vars */
/* global $, ActionInfo */

var selectedBattleBroNumber = -1
var team2abilitiesAlwaysVisible = false
var pendingAbility = null
var aliveBattleBros = []
var ultimateCharge = []
var ultimateBeingUsed = false
//var isAnythingElseRunningHereAtTheSameTime = 0
var engagingCounters = false
var characterDying = false
var promises = []
var checkingPromises = null
const wait = ms => new Promise(res => setTimeout(res, ms))
const floatingTextQueues = new Map()
// FUNNY CONDITIONS
var omicron = true // activates omicron bonuses on some abilities
var headbutt = true   // characters will headbutt enmies with melee attacks
var oldSchool = false // characters will use old school abilities (incredibly overpowered)
var sharePassives = false // doesn't work
var protectionTurnsIntoShields = true // protection becomes shields, it can't be regenerated, but can be gained from abilities
var startingUltCharge = 0

var runningDelay = 0;

import { battleBros } from './battleBros.js'

import { infoAboutCharacters } from './infoAboutCharacters.js'

const infoAboutAbilities = {
    'test1': {
        name: 'test1',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'basic',
        tags: ['attack', 'physical_damage', 'projectile_attack'],
        abilityDamage: 100,
        desc: 'This is a test, deal physical damage to target enemy.',
        use: async function (actionInfo) {
            //await logFunctionCall('method: use (', ...arguments,)
            await dealDmg(actionInfo, this.abilityDamage, 'physical')
            await applyEffect(actionInfo.withSelfAsTarget(), 'offenceUp', 2)
        }
    },
    'test2': {
        name: 'test2',
        image: 'images/abilities/abilityui_passive_takeaseat.png',
        type: 'special',
        cooldown: 3,
        tags: ['target_ally', 'attack', 'special_damage', 'health_recovery'],
        abilityDamage: 160,
        desc: 'Heal target ally + special dmg dealt',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            await dealDmg(actionInfo, this.abilityDamage, 'special')
            // insert target ally part
            console.log('Waiting for ally target...')
        },
        allyUse: async function (battleBro, ally, target) {
            await logFunctionCall('method: allyUse (', ...arguments,)
            let healInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            await heal(healInfo, battleBro.physicalDamage, 'protection')
        }
    },
    'Bowcaster': {
        name: 'Bowcaster',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'basic',
        tags: ['attack', 'physical_damage', 'projectile_attack'],
        projectile: 'redLaser',
        abilityDamage: 117.8,
        desc: 'Deal Physical damage to target enemy with a 55% chance to remove 50% Turn Meter.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hits = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            let hit = hits[0]
            if (hit > 0 && Math.random() < 0.55) {
                await TMchange(actionInfo, -50)
            }
        }
    },
    'Wookie Rage': {
        name: 'Wookie Rage',
        image: 'images/abilities/clonewarschewbacca_wookierage.png',
        type: 'special',
        cooldown: 5,
        tags: ['buff_gain'],
        desc: 'Chewbacca Taunts and gains 2 stacks of Health Up for 2 turns.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            await applyEffect(actionInfo.withSelfAsTarget(), 'taunt', 2, 1, false, true);
            await applyEffect(actionInfo.withSelfAsTarget(), 'healthUp', 2, 2);
        }
    },
    'Defiant Roar': {
        name: 'Defiant Roar',
        image: 'images/abilities/clonewarschewbacca_defiantroar.png',
        type: 'special',
        cooldown: 5,
        tags: ['dispel', 'health_recovery', 'buff_gain', 'turnmeter_recovery'],
        desc: 'Chewbacca dispels all debuffs from himself, recovers 50% of his Max Health, gains Defense Up for 3 Turns, and has a 50% Chance to gain 25% Turn Meter.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            await dispel(actionInfo.withSelfAsTarget(), 'debuff')
            await heal(actionInfo.withSelfAsTarget(), actionInfo.battleBro.maxHealth * 0.5)
            await applyEffect(actionInfo.withSelfAsTarget(), 'defenceUp', 3);
            if (Math.random() < 0.5) {
                await TMchange(actionInfo.withSelfAsTarget(), 25)
            }
        }
    },
    'Unbowed and Unbroken': {
        name: 'Unbowed and Unbroken',
        image: 'images/abilities/clonewarschewbacca_ult.png',
        type: 'ultimate',
        ultimateCost: 3000,
        tags: ['dispel', 'health_recovery', 'buff_gain', 'taunt'],
        desc: 'Chewbacca lets out a defiant roar, rallying his allies to stand their ground. He dispels all debuffs on himself and all allies, recovers 50% Health and Protection, and Taunts for 3 turns. For 2 turns, all other allies gain Unbreakable: they cannot fall below 1% Health from damage (but can be defeated by other abilities that defeat outright). Chewbacca gains Damage Immunity, Revival and Retribution for 2 turns.',
        use: async function (actionInfo) {
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                await dispel(actionInfo.withTarget(ally), 'debuff')
                if (ally !== actionInfo.battleBro) await applyEffect(actionInfo.withTarget(ally), 'unbreakable', 2, 1, false, true)
            }
            await heal(actionInfo.withSelfAsTarget(), actionInfo.battleBro.maxHealth * 0.5)
            await heal(actionInfo.withSelfAsTarget(), actionInfo.battleBro.maxProtection * 0.5, 'protection')
            await applyEffect(actionInfo.withSelfAsTarget(), 'taunt', 3, 1, false, true);
            await applyEffect(actionInfo.withSelfAsTarget(), 'damageImmunity', 2);
            await applyEffect(actionInfo.withSelfAsTarget(), 'revival', 2);
            await applyEffect(actionInfo.withSelfAsTarget(), 'retribution', 2);
        }
    },
    'Ataru': {
        name: 'Ataru',
        image: 'images/abilities/ability_grandmasteryoda_basic.png',
        type: 'basic',
        tags: ['attack', 'turnmeter_recovery', 'buff_gain', 'special_damage', 'debuff_gain'],
        abilityDamage: 208,
        desc: 'Deal Special damage to target enemy and inflict Potency Down for 1 Turn. If that enemy has 50% or more Health, Yoda gains 40% Turn Meter and Foresight for 2 turns. If that enemy has less than 50% Health, Yoda gains Offense Up and Defense Penetration Up for 2 turns.',
        use: async function (actionInfo) {
            let hits = await dealDmg(actionInfo, this.abilityDamage, 'special')
            let hit = hits[0]
            if (hit > 0) {
                await applyEffect(actionInfo, 'potencyDown', 1);
            }
            if (actionInfo.target.health >= actionInfo.target.maxHealth * 0.5) {
                await TMchange(actionInfo.withSelfAsTarget(), 40)
                //await applyEffect(actionInfo.withSelfAsTarget(), 'foresight', 2);
                //await applyEffect(actionInfo.copyAndChangeTargetTo(actionInfo.battleBro), 'foresight', 2);
                //await applyEffect(actionInfo.copy().setTarget(actionInfo.battleBro), 'foresight', 2);
                let selfActionInfo = actionInfo.withSelfAsTarget()
                await applyEffect(selfActionInfo, 'foresight', 2);
            } else {
                await applyEffect(actionInfo.withSelfAsTarget(), 'offenceUp', 2);
                await applyEffect(actionInfo.withSelfAsTarget(), 'defencePenetrationUp', 2);
            }
        }
    },
    'Masterstroke': {
        name: 'Masterstroke',
        image: 'images/abilities/ability_grandmasteryoda_special01.png',
        type: 'special',
        cooldown: 3,
        tags: ['attack', 'bonus_turn', 'special_damage', 'buff_gain', 'copy'],
        abilityDamage: 60.2,
        desc: `Deal Special damage to all enemies. Then, for each buff an enemy has, Grand Master Yoda gains that effect for ${(oldSchool ? 3 : 2)} turns. (Unique status effects can't be copied.) Grand Master Yoda takes a bonus turn as long as there is one other living Jedi ally.`,
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            const enemies = aliveBattleBros // multi-enemy-team functionality
                .filter((_, i) => i !== actionInfo.battleBro.team) // removes this character's team from the array
                .flat() // flattens nested arrays into just one
            let copiedEffects = []
            for (let enemy of enemies) {
                let actionInfo_targetEnemy = actionInfo.setTarget(enemy)
                await dealDmg(actionInfo_targetEnemy, this.abilityDamage, 'special')
                for (let effect of enemy.buffs) {
                    if (effect.type === 'buff' && effect.isLocked !== true && effect.name !== 'stealth' && effect.name !== 'taunt' && (!copiedEffects.some(e => e.name === effect.name && oldSchool === false))) {
                        // Exclude Stealth, taunt, and already copied effects (if oldSchool is false)
                        copiedEffects.push(effect)
                    }
                }
            }
            for (let buff of copiedEffects) {
                await applyEffect(actionInfo.withSelfAsTarget(), buff.name, (oldSchool ? 3 : 2))
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team].filter(ally => ally !== actionInfo.battleBro)) {
                if (ally.tags.includes('jedi') == true) {
                    actionInfo.battleBro.turnMeter += 100
                    return
                }
            }
        }
    },
    'Unstoppable Force': {
        name: 'Unstoppable Force',
        image: 'images/abilities/ability_grandmasteryoda_special02.png',
        type: 'special',
        cooldown: 4,
        tags: ['attack', 'debuff_gain', 'special_damage'],
        abilityDamage: 299.9,
        desc: 'Deal Special damage to target enemy and remove 70% Turn Meter. If that enemy had less than 100% Health, they are also Stunned for 1 turn.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'special')
            if (hit[0] > 0) {
                await TMchange(actionInfo, -70)
                if (actionInfo.target.health < actionInfo.target.maxHealth) await applyEffect(actionInfo, 'stun', 1)
            }
        }
    },
    'Battle Meditation': {
        name: 'Battle Meditation',
        image: 'images/abilities/ability_grandmasteryoda_special03.png',
        type: 'special',
        cooldown: 4,
        tags: ['turnmeter_recovery', 'buff_gain'],
        desc: `Yoda gains Tenacity Up, Protection Up (30%), and Foresight for 2 turns, then grants each ally every non-unique buff he has (excluding Stealth and Taunt) for ${(oldSchool ? '2 turns' : '1 turn')}. Yoda grants himself +35% Turn Meter and an additional +10% Turn Meter for each other living Jedi ally.`,
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            await applyEffect(actionInfo.withSelfAsTarget(), 'tenacityUp', 2)
            await applyEffect(actionInfo.withSelfAsTarget(), 'protectionUp', 2, 2)
            await applyEffect(actionInfo.withSelfAsTarget(), 'foresight', 2)
            const copiedEffects = actionInfo.battleBro.buffs.filter(effect => effect.type === 'buff' && effect.isLocked !== true)
            let bonusTurnMeter = 0
            for (let ally of aliveBattleBros[actionInfo.battleBro.team].filter(ally => ally !== actionInfo.battleBro)) {
                for (let buff of copiedEffects) {
                    await applyEffect(actionInfo.withTarget(ally), buff.name, (oldSchool ? 2 : 1))
                }
                if (infoAboutCharacters[ally.character].tags.includes('jedi') == true) {
                    bonusTurnMeter += 10
                }
            }
            await TMchange(actionInfo.withSelfAsTarget(), 35 + bonusTurnMeter)
        }
    },
    'Outwit': {
        name: 'Outwit',
        image: 'images/abilities/ability_hera_s3_basic.png',
        type: 'basic',
        tags: ['attack', 'projectile_attack', 'debuff_gain'],
        abilityDamage: 238.9,
        desc: 'Deal Physical damage to target enemy. If that enemy was the healthiest enemy, also Expose them for 1 turn.',
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            const enemies = aliveBattleBros[actionInfo.target.team]
            const enemyHealths = enemies.map(guy => guy.health)
            const healthiestEnemy = enemies[enemyHealths.indexOf(Math.max(...enemyHealths))]
            if (hit[0] > 0 && actionInfo.target === healthiestEnemy) {
                await applyEffect(actionInfo, 'expose', 1)
            }
        }
    },
    'Play to Strengths': {
        name: 'Play to Strengths',
        image: 'images/abilities/ability_hera_s3_special01.png',
        type: 'special',
        cooldown: 3,
        tags: ['target_ally', 'assist', 'buff_gain'],
        desc: 'Call another target ally to assist. That ally\'s attack has +50% Potency and deals 35% more damage. Dispel all debuffs on them, reduce their cooldowns by 1, and grant them 50% Turn Meter.',
        use: async function (actionInfo) { },
        allyUse: async function (battleBro, ally, target) {
            let effectActionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            let assistActionInfo = new ActionInfo({ battleBro: ally, target: target })
            await applyEffect(effectActionInfo, 'potencyUp', 1)
            await assist(assistActionInfo, battleBro, 135)
            await dispel(effectActionInfo, 'debuff')
            await changeCooldowns(ally, -1)
            await TMchange(effectActionInfo, 50)
        }
    },
    'Backup Plan': {
        name: 'Backup Plan',
        image: 'images/abilities/ability_hera_s3_special02.png',
        type: 'special',
        cooldown: 5,
        tags: ['target_ally', 'buff_gain'],
        desc: 'Target other ally gains locked Backup Plan for 3 turns. Backup Plan: Recover 10% Health per turn, revive with 80% Health and 30% Turn Meter when defeated',
        use: async function (actionInfo) { },
        allyUse: async function (battleBro, ally, target) {
            let effectActionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            await applyEffect(effectActionInfo, 'backupPlan', 3, 1, false, true)
        }
    },
    'Invincible Assault': {
        name: 'Invincible Assault',
        image: 'images/abilities/ability_macewindu_basic.png',
        type: 'basic',
        tags: ['attack', 'special_damage'],
        abilityDamage: 154.3,
        desc: "Meal Special damage to target enemy and inflict Ability Block for 1 turn. This attack deals bonus damage equal to 5% of Mace's Max Health. If Mace is above 50% Health, he gains 15% Turn Meter. If Mace is below 50% Health, he recovers Health equal to 100% of the damage dealt.",
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'special')
            let hit2 = await dealDmg(actionInfo, actionInfo.battleBro.maxHealth * 0.05, 'true', false)
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'abilityBlock', 1)
            }
            if (actionInfo.battleBro.health > actionInfo.battleBro.maxHealth * 0.5) {
                await TMchange(actionInfo.withSelfAsTarget(), 15)
            } else {
                await heal(actionInfo.withSelfAsTarget(), hit[0] + hit2[0])
            }
        }
    },
    'Smite': {
        name: 'Smite',
        image: 'images/abilities/ability_macewindu_special01.png',
        type: 'special',
        cooldown: 3,
        tags: ['attack', 'special_damage'],
        abilityDamage: 184,
        desc: "Mace Windu deals Special damage to target enemy and dispels all buffs on them. If target enemy had Shatterpoint, Stun them for 1 turn and remove 50% Turn Meter, then Mace gains 50% Turn Meter.",
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let enemyHadShatterpoint = actionInfo.target.buffs?.find(e => e.name === 'shatterpoint')
            await dispel(actionInfo, 'buff')
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'special')
            if (enemyHadShatterpoint) {
                await applyEffect(actionInfo, 'stun', 1)
                await TMchange(actionInfo, -50)
                await TMchange(actionInfo.withSelfAsTarget(), 50)
            }
        }
    },
    "This Party's Over": {
        name: "This Party's Over",
        image: 'images/abilities/ability_macewindu_special02.png',
        type: 'special',
        cooldown: 3,
        tags: ['target_ally', 'attack', 'special_damage'],
        abilityDamage: 184,
        desc: "Deal Special damage to target enemy and call target other ally to assist. If target enemy had Shatterpoint and target ally is Galactic Republic, swap Turn Meter with target ally. If target enemy had Shatterpoint and target ally is Jedi, Mace gains 2 stacks of Resilient Defense (max 8) for the rest of the encounter. Both Mace and target ally recover 30% Protection.",
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'special')
        },
        allyUse: async function (battleBro, ally, target) {
            await logFunctionCall('method: allyUse (', ...arguments,)
            let enemyHadShatterpoint = target.buffs?.find(e => e.name == 'shatterpoint')
            let assistActionInfo = new ActionInfo({ battleBro: ally, target: target })
            let actionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            await assist(assistActionInfo, battleBro)
            await heal(actionInfo, ally.maxProtection * 0.3, 'protection')
            await heal(actionInfo.withSelfAsTarget(), battleBro.maxProtection * 0.3, 'protection')
            if (enemyHadShatterpoint) {
                await TMchange(assistActionInfo.withTarget(battleBro), ally.turnMeter)
                await TMchange(actionInfo, 100 - ally.turnMeter)
                await applyEffect(actionInfo.withSelfAsTarget(), 'resilientDefence', 999, 2) // infinite duration effects = 999 duration
            }
        }
    },
    'Rattling Uppercut': {
        name: 'Rattling Uppercut',
        image: 'images/abilities/ability_sm33_basic.png',
        type: 'basic',
        tags: ['attack', 'physical_damage', 'debuff_gain'],
        abilityDamage: 380,
        desc: "Deal physical damage to target enemy and stagger them for 2 turns. If the target is a challenger, remove 100% turn meter and inflict ability block and daze for 1 turn.",
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'stagger', 2)
                if (actionInfo.target.buffs.find(effect => effect.tags.includes('challenger'))) {
                    await TMchange(actionInfo, -100)
                    await applyEffect(actionInfo, 'abilityBlock', 1)
                    await applyEffect(actionInfo, 'daze', 1)
                }
            }
        }
    },
    'Limb From Limb': {
        name: 'Limb From Limb',
        image: 'images/abilities/ability_sm33_special01.png',
        type: 'special',
        cooldown: 4,
        tags: ['attack', 'physical_damage', 'debuff_gain'],
        abilityDamage: 210,
        desc: "Deal Physical damage 6 times to target enemy. This attack has +1000% Health Steal and deals 20% more damage for each 20% Health SM-33 is missing. If the target is a challenger, SM-33 deals 50% more damage. Omicron: If this attack defeats an enemy, they can't be revived. For each instance of damage done from this ability while SM-33 has 100% Health, he gains 20% bonus Protection for 2 turns. If the target is a challenger, reduce their max protection by 50%.",
        use: async function (actionInfo) {
            let battleBro = actionInfo.battleBro
            let target = actionInfo.target
            const chunkNum = Math.floor((battleBro.maxHealth - battleBro.health) / (battleBro.maxHealth * 0.2)) // missing health divided by chunk size (20%)
            let dmgPercent = 100 + (20 * chunkNum)
            let isChallenger = target.buffs.find(effect => effect.tags.includes('challenger'))
            if (isChallenger) dmgPercent += 50
            battleBro.healthSteal += 1000
            for (let i = 0; i < 6; i++) {
                await dealDmg(actionInfo, this.abilityDamage * dmgPercent * 0.01, 'physical')
                // add bonus prot
            }
            if (omicron == true) {
                if (target.isDead == true) {
                    target.cantRevive = true
                } else if (isChallenger) {
                    target.maxProtection *= 0.5
                }
            }
            battleBro.healthSteal -= 1000
        }
    },
    'Forearm Bucklers': {
        name: 'Forearm Bucklers',
        image: 'images/abilities/ability_sm33_special02.png',
        type: 'special',
        cooldown: 4,
        tags: ['attack', 'dispel', 'buff_gain', 'debuff_gain'],
        desc: "Dispel all buffs on target enemy then inflict buff immunity and burning for 2 turns. SM-33 gains defence up for 2 turns. If SM-33 was burning, recover 50% health and protection and inflict 5 stacks of damage over time. Omicron: SM-33 dispels all debuffs on himself and gains locked retribution for 1 turn. All Pirate allies gain 25% bonus Protection for 2 turns. If the target is a challenger, SM-33 gains burning for the rest of the battle.",
        use: async function (actionInfo) {
            let battleBro = actionInfo.battleBro
            let target = actionInfo.target
            await dispel(actionInfo, 'buff')
            await applyEffect(actionInfo, 'buffImmunity', 2)
            await applyEffect(actionInfo, 'burning', 2)
            await applyEffect(actionInfo.withSelfAsTarget(), 'defenceUp', 2)
            if (battleBro.buffs.find(effect => effect.tags.includes('burning'))) {
                await heal(actionInfo.withSelfAsTarget(), battleBro.maxHealth * 0.5)
                await heal(actionInfo.withSelfAsTarget(), battleBro.maxProtection * 0.5, 'protection')
                await applyEffect(actionInfo, 'damageOverTime', 2, 5)
            }
            if (omicron == true) {
                await dispel(actionInfo.withSelfAsTarget(), 'debuff')
                await applyEffect(actionInfo.withSelfAsTarget(), 'retribution', 1, 1, false, true)
                // add bonus prot
                if (target.buffs.find(effect => effect.tags.includes('challenger'))) {
                    await applyEffect(actionInfo.withSelfAsTarget(), 'burning', 999)
                }
            }
        }
    },
    'Draining Strike': {
        name: 'Draining Strike',
        image: 'images/abilities/ability_talia_basic.png',
        type: 'basic',
        tags: ['attack', 'physical_damage'],
        abilityDamage: 154.3,
        desc: "Deal Physical damage to target enemy, dealing +50% damage if Talia is below full Health. Allies recover Health equal to the damage dealt.",
        use: async function (actionInfo) {
            let hit
            if (actionInfo.battleBro.health < actionInfo.battleBro.maxHealth) {
                hit = await dealDmg(actionInfo, this.abilityDamage * 1.5, 'physical')
            } else {
                hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                await heal(actionInfo.withTarget(ally), hit[0])
            }
        }
    },
    'Water of Life': {
        name: 'Water of Life',
        image: 'images/abilities/ability_talia_special01.png',
        type: 'special',
        cooldown: 5,
        tags: ['dispel', 'heal', 'turnmeter_recovery'],
        desc: "Dispel all debuffs on allies. Talia consumes 20% of her Max Health and gains 15% Turn Meter for each active ally. Allies recover 50% Health and gain 30% Turn Meter.",
        use: async function (actionInfo) {
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                await dispel(actionInfo.withTarget(ally), 'debuff')
                if (ally !== actionInfo.battleBro) {
                    await heal(actionInfo.withTarget(ally), ally.maxHealth * 0.5)
                    await TMchange(actionInfo.withTarget(ally), 30)
                }
            }
            await dealDmg(actionInfo.withSelfAsTarget(), 20, 'percentage', false, false, true, 'Water of Life', false, false)
            await TMchange(actionInfo.withSelfAsTarget(), 15 * aliveBattleBros[actionInfo.battleBro.team].length)
        }
    },
    'Harrowing Assault': {
        name: 'Harrowing Assault',
        image: 'images/abilities/ability_talia_special02.png',
        type: 'special',
        cooldown: 3,
        tags: ['attack', 'special_damage', 'damageOverTime', 'stagger'],
        abilityDamage: 165.3,
        desc: "Deal Special damage to target enemy and inflict Damage Over Time and Stagger for 2 turns. If Talia has full Health, consume 10% of her Max Health to deal double damage, otherwise she immediately uses Draining Strike.",
        use: async function (actionInfo) {
            let isAtFullHealth = 1 + +(actionInfo.battleBro.health >= actionInfo.battleBro.maxHealth)
            let hit = await dealDmg(actionInfo, this.abilityDamage * isAtFullHealth, 'special')
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'damageOverTime', 2)
                await applyEffect(actionInfo, 'stagger', 2)
            }
            if (actionInfo.battleBro.health >= actionInfo.battleBro.maxHealth) {
                await dealDmg(actionInfo.withSelfAsTarget(), 10, 'percentage', false, false, true)
            } else {
                await wait(300)
                await useAbility('Draining Strike', actionInfo, false, 'chained')
            }
        }
    },
    'Blood Moon Ritual': {
        name: 'Blood Moon Ritual',
        image: 'images/abilities/ability_talia_ult.png',
        type: 'ultimate',
        ultimateCost: 3000,
        tags: ['revive', 'equalize', 'health_recovery', 'buff_gain', 'cleanse'],
        desc: "Talia performs a forbidden Nightsister ritual, sacrificing her own vitality to defy death. She consumes 50% of her Max Health to revive all defeated allies at 50% Health and cleanse all debuffs from them. All allies gain Offense Up, Speed Up, and Foresight for 2 turns. Talia then equalizes her remaining Health among all allies and recovers Protection equal to 50% of the total Health sacrificed. If Talia would be defeated by this ability, she is reduced to 1% Health instead and gains Damage Immunity for 1 turn.",
        use: async function (actionInfo) {
            const savedHealth = actionInfo.battleBro.health
            if (actionInfo.battleBro.health > actionInfo.battleBro.maxHealth * 0.5) {
                await dealDmg(actionInfo.withSelfAsTarget(), 50, 'percentage', false, false, true, 'Blood Moon Ritual', false, false)
            } else {
                await dealDmg(actionInfo.withSelfAsTarget(), actionInfo.battleBro.health - 1, 'unchangeable', false, false, true, 'Blood Moon Ritual', false, false)
                await applyEffect(actionInfo.withSelfAsTarget(), 'damageImmunity', 1)
            }
            const deadAllies = battleBros.filter(guy => guy.team == actionInfo.battleBro.team && guy.isDead == true)
            for (let ally of deadAllies) {
                await revive(actionInfo.withTarget(ally), 50)
                await dispel(actionInfo.withTarget(ally), 'debuff')
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                await applyEffect(actionInfo.withTarget(ally), 'offenceUp', 2)
                await applyEffect(actionInfo.withTarget(ally), 'speedUp', 2)
                await applyEffect(actionInfo.withTarget(ally), 'foresight', 2)
            }
            await equalize(actionInfo, aliveBattleBros[actionInfo.battleBro.team], 'health')
            await heal(actionInfo.withSelfAsTarget(), (savedHealth - actionInfo.battleBro.health) * 0.5, 'protection')
        }
    },
    // --------------------------------------------------------SAVI'S CHARACTERS
    'Slipper Slam': {
        name: 'Slipper Slam',
        image: 'images/abilities/johnWok1.png',
        type: 'basic',
        tags: ['attack', 'projectile_attack', 'physical_damage', 'debuff_gain'],
        projectile: 'slipper',
        abilityDamage: 68,
        desc: "Deals physical damage to target enemy then deals physical damage to all other enemies which can't be countered, inflicting knockback for 1 turn on all of them.",
        use: async function (actionInfo) {
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let enemy of enemies) {
                const isTarget = (enemy == actionInfo.target) ? 2 : 1
                const counterable = (enemy == actionInfo.target) ? true : false
                let hit = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage * isTarget, 'physical', true, false, false, this.name, counterable)
                if (hit[0] > 0) {
                    await applyEffect(actionInfo.withTarget(enemy), 'knockback', 1)
                }
            }
        }
    },
    'Belt Flashbang': {
        name: 'Belt Flashbang',
        image: 'images/abilities/johnWok2.png',
        type: 'special',
        cooldown: 4,
        tags: ['debuff_gain'],
        abilityDamage: 48,
        desc: "Deals low special damage to all enemies, which can't be countered. Enemies over 100% health are stunned for 1 turn, and other enemies are blinded for 1 turn. Debuffed enemies are staggered for 1 turn and buffed enemies are dazed for 1 turn.",
        use: async function (actionInfo) {
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let enemy of enemies) {
                let hit = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage, 'special', true, false, false, this.name, false)
                if (hit[0] > 0) {
                    if (enemy.buffs.find(effect => effect.type == 'debuff')) {
                        await applyEffect(actionInfo.withTarget(enemy), 'stagger', 1)
                    }
                    if (enemy.health >= enemy.maxHealth) {
                        await applyEffect(actionInfo.withTarget(enemy), 'stun', 1)
                    } else {
                        await applyEffect(actionInfo.withTarget(enemy), 'blind', 1)
                    }
                    if (enemy.buffs.find(effect => effect.type == 'buff')) {
                        await applyEffect(actionInfo.withTarget(enemy), 'daze', 1)
                    }
                }
            }
        }
    },
    'Belt Nunchuck': {
        name: 'Belt Nunchuck',
        image: 'images/abilities/johnWok3.png',
        type: 'special',
        cooldown: 3,
        tags: ['attack', 'physical_damage', 'debuff_gain'],
        abilityDamage: 120,
        desc: "Deals physical damage to target enemy and the two other weakest enemies and inflicts disarm for 1 turn on them. Inflict accuracy down on them for an amount of turns equal to the number of debuffed enemies hit and John gains chain attack for an amount of turns equal to the number of buffed enemies hit.",
        use: async function (actionInfo) {
            let targetedEnemies = []
            let enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            let enemyHealths = enemies.map(guy => guy.health + guy.protection)
            const weakestEnemy = enemies[enemyHealths.indexOf(Math.min(...enemyHealths))]
            enemies.splice(enemyHealths.indexOf(Math.min(...enemyHealths)), 1)
            enemyHealths = enemies.map(guy => guy.health + guy.protection)
            const secondWeakestEnemy = enemies[enemyHealths.indexOf(Math.min(...enemyHealths))]
            targetedEnemies.push(actionInfo.target, weakestEnemy, secondWeakestEnemy)
            let numberOfDebuffedEnemiesHit = 0
            let numberOfBuffedEnemiesHit = 0
            let hitEnemies = []
            for (let enemy of targetedEnemies) {
                let hit = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage, 'physical')
                if (hit[0] > 0) {
                    if (enemy.buffs.find(effect => effect.type == 'debuff')) {
                        numberOfDebuffedEnemiesHit++
                    }
                    await applyEffect(actionInfo.withTarget(enemy), 'disarm', 1)
                    if (enemy.buffs.find(effect => effect.type == 'buff')) {
                        numberOfBuffedEnemiesHit++
                    }
                    hitEnemies.push(enemy)
                }
            }
            for (let enemy of hitEnemies) {
                if (numberOfDebuffedEnemiesHit > 0) {
                    await applyEffect(actionInfo.withTarget(enemy), 'accuracyDown', numberOfDebuffedEnemiesHit)
                }
            }
            if (numberOfBuffedEnemiesHit > 0) {
                await applyEffect(actionInfo.withSelfAsTarget(), 'chainAttack', numberOfBuffedEnemiesHit)
            }
        }
    },
    'Minute Rice in 59 Seconds': {
        name: 'Minute Rice in 59 Seconds',
        image: 'images/abilities/johnWok4.png',
        type: 'ultimate',
        ultimateCost: 3500,
        tags: ['attack', 'physical_damage', 'debuff_gain'],
        abilityDamage: 150,
        desc: "Deals physical damage to target enemy three times, inflicting locked Emotional Damage for 1 turn. Dispel all debuffs on allies, then they gain locked Minute Rice for 2 turns.",
        use: async function (actionInfo) {
            for (let i = 0; i < 3; i++) {
                let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            }
        }
    },
    // --------------------------------------------------------SUPERPIG'S BRAVADO
    'Thwart the Plan': {
        name: 'Thwart the Plan',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'basic',
        tags: ['attack', 'projectile_attack', 'physical_damage'],
        projectile: 'redLaser',
        abilityDamage: 63,
        desc: "Business pig's hoof gloves shoot out a little capsule that folds out into two miniature stun-guns. Deals 2x low damage to target enemy. Each amount of damage has a 25% chance to be physical damage, a 50% chance to be special damage and a 25% chance to be ultra damage. If an attack deals physical damage, double Business Pig's critical hit chance and penetrate defence by 25%.",
        use: async function (actionInfo) {
            for (let i = 0; i < 2; i++) {
                const randomChance = Math.random()
                if (randomChance < 0.25) {
                    const critChance = actionInfo.battleBro.critChance
                    actionInfo.battleBro.critChance += critChance
                    actionInfo.battleBro.defencePenetration += 25
                    await dealDmg(actionInfo, this.abilityDamage, 'physical')
                    actionInfo.battleBro.critChance -= critChance
                    actionInfo.battleBro.defencePenetration -= 25
                } else if (randomChance < 0.75) {
                    await dealDmg(actionInfo, this.abilityDamage, 'special')
                } else {
                    await dealDmg(actionInfo, this.abilityDamage, 'ultra')
                }
            }
        }
    },
    'Important Meeting': {
        name: 'Important Meeting',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'special',
        cooldown: 5,
        tags: ['debuff_gain', 'buff_gain'],
        desc: "Business Pig must interrupt the battle for an important meeting. Inflicts Locked Stun on all enemies that can't be resisted and sets the turn meter of all Superpig's Bravado allies to 0. Business Pig's speed is set to 0 until all enemies have come out of stun. Then Business Pig activates his jetpack and gains Aerial Advantage for 2 turns. During this Aerial Advantage he can use all other abilities except for Important Meeting and Oinks of Approval.",
        use: async function (actionInfo) {
            for (let enemy of actionInfo.enemies) {
                await applyEffect(actionInfo.withTarget(enemy), 'stun', 1, 1, false, true)
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                ally.turnMeter = 0
            }
            actionInfo.battleBro.customData.importantMeeting = {
                enemiesStunned: true,
                savedSpeed: actionInfo.battleBro.speed
            }
            actionInfo.battleBro.speed -= actionInfo.battleBro.customData.importantMeeting.savedSpeed
        }
    },
    // --------------------------------------------------------OLIV'S CHARACTERS
    'Lethal Swing': {
        name: "Lethal Swing",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'basic',
        tags: ['attack', 'physical_damage'],
        abilityDamage: 117.8,
        desc: 'Deals physical damage and inflicts Tenacity Down and Potency Down, this ability ignores defence and can\'t be evaded. If this ability scores a critical hit, inflict Ability Block on a random enemy.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let savedArmour = actionInfo.target.armour
            let savedEvasion = actionInfo.target.evasion
            actionInfo.target.armour = 0
            actionInfo.target.evasion = 0
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            actionInfo.target.armour += savedArmour
            actionInfo.target.evasion += savedEvasion
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'potencyDown', 1);
                await applyEffect(actionInfo, 'tenacityDown', 1);
            }
            if (hit[1] == true) { // crit condition
                const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
                const randomIndex = Math.floor(Math.random() * enemies.length)
                await applyEffect(actionInfo.withTarget(enemies[randomIndex]), 'abilityBlock', 2);
            }
        }
    },
    'Piercing Edge': {
        name: "Piercing Edge",
        image: 'images/abilities/superStriker2.png',
        type: 'special',
        cooldown: 3,
        tags: ['attack', 'physical_damage'],
        desc: "Deals physical damage to target enemy. If it scores a critical hit, deal special damage to target enemy. Inflict Target Lock to the enemy leader for 3 turns. Target Lock: Inflict Vulnerable to target enemy.",
        abilityDamage: 130,
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                let enemyLeaders = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat().filter(guy => guy.isLeader == true)
                for (let enemyLeader of enemyLeaders) {
                    await applyEffect(actionInfo.withTarget(enemyLeader), 'targetLock', 3)
                }
            }
            if (hit[1] == true) {
                await dealDmg(actionInfo, this.abilityDamage * 0.5, 'special', false)
            }
        }
    },
    'Disruptor Blade': {
        name: "Disruptor Blade",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'special',
        cooldown: 4,
        tags: ['attack', 'physical_damage'],
        desc: "Deal special damage to the target enemy and dispel all buffs. This ability has +30% Critical Chance and Critical Damage when used against tanks. Target Lock: This attack deals +50% damage and inflicts Daze and Buff Immunity for 2 turns.",
        abilityDamage: 135,
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let locked = false
            if (actionInfo.target.buffs.find(effect => effect.tags.includes('targetLock'))) {
                actionInfo.battleBro.flatDamageDealt += 50
                locked = true
            }
            if (infoAboutCharacters[actionInfo.target.character].tags.includes('tank') == true) {
                actionInfo.battleBro.critChance += 30
                actionInfo.battleBro.critDamage += 30
                await dealDmg(actionInfo, this.abilityDamage, 'physical')
                actionInfo.battleBro.critChance -= 30
                actionInfo.battleBro.critDamage -= 30
            } else {
                await dealDmg(actionInfo, this.abilityDamage, 'physical')
            }
            if (locked == true) {
                actionInfo.battleBro.flatDamageDealt -= 50
                await applyEffect(actionInfo, 'daze', 2)
                await applyEffect(actionInfo, 'buffImmunity', 2)
            }
        }
    },
    'Super Strike': {
        name: "Super Strike",
        image: 'images/abilities/superStrike.png',
        type: 'ultimate',
        ultimateCost: 3000,
        tags: ['attack', 'physical_damage'],
        abilityDamage: 10000,
        desc: 'Deal true damage to target enemy, inflict Doomed, Fear and Bleed for 3 turns to target enemy. If this ability scores a critical hit, use this ability again. If this ability defeats an enemy, inflict Fear to all enemies for 1 turn.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let savedEvasion = actionInfo.target.evasion
            actionInfo.target.evasion -= savedEvasion
            await applyEffect(actionInfo, 'doomed', 3)
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'true')
            await applyEffect(actionInfo, 'fear', 3)
            await applyEffect(actionInfo, 'bleed', 3)

            if (actionInfo.target.isDead == true) {
                const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
                for (let enemy of enemies) {
                    await applyEffect(actionInfo.withTarget(enemy), 'fear', 1)
                }
            }
            actionInfo.target.evasion += savedEvasion

            if (actionInfo.target.isDead == false && Math.random() < (actionInfo.battleBro.critChance - actionInfo.target.critAvoidance) * 0.01) { // && hit[1] == true
                await wait(300)
                await useAbility('Super Strike', actionInfo, false, 'chained')
            }
        }
    },
    'Focused Blast': {
        name: "Focused Blast",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'basic',
        tags: ['attack', 'projectile_attack', 'special_damage', 'shadow_damage', 'debuff_gain'],
        abilityDamage: 70,
        desc: 'Deal special damage and shadow damage and inflict Shock for 3 turns.',
        use: async function (actionInfo) {
            let hit1 = await dealDmg(actionInfo, this.abilityDamage, 'special')
            let hit2 = await dealDmg(actionInfo, this.abilityDamage * 0.3 * actionInfo.battleBro.offence, 'shadow')
            if (hit1[0] > 0 || hit2[0] > 0) {
                await applyEffect(actionInfo, 'shock', 3)
            }
        }
    },
    'Cybernetic Overload': {
        name: "Cybernetic Overload",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'special',
        cooldown: 2,
        tags: ['attack', 'special_damage', 'physical_damage', 'debuff_gain'],
        abilityDamage: 150,
        desc: "Deal high physical damage to target enemy and inflict Scam to all enemies for 1 turn. If this ability scores a critical hit, deal high special damage again and increase the cooldown by 2.",
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            for (let enemy of actionInfo.enemies) {
                await applyEffect(actionInfo.withTarget(enemy), 'scam', 1)
            }
            if (hit[1] == true) { // crit condition
                await dealDmg(actionInfo, this.abilityDamage, 'special')
                return [2] // increases cooldowns of Cybernetic Overload by 2
            }
        }
    },
    'Crippling Slice': {
        name: "Crippling Slice",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'special',
        cooldown: 4,
        tags: ['attack', 'physical_damage', 'debuff_gain'],
        abilityDamage: 145,
        desc: "Deal physical damage and inflict Bleed and Decay to target enemy for 3 turns. These effects cannot be resisted. This attack cannot be evaded.",
        use: async function (actionInfo) {
            const savedEvasion = actionInfo.target.evasion
            actionInfo.target.evasion = -1000
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            actionInfo.target.evasion += savedEvasion + 1000
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'bleed', 3, 1, false)
                await applyEffect(actionInfo, 'decay', 3, 1, false)
            }
        }
    },
    'Atomic Detonation': {
        name: "Atomic Detonation",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'special',
        cooldown: 5,
        tags: ['attack', 'mines', 'debuff_gain'],
        desc: "Inflict 5 stacks of Concussion Mine to all enemies and decrease the cooldown by 4. Use this ability again to explode all Concussion Mines. When this ability detonates, inflict radiation on all enemies for 1 turn.",
        use: async function (actionInfo) {
            if (!actionInfo.battleBro.customData.atomicDetonation) {
                actionInfo.battleBro.customData.atomicDetonation = {
                    minesPlaced: false,
                }
            }
            if (actionInfo.battleBro.customData.atomicDetonation.minesPlaced == false) {
                for (let enemy of actionInfo.enemies) {
                    await applyEffect(actionInfo.withTarget(enemy), 'concussionMine', Infinity, 5)
                }
                actionInfo.battleBro.customData.atomicDetonation.minesPlaced = true
                return [-4] // decreases cooldowns of Atomic Detonation by 4
            } else {
                for (let enemy of actionInfo.enemies) {
                    let concussionMines = enemy.buffs.filter(effect => effect.tags.includes('mine') && effect.caster == actionInfo.battleBro)
                    for (let mine of concussionMines) {
                        await expireEffect(actionInfo.withTarget(enemy), enemy, mine, 'detonated')
                    }
                    await applyEffect(actionInfo.withTarget(enemy), 'radiation', 1)
                }
                actionInfo.battleBro.customData.atomicDetonation.minesPlaced = false
            }
        }
    },
    'Quantum Surge': {
        name: "Quantum Surge",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        type: 'ultimate',
        ultimateCost: 2400,
        tags: ['attack', 'physical_damage', 'special_damage', 'ultra_damage', 'debuff_gain'],
        abilityDamage: 80,
        desc: "Deal special damage, ultra damage and physical damage and inflict EMP Device to all enemies for 3 turns. EMP Device: Zero speed until the end of 2 turns. When an EMP Device expires, take special damage, gain Expose and Protection Disruption for 2 turns and become stunned if this character is a droid.",
        use: async function (actionInfo) {
            for (let enemy of actionInfo.enemies) {
                let hit1 = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage, 'special')
                let hit2 = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage, 'ultra')
                let hit3 = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage, 'physical')
                if (hit1[0] > 0 || hit2[0] > 0 || hit3[0] > 0) {
                    await applyEffect(actionInfo.withTarget(enemy), 'EMPDevice', 3)
                }
            }
        }
    },
    // --------------------------------------------------------JAMES' CHARACTERS
    'Cloning Strike': {
        name: "Cloning Strike",
        image: 'images/abilities/shadowMenaceOriginal1.png',
        type: 'basic',
        tags: ['attack', 'physical_damage', 'healthSteal'],
        abilityDamage: 45,
        desc: 'Deal physical damage 5 times to target enemy and recover health equal to the damage dealt. On 3 or more critical hits inflict offense down for 3 turns.',
        use: async function (actionInfo) {
            let critCounter = 0
            for (let i = 0; i < 5; i++) {
                let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
                if (hit[1] == true) { // crit condition
                    critCounter++
                }
            }
            if (critCounter >= 3) {
                await applyEffect(actionInfo, 'offenceDown', 3)
            }
        },
    },
    'Sabre Storm': {
        name: "Sabre Storm",
        image: 'images/abilities/shadowMenaceOriginal2.png',
        type: 'special',
        cooldown: 3,
        tags: ['attack', 'ultra_damage'],
        abilityDamage: 22,
        desc: 'Deal ultra damage 4 times to target enemy and 2 times to all other enemies and inflict 3 damage over time for 3 turns. All shadow menace allies recover 20% of the total damage dealt.',
        use: async function (actionInfo) {
            let damageDealt = 0
            for (let i = 0; i < 2; i++) {
                let hit = await dealDmg(actionInfo, this.abilityDamage, 'ultra')
                damageDealt += hit[0]
            }
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let enemy of enemies) {
                for (let i = 0; i < 2; i++) {
                    let actionInfo_targetEnemy = actionInfo.setTarget(enemy)
                    let hit = await dealDmg(actionInfo_targetEnemy, this.abilityDamage, 'ultra')
                    damageDealt += hit[0]
                }
                await applyEffect(actionInfo.withTarget(enemy), 'damageOverTime', 3, 3)
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team].filter(unit => infoAboutCharacters[unit.character].tags.includes('shadowMenace'))) {
                await heal(actionInfo.withTarget(ally), damageDealt * 0.2)
            }
        }
    },
    'Rotating Blades': {
        name: "Rotating Blades",
        image: 'images/abilities/shadowMenaceOriginal3.png',
        type: 'special',
        cooldown: 7,
        tags: ['buffGain'],
        desc: 'Gain the Rotation effect and defense up for 4 turns, and recover 35% protection. Rotating: Reflect projectile attacks such as blaster shots, absorb force/magic attacks, and reduce melee attacks by 50%.',
        use: async function (actionInfo) {
            await heal(actionInfo.withSelfAsTarget(), actionInfo.battleBro.maxProtection * 0.35, 'protection')
            await applyEffect(actionInfo.withSelfAsTarget(), 'rotating', 4)
            await applyEffect(actionInfo.withSelfAsTarget(), 'defenceUp', 4)
        }
    },
    'Cut it short': {
        name: "Cut it short",
        image: 'images/abilities/shadowMenaceOriginal4.png',
        type: 'ultimate',
        ultimateCost: 2200,
        tags: ['buffGain'],
        desc: 'Shadow menace gains a bonus turn and heals all allies by 20% of their max health for each fallen ally. Shadow menace gains 1 stack of fallen ally for each fallen ally. Fallen ally When attacking an enemy revive a random fallen ally with 1 health who assists dealing 10% damage for each stack. Then defeat these allies.',
        use: async function (actionInfo) {
            actionInfo.battleBro.turnMeter += 100 // bonus turn
            let fallenAllies = battleBros.filter(bro => bro.team === actionInfo.battleBro.team && bro.isDead === true)
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                await heal(actionInfo.withTarget(ally), ally.maxHealth * 0.2 * fallenAllies.length)
            }
            await applyEffect(actionInfo.withSelfAsTarget(), 'fallenAlly', 999, fallenAllies.length, false, true) // infinite duration effects = 999 duration
        },
    },
    // --------------------------------------------------------ERIK'S CHARACTERS
    'Sword Slash': {
        name: "Sword Slash",
        image: 'images/abilities/ninja1.png',
        type: 'basic',
        tags: ['attack', 'physical_damage'],
        abilityDamage: 200,
        desc: 'Deals physical damage and inflicts healing immunity for 3 turns.',
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'healingImmunity', 3)
            }
        },
    },
    'Sneak Attack': {
        name: "Sneak Attack",
        image: 'images/abilities/ninja2.png',
        type: 'special',
        cooldown: 3,
        tags: ['attack', 'special_damage'],
        abilityDamage: 260,
        desc: 'Deals special damage and stealths for 2 turns.',
        use: async function (actionInfo) {
            await dealDmg(actionInfo, this.abilityDamage, 'special')
            await applyEffect(actionInfo.withSelfAsTarget(), 'stealth', 2)
        },
    },
    'Dread Slash': {
        name: "Dread Slash",
        image: 'images/abilities/ninja3.png',
        type: 'ultimate',
        ultimateCost: 3500,
        tags: ['attack', 'shadow_damage'],
        abilityDamage: 18000,
        desc: 'Deals shadow damage. Buffs ninja with offence up and stealth for 3 turns this can\'t be dispelled while the opponents will gain blind and defence down for 2 turns can\'t be dispelled.',
        use: async function (actionInfo) {
            await applyEffect(actionInfo.withSelfAsTarget(), 'stealth', 3, 1, false, true)
            await applyEffect(actionInfo.withSelfAsTarget(), 'offenceUp', 3, 1, false, true)
            await dealDmg(actionInfo, this.abilityDamage, 'shadow')
            for (let enemy of aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()) {
                await applyEffect(actionInfo.withTarget(enemy), 'blind', 2, 1, false, true)
                await applyEffect(actionInfo.withTarget(enemy), 'defenceDown', 2, 1, false, true)
            }
        },
    },
    // --------------------------------------------------------OUR CHARACTERS
    'Gooseballs': {
        name: "Gooseballs",
        image: 'images/abilities/ability_jediconsular_special01.png',
        type: 'basic',
        tags: ['attack', 'projectile_attack', 'physical_damage'],
        abilityDamage: 100,
        projectile: 'gooseball',
        desc: 'Deals physical damage to target enemy and another random enemy with a bonus attack on critical hits. Can not bonus attack out of turn',
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (battleBros[selectedBattleBroNumber] == actionInfo.battleBro && hit[1] == true && actionInfo.parentActionInfo?.actionDetails?.type == 'main') {
                const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
                await addAttackToQueue(actionInfo.withTarget(enemies[Math.floor(Math.random() * enemies.length)]))
            }
        },
    },
    'Honk of Approval': {
        name: "Honk of Approval",
        image: 'images/abilities/KraytDragonSkill4.png',
        type: 'special',
        cooldown: 5,
        tags: ['target_ally', 'buff_gain'],
        abilityDamage: 100,
        desc: 'Target ally gains Resilience and Goosey gains Call to Action for 1 turn. For every ally with a buff, the duration of these buffs are increased by 1.',
        use: async function (actionInfo) {
        },
        allyUse: async function (battleBro, ally, target) {
            let actionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            const numberOfBuffedAllies = aliveBattleBros[battleBro.team].filter(ally => ally.buffs.find(effect => effect.type == 'buff')).length
            await applyEffect(actionInfo, 'resilience', 1 + numberOfBuffedAllies)
            await applyEffect(actionInfo.withSelfAsTarget(), 'callToAction', 1 + numberOfBuffedAllies)
        }
    },
    'Belly Bounce': {
        name: "Belly Bounce",
        image: 'images/abilities/KraytDragonSkill3.png',
        type: 'special',
        cooldown: 4,
        tags: ['attack', 'debuff_gain'],
        abilityDamage: 600,
        desc: 'dealing physical damage to it. He then bounces onto 2 more targets, reducing the damage by 50% per bounce (e.g. enemy 1 takes 100 damage, enemy 2 takes 50 damage and enemy 3 takes 25 damage). The target enemy is inflicted with Flatten for 1 turn.',
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'stun', 1)
            }
            let enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let i = 0; i < 2; i++) {
                const randomEnemyIndex = Math.floor(Math.random() * enemies.length)
                let hit = await dealDmg(actionInfo.withTarget(enemies[randomEnemyIndex]), this.abilityDamage * 1 / ((i + 1) * 2), 'physical')
                enemies.splice(randomEnemyIndex, 1)
            }
        },
    },
    'Gooseball Barrage': {
        name: "Gooseball Barrage",
        image: 'images/abilities/ability_dathcha_basic.png',
        type: 'ultimate',
        ultimateCost: 2700,
        tags: ['attack', 'projectile_attack', 'physical_damage'],
        abilityDamage: 100,
        projectile: 'gooseball',
        desc: 'Goosey channels 30 gooseballs all in one turn, dealing physical damage to random enemies. Enemies can be struck more than once.',
        use: async function (actionInfo) {
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let i = 0; i < 30; i++) {
                const randomEnemyIndex = Math.floor(Math.random() * enemies.length)
                await dealDmg(actionInfo.withTarget(enemies[randomEnemyIndex]), this.abilityDamage, 'physical')
            }
        },
    },
    'Bob Bash': {
        name: "Bob Bash",
        image: 'images/abilities/ability_grandmasteryoda_basic.png',
        type: 'basic',
        tags: ['attack', 'physical_damage'],
        abilityDamage: 200,
        desc: 'Deals physical damage and inflicts a random locked debuff for 4 turns.',
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                const debuffs = Object.entries(infoAboutEffects).filter(effect => effect[1].type === 'debuff')
                let randomDebuffIndex = Math.floor(Math.random() * debuffs.length)
                await applyEffect(actionInfo, debuffs[randomDebuffIndex][1].name, 4, 1, false, true, 50)
            }
        },
    },
    'Bob Force': {
        name: 'Bob Force',
        image: 'images/abilities/ability_jediconsular_special01.png',
        type: 'special',
        cooldown: 3,
        tags: ['target_ally', 'health_recovery'],
        desc: 'Heal target ally, with extra healing passing into protection, and give them a random locked buff for 4 turns.',
        use: async function (actionInfo) {
        },
        allyUse: async function (battleBro, ally, target) {
            let healInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            if (ally.health + battleBro.specialDamage <= ally.maxHealth) {
                await heal(healInfo, battleBro.specialDamage)
            } else {
                await heal(healInfo, ally.maxHealth - ally.health)
                await heal(healInfo, battleBro.specialDamage - (ally.maxHealth - ally.health), 'protection')
            }
            const buffs = Object.entries(infoAboutEffects).filter(effect => effect[1].type === 'buff')
            let randomBuffIndex = Math.floor(Math.random() * buffs.length)
            await applyEffect(healInfo, buffs[randomBuffIndex][1].name, 4, 1, false, true, 50)
        }
    },
    'Bob Blast': {
        name: "Bob Blast",
        image: 'images/abilities/ability_jediconsular_special02.png',
        type: 'ultimate',
        ultimateCost: 4300,
        tags: ['buff_gain', 'debuff'],
        desc: 'Inflicts 5 locked debuffs on all enemies for 3 turns and 5 locked buffs on all allies for 3 turns.',
        use: async function (actionInfo) {
            const effects = Object.entries(infoAboutEffects)
            const debuffs = effects.filter(effect => effect[1].type === 'debuff')
            const buffs = effects.filter(effect => effect[1].type === 'buff')
            for (let enemy of aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()) {
                for (let i = 0; i < 5; i++) {
                    let randomDebuffIndex = Math.floor(Math.random() * debuffs.length)
                    await applyEffect(actionInfo.withTarget(enemy), debuffs[randomDebuffIndex][1].name, 3, 1, false, true, 50)
                }
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                for (let i = 0; i < 5; i++) {
                    let randomBuffIndex = Math.floor(Math.random() * buffs.length)
                    await applyEffect(actionInfo.withTarget(ally), buffs[randomBuffIndex][1].name, 3, 1, false, true, 50)
                }
            }
        },
    },
    // --------------------------------------------------------ANGRY BIRDS EPIC CHARACTERS
    'Dragon Strike': {
        name: "Dragon Strike",
        image: 'images/abilities/dragonStrike.png',
        type: 'basic',
        tags: ['attack', 'physical_damage'],
        abilityDamage: 50,
        desc: 'Deals physical damage thrice.',
        use: async function (actionInfo) {
            for (let i = 0; i < 3; i++) {
                await dealDmg(actionInfo, this.abilityDamage, 'physical')
            }
        },
    },
    'Defensive Formation': {
        name: "Defensive Formation",
        image: 'images/abilities/defensiveFormation.png',
        type: 'special',
        cooldown: 1,
        tags: ['target_ally', 'buffGain'],
        desc: 'Target gains locked defence up for 2 turns and all other allies gain regular defence up.',
        use: async function (actionInfo) {
        },
        allyUse: async function (battleBro, ally, target) {
            let actionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            await applyEffect(actionInfo, 'defenceUp', 2, 1, false, true)
            for (let friend of aliveBattleBros[battleBro.team].filter(unit => unit !== ally)) {
                await applyEffect(actionInfo.withTarget(friend), 'defenceUp', 2)
            }
        }
    },
    'Heroic Strike': {
        name: "Heroic Strike",
        image: 'images/abilities/rageChili.png',
        type: 'ultimate',
        ultimateCost: 2500,
        tags: ['attack', 'physical_damage'],
        abilityDamage: 500,
        desc: 'Deals physical damage to the enemy with the most health.',
        use: async function (actionInfo) {
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            const enemyHealths = enemies.map(guy => guy.health)
            const healthiestEnemy = enemies[enemyHealths.indexOf(Math.max(...enemyHealths))]
            let actionInfo_healthiestEnemy = actionInfo.setTarget(healthiestEnemy)
            await dealDmg(actionInfo_healthiestEnemy, this.abilityDamage, 'physical')
        },
    },
    'Acid Rain': {
        name: "Acid Rain",
        image: 'images/abilities/acidRain.png',
        type: 'basic',
        tags: ['attack', 'projectile_attack', 'physical_damage'],
        abilityDamage: 20,
        desc: 'Deals physical damage to all enemies and inflict damage over time for 3 turns.',
        use: async function (actionInfo) {
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let enemy of enemies) {
                let hit = await dealDmg(actionInfo.setTarget(enemy), this.abilityDamage, 'physical')
                if (hit[0] > 0) {
                    await applyEffect(actionInfo.setTarget(enemy), 'damageOverTime', 3)
                }
            }
        },
    },
    'Healing Rain': {
        name: "Healing Rain",
        image: 'images/abilities/healingRain.png',
        type: 'special',
        cooldown: 1,
        tags: ['target_ally', 'heal', 'dispel'],
        desc: 'Dispels all debuffs from target ally and heals all allies for 20% of Chuck\'s max health',
        use: async function (actionInfo) {
        },
        allyUse: async function (battleBro, ally, target) {
            let actionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            await dispel(actionInfo, 'debuff')
            for (let friend of aliveBattleBros[battleBro.team]) {
                await heal(actionInfo.withTarget(friend), battleBro.maxHealth * 0.2)
            }
        }
    },
    'Speed of Light': {
        name: "Speed of Light",
        image: 'images/abilities/rageChili.png',
        type: 'ultimate',
        ultimateCost: 3200,
        tags: ['assist'],
        desc: 'Unleash five attacks from allies.',
        use: async function (actionInfo) {
            for (let i = 0; i < 5; i++) {
                let randomAllyIndex = Math.floor(Math.random() * aliveBattleBros[actionInfo.battleBro.team].length)
                await assist(new ActionInfo({ battleBro: aliveBattleBros[actionInfo.battleBro.team][randomAllyIndex], target: actionInfo.target }), actionInfo.battleBro)
            }
        },
    },
    'Thorny Vine': {
        name: "Thorny Vine",
        image: 'images/abilities/thornyVine.png',
        type: 'basic',
        tags: ['attack', 'physical_damage'],
        abilityDamage: 35,
        desc: 'Deals physical damage to target enemy and inflicts 3 stacks of damage over time for 3 turns.',
        use: async function (actionInfo) {
            await dealDmg(actionInfo, this.abilityDamage, 'physical')
            await applyEffect(actionInfo, 'damageOverTime', 3, 3)
        },
    },
    'Regrowth': {
        name: "Regrowth",
        image: 'images/abilities/regrowth.png',
        type: 'special',
        cooldown: 1,
        tags: ['target_ally', 'heal'],
        desc: 'Heals target ally for 22% of their max health and all other allies by 10%.',
        use: async function (actionInfo) {
        },
        allyUse: async function (battleBro, ally, target) {
            let actionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            for (let friend of aliveBattleBros[battleBro.team]) {
                if (friend == ally) {
                    await heal(actionInfo.withTarget(friend), friend.maxHealth * 0.22)
                } else {
                    await heal(actionInfo.withTarget(friend), friend.maxHealth * 0.1)
                }
            }
        }
    },
    'Matildas Medicine': {
        name: "Matildas Medicine",
        image: 'images/abilities/rageChili.png',
        type: 'ultimate',
        ultimateCost: 2000,
        tags: ['heal', 'dispel'],
        desc: 'Dispels all debuffs from all allies and heals them for 35% of their max health, which ignores any heal-blocking effects.',
        use: async function (actionInfo) {
            for (let friend of aliveBattleBros[actionInfo.battleBro.team]) {
                await dispel(actionInfo.withTarget(friend), 'debuff')
                await heal(actionInfo.withTarget(friend), friend.maxHealth * 0.35, 'health', false, true)
            }
        },
    },
    // --------------------------------------------------------KRAYT RAID
    'jangoUnscrupulousGunfire': {
        name: "Unscrupulous Gunfire",
        image: 'images/abilities/ability_jangofett_basic.png',
        desc: "Deal Physical damage to target enemy and gain 15% Offense for each enemy suffering a debuff during this attack. If the target enemy was suffering a debuff, Jango Fett attacks again.",
        abilityDamage: (6823 + 7541) / 2, // "6823 - 7541"
        abilityDamageVariance: -(6823 - 7541) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'dathchaHitAndRun': {
        name: "HitAndRun",
        image: 'images/abilities/ability_dathcha_basic.png',
        desc: "",
        abilityDamage: (5921 + 6543) / 2,
        abilityDamageVariance: -(5921 - 6543) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'bobaEE3Carbine': {
        name: "EE-3 Carbine",
        image: 'images/abilities/ability_bobafett_basic.png',
        desc: "",
        abilityDamage: (6813 + 7529) / 2,
        abilityDamageVariance: -(6813 - 7529) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'cadBaneGunSlinger': {
        name: "Gun Slinger",
        image: 'images/abilities/ability_cadbane_basic.png',
        desc: "",
        abilityDamage: (5898 + 6518) / 2,
        abilityDamageVariance: -(5898 - 6518) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'mandoSwiftShot': {
        name: "Swift Shot",
        image: 'images/abilities/ability_mandalorian_basic.png',
        desc: "",
        abilityDamage: (6622 + 7318) / 2,
        abilityDamageVariance: -(6622 - 7318) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'kraytBasicAttack': {
        name: "Krayt 1",
        image: 'images/abilities/KraytDragonSkill1.png',
        desc: "",
        abilityDamage: 10000,
        abilityDamageVariance: 0,
        // New
        needsEnemyTarget: 1,
        attackFct: async function (inputs) {
            await logFunctionCall('method: attackFct (', ...arguments,)
            await damageEnemy(inputs)
            await applyEffectsToEnemy(inputs, ['Daze'])
        },
    },
    'kraytAcidPuke': {
        name: "Acid Puke",
        image: 'images/abilities/KraytDragonSkill2.png',
        desc: "",
        abilityDamage: 20000,
        abilityDamageVariance: 0,
        // New
        needsEnemyTarget: 0,
        cooldownAfterUse: 2,
        initialCooldown: 0,
        attackFct: async function (inputs) {
            await logFunctionCall('method: attackFct (', ...arguments,)
            await damageAllEnemies(inputs)
        },
    },
    'kraytEatEnemy': {
        name: "Eat Enemy",
        image: 'images/abilities/KraytDragonSkill3.png',
        desc: "",
        abilityDamage: 30000,
        abilityDamageVariance: 0,
        // New
        needsEnemyTarget: 1,
        cooldownAfterUse: 4,
        initialCooldown: 1,
        attackFct: async function (inputs) {
            await logFunctionCall('method: attackFct (', ...arguments,)
            await applyEffectsToEnemy(inputs, ['Eaten'])
        },
    },
    'kraytBurrow': {
        name: "Burrow",
        image: 'images/abilities/KraytDragonSkill4.png',
        desc: "",
        abilityDamage: 40000,
        abilityDamageVariance: 0,
        // New
        needsEnemyTarget: 0,
        cooldownAfterUse: 4,
        initialCooldown: 2,
        selectThisSkillLastPerTurn: true,
        attackFct: async function (inputs) {
            await logFunctionCall('method: attackFct (', ...arguments,)
            await applyEffectsToSelf(inputs, ['Burrowed'])
            // Change Unburrow cooldown to 0
            let battleBro = battleBros[inputs.battleBroNumber]
            battleBro.skillsData[4].cooldown = 0
        },
    },
    'kraytUnburrow': {
        name: "Unburrow",
        image: 'images/abilities/KraytDragonSkill4.png',
        desc: "",
        abilityDamage: 40000,
        abilityDamageVariance: 0,
        // New
        needsEnemyTarget: 0,
        cooldownAfterUse: 9,
        initialCooldown: 9,
        attackFct: async function (inputs) {
            await logFunctionCall('method: attackFct (', ...arguments,)
            //await removeEffectsFromSelf(inputs, ['Burrowed'])
        },
    },
}

const infoAboutPassives = {
    'test3': {
        name: 'test3',
        image: 'images/abilities/ability_grandmasteryoda_special01.png',
        desc: 'jabba\'s blubber grants him 50% counter chance',
        type: 'unique',
        tags: [],
        endedAbility: async function (actionInfo) {
            await logFunctionCall('method: attacked (', ...arguments,)

            /*// Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw('target is not the target in attacked passive')
            if (attacker !== actionInfo.parentActionInfo.battleBro)
                throw('attacker is not the attacker in attacked passive')
            */
            // We can start using those definitions:
            //let owner = actionInfo.battleBro
            //let target = actionInfo.parentActionInfo.target
            //let attacker = actionInfo.parentActionInfo.battleBro
            let [owner, target, attacker, hitEnemies] = [actionInfo?.battleBro, actionInfo?.parentActionInfo?.target, actionInfo?.parentActionInfo?.battleBro, actionInfo?.parentActionInfo?.hitEnemies]
            if (hitEnemies.includes(owner)) {
                //let abilityName=infoAboutCharacters[owner.character].abilities[0]
                //await useAbility(abilityName,owner,attacker)
                let actionInfo = new ActionInfo({ battleBro: owner, target: attacker })
                await addAttackToQueue(actionInfo)
            }
        }
    },
    'Wookie Resolve': {
        name: 'Wookie Resolve',
        image: 'images/abilities/abilityui_passive_def.png',
        desc: 'All allies have +50 Defense, and a 50% chance to gain Defense Up for 3 turns whenever they are damaged.',
        omicron_desc: 'At the start of battle, if no allies are galactic legends, allied light side tanks gain Max Health and Protection equal to 50% of Chewbacca\'s Max Health and Protection and Chewbacca gains bonus Max Health and Protection equal to 20% of every allied light side tank\'s max health and protection.',
        type: 'leader',
        tags: ['buff_gain', 'grand_arena_omicron'],
        start: async function (actionInfo) {
            await logFunctionCall('method: start (', ...arguments,)
            let owner = actionInfo?.battleBro

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw ('owner is not the battleBro in attacked passive')
            // We can start using those definitions:

            for (let ally of aliveBattleBros[owner.team]) {
                ally.armour += 10
                ally.resistance += 10
                console.log('bonus defence given out from wookie resolve!')
            }
        },
        damaged: async function (actionInfo) {
            await logFunctionCall('method: damaged (', ...arguments,)
            // We can start using those definitions:
            let [owner, target, attacker] = [actionInfo?.battleBro, actionInfo?.parentActionInfo?.target, actionInfo?.parentActionInfo?.battleBro]

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw ('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw ('target is not the target in attacked passive')
            if (attacker !== actionInfo.parentActionInfo.battleBro)
                throw ('attacker is not the attacker in attacked passive')

            if (Math.random() < 0.5 && owner.team == target.team) {
                let actionInfo = new ActionInfo({ battleBro: owner, target: target })
                await applyEffect(actionInfo, 'defenceUp', 3)
            }
        }
    },
    'Grand Master\'s Guidance': {
        name: 'Grand Master\'s Guidance',
        image: 'images/abilities/abilityui_passive_removeharmful.png',
        desc: 'Allies have +30% Tenacity. Whenever an ally Resists a debuff, they gain the following: 30% Turn Meter, Critical Chance Up for 2 turns, and Critical Damage Up for 2 turns. Whenever they suffer a debuff, they gain Tenacity Up for 1 turn at the end of that turn. Grand Master Yoda is immune to Shock. Omicron: The leadership abilities of all other allies are active until the end of battle.',
        type: 'leader',
        tags: ['buff_gain', 'grand_arena_omicron'],
        start: async function (actionInfo, owner) {
            for (let ally of aliveBattleBros[owner.team]) {
                ally.tenacity += 30
            }
        },
        resisted: async function (actionInfo, owner, target, user, type) {
            if (target.team == owner.team && type == 'effect') {
                await TMchange(actionInfo.withTarget(target), 30)
                await applyEffect(actionInfo.withTarget(target), 'criticalChanceUp', 2)
                await applyEffect(actionInfo.withTarget(target), 'criticalDamageUp', 2)
            }
        },
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (target.team == owner.team && effect.type == 'debuff') {
                // Only apply at the end of the turn
                if (!target.customData) target.customData = {}
                if (!target.customData.grandmastersGuidance) target.customData.grandmastersGuidance = {
                    gainedDebuffThisTurn: true
                }
                target.customData.grandmastersGuidance.gainedDebuffThisTurn = true
            }
            if (effect.tags.includes('shock') && target === owner) {
                // Yoda is immune to shock
                await removeEffect(actionInfo.withTarget(target), owner, 'shock')
            }
        },
        endedTurn: async function (actionInfo, owner, selectedBro) {
            for (let ally of aliveBattleBros[owner.team]) {
                if (ally.customData?.grandmastersGuidance?.gainedDebuffThisTurn) {
                    await applyEffect(actionInfo.withTarget(ally), 'tenacityUp', 1)
                    ally.customData.grandmastersGuidance.gainedDebuffThisTurn = false
                }
            }
        }
    },
    'Take A Seat': {
        name: 'Take A Seat',
        image: 'images/abilities/abilityui_passive_takeaseat.png',
        desc: 'Jedi allies gain 20% Max Health and Offense, and recover 10% of their Health when they score a critical hit.',
        type: 'leader',
        tags: ['health_recovery'],
        start: async function (actionInfo, owner) {
            await logFunctionCall('method: start (', ...arguments,)

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw ('owner is not the battleBro in attacked passive')
            // We can start using those definitions:
            var owner = actionInfo.battleBro

            for (let ally of battleBros.filter(unit => unit.team == owner.team)) {
                ally.maxHealth *= 1.2
                ally.health *= 1.2
                ally.offence *= 1.2
            }
        },
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            await logFunctionCall('method: damaged (', ...arguments,)

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw ('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw ('target is not the target in attacked passive')
            if (attacker !== actionInfo.parentActionInfo.battleBro)
                throw ('attacker is not the attacker in attacked passive')
            // We can start using those definitions:
            var owner = actionInfo.battleBro
            var target = actionInfo.parentActionInfo.target
            var attacker = actionInfo.parentActionInfo.battleBro

            if (owner.team == attacker.team && crit == true) {
                let healInfo = new ActionInfo({ target: attacker })
                await heal(healInfo, target.maxHealth * 0.1)
            }
        }
    },
    'Vaapad': {
        name: 'Vaapad',
        image: 'images/abilities/abilityui_passive_def.png',
        desc: 'Mace gains 30% Max Health. At the end of each turn, if another ally with Protection was damaged by an attack that turn, Mace gains 3 stacks of Resilient Defense (max 8) for the rest of the encounter if he has not gained Resilient Defense this way since his last turn. While Mace has Resilient Defense, he has +10% Offense per stack and 100% counter chance. Whenever Mace gains Taunt, he dispels it and gains 2 stacks of Resilient Defense.\n Resilient Defense: Enemies will target this unit; lose one stack when damaged by an attack',
        type: 'unique',
        tags: ['dispel', 'buff_gain'],
        start: async function (actionInfo, owner) {
            await logFunctionCall('method: start (', ...arguments,)
            owner.maxHealth *= 1.3
            owner.health *= 1.3

            // Create memory space for this passive
            if (!owner.customData) owner.customData = {}
            owner.customData.passive4 = {
                gotResilientDefenseThisCycle: false,
                allyWithProtectionDamaged: false,
            }
        },
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            await logFunctionCall('method: damaged (', ...arguments,)

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw ('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw ('target is not the target in attacked passive')
            if (attacker !== actionInfo.parentActionInfo.battleBro)
                throw ('attacker is not the attacker in attacked passive')
            // We can start using those definitions:
            var owner = actionInfo.battleBro
            var target = actionInfo.parentActionInfo.target
            var attacker = actionInfo.parentActionInfo.battleBro

            // Only care if the target is an ally of the owner
            if (target.team === owner.team && target !== owner && target.protection > 0) {
                if (!owner.customData) owner.customData = {}
                if (!owner.customData.passive4) owner.customData.passive4 = {}

                owner.customData.passive4.allyWithProtectionDamaged = true // an ally has had its protection damaged!
            }
        },
        endedTurn: async function (actionInfo, owner, selectedBro) {
            await logFunctionCall('method: endedTurn (', ...arguments,)
            // Only trigger if it's *someone else's* turn ending
            if (selectedBro !== owner) {
                const memory = owner.customData?.passive4
                if (!memory) return;

                if (
                    memory.allyWithProtectionDamaged &&
                    !memory.gotResilientDefenseThisCycle
                ) {
                    let actionInfo = new ActionInfo({ target: owner })
                    await applyEffect(actionInfo, 'resilientDefence', 999, 3)

                    memory.gotResilientDefenseThisCycle = true;
                    memory.allyWithProtectionDamaged = false;
                }
            } else {
                // If it's owner's own turn ending, reset memory flag
                const memory = owner.customData?.passive4;
                if (memory) {
                    memory.gotResilientDefenseThisCycle = false;
                    memory.allyWithProtectionDamaged = false;
                }
            }
        },
        gainedEffect: async function (actionInfo, owner, target, effect) {

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw ('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw ('target is not the target in attacked passive')
            // We can start using those definitions:
            var owner = actionInfo.battleBro
            var target = actionInfo.parentActionInfo.target

            if (effect.name === 'taunt' && target == owner) {
                await removeEffect(actionInfo, owner, null, 'taunt')
                await applyEffect(new ActionInfo({ target: owner }), 'resilientDefence', 999, 2)
            }
        }
    },
    'Sense Weakness': {
        name: 'Sense Weakness',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'Mace gains 30% Offense. At the start of Mace\'s turn, dispel Stealth on all enemies and a random enemy (excluding raid bosses and Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. Shatterpoint is dispelled at the end of each ally\'s turn. When an ally damages an enemy with Shatterpoint, all allies recover 10% Protection, and all Jedi allies gain Foresight for 1 turn. \n Shatterpoint: Receiving damage dispels Shatterpoint and reduces Defense, Max Health, and Offense by 10% for the rest of the encounter; enemies can ignore Taunt to target this unit',
        omicron_desc: 'At the start of each other Light Side ally\'s turn, a random enemy (excluding Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. When an ally damages an enemy with Shatterpoint, all allies gain 5% Turn Meter.',
        type: 'unique',
        tags: ['territory_war_omicron', 'dispel', 'debuff_gain', 'protection_recovery', 'turnmeter_recovery'],
        start: async function (actionInfo, owner) {
            owner.offence *= 1.3
        },
        startedTurn: async function (actionInfo, owner, selectedBro) {
            if (owner === selectedBro) {
                const enemies = aliveBattleBros.filter((_, i) => i !== owner.team).flat()
                for (let enemy of enemies) {
                    let dispelInfo = new ActionInfo({ battleBro: owner, target: enemy })
                    await dispel(dispelInfo, null, null, 'stealth')
                }
                let randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
                let actionInfo = new ActionInfo({ battleBro: owner, target: randomEnemy })
                await applyEffect(actionInfo, 'speedDown', 1)
                await applyEffect(actionInfo, 'shatterpoint', 1, 1, false)
            }
        },
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            if (attacker.team === owner.team) {
                if (target.buffs.find(e => e.name == 'shatterpoint')) {
                    for (let ally of aliveBattleBros[owner.team]) {
                        await heal({ battleBro: owner, target: ally }, ally.maxProtection * 0.1, 'protection')
                        if (infoAboutCharacters[ally.character].tags.includes('jedi') == true) {
                            let actionInfo = new ActionInfo({ battleBro: owner, target: ally })
                            await applyEffect(actionInfo, 'foresight', 1)
                        }
                    }
                }
            }
        }
    },
    'First Mate of the Onyx Cinder': {
        name: 'First Mate of the Onyx Cinder',
        image: 'images/abilities/abilityui_passive_firstmateoftheonyxcinder.png',
        desc: 'At the start of the battle, SM-33 gains locked Defence Up for 2 turns. If no enemies are challengers, whenever an enemy damages the leader, they gain challenger. Whenever an enemy damages the leader, SM-33 gains 15% Turn Meter and 10% Critical Damage (stacking) for 1 turn. Whenever SM-33 is damaged, he gains burning for 2 turns. Attacked enemies and attackers take all the damage SM-33 would sustain from burning. While in Territory Wars: Allied leaders gain 10% Max Health and Offense, and 10 Speed, doubled if they\'re also a Pirate. The first active enemy that damaged the Pirate in the Leader slot (excluding SM-33) deals 30% less damage and has -50% Potency to all allies aside from SM-33, and SM-33 and the allied Pirate in the Leader slot can ignore Taunt effects to target them. Whenever the allied Pirate in the Leader slot attacks, SM-33 is called to assist. Challenger: Can\'t call allies to assist and can\'t be called to assist. Can ignore taunt to target the enemy leader.',
        type: 'unique',
        tags: ['buff_gain', 'damage_effect'],
        start: async function (actionInfo, owner) {
            let battleBro = owner
            await applyEffect(actionInfo.withSelfAsTarget(), 'defenceUp', 2, 1, false, true)
            owner.customData.firstmateoftheonyxcinder = {
                critDamageStacks: 0
            }
        },
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            let newActionInfo = new ActionInfo({ battleBro: owner, target: attacker })
            if (attacker.team !== owner.team && aliveBattleBros[owner.team].filter(guy => guy.isLeader == true).includes(target)) {
                const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
                if (enemies.filter(enemy => enemy.buffs.find(effect => effect.tags.includes('challenger'))).length <= 0) {
                    await applyEffect(newActionInfo, 'challenger', 999)
                }
                await TMchange(newActionInfo.withSelfAsTarget(), 15)
                if (owner.customData?.firstmateoftheonyxcinder?.critDamageStacks) {
                    owner.critDamage += 10
                    owner.customData.firstmateoftheonyxcinder.critDamageStacks++
                }
            }
            if (attacker.team !== owner.team && target == owner) {
                await applyEffect(newActionInfo.withSelfAsTarget(), 'burning', 2, 1, false)
                const count = owner.buffs.filter(effect => effect.tags.includes('burning')).length
                for (let i = 0; i < count; i++) {
                    await dealDmg(newActionInfo, owner.maxHealth * 0.075, 'true', false)
                }
            }
        },
        endedAbility: async function (actionInfo, owner, abilityName, battleBro, target, type, dmgPercent, savedActionInfo) {
            let hitEnemies = actionInfo?.parentActionInfo?.hitEnemies
            if (hitEnemies.includes(target) && owner == battleBro) {
                let newActionInfo = new ActionInfo({ battleBro: owner, target: target })
                const count = owner.buffs.filter(effect => effect.tags.includes('burning')).length
                for (let i = 0; i < count; i++) {
                    await dealDmg(newActionInfo, owner.maxHealth * 0.15, 'true', false)
                }
            }
        },
    },
    'Nightsister Nimbleness': {
        name: 'Nightsister Nimbleness',
        image: 'images/abilities/abilityui_passive_dodge.png',
        desc: 'Allies gain 16% Evasion. When an ally evades they recover 15% of their Max Health.',
        type: 'leader',
        tags: ['health_recovery', 'evasion'],
        start: async function (actionInfo, ownerOld) {

            // Checking new actionInfo values
            if (ownerOld !== actionInfo.battleBro)
                throw ('owner is not the battleBro in attacked passive')
            // We can start using those definitions:
            let owner = actionInfo.battleBro

            for (let ally of aliveBattleBros[owner.team]) {
                ally.evasion += 16
            }
        },
        dodged: async function (actionInfo, owner, attacker, target) {
            if (owner.team == target.team) {
                await heal(actionInfo.withTarget(target), target.maxHealth * 0.15)
            }
        }
    },
    // --------------------------------------------------------SAVI'S CHARACTERS
    // --------------------------------------------------------SUPERPIG'S BRAVADO
    'Very Important Pig': {
        name: 'Very Important Pig',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: "Whenever Business Pig is attacked, the attacker gains a Concussion Mine, which can't be resisted. Business Pig gains the VIP buff at the start of the battle which lasts forever. When an ally revives, they steal VIP from any ally that had it prior and gain it for the rest of the battle. Targeted enemies damaged during Aerial Advantage also gain 2 stacks of locked Inevitable Failure for 10 turns which can't be resisted. +Contain Detect Important Meeting Stun Removal Trigger",
        type: 'unique',
        tags: ['debuff_gain', 'revive'],
        start: async function (actionInfo, owner) {
            await applyEffect(actionInfo.withTarget(owner), 'VIP', Infinity, 1, false, false, "Superpig's Bravado")
        },
        revived: async function (actionInfo, owner, revivedAlly, reviver, healthGained, protectionGained, turnMeterGained) {
            if (revivedAlly.team == owner.team) {
                let vipAlly = aliveBattleBros[owner.team].find(ally => ally.buffs.find(effect => effect.name == 'VIP'))
                let vipEffect = vipAlly?.buffs.find(effect => effect.name == 'VIP')
                if (vipEffect) {
                    await removeEffect(actionInfo.withTarget(vipAlly), vipAlly, null, 'VIP')
                }
                await applyEffect(actionInfo.withTarget(revivedAlly), 'VIP', Infinity, 1, false, false, "Superpig's Bravado")
            }
        },
        attacked: async function (actionInfo, owner, target, attacker) {
            if (owner == target) {
                await applyEffect(actionInfo.withTarget(attacker), 'concussionMine', 1, 1, false)
            }
        },
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            if (owner == attacker && owner.buffs.find(effect => effect.name == 'aerialAdvantage')) {
                let actionInfo = new ActionInfo({ battleBro: owner, target: target })
                await applyEffect(actionInfo, 'inevitableFailure', 10, 2, false, true)
            }
        },
        lostEffect: async function (actionInfo, owner, target, effect, removalType, dispeller) {
            if (owner.customData.importantMeeting.enemiesStunned == true && actionInfo.enemies.filter(enemy => enemy.buffs.find(effect => effect.tags.includes('stun') && effect.caster == owner)).length <= 0) {
                owner.speed += owner.customData.importantMeeting.savedSpeed
                await applyEffect(actionInfo.withTarget(owner), 'aerialAdvantage', 2, 1, false)
                owner.customData.importantMeeting.enemiesStunned = false
            }
        }
    },
    // --------------------------------------------------------OLIV'S CHARACTERS
    'Elimination Protocol': {
        name: 'Elimination Protocol',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'Super Striker has +25% Critical Chance and +30% Defense Penetration. Whenever he attacks an enemy with Target Lock, he gains +10% Offense (stacking, max 50%) for the rest of the encounter. If Super Striker defeats an enemy, he gains Stealth for 1 turn and resets the cooldown of Super Strike. While Stealthed, Super Striker gains +100% Accuracy and his attacks deal +20% damage.',
        type: 'unique',
        tags: ['cooldownReset'],
        start: async function (actionInfo, owner) {
            await logFunctionCall('method: start (', ...arguments,)
            owner.critChance += 25
            owner.defencePenetration += 30
            owner.customData.eliminationProtocol = {
                offenceStacks: 0,
                stealthActive: false, // unused
            }
        },
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            await logFunctionCall('method: damaged (', ...arguments,)
            if (owner == attacker && hitPointsRemaining < 0) {
                await applyEffect(new ActionInfo({ target: owner }), 'stealth', 1)
                owner.cooldowns['Super Strike'] = 0
                await updateAbilityCooldownUI(owner, 'Super Strike')
            }
        },
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (owner == target && effect.name == 'stealth') {
                console.log('power gained from stealth')
                owner.accuracy += 100
                owner.flatDamageDealt += 20
            }
        },
        lostEffect: async function (actionInfo, owner, target, effect) {
            if (owner == target && effect.name == 'stealth') {
                console.log('power lost from stealth')
                owner.accuracy -= 100
                owner.flatDamageDealt -= 20
            }
        },
        attacked: async function (actionInfo, owner, target, attacker) {
            if (owner === attacker && target.buffs.find(effect => effect.tags.includes('targetLock')) && owner.customData?.eliminationProtocol?.offenceStacks < 5) {
                await modifyStat(actionInfo.withTarget(owner), 'offence', 10)
                owner.customData.eliminationProtocol.offenceStacks++
            }
        }
    },
    'Unchained Arsenal': {
        name: 'Unchained Arsenal',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'Super Striker gains +10% Special Damage and +5 Speed for each debuffed enemy (max 5 stacks). At the start of his turn, he inflicts Target Lock on a random non-Stealthed Droid enemy for 2 turns (limit once per turn). When Super Striker damages an enemy suffering from Shock, EMP Device, or Radiation, he gains +20% Offense (stacking, max 100%, resets on defeat) and 10% Turn Meter.',
        type: 'unique',
        tags: ['speed'],
        start: async function (actionInfo, owner) {
            owner.customData.unchainedArsenal = {
                debuffedEnemies: [],
                damageStacks: 0,
            }
        },
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (owner.team !== target.team && effect.type == 'debuff' && owner.customData?.unchainedArsenal?.debuffedEnemies.length < 5 && owner.customData?.unchainedArsenal?.debuffedEnemies.includes(target) !== true) {
                owner.specialDamage += 0.1 * infoAboutCharacters[owner.character].specialDamage
                owner.speed += 5
                owner.customData.unchainedArsenal.debuffedEnemies.push(target)
            }
        },
        lostEffect: async function (actionInfo, owner, target, effect) {
            if (owner.customData?.unchainedArsenal?.debuffedEnemies.includes(target) == true && target.buffs.filter(effect => effect.type == 'debuff').length <= 0) {
                owner.specialDamage -= 0.1 * infoAboutCharacters[owner.character].specialDamage
                owner.speed -= 5
                owner.customData.unchainedArsenal.debuffedEnemies.splice(owner.customData.unchainedArsenal.debuffedEnemies.indexOf(target), 1)
            }
        },
        startedTurn: async function (actionInfo, owner, selectedBro) {
            if (owner == selectedBro) {
                const NotStealthedDroidEnemies = actionInfo.enemies.filter(enemy => infoAboutCharacters[enemy.character].tags.includes('droid') == true && enemy.buffs.filter(effect => effect.tags.includes('stealth')).length <= 0)
                if (NotStealthedDroidEnemies.length > 0) {
                    const randomEnemy = NotStealthedDroidEnemies[Math.floor(Math.random() * NotStealthedDroidEnemies.length)]
                    if (randomEnemy) {
                        let newActionInfo = new ActionInfo({ battleBro: owner, target: randomEnemy })
                        await applyEffect(newActionInfo, 'targetLock', 2)
                    }
                }
            }
        },
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            await logFunctionCall('method: damaged (', ...arguments,)
            if (owner == attacker && target.buffs.find(effect => effect.name == 'shock' || effect.name == 'EMPDevice' || effect.name == 'radiation')) {
                await TMchange(actionInfo.withSelfAsTarget(), 10)
                if (owner.customData.unchainedArsenal.damageStacks < 5) {
                    owner.offence += 20
                    owner.customData.unchainedArsenal.damageStacks++
                }
            }
        },
        defeated: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, HPremaining) {
            if (owner == target) {
                owner.customData.unchainedArsenal.damageStacks = 0
            }
        }
    },
    'Unrelenting Protocol': {
        name: 'Unrelenting Protocol',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'If Super Striker is the last active ally, he is immune to Stun and Healing Immunity effects and at the start of his turns, he recovers 15% Protection and dispels one random debuff.',
        type: 'unique',
        tags: ['protection_recovery'],
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (aliveBattleBros[owner.team].length == 1 && (effect.tags.includes('stun') || effect.tags.includes('healingImmunity'))) {
                await removeEffect(actionInfo, owner, null, null, null, false, effect)
            }
        },
        startedTurn: async function (actionInfo, owner, selectedBro) {
            if (aliveBattleBros[owner.team].length == 1 && owner == selectedBro) {
                await heal(actionInfo.withSelfAsTarget(), owner.maxProtection * 0.15, 'protection')
                let debuffs = owner.buffs.filter(buff => buff.type == 'debuff' && buff.isLocked == false)
                let randomDebuff = debuffs[Math.floor(Math.random() * debuffs.length)]
                if (randomDebuff) {
                    await dispel(actionInfo.withSelfAsTarget(), null, null, null, false, randomDebuff)
                }
            }
        },
    },
    // --------------------------------------------------------JAMES' CHARACTERS
    'Prime Era': {
        name: 'Prime Era',
        image: 'images/abilities/shadowMenaceOriginal5.png',
        desc: 'Shadow menace grants a random ally heal over time whenever he critically hits an enemy. He gains +0.5% max health every time he gains a stack of heal over time, and half that much whenever an ally gains heal over time. Heal over times last for 3 turns.',
        oldSchoolDesc: 'Shadow menace grants his allies heal over time whenever he critically hits an enemy. He gains +0.5% max health every time he gains a stack of heal over time. Whenever an ally with heal over time hits an enemy, they gain another stack of it. These heal over times recover 5% health each turn for 3 turns.',
        type: 'unique',
        tags: ['health_recovery'],
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            if (oldSchool == true) { // Old school version
                if (owner === attacker && crit === true) {
                    for (let ally of aliveBattleBros[owner.team]) {
                        await applyEffect(actionInfo.withTarget(ally), 'healOverTime', 3)
                    }
                }
                if (owner.team == attacker.team && attacker.buffs.find(e => e.name == 'healOverTime') && target.team !== owner.team) {
                    await applyEffect(actionInfo.withTarget(attacker), 'healOverTime', 3)
                }
            } else {
                if (owner === attacker && crit === true) {
                    let randomAlly = aliveBattleBros[owner.team][Math.floor(Math.random() * aliveBattleBros[owner.team].length)]
                    await applyEffect(actionInfo.withTarget(randomAlly), 'healOverTime', 3)
                }
            }
        },
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (owner === target && effect.name === 'healOverTime') {
                owner.maxHealth *= 1.005
            } else if (target.team === owner.team && effect.name === 'healOverTime') {
                // If an ally gains heal over time, increase max health by half the amount
                owner.maxHealth *= 1.0025
            }
        }
    },
    'Reign of Mandalore': {
        name: 'Reign of Mandalore',
        image: 'images/abilities/shadowMenaceOriginal6.png',
        desc: 'All mandalorian allies have the Power of Mandalore buff at the start of the battle for 1 turn. Power of Mandalore: When an ability is used then gain all up buffs for 3 turns. If these buffs are dispelled, gain 5% turn metre for each buff dispelled.',
        type: 'unique',
        tags: ['buffGain', 'mandalorian'],
        start: async function (actionInfo, owner) {
            for (let ally of aliveBattleBros[owner.team].filter(unit => infoAboutCharacters[unit.character].tags.includes('mandalorian'))) {
                await applyEffect(actionInfo.withTarget(ally), 'powerOfMandalore', 4)
            }
        },
    },
    // --------------------------------------------------------ERIK'S CHARACTERS
    'Trust is Key to Victory': {
        name: 'Trust is Key to Victory',
        image: 'images/abilities/ninja4.png',
        desc: 'If the character is a sith ninja will give the buffs to them.',
        type: 'unique',
        tags: ['buffGain', 'sith'],
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (owner === target && effect.type == 'buff' && effect.name !== 'stealth') {
                for (let ally of aliveBattleBros[owner.team].filter(unit => infoAboutCharacters[unit.character].tags.includes('sith'))) {
                    if (ally !== owner && !ally.buffs.find(e => e.name === effect.name)) {
                        await applyEffect(actionInfo.withTarget(ally), effect.name, effect.duration, effect.stacks || 1, false, effect.isLocked || false)
                    }
                }
            }
        }
    },
    'A Ninja Way is Stealth': {
        name: 'A Ninja Way is Stealth',
        image: 'images/abilities/abilityui_passive_stealth.png',
        desc: 'While in stealth he gains critical damage up when stealth wears off gain one more turn of stealth.',
        type: 'unique',
        tags: ['buffGain', 'sith'],
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (owner === target && effect.tags.includes('stealth')) {
                await applyEffect(actionInfo.withTarget(owner), 'criticalDamageUp', effect.duration, 1)
            }
        },
        lostEffect: async function (actionInfo, owner, target, effect, removalType, dispeller) {
            if (owner === target && effect.tags.includes('stealth') && removalType == 'expired') {
                await applyEffect(actionInfo.withTarget(owner), 'stealth', 1) // gain one more turn of stealth
            }
        }
    },
}

const infoAboutEffects = {
    'accuracyUp': {
        name: 'accuracyUp',
        image: 'images/effects/accuracyUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'accuracy'],
        desc: "+100% Accuracy",
        opposite: 'accuracyDown',
        apply: async function (actionInfo, unit) {
            unit.accuracy += 100
        },
        remove: async function (actionInfo, unit) {
            unit.accuracy -= 100
        }
    },
    'backupPlan': {
        name: 'backupPlan',
        image: 'images/effects/backupPlan.png',
        type: 'buff',
        tags: ['stack', 'revive'],
        desc: "Recover 10% Health per turn, Revive with 80% Health and 30% Turn Meter when defeated.",
        opposite: 'inevitableFailure',
        remove: async function (actionInfo, unit, effect, type) {
            if (type == 'removed' && unit.isDead == true) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await revive(actionInfo, 80, 0, 30)
            }
        },
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await heal(actionInfo, 10 * unit.maxHealth) // heal 10% of max health
            }
        },
    },
    'callToAction': {
        name: 'callToAction',
        image: 'images/effects/callToAction.png',
        type: 'buff',
        tags: ['accuracy', 'critChance', 'critDamage', 'target'],
        desc: "+50% Accuracy, +50% Critical Chance, + 50% Critical Damage, and ignores taunts during this character's turn.",
        opposite: 'criticalChanceDown',
        apply: async function (actionInfo, unit) {
            unit.accuracy += 50
            unit.critChance += 50
            unit.critDamage += 50
            unit.customData.callToAction = {
                enemiesNotTaunting: [],
                ignoringTaunts: false
            }
        },
        remove: async function (actionInfo, unit) {
            unit.accuracy -= 50
            unit.critChance -= 50
            unit.critDamage -= 50
        },
        startedTurn: async function (actionInfo, unit, effect, guyWhoStartedTheirTurn) {
            if (unit == guyWhoStartedTheirTurn) {
                let enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
                unit.customData.callToAction.enemiesNotTaunting = enemies.filter(unit => unit.taunting == false)
                for (let enemy in unit.customData.callToAction.enemiesNotTaunting) {
                    enemy.taunting == true
                }
                unit.customData.callToAction.ignoringTaunts = true
            }
        },
        endedTurn: async function (actionInfo, unit, effect, guyWhoStartedTheirTurn) {
            if (unit.customData?.callToAction?.ignoringTaunts == true) {
                for (let enemy in unit.customData.callToAction?.enemiesNotTaunting) {
                    if (!enemy?.buffs?.find(e => e.tags.includes('taunt'))) enemy.taunting == false
                }
                unit.customData.callToAction.enemiesNotTaunting = []
                unit.customData.callToAction.ignoringTaunts = false
            }
        }
    },
    'chainAttack': {
        name: 'chainAttack',
        image: 'images/effects/chainAttack.png',
        type: 'buff',
        tags: ['stack', 'damage'],
        desc: "Upon damaging the targeted enemy, deal damage to a random enemy equal to 50% of the damage dealt.",
        opposite: 'breach',
        damaged: async function (actionInfo, unit, effect, target, attacker, dealtdmg) {
            if (unit == attacker && target.isTarget == true) {
                const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat().filter(enemy => enemy !== target)
                const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
                let newActionInfo = new ActionInfo({ battleBro: unit, target: randomEnemy })
                await dealDmg(newActionInfo, dealtdmg * 0.5, 'true', true, true, false, 'chainAttack')
            }
        },

    },
    'criticalChanceUp': {
        name: 'criticalChanceUp',
        image: 'images/effects/criticalChanceUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'critChance'],
        desc: "+25% Critical Chance",
        opposite: 'criticalChanceDown',
        apply: async function (actionInfo, unit) {
            unit.critChance += 25
        },
        remove: async function (actionInfo, unit) {
            unit.critChance -= 25
        }
    },
    'criticalDamageUp': {
        name: 'criticalDamageUp',
        image: 'images/effects/criticalDamageUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'critDamage'],
        desc: "+50% Critical Damage",
        opposite: 'criticalDamageDown',
        apply: async function (actionInfo, unit) {
            unit.critDamage += 50
        },
        remove: async function (actionInfo, unit) {
            unit.critDamage -= 50
        }
    },
    'damageImmunity': {
        name: 'damageImmunity',
        image: 'images/effects/damageImmunity.png',
        type: 'buff',
        tags: ['absorb', 'damageImmunity'],
        desc: "-100% damage received",
        opposite: 'deathmark',
        apply: async function (actionInfo, unit) {
            unit.flatDamageReceived -= 100
        },
        remove: async function (actionInfo, unit) {
            unit.flatDamageReceived += 100
        },
        damaged: async function (actionInfo, unit, effect, target, attacker, dealtdmg) {
            if (unit == target) {
                return 0 // 0 damage
            }
        }
    },
    'defenceUp': {
        name: 'defenceUp',
        image: 'images/effects/defenceUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'defence'],
        desc: "+50% Armour and Resistance",
        opposite: 'defenceDown',
        apply: async function (actionInfo, unit) {
            unit.armour += 50
            unit.resistance += 50
        },
        remove: async function (actionInfo, unit) {
            unit.armour -= 50
            unit.resistance -= 50
        }
    },
    'defencePenetrationUp': {
        name: 'defencePenetrationUp',
        image: 'images/effects/defencePenetrationUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'defence'],
        desc: "+50% Defence Penetration",
        opposite: 'defencePenetrationDown',
        apply: async function (actionInfo, unit) {
            unit.defencePenetration += 50
        },
        remove: async function (actionInfo, unit) {
            unit.defencePenetration -= 50
        }
    },
    'evasionUp': {
        name: 'evasionUp',
        image: 'images/effects/evasionUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'evasion'],
        desc: "+15% Evasion",
        opposite: 'evasionDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.evasion += 15
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.evasion -= 15
        }
    },
    'fallenAlly': {
        name: 'fallenAlly',
        image: 'images/effects/fallenAlly.png',
        type: 'buff',
        tags: ['stack', 'fallenAlly'],
        desc: "When attacking an enemy, call a defeated ally to assist, dealing 20% of their regular damage for each stack of fallen ally.",
        apply: async function (actionInfo, unit) {
            // create memory space
            if (!unit.customData) unit.customData = {}
            if (!unit.customData.fallenAlly) unit.customData.fallenAlly = {
                alliesAlreadySummoned: [],
            }
        },
        remove: async function (actionInfo, unit) {
            unit.customData.fallenAlly = null // clear the memory space
        },
        usedAbility: async function (actionInfo, unit, effect, abilityName, user, target, type, dmgPercent) {
            if (unit == user && infoAboutAbilities[abilityName].tags.includes('attack')) {
                let fallenAllies = battleBros.filter(bro => bro.team === unit.team && bro.isDead === true)
                let selectedFallenAllies = fallenAllies.filter(bro => !unit.customData.fallenAlly?.alliesAlreadySummoned?.includes(bro))
                if (selectedFallenAllies.length == 0) return // no fallen allies left to summon

                let stackCount = unit.buffs.filter(e => e.name == 'fallenAlly').length || 0
                let randomFallenAlly = selectedFallenAllies[Math.floor(Math.random() * selectedFallenAllies.length)]
                unit.customData.fallenAlly?.alliesAlreadySummoned?.push(randomFallenAlly) // remember that this fallen ally has been summoned already this attack
                //let assistActionInfo = new ActionInfo({ battleBro: randomFallenAlly, target: target }
                let assistActionInfo = actionInfo.withTarget(target)
                assistActionInfo.battleBro = randomFallenAlly
                assistActionInfo.abilityName = infoAboutCharacters[randomFallenAlly.character].abilities[0] // use the basic ability of the fallen ally
                await assist(assistActionInfo, unit, stackCount * 10) // assist with the fallen ally
            }
        },
        endedAbility: async function (actionInfo, unit, effect, abilityName, user, target, type, dmgPercent, savedActionInfo) {
            if (unit?.customData?.fallenAlly?.alliesAlreadySummoned) unit.customData.fallenAlly.alliesAlreadySummoned = [] // clear the memory space at the end of the attack
        },
    },
    'foresight': {
        name: 'foresight',
        image: 'images/effects/foresight.png',
        type: 'buff',
        tags: ['stack', 'singleUse', 'loseOnDodge', 'evasion'],
        desc: "Evades the next attack.",
        opposite: 'blind',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.evasion += 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.evasion -= 100
        }
    },
    'healOverTime': {
        name: 'healOverTime',
        image: 'images/effects/healOverTime.png',
        type: 'buff',
        tags: ['stack', 'healOverTime'],
        desc: "Heal 5% of health each turn.",
        opposite: 'damageOverTime',
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let healInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await heal(healInfo, unit.maxHealth * 0.05)
            }
        }
    },
    'healthStealUp': {
        name: 'healthStealUp',
        image: 'images/effects/healthStealUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'healthSteal'],
        desc: "Heal health equal to +50% of damage dealt.",
        opposite: 'healthStealDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.healthSteal += 50
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.healthSteal -= 50
        }
    },
    'healthUp': {
        name: 'healthUp',
        image: 'images/effects/healthUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'maxHealth', 'heal'],
        desc: "+15% Max Health",
        opposite: 'healthDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.maxHealth *= 1.15;
            let healInfo = new ActionInfo({ target: unit })
            await heal(healInfo, unit.maxHealth * 0.13)
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.maxHealth /= 1.15;
            unit.health = Math.min(unit.health, unit.maxHealth) // Make sure health doesn't surpass max health when max health is lowered
        }
    },
    'offenceUp': {
        name: 'offenceUp',
        image: 'images/effects/offenceUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'offence'],
        desc: "+50% Offence (Damage Dealt)",
        opposite: 'offenceDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.offence += 50
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.offence -= 50
        }
    },
    'potencyUp': {
        name: 'potencyUp',
        image: 'images/effects/potencyUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'potency'],
        desc: "+100% Potency (Chance to apply debuffs)",
        opposite: 'potencyDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.potency += 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.potency -= 100
        }
    },
    'powerOfMandalore': {
        name: 'powerOfMandalore',
        image: 'images/effects/powerOfMandalore.png',
        type: 'buff',
        tags: ['stack', 'buffGain'],
        desc: "When an ability is used then gain Power Up (all Up Buffs) for 3 turns. If these buffs are dispelled, go up to 100% turn meter.",
        opposite: 'powerDown',
        usedAbility: async function (actionInfo, unit, effect, abilityName, user, target, type, dmgPercent) {
            if (user !== unit) return // only apply this effect if the user is the unit itself
            if (effect.isLocked == true) return
            await applyEffect(actionInfo.withTarget(unit), 'powerUp', 3)
            effect.isLocked = true
        },
        lostEffect: async function (actionInfo, unit, effect, target, effectLost, removalType, dispeller) {
            if (effectLost.name == 'powerUp') {
                await removeEffect(actionInfo, unit, null, 'powerOfMandalore')
                unit.turnMeter = 100
            }
        }
    },
    'powerUp': {
        name: 'powerUp',
        image: 'images/effects/powerUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'accuracy', 'critChance', 'critDamage', 'defencePenetration', 'defence', 'evasion', 'healthSteal', 'maxHealth', 'offence', 'potency', 'maxProtection', 'protection', 'speed', 'tenacity'],
        desc: "All Up-Type buffs.",
        opposite: 'powerDown',
        apply: async function (actionInfo, unit) {
            unit.accuracy += 100
            unit.critChance += 25
            unit.critDamage += 50
            unit.defencePenetration += 50
            unit.armour += 50
            unit.resistance += 50
            unit.evasion += 15
            unit.healthSteal += 50
            unit.maxHealth *= 1.15
            let healInfo = new ActionInfo({ target: unit })
            await heal(healInfo, unit.maxHealth * 0.13)
            unit.offence += 50
            unit.potency += 100
            unit.maxProtection *= 1.15
            await heal(healInfo, unit.maxProtection * 0.13, 'protection')
            unit.speedPercent += 25
            unit.tenacity += 100
        },
        remove: async function (actionInfo, unit) {
            unit.accuracy -= 100
            unit.critChance -= 25
            unit.critDamage -= 50
            unit.defencePenetration -= 50
            unit.armour -= 50
            unit.resistance -= 50
            unit.evasion -= 15
            unit.healthSteal -= 50
            unit.maxHealth /= 1.15
            unit.health = Math.min(unit.health, unit.maxHealth)
            unit.offence -= 50
            unit.potency -= 100
            unit.maxProtection /= 1.15
            unit.protection = Math.min(unit.protection, unit.maxProtection)
            unit.speedPercent -= 25
            unit.tenacity -= 100
        }
    },
    'protectionUp': {
        name: 'protectionUp',
        image: 'images/effects/protectionUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'protection', 'protectionHeal'],
        desc: "+15% Max Protection",
        opposite: 'protectionDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.maxProtection *= 1.15;
            let healInfo = new ActionInfo({ target: unit })
            await heal(healInfo, unit.maxProtection * 0.13, 'protection')
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.maxProtection /= 1.15;
            unit.protection = Math.min(unit.protection, unit.maxProtection) // Make sure prot doesn't surpass max prot when max prot is lowered
        }
    },
    'resilience': {
        name: 'resilience',
        image: 'images/effects/resilience.png',
        type: 'buff',
        tags: ['ally', 'damageReduce'],
        desc: "Take 10% less damage for each living ally.",
        opposite: 'discourage',
        apply: async function (actionInfo, unit) {
            const allyNum = aliveBattleBros[unit.team].length - 1
            unit.flatDamageReceived -= allyNum * 10
        },
        remove: async function (actionInfo, unit) {
            const allyNum = aliveBattleBros[unit.team].length - 1
            unit.flatDamageReceived += allyNum * 10
        },
        defeated: async function (actionInfo, unit, effect, target, attacker, dealtdmg, type, crit, HPremaining) {
            if (unit.team == target.team) {
                unit.flatDamageReceived += 10
            }
        } // unfinished: revive condition
    },
    'resilientDefence': {
        name: 'resilientDefence',
        image: 'images/effects/resilientDefence.png',
        type: 'buff',
        tags: ['stack', 'taunt', 'target', 'loseOnHit'],
        desc: "Taunt and lose one stack of Resilient Defence when damaged by an attack.",
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.taunting = true
            await removeEffect(actionInfo, unit, 'stealth')
            if (battleBros.filter(battleBro => battleBro.team == unit.team).filter(battleBro => battleBro.taunting == true).length == 1) await changingTarget(unit) // don't switch the target if there's another member of this character's team taunting
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            if (!(unit.buffs.find(e => e.tags.includes('taunt')))) {
                unit.taunting = false
                if (unit.isTarget == true) { // check if this taunter is the target
                    let unitTeam = battleBros.filter(battleBro => battleBro.team == unit.team)
                    if (unitTeam.filter(battleBro => battleBro.taunting).length > 0) { // if there's another taunter
                        await changingTarget(unitTeam.filter(battleBro => battleBro.taunting)[0]) // change the target to that one
                    }
                }
            }
        }
    },
    'retribution': {
        name: 'retribution',
        image: 'images/effects/retribution.png',
        type: 'buff',
        tags: ['counter', 'attackOutOfTurn'],
        desc: "Counters attacks with their basic ability.",
        opposite: 'daze',
        apply: async function (actionInfo, unit) {
        },
        remove: async function (actionInfo, unit) {
        },
        endedAbility: async function (actionInfo, unit, effect, abilityName, battleBro, target, type, dmgPercent, savedActionInfo) {
            let hitEnemies = actionInfo?.parentActionInfo?.hitEnemies
            if (hitEnemies.includes(unit)) {
                let newActionInfo = new ActionInfo({ battleBro: unit, target: actionInfo?.parentActionInfo?.battleBro })
                await addAttackToQueue(newActionInfo)
            }
        },
    },
    'revival': {
        name: 'revival',
        image: 'images/effects/revival.png',
        type: 'buff',
        tags: ['stack', 'revive'],
        desc: "When defeated this character revives and recovers 50% of max health and protection then gains 100% turn meter and Bonus Protection (75%) for 2 turns.",
        opposite: 'doomed',
        remove: async function (actionInfo, unit, effect, type) {
            if (type == 'removed' && unit.isDead == true) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await revive(actionInfo, 50, 50, 100)
                await applyEffect(actionInfo, 'shields', 2, 1, false, false, 75)
            }
        },
    },
    'rotating': {
        name: 'rotating',
        image: 'images/effects/rotating.png',
        type: 'buff',
        tags: ['deflection'],
        desc: "Reflect projectile attacks and mitigate other attacks by 50%.",
        opposite: 'outmaneuvered',
        apply: async function (actionInfo, unit) {
            // create memory space
            if (!unit.customData) unit.customData = {}
            unit.customData.rotating = {
                wasTriggered: false,
                savedFlatDamageReceived: unit.flatDamageReceived,
            }
        },
        remove: async function (actionInfo, unit) {
            unit.customData.rotating = null // clear the memory space
        },
        attacked: async function (actionInfo, unit, effect, target, attacker) {
            if (infoAboutAbilities[actionInfo?.abilityName]?.tags?.includes('projectile_attack')) {
                unit.customData.rotating.wasTriggered = true // mark that this effect was triggered
                unit.customData.rotating.savedFlatDamageReceived = unit.flatDamageReceived // save the flat damage received before it is set to 0
                unit.flatDamageReceived = 0 // deflects all projectile attacks
            } else if (infoAboutAbilities[actionInfo?.abilityName]?.tags?.includes('attack')) {
                unit.customData.rotating.wasTriggered = true // mark that this effect was triggered
                unit.customData.rotating.savedFlatDamageReceived = unit.flatDamageReceived // save the flat damage received before it is set to 0
                unit.flatDamageReceived /= 2 // reduces other attacks by 50%
            }
        },
        endOfDamage: async function (actionInfo, unit, effect, target, attacker) {
            if (unit.customData?.rotating?.wasTriggered) {
                unit.flatDamageReceived = unit.customData.rotating.savedFlatDamageReceived // restore the flat damage received
                unit.customData.rotating.wasTriggered = false // reset the flag
            }
        },
    },
    'shields': {
        name: 'shields',
        image: 'images/effects/shields.png',
        type: 'buff',
        tags: ['stack', 'shields'],
        desc: "Adds {{bonusData}}% of bonus protection on top of regular protection.",
        opposite: 'protectionDisruption',
        apply: async function (actionInfo, unit, effect) {
            if (!unit.customData) unit.customData = {}
            if (!unit.customData.shields) {
                unit.customData.shields = {
                    shieldsApplied: unit.maxHealth * 0.01 * effect.bonusData
                }
            } else {
                unit.customData.shields.shieldsApplied += unit.maxHealth * 0.01 * effect.bonusData
            }
            effect.shieldsGranted = unit.maxHealth * 0.01 * effect.bonusData
            unit.shields += unit.maxHealth * 0.01 * effect.bonusData
        },
        remove: async function (actionInfo, unit, effect, type) {
            if (unit.customData?.shields?.shieldsApplied - effect.shieldsGranted < unit.shields) {
                unit.shields = unit.customData?.shields?.shieldsApplied - effect.shieldsGranted // remove the shields granted by this effect
            }
            unit.customData.shields.shieldsApplied -= effect.shieldsGranted
        },
        endedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit.customData?.shields?.shieldsApplied - effect.shieldsGranted >= unit.shields) {
                let newActionInfo = new ActionInfo({ battleBro: unit, target: unit })
                await removeEffect(newActionInfo, unit, null, null, null, false, effect)
            }
        }
    },
    'speedUp': {
        name: 'speedUp',
        image: 'images/effects/speedUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'speed'],
        desc: "+25% Speed",
        opposite: 'speedDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.speedPercent += 25
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.speedPercent -= 25
        }
    },
    'stealth': {
        name: 'stealth',
        image: 'images/effects/stealth.png',
        type: 'buff',
        tags: ['stealth', 'target', 'counterImmunity'],
        desc: "Can't be targeted or countered.",
        opposite: 'marked',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            await removeEffect(actionInfo, unit, 'taunt')
            await switchTarget(unit)
        },
        remove: async function (actionInfo, unit) { }
    },
    'taunt': {
        name: 'taunt',
        image: 'images/effects/taunt.png',
        type: 'buff',
        tags: ['taunt', 'target'],
        desc: "Enemies will target this character.",
        opposite: 'tauntImmunity',
        apply: async function (actionInfo, unit) {
            unit.taunting = true
            await removeEffect(actionInfo, unit, 'stealth')
            if (battleBros.filter(battleBro => battleBro.team == unit.team).filter(battleBro => battleBro.taunting == true).length == 1) await changingTarget(unit) // don't switch the target if there's another member of this character's team taunting
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.taunting = false
            if (unit.isTarget == true) { // check if this taunter is the target
                let unitTeam = battleBros.filter(battleBro => battleBro.team == unit.team)
                if (unitTeam.filter(battleBro => battleBro.taunting).length > 0) { // if there's another taunter
                    await changingTarget(unitTeam.filter(battleBro => battleBro.taunting)[0]) // change the target to that one
                }
            }
        }
    },
    'tenacityUp': {
        name: 'tenacityUp',
        image: 'images/effects/tenacityUp.png',
        type: 'buff',
        tags: ['stack', 'up', 'tenacity'],
        desc: "+100% Tenacity (Chance to resist debuffs)",
        opposite: 'tenacityDown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.tenacity += 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.tenacity -= 100
        }
    },
    'unbreakable': {
        name: 'unbreakable',
        image: 'images/effects/unbreakable.png',
        type: 'buff',
        tags: ['absorb', 'limit1health'],
        opposite: 'breakingPoint',
        desc: "This unit can't go below 1 health.",
        damaged: async function (actionInfo, unit, effect, target, attacker, dealtdmg, type, crit, HPremaining) {
            if (unit == target && HPremaining <= 1) {
                const currentTotal = HPremaining + dealtdmg;
                const maxAllowed = currentTotal - 1;
                return Math.max(0, maxAllowed); // clamp the damage to leave 1 HP
            }
        }
    },
    // ----------------------------------------------------------------- DEBUFFS -----------------------------------------------------------------
    'abilityBlock': {
        name: 'abilityBlock',
        image: 'images/effects/abilityBlock.png',
        type: 'debuff',
        tags: ['stifle', 'abilityBlock'],
        desc: "Can't use special abilities.",
        opposite: 'tacticalGenius',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            /*console.log(infoAboutCharacters[unit.character].abilities)
            for (let abilityName of infoAboutCharacters[unit.character].abilities) {
                console.log(abilityName)
                await updateAbilityCooldownUI(unit, abilityName)
            }*/
        },
        remove: async function (actionInfo, unit) { }
    },
    'accuracyDown': {
        name: 'accuracyDown',
        image: 'images/effects/accuracyDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'accuracy'],
        desc: "-15% Accuracy",
        opposite: 'accuracyUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.accuracy -= 15
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.accuracy += 15
        }
    },
    'bleed': {
        name: 'bleed',
        image: 'images/effects/bleed.png',
        type: 'debuff',
        tags: ['stack', 'speed', 'tenacity', 'maxHealth', 'loseOnHeal'],
        desc: "-5% speed and tenacity, 5% max health removed each turn. 1 stack of bleed is removed when healed. Max health regained upon losing bleed.",
        opposite: 'healOverTime',
        apply: async function (actionInfo, unit, effect) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.tenacity -= 5
            unit.speedPercent -= 5
            effect.maxHealthRemoveTriggers = 0
        },
        remove: async function (actionInfo, unit, effect) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.tenacity += 5
            unit.speedPercent += 5
            for (let i = 0; i < effect?.maxHealthRemoveTriggers; i++) {
                unit.maxHealth /= 0.95 // restore max health by 5% for each trigger
            }
        },
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(actionInfo, 5, 'percentage', false, true, true, 'bleed')
                unit.maxHealth *= 0.95
                if (!effect.maxHealthRemoveTriggers) effect.maxHealthRemoveTriggers = 0
                effect.maxHealthRemoveTriggers += 1
            }
        }
    },
    'blind': {
        name: 'blind',
        image: 'images/effects/blind.png',
        type: 'debuff',
        tags: ['stack', 'singleUse', 'accuracy', 'blind'],
        desc: "Miss the next attack.",
        opposite: 'foresight',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.accuracy -= 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.accuracy += 100
        },
        dodged: async function (actionInfo, unit, effect, attacker, target) {
            if (attacker == unit) {
                await removeEffect(actionInfo, unit, null, 'blind')
            }
        }
    },
    'buffImmunity': {
        name: 'buffImmunity',
        image: 'images/effects/buffImmunity.png',
        type: 'debuff',
        tags: ['buffImmunity'],
        desc: "Can't gain buffs.",
        opposite: 'debuffImmunity',
    },
    'burning': {
        name: 'burning',
        image: 'images/effects/burning.png',
        type: 'debuff',
        tags: ['stack', 'speed', 'damageOverTime', 'evasion', 'burning'],
        desc: "Take damage equal to 15% of max health per turn, can't dodge attacks.",
        opposite: 'healOverTime',
        apply: async function (actionInfo, unit, effect) {
            unit.evasion -= 100
        },
        remove: async function (actionInfo, unit, effect) {
            unit.evasion += 100
        },
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(actionInfo, 15, 'percentage', true, true, false, 'burning')
            }
        }
    },
    'concussionMine': {
        name: 'concussionMine',
        image: 'images/effects/concussionMine.png',
        type: 'debuff',
        tags: ['stack', 'mine'],
        desc: "Deals damage equal to 10% of target's max health and dazes them for 1 turn when it explodes.",
        opposite: 'healOverTime',
        remove: async function (actionInfo, unit, effect, removalType) {
            if (removalType == 'expired' || removalType == 'detonated') {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(actionInfo, 10, 'percentage', true, true, false, 'concussionMine', false, false)
                await applyEffect(actionInfo, 'daze', 1) // daze for 1 turn
            }
        },
    },
    'criticalChanceDown': {
        name: 'criticalChanceDown',
        image: 'images/effects/criticalChanceDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'critChance'],
        desc: "-25% Critical Chance",
        opposite: 'criticalChanceUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.critChance -= 25
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.critChance += 25
        }
    },
    'criticalDamageDown': {
        name: 'criticalDamageDown',
        image: 'images/effects/criticalDamageDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'critDamage'],
        desc: "-50% Critical Damage",
        opposite: 'criticalDamageUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.critDamage -= 50
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.critDamage += 50
        }
    },
    'damageOverTime': {
        name: 'damageOverTime',
        image: 'images/effects/damageOverTime.png',
        type: 'debuff',
        tags: ['stack', 'damageOverTime'],
        desc: "Take damage equal to 5% max health each turn.",
        opposite: 'healOverTime',
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(actionInfo, 5, 'percentage', false, true, false, 'damageOverTime')
            }
        }
    },
    'daze': {
        name: 'daze',
        image: 'images/effects/daze.png',
        type: 'debuff',
        tags: ['stopAssist', 'stopCounter', 'stopTMgain'],
        desc: "Can't assist, counter or gain turn meter.",
        opposite: 'retribution',
    },
    'decay': {
        name: 'decay',
        image: 'images/effects/decay.png',
        type: 'debuff',
        tags: ['stack', 'maxHealth', 'healthSteal'],
        desc: "-10% max health per stack. 0% health steal.",
        opposite: 'vampire',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.maxHealth *= 0.9
            unit.health *= 0.9
            unit.healthSteal -= 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.maxHealth /= 0.9
            unit.health /= 0.9
            unit.healthSteal += 100
        }
    },
    'defenceDown': {
        name: 'defenceDown',
        image: 'images/effects/defenceDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'defence'],
        desc: "-50% Armour and Resistance",
        opposite: 'defenceUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.armour -= 50
            unit.resistance -= 50
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.armour += 50
            unit.resistance += 50
        }
    },
    'disarm': {
        name: 'disarm',
        image: 'images/effects/disarm.png',
        type: 'debuff',
        tags: ['stack', 'down', 'critDamage', 'offence', 'debuff_gain'],
        desc: "-50% Critical Damage and Offense. Whenever this character uses a Basic ability, they gain Damage Over Time for 2 turns.",
        opposite: 'advancedTechnology',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.critDamage -= 50
            unit.offence -= 50
        },
        usedAbility: async function (actionInfo, unit, effect, abilityName, battleBro) {
            if (unit == battleBro && infoAboutAbilities[abilityName].type == 'basic') {
                let newActionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await applyEffect(newActionInfo, 'damageOverTime', 2, 1, false)
            }
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.critDamage += 50
            unit.offence += 50
        }
    },
    'doomed': {
        name: 'doomed',
        image: 'images/effects/doomed.png',
        type: 'debuff',
        tags: ['stopRevive', 'conditional'],
        desc: "Can't be revived if this character is defeated.",
        opposite: 'instantDefeatImmunity',
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            if (unit.isDead == true) unit.cantRevive = true
        }
    },
    'EMPDevice': {
        name: 'EMPDevice',
        image: 'images/effects/EMPDevice.png',
        type: 'debuff',
        tags: ['stack', 'mine'],
        desc: "Zero speed until the end of 2 turns. When an EMP Device explodes or is dispelled, take special damage, gain Expose and Protection Disruption for 2 turns and become stunned if this character is a droid.",
        opposite: 'overcharge',
        apply: async function (actionInfo, unit, effect) {
            await logFunctionCall('method: apply (', ...arguments,)
            effect.turnsPassed = 0
            effect.haltingTurns = true
            effect.savedSpeed = unit.speedPercent
            unit.speedPercent = 0
        },
        endedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (effect.turnsPassed >= 2 && effect.haltingTurns == true) {
                effect.haltingTurns = false
                unit.speedPercent += effect.savedSpeed // restore the speed
            } else if (effect.haltingTurns == true) {
                effect.turnsPassed++
                unit.speedPercent = 0 // zero speed until the end of 2 turns
            }
        },
        remove: async function (actionInfo, unit, effect, removalType) {
            if (removalType == 'expired' || removalType == 'detonated' || removalType == 'dispelled') {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(actionInfo, 100, 'special', true, true, false, 'EMPDevice', false, false)
                await applyEffect(actionInfo, 'expose', 2)
                await applyEffect(actionInfo, 'protectionDisruption', 2)
                if (infoAboutCharacters[unit.character].tags.includes('droid')) {
                    await applyEffect(actionInfo, 'stun', 1)
                }
            }
        },
    },
    'evasionDown': {
        name: 'evasionDown',
        image: 'images/effects/evasionDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'evasion'],
        desc: "-100% Evasion",
        opposite: 'evasionUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.evasion -= 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.evasion += 100
        }
    },
    'expose': {
        name: 'expose',
        image: 'images/effects/expose.png',
        type: 'debuff',
        tags: ['stack', 'singleUse', 'loseOnHit', 'percentageDamage'],
        desc: "Take damage equal -20% of max health if damaged by attack, then Expose is removed.",
        apply: async function (actionInfo, unit) {
        },
        remove: async function (actionInfo, unit, effect, removalType) {
            if (removalType == 'removed') {
                let newActionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(newActionInfo, 20, 'percentage', true, true, false, 'expose')
            }
        }
    },
    'fear': {
        name: 'fear',
        image: 'images/effects/fear.png',
        type: 'debuff',
        tags: ['stack', 'singleUse', 'loseOnHit', 'stun'],
        desc: "Miss the next turn, but Fear is removed upon taking damage. If it is, increase cooldowns by 1.",
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.evasion -= 10000
        },
        remove: async function (actionInfo, unit, effect, removalType) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.evasion += 10000
            if (removalType == 'removed') {
                await changeCooldowns(unit, 1)
            }
        }
    },
    'healingImmunity': {
        name: 'healingImmunity',
        image: 'images/effects/healingImmunity.png',
        type: 'debuff',
        tags: ['healingImmunity', 'protectionHealingImmunity'],
        desc: "Can't recover health or protection.",
        opposite: 'lifeMark',
    },
    'healthDown': {
        name: 'healthDown',
        image: 'images/effects/healthDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'maxHealth'],
        desc: "-15% Max Health",
        opposite: 'healthUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.maxHealth /= 1.15
            unit.health /= 1.15
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.maxHealth *= 1.15
            unit.health *= 1.15
        }
    },
    'healthStealDown': {
        name: 'healthStealDown',
        image: 'images/effects/healthStealDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'healthSteal'],
        desc: "-50% Health Steal",
        opposite: 'healthStealUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.healthSteal -= 50
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.healthSteal += 50
        }
    },
    'knockback': {
        name: 'knockback',
        image: 'images/effects/knockback.png',
        type: 'debuff',
        tags: ['stack', 'defence'],
        desc: "-10% defence. Lose 5% defence whenever damaged or inflicted with a debuff.",
        opposite: 'defenceUp',
        apply: async function (actionInfo, unit, effect) {
            effect.knockbackTriggers = 0
            unit.armour -= 10
            unit.resistance -= 10
        },
        remove: async function (actionInfo, unit, effect) {
            unit.armour += 10
            unit.resistance += 10
            for (let i = 0; i < effect.knockbackTriggers; i++) {
                unit.armour += 5
                unit.resistance += 5
            }
        },
        damaged: async function (actionInfo, unit, effect, target, attacker) {
            if (unit == target) {
                unit.armour -= 5
                unit.resistance -= 5
                if (!effect.knockbackTriggers) effect.knockbackTriggers = 0
                effect.knockbackTriggers++
            }
        },
        gainedEffect: async function (actionInfo, unit, effect, target, gainedEffect) {
            if (unit == target && gainedEffect.type == 'debuff') {
                unit.armour -= 5
                unit.resistance -= 5
                if (!effect.knockbackTriggers) effect.knockbackTriggers = 0
                effect.knockbackTriggers++
            }
        }
    },
    'offenceDown': {
        name: 'offenceDown',
        image: 'images/effects/offenceDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'offence'],
        desc: "-50% Offence (Damage Dealt)",
        opposite: 'offenceUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.offence -= 50
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.offence += 50
        }
    },
    'potencyDown': {
        name: 'potencyDown',
        image: 'images/effects/potencyDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'potency'],
        desc: "-100% Potency (Chance to inflict debuffs)",
        opposite: 'potencyUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.potency -= 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.potency += 100
        }
    },
    'powerDown': {
        name: 'powerDown',
        image: 'images/effects/powerDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'accuracy', 'critChance', 'critDamage', 'defencePenetration', 'defence', 'evasion', 'healthSteal', 'maxHealth', 'offence', 'potency', 'maxProtection', 'protection', 'speed', 'tenacity'],
        desc: "All Down-Type debuffs.",
        opposite: 'powerUp',
        apply: async function (actionInfo, unit) {
            unit.accuracy -= 15
            unit.critChance -= 25
            unit.critDamage -= 50
            unit.defencePenetration -= 50
            unit.armour -= 50
            unit.resistance -= 50
            unit.evasion -= 100
            unit.healthSteal -= 50
            unit.maxHealth /= 1.15
            unit.health /= 1.15
            unit.offence -= 50
            unit.potency -= 100
            unit.maxProtection /= 1.15
            unit.protection /= 1.15
            unit.speedPercent -= 25
            unit.tenacity -= 100
        },
        remove: async function (actionInfo, unit) {
            unit.accuracy += 15
            unit.critChance += 25
            unit.critDamage += 50
            unit.defencePenetration += 50
            unit.armour += 50
            unit.resistance += 50
            unit.evasion += 100
            unit.healthSteal += 50
            unit.maxHealth *= 1.15
            unit.health *= 1.15
            unit.offence += 50
            unit.potency += 100
            unit.maxProtection *= 1.15
            unit.protection *= 1.15
            unit.speedPercent += 25
            unit.tenacity += 100
        }
    },
    'protectionDisruption': {
        name: 'protectionDisruption',
        image: 'images/effects/protectionDisruption.png',
        type: 'debuff',
        tags: ['maxProtection', 'protectionDisruption'],
        desc: "Protection is disabled, immune to Protection Up and Shields.",
        opposite: 'protectionUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            if (!unit.customData.protectionDisruption) {
                unit.customData.protectionDisruption = {
                    savedProtection: null,
                    savedMaxProtection: null,
                    savedShields: null,
                }
            }
            await removeEffect(actionInfo, unit, 'shields') // clear the effects they're now immune to
            await removeEffect(actionInfo, unit, null, 'protectionUp')
            if (unit.customData.protectionDisruption.savedProtection == null) unit.customData.protectionDisruption.savedProtection = unit.protection
            if (unit.customData.protectionDisruption.savedMaxProtection == null) unit.customData.protectionDisruption.savedMaxProtection = unit.maxProtection
            if (unit.customData.protectionDisruption.savedShields == null) unit.customData.protectionDisruption.savedShields = unit.shields
            unit.protection = 0
            unit.maxProtection = 0
            unit.shields = 0
        },
        gainedEffect: async function (actionInfo, unit, effect, target, gainedEffect) {
            if (unit == target && (gainedEffect.name == 'shields' || gainedEffect.name == 'protectionUp')) {
                await removeEffect(actionInfo, unit, null, gainedEffect.name)
            }
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            if (!unit.buffs.find(effect => effect.tags.includes('protectionDisruption'))) {
                unit.protection = unit.customData.protectionDisruption.savedProtection
                unit.maxProtection = unit.customData.protectionDisruption.savedMaxProtection
                unit.shields = unit.customData.protectionDisruption.savedShields
                unit.customData.protectionDisruption = {
                    savedProtection: null,
                    savedMaxProtection: null,
                    savedShields: null,
                }
            }
        }
    },
    'protectionDown': {
        name: 'protectionDown',
        image: 'images/effects/protectionDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'maxProtection'],
        desc: "-15% Max Protection",
        opposite: 'protectionUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.maxProtection /= 1.15
            unit.protection /= 1.15
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.maxProtection *= 1.15
            unit.protection *= 1.15
        }
    },
    'radiation': { // unfinished - attackers effects need finishing
        name: 'radiation',
        image: 'images/effects/radiation.png',
        type: 'debuff',
        tags: ['lockDebuffs'],
        desc: "Attackers ignore protection and defensive effects. Debuffs on this character can't be dispelled.",
        opposite: 'determined',
        apply: async function (actionInfo, unit) {
            if (!unit.customData.radiation) {
                unit.customData.radiation = {
                    otherDebuffs: []
                }
            }
            const otherDebuffs = unit.buffs.filter(buff => buff.type == 'debuff' && buff.isLocked == false && buff.name != 'radiation')
            unit.customData.radiation.otherDebuffs = unit.customData.radiation.otherDebuffs.concat(otherDebuffs)
            for (let debuff of otherDebuffs) {
                debuff.isLocked = true
            }
        },
        gainedEffect: async function (actionInfo, unit, effect, target, gainedEffect) {
            if (unit == target && gainedEffect.type == 'debuff' && gainedEffect.name != 'radiation') {
                unit.customData.radiation.otherDebuffs.push(gainedEffect)
                gainedEffect.isLocked = true
            }
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            if (!unit.buffs.find(effect => effect.tags.includes('lockDebuffs'))) {
                for (let debuff of unit.customData.radiation.otherDebuffs) {
                    debuff.isLocked = false // unlock all other debuffs
                }
                unit.customData.radiation.otherDebuffs = [] // clear the memory space
            }
        }
    },
    'scam': { // 3 stacks effect is unfinished
        name: 'scam',
        image: 'images/effects/scam.png',
        type: 'debuff',
        tags: ['stack', 'offence', 'critChance'],
        desc: "1 Stack: -50% Offence and Crit Chance. Lose a random buff every turn.<br>2 Stacks: Attackers will bonus attack and gain Retribution for 1 turn.<br>3 Stacks: Attackers will bonus attack for each buff they have, dealing 50% damage without inflicting status effects.",
        opposite: 'translation',
        apply: async function (actionInfo, unit, effect) {
            if (!unit.customData.scam) {
                unit.customData.scam = {
                    masterEffect: undefined, // The master effect does all the effects - the other stacks do nothing. When the master effect is removed, the master status passes to the next effect.
                }
            }
            if (unit.customData.scam.masterEffect == undefined) {
                unit.customData.scam.masterEffect = effect // set the master effect to this one if there's no other master effects
                unit.offence -= 50
                unit.critChance -= 50
            }
        },
        remove: async function (actionInfo, unit, effect) {
            if (unit.customData.scam.masterEffect == effect) {
                unit.customData.scam.masterEffect = undefined // clear the master effect if this one was the master effect
                unit.offence += 50
                unit.critChance += 50
            }
        },
        lostEffect: async function (actionInfo, unit, effect, target, lostEffect, removalType, dispeller) {
            if (unit.customData.scam.masterEffect == undefined) {
                unit.customData.scam.masterEffect = effect // set the master effect to this one if the last master effect was lost
                unit.offence -= 50
                unit.critChance -= 50
            }
        },
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro && unit.customData.scam.masterEffect == effect) {
                let buffs = unit.buffs.filter(buff => buff.type == 'buff' && buff.isLocked == false)
                let randomBuff = buffs[Math.floor(Math.random() * buffs.length)]
                if (randomBuff) {
                    let newActionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                    await dispel(newActionInfo, null, null, null, false, randomBuff)
                }
            }
        },
        attacked: async function (actionInfo, unit, effect, target, attacker) {
            if (unit == target && effect == unit.customData.scam.masterEffect && unit.buffs.filter(effect => effect.name == 'scam').length >= 2 && actionInfo.parentActionInfo.type !== "bonus") {
                let newActionInfo = new ActionInfo({ battleBro: effect.caster, target: attacker })
                await applyEffect(newActionInfo, 'retribution', 1)
                newActionInfo = new ActionInfo({ battleBro: attacker, target: unit })
                await addAttackToQueue(newActionInfo)
            }
        }
    },
    'shatterpoint': {
        name: 'shatterpoint',
        image: 'images/effects/shatterpoint.png',
        type: 'debuff',
        tags: ['stack', 'speed', 'taunt', 'loseOnHit', 'defence', 'maxHealth', 'offence'],
        desc: "Receiving damage removes Shatterpoint and reduces Defense, Max Health, and Offense by 10%. Enemies can ignore Taunt effects to target this unit.",
        opposite: 'barrier',
        apply: async function (actionInfo, unit) { },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            await switchTarget(unit)
            unit.armour *= 0.9
            unit.resistance *= 0.9
            unit.maxHealth /= 1.1
            unit.health /= 1.1
            unit.offence *= 0.9
        }
    },
    'shock': {
        name: 'shock',
        image: 'images/effects/shock.png',
        type: 'debuff',
        tags: ['healingImmunity', 'stopTMgain', 'buffImmunity'],
        desc: "Can't heal, gain buffs or bonus turn meter.",
        opposite: 'overcharge',
    },
    'speedDown': {
        name: 'speedDown',
        image: 'images/effects/speedDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'speed'],
        desc: "-25% Speed",
        opposite: 'speedUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.speedPercent -= 25
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.speedPercent += 25
        }
    },
    'stagger': {
        name: 'stagger',
        image: 'images/effects/stagger.png',
        type: 'debuff',
        tags: ['turnMeterRemoval', 'loseOnHit'],
        desc: "Lose 100% Turn Meter if damaged by attack, then remove Stagger.",
        opposite: 'frenzy',
        remove: async function (actionInfo, unit, effect, removalType, dispeller) {
            if (removalType == 'removed') {
                let newActionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await TMchange(newActionInfo, -100, false)
            }
        }
    },
    'stun': {
        name: 'stun',
        image: 'images/effects/stun.png',
        type: 'debuff',
        tags: ['stun', 'evasion'],
        desc: "Can't use abilities.",
        opposite: 'lockdown',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.evasion -= 200
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.evasion += 200
        }
    },
    'targetLock': {
        name: 'targetLock',
        image: 'images/effects/targetLock.png',
        type: 'debuff',
        tags: ['targetLock'],
        desc: "Some abilities have extra effects against target-locked characters.",
        opposite: 'chaff',
    },
    'tenacityDown': {
        name: 'tenacityDown',
        image: 'images/effects/tenacityDown.png',
        type: 'debuff',
        tags: ['stack', 'down', 'potency'],
        desc: "-100% Tenacity (Chance to resist debuffs)",
        opposite: 'tenacityUp',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.tenacity -= 100
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.tenacity += 100
        }
    },
    // ----------------------------------------------------------------- MISC EFFECTS -----------------------------------------------------------------
    'challenger': { // unfinished
        name: 'challenger',
        image: 'images/effects/challenger.png',
        type: 'misc',
        tags: ['assist', 'stopAssist', 'targetIgnore', 'stopCallAssist', 'challenger'],
        desc: "Can't assist or be assisted. The Pirate Code demands single combat.",
        apply: async function (actionInfo, unit) {

        },
        remove: async function (actionInfo, unit) {

        }
    },
    'VIP': { // unfinished
        name: 'VIP',
        image: 'images/effects/VIP.png',
        type: 'misc',
        tags: ['health_recovery', 'protectionRecovery', 'stealth', 'bonusData'],
        desc: "When receiving damage, stealth for 1 turn and {{caster}} recovers 5% health and protection. Whenever {{caster}} is damaged, this character recovers health and protection equal to 5% of {{caster}}'s max health and protection. If all allies are {{bonusData}}, {{caster}} and this character are immune to Turn Meter reduction.",
        apply: async function (actionInfo, unit) {

        },
        remove: async function (actionInfo, unit) {

        }
    },
}

/*async function createLimitedAction({
    limitedActions = {}, // object: { actionName: { fn: function, limit: number } }
    unlimitedActions = [], // array of functions
}) {
    // Initialize counters for each limited action
    const counters = {};
    for (const key in limitedActions) {
        counters[key] = 0;
    }

    return async function (...args) {
        // Check if last arg is a valid actionName string
        let possibleName = args[args.length - 1];
        let actionName = (typeof possibleName === 'string' && limitedActions[possibleName])
            ? args.pop() // remove it and use it
            : 'action';  // default
        //console.log(actionName)
        // Run limited action if exists and under limit
        if (limitedActions[actionName]) {
            if (counters[actionName] < limitedActions[actionName].limit) {
                const didRun = await limitedActions[actionName].fn.apply(this, args);
                //console.log(''+didRun)
                if (didRun) {
                    counters[actionName]++;
                }
            } else {
                console.log(`Limited action '${actionName}' reached its max count (${limitedActions[actionName].limit})`);
            }
        } else {
            //console.log(`No limited action named '${actionName}' found.`);
        }

        // Run all unlimited actions every time
        for (const unlimitedFn of unlimitedActions) {
            await unlimitedFn.apply(this, args);
        }
    };
}*/

const argsMap = {
    start: (arg1, arg2, arg3, arg4, arg5, arg6) => [], // selects the arguments needed for the function. The first (or zeroth in this case) argument is always the owner
    damaged: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5, arg6], // target,attacker,dealtdmg,'damagetype',crit true/false, total hit points minus dealtdmg
    endOfDamage: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5, arg6], // target,attacker,dealtdmg,'damagetype',crit true/false, total hit points remaining
    defeated: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5, arg6], // target,attacker,dealtdmg,'damagetype',crit true/false, total hit points remaining
    attacked: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3], //target,attacker,actionInfoPLACEHOLDER
    gainedEffect: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2], // target, effect
    lostEffect: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4], // target, effect, removalType, dispeller
    startedTurn: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1], // guy who started their turn
    endedTurn: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1], // guy who ended their turn
    usedAbility: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5], // abilityName, battleBro, target, type(assist or counter etc), dmgPercent (like when reduced from assists)
    endedAbility: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5, arg6], // abilityName, battleBro, target, type(assist or counter etc), dmgPercent (like when reduced from assists), savedActionInfo
    dodged: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2], // attacker, target
    modifiedStat: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3], // stat name, value, guy Whos Stats Have Been Modified, modifier
    revived: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5], // revived guy, reviver, healthGained, protectionGained, turnMeterGained
    resisted: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4], // target, user, type, effect/change
}
async function eventHandle(type, actionInfo, arg1, arg2, arg3, arg4, arg5, arg6) {
    //await logFunctionCall('eventHandle', ...arguments)
    console.log("eventHandle", type, arg1, arg2, arg3, arg4, arg5, arg6)
    if (arg1?.isDead == true || arg2?.isDead == true) return

    let returnValue = undefined

    if (argsMap[type]) {
        const args = argsMap[type]?.(arg1, arg2, arg3, arg4, arg5, arg6)
        for (let battleBro of battleBros) {
            // Prepare actionInfo for this battleBro
            var childActionInfo = new ActionInfo({ battleBro: battleBro })
            childActionInfo.abilityName = actionInfo?.abilityName // Copying this manually for the moment, because it is not in the ActionInfo constructor
            childActionInfo.parentActionInfo = actionInfo
            childActionInfo.enemies = aliveBattleBros.filter((_, i) => i !== battleBro.team).flat()
            for (let passive of battleBro.passives) { // iterate through all passives to see if they do something when this happens
                let fct = infoAboutPassives[passive]?.[type]

                if (fct) {
                    //console.log("Calling infoAboutPassives " + passive + " " + type)
                    childActionInfo.actionDetails = {
                        category: 'passive',
                        passiveName: passive,
                        type: type,
                    }
                    let ret = await fct(childActionInfo, battleBro, ...args)
                    // If the effect returns a number (e.g. reduced damage), store it
                    if (ret && returnValue === undefined) {
                        returnValue = ret
                    }
                    //console.log("Finished infoAboutPassives " + passive + " " + type + " " + ret)
                } else {
                    //console.log("Checked infoAboutPassives " + passive + " " + type + " => <not defined>")
                }
            }
            for (let effect of battleBro.buffs) {
                let fct = infoAboutEffects[effect.name]?.[type]
                if (fct) {
                    childActionInfo.actionDetails = {
                        category: 'buff/effect',
                        effectName: effect.name,
                        type: type,
                    }
                    let ret = await fct(childActionInfo, battleBro, effect, ...args)
                    // If the effect returns a number (e.g. reduced damage), store it
                    if (ret !== undefined && returnValue === undefined) {
                        returnValue = ret;
                    }
                }
            }
        }
    }
    return returnValue
}
//var abilityImagesDivsPerTeam =[[],[]]
var passiveImagesPerTeam = [[], []]


async function clearScreen() {
    await logFunctionCall('clearScreen', ...arguments)
    $('#myGuys').html("");
}

async function createBattleBroImages() {
    await logFunctionCall('createBattleBroImages', ...arguments)
    for (let battleBro of battleBros) {
        let infoAboutCharacter = infoAboutCharacters[battleBro.character]
        // Create new picture for character
        let newGuy = $('#jabbaTemplate').clone().removeAttr("id")

        // Set image src
        let childImage = newGuy.children("#jabba")
        childImage.attr("src", infoAboutCharacter.image)
        childImage.off("click").on("click", function () {
            avatarClicked(this)
        }).on("contextmenu", function (e) {
            if (!e.shiftKey) {
                e.preventDefault(); // Stop the browser right-click menu
                showStats(battleBro, e.pageX, e.pageY, 'battleBro'); // Show your custom stat box
            }
        })

        // Set position
        newGuy.css({ 'left': battleBro.x + 'px', 'top': battleBro.y + 'px' });
        if (infoAboutCharacter.imageSize) {
            let MassiveimageSize = infoAboutCharacter.imageSize + 50
            newGuy.css({ 'width': infoAboutCharacter.imageSize + 'px', 'height': MassiveimageSize + 'px' });

            childImage.css({ 'width': infoAboutCharacter.imageSize + 'px', 'height': infoAboutCharacter.imageSize + 'px' });
        }



        newGuy.appendTo('#myGuys');
        //avatarHtmlElements.push(newGuy)
        battleBro.avatarHtmlElement = newGuy
    }

    for (let team = 0; team < 2; team++) {
        const maxNumberOfAbilities = 8
        for (let i = 0; i < maxNumberOfAbilities; i++) {
            // Create new picture for ability
            let newAbilityImageDiv = $('#abilityTemplate').clone().removeAttr("id")
            let newPassiveImage = $('#passiveTemplate').clone().removeAttr("id")

            // Set position
            if (team == 0) {
                newAbilityImageDiv.css({ 'left': (i * 115 + 15) + 'px' });
                newPassiveImage.css({ 'left': (i * 85 + 15) + 'px' });
            }
            else {
                newAbilityImageDiv.css({ 'right': (i * 115 + 15) + 'px' });
                newPassiveImage.css({ 'right': (i * 85 + 15) + 'px' });
            }

            newAbilityImageDiv.appendTo('#myAbilities');
            //abilityImagesDivsPerTeam[team].push(newAbilityImageDiv)
            //battleBro.abilityImageDivs.push(newAbilityImageDiv)
            newPassiveImage.appendTo('#myPassives');
            passiveImagesPerTeam[team].push(newPassiveImage)
        }
    }
}

function createUltimateUIForTeam(teamNumber) {
    const container = document.getElementById('ultimateUIContainer');

    const wrapper = document.createElement('div');
    wrapper.className = 'ultimate-ui';
    wrapper.id = `ultimateUI-${teamNumber}`;

    wrapper.innerHTML = `
        <img class="ultimate-bg" src="images/other/ultimateCircle.png" />
        <div class="ultimate-fill fill-1"></div>
        <div class="ultimate-fill fill-2"></div>
        <img class="ultimate-icon" />
    `
    container.appendChild(wrapper);
}

async function createBattleBroVars(battleBro, skipUI = false) {
    await logFunctionCall('createBattleBroVars', ...arguments)
    let infoAboutCharacter = infoAboutCharacters[battleBro.character]
    // battleBro.speed = infoAboutCharacter.speed
    battleBro.turnMeter = 0
    // battleBro.health = infoAboutCharacter.health
    for (let info in infoAboutCharacter) {
        if (Object.prototype.hasOwnProperty.call(infoAboutCharacter, info)) { // fix for: if (infoAboutCharacter.hasOwnProperty(info)) {
            battleBro[info] = infoAboutCharacter[info];
        }
    }
    // add extra variables
    battleBro.critDamage = 150
    battleBro.critAvoidance = 0
    battleBro.accuracy = 0
    battleBro.evasion = 0
    battleBro.defencePenetration = 0
    battleBro.offence = 100
    battleBro.maxHealth = battleBro.health
    battleBro.maxProtection = battleBro.protection
    battleBro.shields = 0 // used for abilities that give bonus protection
    battleBro.speedPercent = 100 // using this to manipulate speed via buffs etc
    battleBro.flatDamageDealt = 100
    battleBro.flatDamageReceived = 100
    battleBro.isDead = false
    battleBro.cantRevive = false
    battleBro.queuedAttacks = []
    battleBro.taunting = false
    battleBro.buffs = []
    battleBro.effects = []
    battleBro.customData = {} // stores ability data
    battleBro.passives = infoAboutCharacters[battleBro.character].passiveAbilities || []
    battleBro.passives = battleBro.passives.filter(passive => {
        return !(infoAboutPassives[passive].type === 'leader' && !battleBro.isLeader);
    }) // remove leader passives of characters that aren't leaders
    battleBro.abilityImageDivs = []
    //const abilities = infoAboutCharacters[battleBro.character].abilities || [];
    if (!skipUI) {
        const abilities = (infoAboutCharacters[battleBro.character].abilities || []).filter(a => infoAboutAbilities[a]?.type !== 'ultimate')
        for (let i = 0; i < abilities.length; i++) {
            let newAbilityImageDiv = $('#abilityTemplate').clone().removeAttr("id")
            console.log('' + battleBro.team)
            if (battleBro.team == 0) {
                newAbilityImageDiv.css({ 'left': (i * 115 + 15) + 'px' })
            } else {
                newAbilityImageDiv.css({ 'right': (i * 115 + 15) + 'px' })
            }
            newAbilityImageDiv.appendTo('#myAbilities');
            battleBro.abilityImageDivs.push(newAbilityImageDiv);
        }
    }
    battleBro.cooldowns = {}
    for (let abilityName of infoAboutCharacters[battleBro.character].abilities) {
        const ability = infoAboutAbilities[abilityName]
        battleBro.cooldowns[abilityName] = ability?.tags?.includes('initialCooldown') ? ability?.cooldown : 0
    }
    // Initialise skill cooldowns
    battleBro.skillsData = []
    for (let skillName of infoAboutCharacter?.abilities || []) {
        let skill = JSON.parse(JSON.stringify(infoAboutAbilities[skillName]))
        let skillData = {
            skill: skill,
            cooldown: skill.initialCooldown,
        }
        battleBro.skillsData.push(skillData)

        // make sure cooldowns are keyed by name for checking and updating
        //battleBro.cooldowns[skillName] = skill.initialCooldown || 0
    }
    if (!aliveBattleBros[battleBro.team]) aliveBattleBros[battleBro.team] = [] // if the aliveBattleBros array doesn't have a row for their team, create it
    aliveBattleBros[battleBro.team].push(battleBro) // add to aliveGuys
    if (!ultimateCharge[battleBro.team]) ultimateCharge[battleBro.team] = startingUltCharge // if the ultimateCharge array doesn't have a row for their team, create it
}

async function updateBattleBrosHtmlText() {
    await logFunctionCall('updateBattleBrosHtmlText', ...arguments)
    for (let battleBro of battleBros) {
        let avatarHtmlElement = battleBro.avatarHtmlElement
        //let broHtmlElement = battleBro.avatarHtmlElement.get(0)
        if (battleBro.health > 0 && battleBro.isDead !== true) {
            battleBro.avatarHtmlElement.children()[1].firstElementChild.firstChild.nodeValue = '' + Math.ceil(battleBro.health)
        } else if (battleBro.isDead == true) {
            battleBro.avatarHtmlElement.children()[1].firstElementChild.firstChild.nodeValue = 'dead'
        }
        let protectionContainer = battleBro.avatarHtmlElement.children()[3];

        if (battleBro.protection + battleBro.shields > 0) {
            let protText = (battleBro.protection > 0) ? `${Math.ceil(battleBro.protection)}` : ''
            if (battleBro.shields > 0) {
                protText += ` <span style="color: magenta"> + ${Math.ceil(battleBro.shields)}</span>`;
            }
            protectionContainer.style.display = 'inline';
            protectionContainer.firstElementChild.innerHTML = protText;
        } else {
            protectionContainer.style.display = 'none'; // Hide the full span
        }
        battleBro.avatarHtmlElement.children()[5].firstElementChild.firstChild.nodeValue = '' + Math.ceil(battleBro.turnMeter)
        battleBro.avatarHtmlElement.children()[7].firstElementChild.firstChild.nodeValue = ''
    }
}

async function updateCurrentBattleBroSkillImages() {
    await logFunctionCall('updateCurrentBattleBroSkillImages', ...arguments)
    // Update ability images
    let battleBro = battleBros[selectedBattleBroNumber]

    // Hide all ability images
    for (let bro of battleBros) {
        if (!bro.abilityImageDivs) continue;
        for (let abilityImageDiv of bro.abilityImageDivs) {
            abilityImageDiv.css({ 'display': 'none' });
        }
    }

    // Hide ALL passive images from BOTH teams
    for (let team = 0; team < 2; team++) {
        let passiveImages = passiveImagesPerTeam[team];
        for (let passiveImage of passiveImages) {
            passiveImage.css({ 'display': 'none' });
        }
    }

    // loop over battlebro abilities and display them
    let characterAbilities = battleBro.abilities//[0]
    /*const nonUltimateAbilities = battleBro.skillsData.filter(
        ab => ab.skill.type !== 'ultimate'
    )*/
    let uiIndex = 0
    if (battleBro.skillsData) {
        for (let i = 0; i < battleBro.skillsData.length; i++) {
            let processedAbility = battleBro.skillsData[i]
            if (processedAbility.skill.type === 'ultimate') {
                continue // ultimate goes in its own ring, not here
            }
            let imagePngPath = processedAbility.skill.image

            let index = battleBro.team === 1
                ? (battleBro.abilityImageDivs.length - uiIndex - 1)
                : uiIndex;
            let abilityImageDiv = battleBro.abilityImageDivs[index];
            let abilityImage = abilityImageDiv.find(".image_ability_cropped")
            let abilityCooldown = abilityImageDiv.find(".cooldown")[0]
            abilityImage.attr("src", imagePngPath)
            abilityImage.off("click").on("click", function () {
                abilityClicked(this);
            }).on("contextmenu", function (e) {
                if (!e.shiftKey) {
                    e.preventDefault(); // Stop the browser right-click menu
                    showStats(battleBro, e.pageX, e.pageY, 'ability', processedAbility.skill.name); // Show your custom stat box
                }
            })
            abilityImageDiv.css({ 'display': 'block' });
            if (!abilityImage.dataset) {
                abilityImage.dataset = {}
            }
            abilityImage.attr("data-mydata", JSON.stringify({
                battleBroNumber: selectedBattleBroNumber,
                abilityNumber: i,
            }))
            abilityCooldown.innerText = processedAbility.cooldown ? processedAbility.cooldown : ''
            uiIndex++
        }
    }
    await updateUltimateIconForCurrentCharacter(battleBro)
    await changeCooldowns(battleBro, -1)
    let characterPassives = battleBro.passives
    if (characterPassives) {
        for (let i = 0; i < characterPassives.length; i++) {
            let processingPassive = characterPassives[i]
            let imagePngPath = infoAboutPassives[processingPassive].image

            // set the image png and set display=block
            let passiveImagesForCurrentTeam = passiveImagesPerTeam[battleBro.team]
            let passiveImage = passiveImagesForCurrentTeam[i]
            passiveImage.attr("src", imagePngPath)
            passiveImage.on("contextmenu", function (e) {
                if (!e.shiftKey) {
                    e.preventDefault(); // Stop the browser right-click menu
                    showStats(battleBro, e.pageX, e.pageY, 'passive', processingPassive); // Show your custom stat box
                }
            })
            passiveImage.css({ 'display': 'block' });
        }
    }
}

$(document).ready(function () {
    (async () => {
        console.log('App started')

        const runningDelayInput = document.getElementById('runningDelay');
        runningDelayInput.addEventListener('input', (event) => {
            runningDelay = Number(event.target.value);
            console.log("Updated runningDelay:", runningDelay);
        });

        // How to move an image
        /*
        var position = $('#jabbaTemplate').position()
        $('#jabbaTemplate').css({ 'left': position.left + 10 + 'px', 'top': position.top + 'px' });
        */

        // How to change text
        //$('#jabbaHealth').text("dead")
        for (let battleBro of battleBros) {
            await createBattleBroVars(battleBro)
        }
        await createBattleBroImages()
        await updateBattleBrosHtmlText()
        for (let team = 0; team < ultimateCharge.length; team++) {
            await createUltimateUIForTeam(team)
        }
        await eventHandle('start') // initiate abilities that have effects upon battle start

        // Buttons and keyboard shortcuts
        $('#button1').on('click', calculateNextTurnFromTurnMetersAndSpeeds)
        $('#button_startKraytRaid').on('click', startKraytRaid)

        $(document).on("keypress", async function (e) {
            if (e.originalEvent.key == 'n') { // Can also use e.which
                await calculateNextTurnFromTurnMetersAndSpeeds()
            }
            if (e.originalEvent.key == 'K') { // Can also use e.which
                await startKraytRaid()
            }
            if (e.originalEvent.key == 'a') {
                await runOnAuto(false)
            }
        });

        console.log('avatarTurnMeters:', battleBros.map(battleBro => battleBro.turnMeter))
        await calculateNextTurnFromTurnMetersAndSpeeds()
        await changeTarget(battleBros.find(guy => guy.team == 0))
        await changeTarget(battleBros.find(guy => guy.team == 1))
    })();
})

async function dead(battleBro) {
    characterDying = true
    battleBro.isDead = true
    aliveBattleBros[battleBro.team].splice(aliveBattleBros[battleBro.team].indexOf(battleBro), 1) // remove it from the array of alive guys on their team

    // Phase 1: Death animation
    const img = battleBro.avatarHtmlElement.children()
    img.css({
        transition: 'transform 0.5s ease'
    })
    img.css({
        filter: 'grayscale(100%) brightness(50%)', // grey and dim
        transform: 'rotate(180deg)',               // flipped upside down
        pointerEvents: 'none'                      // disables interaction
    })
    await wait(500)
    characterDying = false

    // Phase 2: cleanup — AFTER animation
    let actionInfo = new ActionInfo({ battleBro: battleBro })
    await removeEffect(actionInfo, battleBro, null, null, null, true)
    if (battleBro.isDead == true) await switchTarget(battleBro)
    // change avatar look to be dead
}

async function calculateNextTurnFromTurnMetersAndSpeeds() {
    //console.clear()
    await logFunctionCall('calculateNextTurnFromTurnMetersAndSpeeds', ...arguments)
    console.log('---------- Click detected ------------')

    // Bring the battleBros data into a temporary working array, for convenience
    let avatarTurnMeters = battleBros.map(battleBro => battleBro.turnMeter)
    /*
    var maxTurnMeter = Math.max(...avatarTurnMeters)
    while (maxTurnMeter < 100) {
        for (var i = 0; i < battleBros.length; i++) {
            if (battleBros[i].speed) {
                avatarTurnMeters[i] += battleBros[i].speed / 10
            }
        }
        console.log('avatarTurnMeters after increase:', avatarTurnMeters)
        maxTurnMeter = Math.max(...avatarTurnMeters)
    }*/
    let closestAvatar
    if (Math.max(...avatarTurnMeters) < 100) {
        let avatarDistances = battleBros.map(battleBro => (100 - battleBro.turnMeter) / (battleBro.speed * battleBro.speedPercent * 0.01))
        let closestAvatarDistance = Math.min(...avatarDistances)
        for (let battleBro of battleBros) {
            if (battleBro.speed) {
                battleBro.turnMeter += battleBro.speed * battleBro.speedPercent * 0.01 * closestAvatarDistance
            }
        }
        console.log('avatar distances:', avatarDistances)
        console.log('closest distance:', closestAvatarDistance)
        closestAvatar = avatarDistances.indexOf(closestAvatarDistance)
        console.log('closest avatar:', closestAvatar)
    } else {
        closestAvatar = avatarTurnMeters.indexOf(Math.max(...avatarTurnMeters))
    }
    console.log('Processing avatar------------------------- ', closestAvatar)
    $('#myText').html('Processing avatar------------------------- ' + closestAvatar)
    await selectBattleBro(closestAvatar)


    // Save our working array back into the main battleBros data
    /*for (var i = 0; i < battleBros.length; i++) {
        let battleBro = battleBros[i]
        battleBro.turnMeter += battleBro.speed*closestAvatarDistance
    }*/
    await updateBattleBrosHtmlText()
    // abort if battleBro is dead
    if (battleBros[closestAvatar].isDead !== true) await eventHandle('startedTurn', undefined, battleBros[closestAvatar])
    if (battleBros[closestAvatar].isDead == true) { // do it after eventHandling again incase character died of a passive or DOT so we can skip their turn
        let actionInfo = new ActionInfo({ battleBro: battleBros[closestAvatar] })
        await endTurn(actionInfo, battleBros[closestAvatar])
        return
    }
    if (battleBros[closestAvatar].buffs.find(e => e.tags.includes('stun'))) {
        let actionInfo = new ActionInfo({ battleBro: battleBros[closestAvatar] })
        await endTurn(actionInfo, battleBros[closestAvatar])
        return
    }
}

async function selectBattleBro(battleBroNumber) {
    await logFunctionCall('selectBattleBro', ...arguments)
    selectedBattleBroNumber = battleBroNumber
    $('.selected').removeClass('selected')
    let battleBro = battleBros[battleBroNumber]
    let avatarHtmlElement = battleBro.avatarHtmlElement
    avatarHtmlElement.addClass('selected')

    await updateCurrentBattleBroSkillImages()
}


async function avatarClicked(clickedElement) {
    await logFunctionCall('avatarClicked', ...arguments)
    console.log('avatarClicked')
    let clickedElementParent = clickedElement.parentElement
    // Find which battleBro was clicked
    let foundBattleBro
    for (let battleBro of battleBros) {
        let broHtmlElement = battleBro.avatarHtmlElement.get(0)
        if (broHtmlElement == clickedElementParent) {
            console.log(battleBro)
            foundBattleBro = battleBro
        }
    }

    if (pendingAbility) {
        let isAlly = foundBattleBro.team === pendingAbility.user.team
        if (isAlly) {
            console.log('Executing ally-targeted ability on:', foundBattleBro.character)
            let actionInfo = new ActionInfo({ battleBro: pendingAbility.user, target: pendingAbility.target })
            await pendingAbility.ability.allyUse?.(pendingAbility.user, foundBattleBro, pendingAbility.target)
            // the ally Use part of the ability is called before the actual part of the ability is called
            await useAbilityMain(pendingAbility.abilityName, actionInfo, true)
            pendingAbility = null
            return
        } else {
            console.log('Not a valid ally target.')
            return
        }
    }

    await changeTarget(foundBattleBro)
}

async function changeTarget(target) {
    await logFunctionCall('changeTarget', ...arguments)
    let targetTeam = aliveBattleBros[target.team]
    if (targetTeam.filter(unit => unit.taunting).length == 0) {
        if (!(target.buffs.find(effect => effect.tags.includes('stealth')) || target.isDead == true)) {
            await changingTarget(target)
        }
    } else if (target.buffs.find(e => e.tags.includes('taunt'))) {
        await changingTarget(target)
    } else {
        return
    }
}

async function switchTarget(battleBro) {
    await logFunctionCall('switchTarget', ...arguments)
    if (battleBro.isTarget == true) { // if this guy is the target, we need to set the target to another member of the same team
        let otherAllies = aliveBattleBros[battleBro.team].filter(ally => ally !== battleBro)
        if (otherAllies.length <= 0) return
        if (otherAllies.filter(ally => ally.taunting).length == 0) {
            await changingTarget(otherAllies[0])
        } else { // if there's at least one other guy with taunt on the same team as this guy, make them the target
            await changingTarget(otherAllies.filter(ally => ally.taunting)[0])
        }
    }
}

async function changingTarget(target) {
    await logFunctionCall('changingTarget', ...arguments)
    // Set isTarget=false to all other battleBros from the same team
    for (let battleBro of battleBros) {
        if (battleBro.team == target.team) {
            battleBro.isTarget = false
        }
    }

    // Set isTarget=true to our newly-selected battleBro
    target.isTarget = true

    // Move team's target image
    let htmlElementName = '#targetTeam' + target.team
    $(htmlElementName).css({ 'left': target.x + 'px', 'top': target.y + 'px' })
}

//--------------------------------------------------------ABILITY CLICKED


async function abilityClicked(clickedElement) {
    await logFunctionCall('abilityClicked', ...arguments)
    console.log('abilityClicked')
    let clickedElementParent = clickedElement.parentElement
    // Find which battleBro ability was clicked
    let eltData = JSON.parse(clickedElement.dataset.mydata)
    let battleBroNumber = eltData.battleBroNumber
    let abilityNumber = eltData.abilityNumber
    let battleBro = battleBros[battleBroNumber]
    let characterAbilities = battleBro.abilities
    let abilityName = characterAbilities[abilityNumber]
    let tags = infoAboutAbilities[abilityName].tags
    // abort if the ability is on cooldown
    if (battleBro.cooldowns[abilityName] > 0) {
        console.log("Ability on cooldown!")
        return
    }

    // pasted ability hiding code from starting turn so that upon ally select or animation play the abilities are hidden.
    for (let bro of battleBros) {
        if (!bro.abilityImageDivs) continue;
        for (let abilityImageDiv of bro.abilityImageDivs) {
            abilityImageDiv.css({ 'display': 'none' });
        }
    }
    // Hide ALL passive images from BOTH teams
    for (let team = 0; team < 2; team++) {
        let passiveImages = passiveImagesPerTeam[team];
        for (let passiveImage of passiveImages) {
            passiveImage.css({ 'display': 'none' });
        }
    }

    let target = battleBros.find(enemy => enemy.isTarget && enemy.team !== battleBro.team);
    if (!target) {
        console.log('no target found')
    }

    if (tags) {
        if (tags.includes('target_ally')) {
            console.log('Ally-targeting ability selected. Waiting for ally click...')
            await addFloatingText(battleBro.avatarHtmlElement.children()[7].firstElementChild, 'Ally Click', 'white')
            pendingAbility = {
                user: battleBro,
                ability: infoAboutAbilities[abilityName],
                target: target,
                abilityName: abilityName
            }
            return
        }
    } else {
        console.log('where tags')
    }
    let actionInfo = new ActionInfo({ battleBro: battleBro, target: target });
    if (!pendingAbility) await useAbilityMain(abilityName, actionInfo, true)
}

async function useAbilityMain(abilityName, actionInfo, hasTurn = false, type = 'main') {
    if (infoAboutAbilities[abilityName].type === 'ultimate') {
        ultimateBeingUsed = true
        ultimateCharge[actionInfo.battleBro.team] -= infoAboutAbilities[abilityName].ultimateCost || 0
    }
    await useAbility(abilityName, actionInfo, hasTurn, type)

    await Promise.all(promises) // waiting for main, bonus and assist attacks to finish
    promises = []
    const enemyTeam = battleBros.filter(unit => unit.team !== battleBros[selectedBattleBroNumber].team)
    let enemyTeamHasAttacks = false
    for (let enemy of enemyTeam) {
        if (enemy.queuedAttacks.length > 0) {
            enemyTeamHasAttacks = true
            console.log(enemy, '^has a counter attack')
            console.log(enemy.queuedAttacks[0])
        }
    }
    checkingPromises = null
    await engageCounters()
    await Promise.all(promises) // waiting for counter attacks to finish
    if (infoAboutAbilities[abilityName].type === 'ultimate') ultimateBeingUsed = false
    await endTurn(actionInfo, battleBros[selectedBattleBroNumber])
    promises = []
}
async function useAbility(abilityName, actionInfo, hasTurn = false, type = 'main', dmgPercent = 100) {
    await logFunctionCall('useAbility', ...arguments)
    actionInfo.abilityName = abilityName
    if (!actionInfo.actionDetails) actionInfo.actionDetails = {
        category: 'ability',
        type: type,
        hasTurn: hasTurn,
        dmgPercent: dmgPercent
    }
    let ability = infoAboutAbilities[abilityName]
    let animation = null
    if (ability.tags.includes("projectile_attack")) {
        animation = 'projectile'
        let taskDone = false
        await playProjectileAttackAnimation(
            actionInfo,
            abilityName,
            hasTurn,
            type,
            ability.projectile || null,
            "#00FFFF"
        )

    } else if (ability.tags.includes("attack")) {
        animation = 'melee'
        await playMeleeAttackAnimation(
            actionInfo.battleBro,
            actionInfo.target,
            abilityName,
            hasTurn,
            type,
            ability.projectile || null,
            "#00FFFF"
        )
    }
    actionInfo.battleBro.flatDamageDealt *= dmgPercent * 0.01

    await eventHandle('usedAbility', actionInfo, abilityName, actionInfo.battleBro, actionInfo.target, type, dmgPercent)
    actionInfo.hitEnemies = []
    actionInfo.enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
    let savedActionInfo = actionInfo.copy()
    let abilityUsed = await ability?.use(actionInfo) // [cooldown increase]
    await eventHandle('endedAbility', actionInfo, abilityName, actionInfo.battleBro, actionInfo.target, type, dmgPercent, savedActionInfo)


    actionInfo.battleBro.flatDamageDealt /= dmgPercent * 0.01
    if (!abilityName || !infoAboutAbilities[abilityName]) {
        console.warn("Ability not found:", abilityName);
        return;
    }
    if (animation == 'melee') {
        await wait(200)
    }
    for (let team = 0; team < ultimateCharge.length; team++) {
        await updateUltimateUI(team)
    }
    actionInfo.battleBro.cooldowns[abilityName] = ability.cooldown || 0
    if (abilityUsed) actionInfo.battleBro.cooldowns[abilityName] += abilityUsed[0] // adds optional cooldown increase
    await updateAbilityCooldownUI(actionInfo.battleBro, abilityName)
    if (type !== 'chained') { // if this ability is used from another ability, we don't do this ending turn stuff so it doesn't execute multiple times
        let attack
        if (type !== 'main') {
            attack = (actionInfo.battleBro.queuedAttacks.length > 0) ? actionInfo.battleBro.queuedAttacks.shift() : null // if this attack is a counter, assist, or bonus then remove it from the list of queued attacks
        } else {
            // MAIN ATTACK DONE - We can use assists now, remember to use promises array
            for (let ally of battleBros.filter(unit => unit.team === actionInfo.battleBro.team && unit !== actionInfo.battleBro)) {
                if (ally.queuedAttacks.length > 0) { // if they have a queued attack
                    let firstQueuedAttack = ally.queuedAttacks[0] // target, type, dmg multipler, abilityIndex
                    let assistAbilityName = infoAboutCharacters[ally.character].abilities[firstQueuedAttack[3]] // name of the ability stored in their queued attack
                    let actionInfo_assist = new ActionInfo({ battleBro: ally, target: firstQueuedAttack[0], type: firstQueuedAttack[1] })
                    let promise = useAbility(assistAbilityName, actionInfo_assist, false, firstQueuedAttack[1], firstQueuedAttack[2])
                    promises.push(promise) // add the ability being used to promises so we can wait for all of them to finish later
                }
            }
        }
        if (actionInfo.battleBro.queuedAttacks.length > 0) { // start bonus/counters if this character has some queued
            let firstQueuedAttack = actionInfo.battleBro.queuedAttacks[0] // target, type, dmg multipler, abilityIndex
            let nextAbilityName = infoAboutCharacters[actionInfo.battleBro.character].abilities[firstQueuedAttack[3]] // chosen ability index (usually the basic)
            let actionInfo_extra = actionInfo.withTarget(firstQueuedAttack[0])
            actionInfo_extra.type = firstQueuedAttack[1]
            let promise = useAbility(nextAbilityName, actionInfo_extra, hasTurn, firstQueuedAttack[1], firstQueuedAttack[2]) // after the attack is done, use the next attack in the list of queued attacks
            promises.push(promise)
        }
    }
    //if (hasTurn==true) await endTurn(actionInfo.battleBro)
}
/*
async function executeAbility(abilityName, actionInfo) {
    const ability = infoAboutAbilities[abilityName]
    // Provide context helpers automatically
    const obj = {
        battleBro: battleBro,
        target: target,
        abilityName: abilityName,
        dealDmg: async function (
            type = 'physical',
            target = this.target,
            dmg = ability.abilityDamage,
            triggerEventHandlers = true,
            ignoreProtection = false,
            sourceName = abilityName,
            effectDmg = false,
            user = battleBro
        ) {
            await dealDmg(user, target, dmg, type, triggerEventHandlers, effectDmg, ignoreProtection, sourceName)
        },
        applyEffect: async function (
            effectName,
            target = this.target,
            duration = 1,
            stacks = 1,
            resistable = true,
            isLocked = false,
            user = battleBro
        ) {
            await applyEffect({battleBro: user, target: target}, effectName, duration, stacks, resistable, isLocked)
        },
        // Add any other shortcut helpers here as needed...
    }
    if (ability.use) {
        //return await ability.use.call(obj, actionInfo)
        return await ability.use(actionInfo, obj)
    }
}*/

async function endTurn(actionInfo, battleBro) {
    await logFunctionCall('endTurn', ...arguments)
    battleBro.turnMeter -= 100
    engagingCounters = false
    if (battleBro.isDead == false) await eventHandle('endedTurn', undefined, battleBro)
    await updateBattleBrosHtmlText()
    await updateEffectsAtTurnEnd(actionInfo, battleBro)
    await calculateNextTurnFromTurnMetersAndSpeeds()
}

async function assist(actionInfo, caller, dmgPercent = 100, abilityIndex = 0) {
    actionInfo.actionDetails = {
        category: 'assist',
        caller: caller,
        dmgPercent: dmgPercent,
        abilityIndex: abilityIndex,
    }
    if (actionInfo.battleBro.buffs.find(effect => effect.tags.includes('stopAssist'))) return
    actionInfo.battleBro.queuedAttacks.unshift([actionInfo.target, 'assist', dmgPercent, abilityIndex])
}

async function addAttackToQueue(actionInfo, dmgPercent = 100, abilityIndex = 0) {
    if (actionInfo.battleBro.buffs.find(e => e.tags.includes('stun'))) return
    await logFunctionCall('addAttackToQueue', ...arguments)
    if (battleBros[selectedBattleBroNumber].team !== actionInfo.battleBro.team) {
        if (actionInfo.battleBro.buffs.find(effect => effect.tags.includes('stopCounter')) || actionInfo.target.buffs.find(effect => effect.tags.includes('counterImmunity'))) return
        console.log('counter attack logged')
        let currentTarget = battleBros.find(enemy => enemy.isTarget && enemy.team !== actionInfo.battleBro.team)
        currentTarget = (currentTarget.taunting == true) ? currentTarget : actionInfo.target
        actionInfo.battleBro.queuedAttacks.push([currentTarget, 'counter', dmgPercent, abilityIndex])
    } else if (engagingCounters == false) {
        console.log('bonus attack logged')
        actionInfo.battleBro.queuedAttacks.push([actionInfo.target, 'bonus', dmgPercent, abilityIndex])
    }
}

async function engageCounters() {
    await logFunctionCall('engageCounters', ...arguments)
    engagingCounters = true // enemy team is now counter attacking!
    const enemyTeam = battleBros.filter(unit => unit.team !== battleBros[selectedBattleBroNumber].team)
    for (let enemy of enemyTeam) {
        if (enemy.queuedAttacks.length > 0) { // if they have a queued attack
            let firstQueuedAttack = enemy.queuedAttacks[0] // target, type, dmg multipler, abilityIndex
            let counterAbilityName = infoAboutCharacters[enemy.character].abilities[firstQueuedAttack[3]] // name of the ability stored in their queued attack
            let actionInfo = new ActionInfo({ battleBro: enemy, target: firstQueuedAttack[0] })
            let promise = useAbility(counterAbilityName, actionInfo, false, firstQueuedAttack[1], firstQueuedAttack[2])
            promises.push(promise) // add the ability being used to promises so we can wait for all of them to finish later
        }
    }
}

async function playProjectileAttackAnimation(actionInfo, abilityName, hasTurn, type, imageName, colour = '#00FFFF') {
    await logFunctionCall('playProjectileAttackAnimation', ...arguments)
    const attackerDiv = actionInfo.battleBro.avatarHtmlElement.children()//.eq(0),  or wherever the character image is
    const targetDiv = actionInfo.target.avatarHtmlElement.children()//.eq(0),    same here
    let projectile
    if (imageName) {
        projectile = document.createElement('img');
        projectile.src = `images/projectiles/${imageName}.png`
    } else {
        projectile = document.createElement('div');
    }
    projectile.className = 'projectile-animation';
    projectile.style.position = 'absolute';
    if (!imageName) {
        projectile.style.width = '20px';
        projectile.style.height = '20px';
        projectile.style.backgroundColor = colour;
        projectile.style.borderRadius = '50%';
    } else {
        // wait for image to load before setting dimensions
        await new Promise((resolve, reject) => {
            projectile.onload = () => {
                projectile.style.width = `${projectile.naturalWidth}px`;
                projectile.style.height = `${projectile.naturalHeight}px`;
                console.log("Image dimensions set.");
                resolve();
            };
            projectile.onerror = reject;
        });
        /*projectile.onload = function () {
            projectile.style.width = `${projectile.naturalWidth}px`;
            projectile.style.height = `${projectile.naturalHeight}px`;
            console.log("Image dimensions set.");
        };*/
    }
    projectile.style.zIndex = '10';
    if (imageName == 'redLaser') {
        projectile.style.transition = 'transform 0.3s linear'
    } else {
        projectile.style.transition = 'transform 0.3s ease'
    }

    // Get screen positions
    const attackerRect = attackerDiv.get(0).getBoundingClientRect();
    const targetRect = targetDiv.get(0).getBoundingClientRect();

    // Append to body so it can travel freely
    document.body.appendChild(projectile);

    // Initial position: center of attacker
    const startX = attackerRect.left + attackerRect.width / 2;
    const startY = attackerRect.top + attackerRect.height / 2;

    // Final position: center of target
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    // Position projectile at start
    projectile.style.left = `${startX}px`;
    projectile.style.top = `${startY}px`;

    // Force reflow so transition applies
    void projectile.offsetWidth;

    // Animate to target
    const deltaX = endX - startX
    const deltaY = endY - startY

    if (imageName) {
        // Normalize direction vector
        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normX = deltaX / magnitude;
        const normY = deltaY / magnitude;
        // Offset: move slightly *less* in the direction of travel
        const adjustedDeltaX = deltaX - normX * (projectile.naturalWidth / 2);//1.3
        const adjustedDeltaY = deltaY - normY * (projectile.naturalHeight / 2);//0.1
        //const adjustedDeltaX = (deltaX - (projectile.naturalWidth))
        //const adjustedDeltaY = (deltaY - (projectile.naturalHeight / 2))

        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // Radians → Degrees
        console.log(angle + '')
        projectile.style.transform = `
            translate(${adjustedDeltaX}px, ${adjustedDeltaY}px)
            rotate(${angle}deg)
            `
    } else {
        projectile.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    }

    // Remove after animation
    await wait(300)
    projectile.remove();
    return 'projectile hit'
}

async function playMeleeAttackAnimation(attacker, target, abilityName, hasTurn, type, imageName, colour = '#00FFFF') {
    await logFunctionCall('playMeleeAttackAnimation', ...arguments)
    const attackerDiv = attacker.avatarHtmlElement.children()//.eq(0),  or wherever the character image is
    const targetDiv = target.avatarHtmlElement.children()//.eq(0),    same here
    // Get screen positions
    const attackerRect = attackerDiv.get(0).getBoundingClientRect();
    const targetRect = targetDiv.get(0).getBoundingClientRect();

    // Distance to move (from center to center)
    const deltaX = targetRect.left + targetRect.width / 2 - (attackerRect.left + attackerRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (attackerRect.top + attackerRect.height / 2);

    // Save original transform so we can return smoothly
    const originalTransform = attackerDiv.css("transform");

    // Move toward target
    attackerDiv.css({
        transition: 'transform 0.2s ease',
        zIndex: 1000 // in front of target
    });

    await wait(10); // allow style to apply
    const headbuttAngle = (headbutt == true) ? (Math.sign(deltaX) * (80 + Math.atan2(deltaY, Math.abs(deltaX)) * (180 / Math.PI))) : 0
    attackerDiv.css("transform", `translate(${deltaX * 0.9}px, ${deltaY * 0.9}px) rotate(${headbuttAngle}deg)`); // Move part of the way

    // Wait for lunge to complete
    await wait(200);

    // Wait a short moment after impact
    await wait(100);

    // Return to original position
    attackerDiv.css({
        transition: 'transform 0.18s ease',
        transform: originalTransform || 'none'
    });
}

async function playSparkImpact(x, y, primaryColour = 'yellow', secondaryColour = 'orange', numberOfSparks = 8) {
    await logFunctionCall('playSparkImpact', ...arguments)
    for (let i = 0; i < Math.min(numberOfSparks, 250); i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';

        // Random angle and distance
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.max(20, numberOfSparks * 2.5) + Math.random() * 10;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        // Set position and animation vector
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.setProperty('--dx', `${dx}px`);
        spark.style.setProperty('--dy', `${dy}px`);

        // Set custom colour glow using radial gradient!
        spark.style.background = `radial-gradient(circle, ${primaryColour}, ${secondaryColour})`;

        document.body.appendChild(spark);

        // Remove spark after animation
        setTimeout(() => {
            spark.remove();
        }, 500);
    }
}





async function addFloatingText(targetElement, value, colour) {
    if (value === "+0" || value === "-0") return; // don't show floating text for 0 values
    await logFunctionCall('addFloatingText', ...arguments)
    let queue = floatingTextQueues.get(targetElement) || Promise.resolve();

    queue = queue.then(() => showFloatingText(targetElement, value, colour));
    floatingTextQueues.set(targetElement, queue);

    // Clean up the queue when done (optional but neat)
    queue = queue.finally(() => {
        if (floatingTextQueues.get(targetElement) === queue) {
            floatingTextQueues.delete(targetElement);
        }
    });
}

async function showFloatingText(targetElement, value, colour) {
    await logFunctionCall('showFloatingText', ...arguments)
    const floatText = document.createElement('span');
    floatText.className = 'floating-text';
    floatText.textContent = value;
    floatText.style.color = colour;

    // Position the text inside the target box
    floatText.style.left = '50%';
    floatText.style.top = '0';
    floatText.style.transform = 'translateX(-50%)';

    targetElement.appendChild(floatText);

    // Remove it after animation ends
    setTimeout(() => {
        floatText.remove();
    }, 2000); // matches animation duration
    await wait(500)
}

async function playStatusEffectGlow(characterDiv, effectName) {
    await logFunctionCall('playStatusEffectGlow', ...arguments)
    let colour;
    const type = infoAboutEffects[effectName]?.type;
    if (infoAboutEffects[effectName].colour) {
        colour = infoAboutEffects[effectName]?.colour // if the effect already has a defined colour, set it to that
    } else if (type === 'buff') {
        colour = '#50C878'; // green
    } else if (type === 'debuff') {
        colour = '#880808'; // red
    } else {
        colour = '#6495ED'; // blue-ish
    }

    const glow = document.createElement('div');
    glow.style.position = 'absolute';
    glow.style.left = '50%';
    glow.style.top = '50%';
    glow.style.transform = 'translate(-50%, -50%)';
    glow.style.width = '60px';
    glow.style.height = '60px';
    glow.style.borderRadius = '50%';
    glow.style.backgroundColor = colour;
    glow.style.opacity = '0.6';
    glow.style.boxShadow = `0 0 20px 10px ${colour}`;
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '10';
    glow.style.animation = 'fadeOutGlow 0.8s ease-out forwards';

    characterDiv.get(0).appendChild(glow);

    setTimeout(() => {
        glow.remove();
    }, 800);
}

async function applyEffect(actionInfo, effectName, duration = 1, stacks = 1, resistable = true, isLocked = false, bonusData = null) {
    const identifier = Math.random().toString(36).substring(2, 15) // generate a random identifier for the effect
    actionInfo.actionDetails = {
        category: 'applyEffect',
        effectName: effectName,
        duration: duration,
        stacks: stacks,
        resistable: resistable,
        isLocked: isLocked,
        bonusData: bonusData,
        identifier: identifier,
    }
    if (actionInfo.target.isDead == true || (actionInfo.target.buffs.find(effect => effect.tags.includes('buffImmunity')) && infoAboutEffects[effectName].type == 'buff' && isLocked == false)) return // don't apply the effect if the target is dead
    await logFunctionCall('applyEffect', ...arguments)
    const info = infoAboutEffects[effectName];
    for (let i = 0; i < stacks; i++) {
        const effect = {
            ...info,
            duration: actionInfo.target === actionInfo.battleBro ? duration + 1 : duration, // if the caster applies effects to themself, the duration is knocked down by 1 at the end of their turn
            isLocked: isLocked,
            bonusData: bonusData,
            caster: actionInfo.battleBro,
            apply: info?.apply,
            remove: info?.remove,
            identifier: identifier,
        }
        if (info.type == 'debuff' && resistable == true && Math.random() < (actionInfo.target.tenacity - actionInfo.battleBro.potency) * 0.01) {
            await addFloatingText(actionInfo.target.avatarHtmlElement.children()[7].firstElementChild, 'RESISTED', 'white')
            await eventHandle('resisted', actionInfo, actionInfo.target, actionInfo.battleBro, 'effect', effect)
            return
        }
        actionInfo.target.buffs.push(effect)
        if (!(effect.tags.includes('stack') == false && actionInfo.target.buffs.filter(e => e.name == effectName).length > 1)) {
            if (effect?.apply) await effect.apply(actionInfo, actionInfo.target, effect) //the effect's apply effect activates unless it isn't stackable and there's already an effect with the same name
            await eventHandle('gainedEffect', actionInfo, actionInfo.target, effect)
            await playStatusEffectGlow(actionInfo.target.avatarHtmlElement, effectName)
            console.log('effect applied')
            await gainUltCharge(actionInfo.battleBro, 2.5)
        } else {
            console.log('second instance of non-stackable effect detected: apply async function not called')
        }
        await updateEffectIcons(actionInfo.target);
    }
}

async function updateEffectsAtTurnEnd(actionInfo, battleBro) {
    await logFunctionCall('updateEffectsAtTurnEnd', ...arguments)

    for (let i = battleBro.buffs.length - 1; i >= 0; i--) {
        const effect = battleBro.buffs[i]
        effect.duration -= 1
        if (effect.duration <= 0) {
            await expireEffect(actionInfo, battleBro, effect, 'expired')
        }
    }
    await updateEffectIcons(battleBro);
}

async function expireEffect(actionInfo, battleBro, effect, type) {
    battleBro.buffs.splice(battleBro.buffs.indexOf(effect), 1)
    let newActionInfo = new ActionInfo({ battleBro: battleBro })
    if (effect?.remove) await effect.remove(newActionInfo, battleBro, effect, type)
    await eventHandle('lostEffect', newActionInfo, battleBro, effect, type)
}

async function updateEffectIcons(battleBro) {
    await logFunctionCall('updateEffectIcons', ...arguments)
    // group effects that are the same for stacking
    let groupedEffects = {}; // { effectName: { instances: [], effectInfo: {} } }

    for (let effect of battleBro.buffs) {
        // group together instances of the same existing effects
        let effectInfo = infoAboutEffects[effect.name]
        if (!groupedEffects[effect.name]) {
            groupedEffects[effect.name] = {
                instances: [],
                effectInfo: effectInfo,
                isLocked: effect.isLocked,
            };
        }
        groupedEffects[effect.name].instances.push(effect);
    }


    // delete all instances of non-stackable effects except the instance with the longest duration
    for (let effectName in groupedEffects) {
        let { instances, effectInfo, isLocked } = groupedEffects[effectName]; // copy instances and effectInfo from the effect

        if (!effectInfo.tags.includes("stack")) {
            // Find the instance with the longest duration
            let longest = instances.reduce((prev, current) => {
                return (prev.duration > current.duration) ? prev : current;
            });
            instances = [longest]

            // Remove all other instances of this effect name from battleBro.buffs
            battleBro.buffs = battleBro.buffs.filter(effect => {
                // Keep the longest or any other effect
                return effect.name !== effectName || effect === longest;
            });
        }
    }


    let displayEffects = [];

    for (let effectName in groupedEffects) {
        let { instances, effectInfo, isLocked } = groupedEffects[effectName];

        if (effectInfo.tags.includes("stack")) {
            // STACKABLE: Show one icon with a counter
            displayEffects.push({
                name: effectName,
                isLocked: isLocked,
                image: effectInfo.image,
                count: instances.length,
                duration: Math.max(...instances.map(e => e.duration)), // for optional sorting or tooltip
                instances: instances, // keep track of all instances for potential future use
            });
        } else {
            // NON-STACKABLE: There will only be a single instance remaining so we set that to 1
            displayEffects.push({
                name: effectName,
                isLocked: isLocked,
                image: effectInfo.image,
                count: 1, // always going to be just a single instance
                duration: Math.max(...instances.map(e => e.duration)),
                instances: instances,
            });
        }
    }
    // render UI
    const container = battleBro.avatarHtmlElement.get(0).querySelector('.buffIcons');
    if (!container) {
        console.warn("Could not find buffIcons container for:", battleBro);
        return;
    }
    /*console.log('buffs')
    console.log(battleBro.buffs)
    console.log('buffdisplays')
    console.log(displayEffects)*/
    container.innerHTML = ''; // Clear old icons
    displayEffects.forEach(effect => {
        const wrapper = document.createElement('div')
        wrapper.style.position = 'relative'
        wrapper.style.display = 'inline-block'
        wrapper.style.width = '30px'
        wrapper.style.height = '30px'
        wrapper.style.marginRight = '4px' // spacing between icons (optional)

        if (effect.isLocked) { // add the block white border if the effect is Locked
            wrapper.style.border = '2px solid white'
            wrapper.style.borderRadius = '4px'
        }

        const img = document.createElement('img')
        img.src = effect.image
        img.style.width = '30px'
        img.style.height = '30px'
        img.style.display = 'block'

        const $img = $(img)
        $img.on("contextmenu", function (e) {
            if (!e.shiftKey) {
                e.preventDefault() // Stop the browser right-click menu
                showStats(battleBro, e.pageX, e.pageY, 'effect', effect) // Show your custom stat box
            }
        })

        wrapper.appendChild(img);

        if (effect.isLocked) {
            const lockImg = document.createElement('img');
            lockImg.src = 'images/other/lock.png'; // Ensure this is correctly pathed
            lockImg.style.position = 'absolute';
            lockImg.style.top = '-8px';
            lockImg.style.right = '-10px';
            lockImg.style.width = '18px';
            lockImg.style.height = '18px';
            lockImg.style.pointerEvents = 'none'; // Let clicks pass through if needed
            wrapper.appendChild(lockImg);
        }

        if (effect.count > 1) {
            const countDiv = document.createElement('div');
            countDiv.innerText = effect.count;
            countDiv.style.position = 'absolute';
            countDiv.style.top = '0';
            countDiv.style.right = '0';
            countDiv.style.backgroundColor = 'rgba(24, 1, 1, 0.06)';
            countDiv.style.color = 'white';
            countDiv.style.fontSize = '12px';
            countDiv.style.padding = '1px 3px';
            countDiv.style.borderRadius = '8px';
            countDiv.style.lineHeight = '1';
            wrapper.appendChild(countDiv);
        }

        container.appendChild(wrapper);
    });
}

async function dispel(actionInfo, type = null, tag = null, name = null, dispelLocked = false, specificEffect = null) {
    await logFunctionCall('dispel', ...arguments)
    actionInfo.actionDetails = {
        category: 'dispel',
        type: type,
        tag: tag,
        name: name,
        dispelLocked: dispelLocked,
    }
    let dispelledEffects = actionInfo.target.buffs
    if (type) { // dispel if there's a type selected
        dispelledEffects = dispelledEffects.filter(effect => effect.type === type && (effect.isLocked !== true || dispelLocked == true))
    }
    if (tag) { // otherwise we might be dispelling a tag (e.g. defensive effects)
        dispelledEffects = dispelledEffects.filter(effect => infoAboutEffects[effect.name].tags.includes(tag) == true && (effect.isLocked !== true || dispelLocked == true))
    } else if (name) { // otherwise we might be dispelling an effect with a specific name
        dispelledEffects = dispelledEffects.filter(effect => effect.name === name && (effect.isLocked !== true || dispelLocked == true))
    } else if (!type) { // dispel all effects if all of the above is null
        dispelledEffects = dispelledEffects.filter(effect => effect.isLocked !== true || dispelLocked == true)
    }

    if (specificEffect) {
        dispelledEffects = dispelledEffects.filter(effect => effect == specificEffect && (effect.isLocked !== true || dispelLocked == true))
    }

    for (let i = actionInfo.target.buffs.length - 1; i >= 0; i--) {
        const effect = actionInfo.target.buffs[i];
        if (dispelledEffects.includes(effect)) {
            actionInfo.target.buffs.splice(i, 1)
            if (effect?.remove) await effect.remove(actionInfo, actionInfo.target, effect, 'dispelled')
            await eventHandle('lostEffect', actionInfo, actionInfo.target, effect, 'dispelled', actionInfo.battleBro)
            await gainUltCharge(actionInfo.battleBro, 8)
        }
    }
    await updateEffectIcons(actionInfo.target)
}

async function removeEffect(actionInfo, target, bufftag = null, name = null, type = null, all = false, specificEffect = null) {
    //console.log(target.evasion)
    let filteredEffects = target.buffs
    if (type) {
        filteredEffects = filteredEffects.filter(effect => effect.type === type)
    }
    if (bufftag) {
        filteredEffects = filteredEffects.filter(effect => infoAboutEffects[effect.name].tags.includes(bufftag) == true)
    } else if (name) {
        filteredEffects = filteredEffects.filter(effect => effect.name === name)
    }
    if (specificEffect) {
        filteredEffects = filteredEffects.filter(effect => effect === specificEffect)
    }
    if (filteredEffects.length > 0) {
        if (all == false) {
            let shortestDurationEffect = filteredEffects.reduce((prev, current) => {
                return (prev.duration < current.duration) ? prev : current;
            })
            let shortestDurationEffectIndex = target.buffs.indexOf(shortestDurationEffect)
            target.buffs.splice(shortestDurationEffectIndex, 1)
            if (shortestDurationEffect?.remove) await shortestDurationEffect.remove(actionInfo, target, shortestDurationEffect, 'removed')
            await eventHandle('lostEffect', actionInfo, target, shortestDurationEffect, 'removed')
            await updateEffectIcons(target)
        } else {
            for (let i = target.buffs.length - 1; i >= 0; i--) {
                const effect = target.buffs[i];
                if (filteredEffects.includes(effect)) {
                    target.buffs.splice(i, 1)
                    if (effect?.remove) await effect.remove(actionInfo, target, effect, 'removed')
                    await eventHandle('lostEffect', actionInfo, target, effect, 'removed')
                }
            }
            await updateEffectIcons(target)
        }
    }
}

async function changeCooldowns(battleBro, amount = -1, ability = null) {
    await logFunctionCall('changeCooldowns', ...arguments)
    /*for (let abilityName in battleBro.cooldowns) {
        if (battleBro.cooldowns[abilityName] > 0) {
            battleBro.cooldowns[abilityName] --;
            await pdateAbilityCooldownUI(battleBro, abilityName);
        }
    }*/
    if (ability == null) {
        for (let abilityName of battleBro.abilities) {
            //console.log(abilityName)
            if (infoAboutAbilities[abilityName].type == 'special') {
                battleBro.cooldowns[abilityName] += amount;
                await updateAbilityCooldownUI(battleBro, abilityName)
            }
        }
        for (let skillData of battleBro.skillsData) {
            if (skillData.cooldown > 0) {
                skillData.cooldown += amount;
                //await updateAbilityCooldownUI(battleBro, skillData.skill.name);
            }
        }
    } else {
        battleBro.cooldowns[ability] += amount
        await updateAbilityCooldownUI(battleBro, ability)
        for (let skillData of battleBro.skillsData) {
            if (skillData.skill.name == ability) {
                skillData.cooldown += amount
                //await updateAbilityCooldownUI(battleBro, skillData.skill.name);
            }
        }
    }
}

async function updateAbilityCooldownUI(battleBro, abilityName) {
    await logFunctionCall('updateAbilityCooldownUI', ...arguments)
    if (battleBro !== battleBros[selectedBattleBroNumber]) return;
    const cooldown = battleBro.cooldowns[abilityName] || 0

    const characterAbilities = battleBro.abilities
    const abilityIndex = battleBro.team == 0 ? characterAbilities.indexOf(abilityName) : (characterAbilities.length - characterAbilities.indexOf(abilityName) - 1)
    if (abilityIndex === -1) console.log("no ability index found")

    const abilityImageDiv = (battleBro.team == 1 && characterAbilities.find(ability => infoAboutAbilities[ability].type == 'ultimate')) ? battleBro.abilityImageDivs[abilityIndex - 1] : battleBro.abilityImageDivs[abilityIndex]
    if (!abilityImageDiv) console.log("no ability Image Div found")
    if (!abilityImageDiv) return;

    const img = abilityImageDiv.get(0).querySelector('img');
    const cooldownSpan = abilityImageDiv.get(0).querySelector('#cooldown');
    console.log(abilityName, 'cooldown:', cooldown, 'abilityIndex:', abilityIndex, 'img:', img, 'cooldownSpan:', cooldownSpan)
    if (cooldown > 0 || (!!battleBro.buffs.find(effect => effect.tags.includes('abilityBlock')) == true && infoAboutAbilities[abilityName].type !== 'basic')) {
        //|| (infoAboutAbilities[abilityName].type === 'ultimate' && ultimateCharge[battleBro.team] < infoAboutAbilities[abilityName].ultimateCost)
        img.style.filter = 'grayscale(100%) brightness(50%)'; // greyed out
        cooldownSpan.innerText = (cooldown > 0) ? cooldown : ''
        cooldownSpan.style.display = 'block';
        img.style.pointerEvents = 'none'; // prevent clicking
    } else {
        img.style.filter = '';
        cooldownSpan.style.display = 'none';
        img.style.pointerEvents = 'auto';
    }
}

async function dodge(actionInfo, user, target) {
    await logFunctionCall('dodge', ...arguments)
    await gainUltCharge(user, 10)
    await eventHandle('dodged', actionInfo, user, target) // activate passive conditions upon dodging
    const logElement = target.avatarHtmlElement.children()[7].firstElementChild
    if (target.protection > 0) {
        if (Math.random() > 0.5) {
            await addFloatingText(logElement, 'BLOCKED', 'white');
        } else {
            await addFloatingText(logElement, 'DEFLECTED', 'white');
        }
    } else {
        if (Math.random() > 0.5) {
            await addFloatingText(logElement, 'EVADED', 'white');
        } else {
            await addFloatingText(logElement, 'DODGED', 'white');
        }
    }
    await removeEffect(actionInfo, target, 'loseOnDodge')
}

async function dealDmg(actionInfo, dmg, type, triggerEventHandlers = true, effectDmg = false, ignoreProtection = false, sourceName = null, counterable = true, healthSteal = true) {
    await logFunctionCall('dealDmg', ...arguments)
    actionInfo.actionDetails = {
        category: 'dealDmg',
        type: type,
        dmg: dmg,
        triggerEventHandlers: triggerEventHandlers,
        effectDmg: effectDmg,
        ignoreProtection: ignoreProtection,
        sourceName: sourceName
    }
    let user = actionInfo.battleBro
    let target = actionInfo.target
    //if (user.team===battleBros[selectedBattleBroNumber].team) {
    if (type !== 'shadow' && effectDmg == false && triggerEventHandlers == true) {

        await eventHandle('attacked', actionInfo, target, user, actionInfo) // activate passive conditions upon being attacked unless the damage is shadow damage
    }
    if (Math.random() > (target.evasion - user.accuracy) * 0.01 || ['shadow', 'massive', 'percentage', 'ultra', 'unchangeable'].includes(type)) { // shadow, massive, percentage, and ultra damage can't be evaded.
        const logElement = target.avatarHtmlElement.children()[7].firstElementChild
        let crit = false // prepare crits in the case of physical damage!
        let colour // prepare the colour for the damage types
        const targetRect = target.avatarHtmlElement.children().get(0).getBoundingClientRect() // get the avatar location of the target for spark effects
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;
        let secondaryColour
        let dealtdmg
        const physicalDamage = user.physicalDamage * user.offence * 0.01
        const specialDamage = user.specialDamage * user.offence * 0.01
        if (type == 'physical') {
            dealtdmg = ((dmg * physicalDamage * 0.01) * Math.max((1 - Math.max((target.armour - user.defencePenetration), -50) / 100), 0.3) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001 // 20=100-80 where 80 is the max damage negation from defence
            if (Math.random() < (user.critChance - target.critAvoidance) * 0.01) { // physical attacks can crit
                dealtdmg = dealtdmg * user.critDamage * 0.01
                colour = 'yellow' // change colour upon crit!
                secondaryColour = 'orange'
                crit = true
            } else {
                colour = 'red'
                secondaryColour = 'orange'
            }
        } else if (type == 'special') {
            dealtdmg = ((dmg * specialDamage * 0.01) * Math.max((1 - Math.max((target.resistance - user.defencePenetration), -50) / 100), 0.3) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001 // uses resistance/special damage instead of armour/physical damage
            colour = 'cornflowerblue'
            secondaryColour = 'cyan'
        } else if (type === 'true') {
            dealtdmg = Math.max(dmg * user.flatDamageDealt * target.flatDamageReceived * 0.0001, 0) // nice and simple true damage doesn't have damage variance
            colour = 'white'
        } else if (type == 'ultra') {
            dealtdmg = ((dmg * (physicalDamage + specialDamage) * 0.01) * Math.max((1 - Math.max((target.armour + target.resistance - user.defencePenetration), -50) / 100), 0.3) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001
            if (Math.random() < (user.critChance - target.critAvoidance) * 0.01) { // ultra attacks can crit
                dealtdmg = dealtdmg * user.critDamage * 0.01
                colour = 'violet' // change colour upon crit!
                secondaryColour = 'orchid'
                crit = true
            } else {
                colour = 'purple'
                secondaryColour = 'orchid'
            }
        } else if (type == 'silver') {
            dealtdmg = ((dmg * specialDamage * 0.015) * Math.max((1 - Math.max((infoAboutCharacters[target.character].resistance - user.defencePenetration), -50) / 100), 0.3) - Math.floor(Math.random() * dmg * specialDamage * 0.01)) * user.flatDamageDealt * target.flatDamageReceived * 0.000001 * user.critDamage // lots of damage variance and ignores resistance buffs
            colour = 'silver'
            secondaryColour = 'platinum'
            crit = true // always crits
        } else if (type == 'shadow') {
            dealtdmg = Math.max((dmg - Math.floor(Math.random() * 501)) * Math.min(user.flatDamageDealt, 100) * Math.max(target.flatDamageReceived, 100) * Math.min(user.offence, 100) * 0.000001, 0)
            colour = 'midnightblue'
            secondaryColour = 'black'
        } else if (type == 'massive') {
            dealtdmg = 99999
            colour = 'white'
        } else if (type == 'percentage') {
            dealtdmg = Math.max(dmg * target.maxHealth * target.flatDamageReceived * 0.0001, 0) // in this case 'dmg' would the the percentage of health dealt as damage
            colour = 'white'
        } else if (type == 'unchangeable') {
            dealtdmg = Math.max(dmg, 0) // can't be changed
            colour = 'white'
        }

        if (dealtdmg > 0) {
            await playSparkImpact(endX, endY, colour, secondaryColour, Math.ceil(dealtdmg / 625))
            // } else if (target.buffs.find(e => e.tags.includes('taunt'))) {
            if (type !== 'shadow' && triggerEventHandlers == true) {
                if (effectDmg == false && counterable == true) {
                    if (!actionInfo.hitEnemies) actionInfo.hitEnemies = []
                    actionInfo.hitEnemies.push(target)
                }
                let returnedValue = await eventHandle('damaged', actionInfo, target, user, dealtdmg, type, crit, target.health + target.protection + target.shields - dealtdmg)
                if (typeof returnedValue === 'number') {
                    dealtdmg = returnedValue
                }
            } // passive effects upon damage that isn't shadow damage
            if (target.buffs.find(e => e.tags.includes('loseOnHit'))) await removeEffect(actionInfo, target, 'loseOnHit')
        }


        if (ignoreProtection === false) {
            let remainingDmg = dealtdmg

            // 1 Damage shields first
            if (target.shields > 0) {
                const shieldDmg = Math.min(remainingDmg, target.shields)
                target.shields -= shieldDmg
                remainingDmg -= shieldDmg
            }

            // 2 Damage protection next
            if (remainingDmg > 0 && target.protection > 0) {
                const protDmg = Math.min(remainingDmg, target.protection);
                target.protection -= protDmg;
                remainingDmg -= protDmg;
            }

            // 3 Damage health last
            if (remainingDmg > 0) {
                target.health -= remainingDmg;

                if (user.healthSteal > 0 && effectDmg === false && healthSteal == true) {
                    await heal({ battleBro: user, target: user }, (dealtdmg - target.protection) * user.healthSteal * 0.01, 'health', true)
                }
            }
        } else {
            // Ignore shields and protection, damage health directly
            target.health -= dealtdmg;

            if (user.healthSteal > 0 && effectDmg === false && healthSteal == true) {
                await heal({ battleBro: user, target: user }, dealtdmg * user.healthSteal * 0.01, 'health', true)
            }
        }

        await addFloatingText(logElement, `-${Math.ceil(dealtdmg)}`, colour)
        if (type !== 'shadow' && triggerEventHandlers == true) {
            await eventHandle('endOfDamage', actionInfo, target, user, dealtdmg, type, crit, target.health + target.protection - dealtdmg)
        }
        await gainUltCharge(user, dealtdmg * 0.005)
        await gainUltCharge(target, dealtdmg * 0.0035)
        //const protUsed = (ignoreProtection == false) ? target.protection : 0 // how much protection was used
        if (target.health <= 0 && target.isDead == false) {
            await dead(target)
            await gainUltCharge(target, 500)
            await eventHandle('defeated', actionInfo, target, user, dealtdmg, type, crit, target.health + target.protection - dealtdmg)
        }
        await updateBattleBrosHtmlText()
        return [dealtdmg, crit]
    } else {
        await dodge(actionInfo, user, target)
        if (triggerEventHandlers == true) await eventHandle('endOfDamage', actionInfo, target, user, 0, type, false, target.health + target.protection)
        return [0, 'dodged']
    }
}

async function heal(actionInfo, healing, type = 'health', isHealthSteal = false, ignoreHealImmunity = false, triggerEventHandlers = true) {
    await logFunctionCall('heal', ...arguments)
    if (ignoreHealImmunity == false && ((actionInfo.target.buffs.find(effect => effect.tags.includes('healingImmunity')) && type == 'health') || (actionInfo.target.buffs.find(effect => effect.tags.includes('protectionHealingImmunity')) && type == 'protection'))) return
    actionInfo.actionDetails = {
        category: 'heal',
        type: type,
        healing: healing,
        isHealthSteal: isHealthSteal,
    }
    let user = actionInfo.battleBro
    let target = actionInfo.target
    const logElement = target.avatarHtmlElement.children()[7].firstElementChild
    if (isHealthSteal == false && target.buffs.find(e => e.tags.includes('loseOnHeal'))) await removeEffect(actionInfo, target, 'loseOnHeal')
    if (type == 'health') {
        await addFloatingText(logElement, `+${Math.ceil(Math.min(target.maxHealth - target.health, healing))}`, 'green');
        target.health = Math.min(target.health + healing, target.maxHealth)
        await gainUltCharge(user, Math.min(target.maxHealth - target.health, healing) * 0.004)
    } else { // healing protection
        await addFloatingText(logElement, `+${Math.ceil(Math.min(target.maxProtection - target.protection, healing))}`, 'turquoise');
        target.protection = Math.min(target.protection + healing, target.maxProtection)
        await gainUltCharge(user, Math.min(target.maxProtection - target.protection, healing) * 0.004)
    }
}

async function TMchange(actionInfo, change, resistable = true) {
    let user = actionInfo.battleBro // get the user from the actionInfo
    let target = actionInfo.target // get the target from the actionInfo
    if (target.buffs.find(effect => effect.tags.includes('stopTMgain') && change > 0)) return
    if (resistable == true && change < 0 && Math.random() < (target.tenacity - user.potency) * 0.01) {
        await addFloatingText(target.avatarHtmlElement.children()[7].firstElementChild, 'RESISTED', 'white')
        await eventHandle('resisted', actionInfo, target, user, 'turnMeter', change)
        return
    }
    target.turnMeter += change
    target.turnMeter = (target.turnMeter < 0) ? 0 : target.turnMeter // turn meter shouldn't be less than 0
}

async function revive(actionInfo, health = 0, protection = 0, turnMeter = 0) {
    await wait(1) // ensure revive visuals start after death visuals complete
    let instantRevive = false
    if (characterDying == true) {
        instantRevive = true
        await wait(501)
    }
    if (actionInfo.target.cantRevive == true) return
    const img = actionInfo.target.avatarHtmlElement.children()
    img.css({
        transition: 'transform 0.5s ease'
    })
    img.css({
        filter: 'none',
        transform: 'none',
        pointerEvents: 'auto'
    })
    await createBattleBroVars(actionInfo.target, true)
    const healthGained = actionInfo.target.maxHealth * health * 0.01
    const protectionGained = actionInfo.target.maxProtection * protection * 0.01
    actionInfo.target.health = 1
    actionInfo.target.protection = 0
    await heal(actionInfo, healthGained, 'health', false, true, false)
    await heal(actionInfo, protectionGained, 'protection', false, true, false)
    actionInfo.target.turnMeter += turnMeter
    await eventHandle('revived', actionInfo, actionInfo.target, actionInfo.battleBro, healthGained, protectionGained, turnMeter)
}

async function equalize(actionInfo, targets, type = 'health', ignoreHealImmunity = true) {
    if (targets == undefined) {
        targets = [actionInfo.battleBro, actionInfo.target]
    }
    let totalHitPointsPercent = 0
    for (let guy of targets) {
        totalHitPointsPercent += (type == 'health') ? guy.health / guy.maxHealth : guy.protection / guy.maxProtection
    }
    const averageHitPointsPercent = totalHitPointsPercent / targets.length
    let HPchangeArray = []
    for (let guy of targets) {
        const healingAmountPercent = averageHitPointsPercent - ((type == 'health') ? guy.health / guy.maxHealth : guy.protection / guy.maxProtection)
        const healingAmount = (type == 'health') ? healingAmountPercent * guy.maxHealth : healingAmountPercent * guy.maxProtection
        HPchangeArray.push(healingAmount)
        let newActionInfo = new ActionInfo({ battleBro: actionInfo.battleBro, target: guy })
        if (healingAmount > 0) {
            await heal(newActionInfo, healingAmount, type, false, ignoreHealImmunity, false)
        } else if (healingAmount < 0) {
            await dealDmg(newActionInfo, -healingAmount, 'unchangeable', false, false, ((type == 'health') ? true : false), null, false, false)
        }
    }
    return HPchangeArray
}

async function gainUltCharge(battleBro, chargeAmount = 1) {
    if (ultimateBeingUsed === true) return
    let team = battleBro.team
    ultimateCharge[team] = Math.min(ultimateCharge[team] + chargeAmount, 10000)
    //console.log(`Ultimate charge for team ${team} increased by ${chargeAmount}. Current charge: ${ultimateCharge[team]}`);
}

async function updateUltimateUI(team) {
    const ui = document.getElementById(`ultimateUI-${team}`)
    const charge = ultimateCharge[team]
    const fill1 = ui.querySelector('.fill-1')
    const fill2 = ui.querySelector('.fill-2')

    const percent = charge / 10000;
    if (percent >= 1) {
        fill1.style.clipPath = 'inset(0 0 0 0)'
        fill2.style.clipPath = 'inset(0 0 0 0)'
    } else if (percent >= 0.5) {
        fill1.style.clipPath = 'inset(0 0 0 0)';
        fill2.style.clipPath = `inset(${(1 - (percent - 0.5) * 2) * 100}% 0 0 0)`
    } else {
        fill1.style.clipPath = `inset(${(1 - percent * 2) * 100}% 0 0 0)`
        fill2.style.clipPath = 'inset(100% 0 0 0)'
    }
    /*
    fill1.style.display = charge >= 5000 ? 'block' : 'none';
    fill2.style.display = charge >= 10000 ? 'block' : 'none';*/
}

async function updateUltimateIconForCurrentCharacter(battleBro) {
    const ultimate = battleBro.abilities.find(a => infoAboutAbilities[a]?.type === 'ultimate')
    for (let teamFound = 0; teamFound < ultimateCharge.length; teamFound++) {
        let teamIcon = document.getElementById(`ultimateUI-${teamFound}`).querySelector('.ultimate-icon')
        if (teamIcon) teamIcon.remove()
    }
    const team = battleBro.team
    const ui = document.getElementById(`ultimateUI-${team}`)
    if (!ultimate) {
        console.log('No ultimate ability found for', battleBro.character, 'in', team, ui);
        return
    }


    const img = document.createElement('img');
    img.src = infoAboutAbilities[ultimate].image
    img.classList.add('ultimate-icon');
    img.style.position = 'absolute';
    img.style.width = '50%';
    img.style.height = '50%';
    img.style.top = '25%';
    img.style.left = '25%';
    img.style.borderRadius = '50%';
    img.style.cursor = 'pointer';
    img.dataset.battleBroNumber = battleBros.indexOf(battleBro)
    img.dataset.abilityIndex = battleBro.abilities.indexOf(ultimate)

    const charge = ultimateCharge[team] || 0;
    const enoughCharge = charge >= infoAboutAbilities[ultimate].ultimateCost;

    if (!enoughCharge) {
        img.style.filter = 'grayscale(100%) brightness(50%)';
        img.style.pointerEvents = 'auto';
    } else {
        img.style.filter = '';
        img.style.pointerEvents = 'auto';
    }

    // Attach click
    let imagePngPath = infoAboutAbilities[ultimate].image
    img.setAttribute('onclick', `abilityClicked(this)`)
    img.dataset.mydata = JSON.stringify({
        battleBroNumber: battleBros.indexOf(battleBro),
        abilityNumber: battleBro.abilities.indexOf(ultimate)
    })
    const $img = $(img);
    $img.off("click").on("click", function () {
        if (infoAboutAbilities[ultimate].ultimateCost <= ultimateCharge[team]) {
            abilityClicked(this);
        }
    }).on("contextmenu", function (e) {
        if (!e.shiftKey) {
            e.preventDefault(); // Stop the browser right-click menu
            showStats(battleBro, e.pageX, e.pageY, 'ability', ultimate); // Show your custom stat box
        }
    })

    ui.appendChild(img);

    img.style.display = 'block'
}

async function modifyStat(actionInfo, stat, amount, triggerEventHandlers = true) {
    if (triggerEventHandlers == true) {
        await eventHandle('modifiedStat', actionInfo, stat, amount, actionInfo.target, actionInfo.battleBro)
    }
    actionInfo.target[stat] += amount
}

async function showStats(battleBro, x, y, type, abilityName = null) {
    let statBox = $('#statBox')
    if (type == 'battleBro') {

        if (statBox.length === 0) {
            statBox = $('<div id="statBox"></div>').appendTo('body')
        }

        let protText = `Protection: ${Math.ceil(battleBro.protection)}/${Math.ceil(battleBro.maxProtection)}`;
        if (battleBro.shields > 0) {
            protText += ` <span style="color: magenta"> + ${Math.ceil(battleBro.shields)}</span>`;
        }

        let effects = battleBro.buffs.map(e => e.name) || 'None'
        let effectNames = []
        for (let effect of effects) {
            const neweffect = effect
                .replace(/([A-Z])/g, ' $1') // insert space before capital letters
                .replace(/^./, str => str.toUpperCase()) // capitalize first letter
                .trim(); // remove leading/trailing space
            effectNames.push(neweffect)
        }

        // Clear and populate with stats
        statBox.html(`
        <span style="font-size: 1.2em"><strong>${battleBro.character}</strong><br></span>
        <span style="color: lightgray">${battleBro.charDesc}<br></span>
        <span style="color: limegreen">Health: ${Math.ceil(battleBro.health)}/${Math.ceil(battleBro.maxHealth)}<br></span>
        <span style="color: cyan">${protText}<br></span>
        <span style="color: orange">Armour: ${Math.ceil(battleBro.armour)}<br></span>
        <span style="color: goldenrod">Accuracy: ${Math.ceil(battleBro.accuracy)}<br></span>
        <span style="color: darkorange">Critical Avoidance: ${Math.ceil(battleBro.critAvoidance)}<br></span>
        <span style="color: orangered">Critical Chance: ${Math.ceil(battleBro.critChance)}<br></span>
        <span style="color: red">Critical Damage: ${Math.ceil(battleBro.critDamage)}<br></span>
        <span style="color: crimson">Defence Penetration: ${Math.ceil(battleBro.defencePenetration)}<br></span>
        <span style="color: plum">Evasion: ${Math.ceil(battleBro.evasion)}<br></span>
        <span style="color: lime">Health Steal: ${Math.ceil(battleBro.healthSteal)}<br></span>
        <span style="color: #e7120bff">Offence: ${Math.ceil(battleBro.offence)}<br></span>
        <span style="color: #2AAA8A">Potency: ${Math.ceil(battleBro.potency)}<br></span>
        <span style="color: #6082B6">Resistance: ${Math.ceil(battleBro.resistance)}<br></span>
        <span style="color: brightblue">Speed: ${Math.ceil(battleBro.speed * battleBro.speedPercent * 0.01)}<br></span>
        <span style="color: #556ae4ff">Tenacity: ${Math.ceil(battleBro.tenacity)}<br></span>

        <span style="color: #6082B6">Turn Meter: ${Math.ceil(battleBro.turnMeter)}<br></span>  
        <span style="color: white">Damage Dealt: ${Math.ceil(battleBro.flatDamageDealt)}<br></span>
        <span style="color: white">Damage Received: ${Math.ceil(battleBro.flatDamageReceived)}<br></span>
        <span style="color: white">Leader: ${battleBro.isLeader}<br></span>
        <span style="color: cornflowerblue">Effects: ${effectNames}<br></span>
    `);
    } else if (type == 'effect') {
        let effect = abilityName
        if (statBox.length === 0) {
            statBox = $('<div id="statBox"></div>').appendTo('body');
        }

        const regularName = effect.name
            .replace(/([A-Z])/g, ' $1') // insert space before capital letters
            .replace(/^./, str => str.toUpperCase()) // capitalize first letter
            .trim(); // remove leading/trailing space

        const oldDesc = infoAboutEffects[effect.name].desc
        let desc = oldDesc.replace(/{{(.*?)}}/g, (_, key) => {
            let value = effect.instances[0][key]
            if (typeof value === 'number') {
                for (let i = 1; i < effect.instances.length; i++) {
                    const instanceValue = effect.instances[i][key];
                    if (instanceValue !== undefined) {
                        value += instanceValue // sum up values from all instances
                    }
                }
            }
            if (key == 'caster') {
                value = effect.instances[0].caster.character // get the character name of the caster
            }
            return value !== undefined ? value : `{{${key}}}`; // leave it unchanged if missing
        })
        /*for (let word in effect) {
            const regex = new RegExp(`\\b(${word})\\b`, 'gi') // match whole words
            desc = desc.replace(regex, `$1`)
        }*/
        console.log(oldDesc)
        console.log(desc)

        let effectType = infoAboutEffects[effect.name].type
        if (effectType == 'buff') {
            effectType = `<span style="color: limegreen">Buff</span>`
        } else if (effectType == 'debuff') {
            effectType = `<span style="color: red">Debuff</span>`
        } else if (effectType == 'misc') {
            effectType = `<span style="color: cornflowerblue">Miscellaneous Effect</span>`
        }

        // Clear and populate with stats
        statBox.html(`
        <span style="font-size: 1.2em"><strong>${regularName}</strong><br></span>
        <span style="color: lightgray; font-size: 0.9em;">${effectType}<br></span>
        <span style="color: lightgray">${desc}<br></span>
    `);
    } else {
        if (statBox.length === 0) {
            statBox = $('<div id="statBox"></div>').appendTo('body');
        }

        let desc = (type == 'ability') ? infoAboutAbilities[abilityName].desc : infoAboutPassives[abilityName].desc
        desc = await highlightKeywords(desc)
        let abilityType = (type == 'ability') ? infoAboutAbilities[abilityName].type : infoAboutPassives[abilityName].type
        if (abilityType == 'basic') {
            abilityType = `<span style="color: white">Basic Ability</span>`
        } else if (abilityType == 'special') {
            abilityType = `<span style="color: cornflowerblue">Special Ability<br>Cooldown: ${infoAboutAbilities[abilityName].cooldown} Turns</span>`
        } else if (abilityType == 'ultimate') {
            abilityType = `<span style="color: orange">Ultimate Ability<br>Ultimate Cost: ${infoAboutAbilities[abilityName].ultimateCost}</span>`
        } else if (abilityType == 'unique') {
            abilityType = `<span style="color: cyan">Unique Passive</span>`
        } else if (abilityType == 'leader') {
            abilityType = `<span style="color: plum">Leader Passive</span>`
        }
        // Clear and populate with stats
        statBox.html(`
        <span style="font-size: 1.2em"><strong>${abilityName}</strong><br></span>
        <span style="color: lightgray">${desc}<br></span>
        <span style="color: lightgray; font-size: 1.1em;">${abilityType}<br></span>
    `);
    }

    // Style and position
    statBox.css({
        position: 'absolute',
        top: y + 'px',
        left: x + 'px',
        padding: '10px',
        backgroundColor: '#222831', // 🔷 Dark grey background
        color: '#00ffcc',            // 🔷 Neon teal text
        border: '2px solid #00ffcc', // 🔷 Matching border
        borderRadius: '10px',
        fontFamily: 'monospace',     // (optional) cool techy font
        fontSize: '14px',
        minWidth: '300px',
        maxWidth: '400px',
        zIndex: 9999
    })

    // Smart positioning
    const padding = 10;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Temporarily show to measure
    statBox.css({ visibility: 'hidden', display: 'block' });
    const boxWidth = statBox.outerWidth();
    const boxHeight = statBox.outerHeight();
    statBox.css({ visibility: 'visible' });

    if (x + boxWidth + padding > screenWidth) {
        x = screenWidth - boxWidth - padding;
    }
    if (y + boxHeight + padding > screenHeight) {
        y = screenHeight - boxHeight - padding;
    }

    x = Math.max(padding, x);
    y = Math.max(padding, y);

    statBox.css({ top: y + 'px', left: x + 'px' }).show();

    // Wait for left click anywhere
    return new Promise(resolve => {
        const handleClick = (e) => {
            if (e.button === 0) { // 0 = left click
                statBox.hide();
                $(document).off("mousedown", handleClick);
                resolve(); // Resolve the promise after hiding
            }
        };
        $(document).on("mousedown", handleClick);
    });
}

async function highlightKeywords(text) {
    let newText = text
    const highlights = {
        'physical damage': 'orange',
        'special damage': 'cornflowerblue',
        'true damage': 'white',
        'ultra damage': 'violet',
        'silver damage': 'silver',
        'shadow damage': 'white',
        'massive damage': 'white',
        'instantly defeat': 'red'
    };

    for (let word in highlights) {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi') // match whole words
        const color = highlights[word]
        newText = newText.replace(regex, `<span style="color:${color}">$1</span>`)
    }

    return newText
}

/////////////////////// KRAYT RAID stuff ///////////////////////////////////

async function startKraytRaid() {
    await logFunctionCall('startKraytRaid', ...arguments)
    battleBros = [
        // Team 0 (left side)
        {
            character: 'Dathcha',
            x: 500,
            y: 700,
            team: 0,
        },
        {
            character: 'Boba Fett',
            x: 700,
            y: 720,
            team: 0,
        },
        {
            character: 'Mando',
            x: 900,
            y: 730,
            team: 0,
        },
        {
            character: 'Jango Fett',
            x: 1100,
            y: 720,
            team: 0,
        },
        {
            character: 'Cad Bane',
            x: 1300,
            y: 700,
            team: 0,
        },

        // Team 1 (right side)
        {
            character: 'KraytDragon',
            x: 850,
            y: 50,
            team: 1,
        },
        {
            character: 'Explosives',
            x: 700,
            y: 270,
            team: 1,
        },
        {
            character: 'Explosives',
            x: 900,
            y: 300,
            team: 1,
        },
        {
            character: 'Explosives',
            x: 1100,
            y: 270,
            team: 1,
        },
    ]

    team2abilitiesAlwaysVisible = true

    await clearScreen()
    await createBattleBroVars()
    await createBattleBroImages()
    await updateBattleBrosHtmlText()
}


async function runOnAuto(runForever = true) {
    await logFunctionCall('runOnAuto', ...arguments)
    let count = 0
    try {
        while (runForever || count++ == 0) {
            // Click next
            if (selectedBattleBroNumber == -1) {
                await calculateNextTurnFromTurnMetersAndSpeeds()
                continue
            }

            let battleBro = battleBros[selectedBattleBroNumber]

            // Some raid bosses can attack multiple times
            let attackCount = Math.max(infoAboutCharacters[battleBro.character].attacksPerTurn, 1)
            for (let attackNum = 0; attackNum < attackCount; attackNum++) {
                // Pick a skill
                let skill, skillNum
                let skillChoiceStrategy = 'right-most' // or 'random'
                switch (skillChoiceStrategy) {
                    case 'random':
                        {
                            let skillsCount = infoAboutCharacters[battleBro.character]?.abilities?.length
                            if (!skillsCount) throw new Error('Char has no skill available')
                            let randomSkillNum = Math.floor(Math.random() * skillsCount)
                            let skillName = infoAboutCharacters[battleBro.character].abilities[randomSkillNum]
                            skill = infoAboutAbilities[skillName]
                            skillNum = randomSkillNum
                        }
                        break

                    case 'right-most':
                        {
                            let rightMostActiveSkillNum = battleBro.skillsData.findLastIndex(sd => !sd.cooldown && (!sd.skill.selectThisSkillLastPerTurn || attackNum == attackCount - 1))
                            if (rightMostActiveSkillNum == -1) throw new Error('Char has no skill available')
                            skill = battleBro.skillsData[rightMostActiveSkillNum].skill
                            skillNum = rightMostActiveSkillNum
                        }
                        break
                }

                // Target 1 enemy
                let targetedEnemy
                if (skill.needsEnemyTarget === undefined || skill.needsEnemyTarget == 1) {
                    let aliveEnemies = battleBros.filter(bb => bb.team != battleBro.team && bb.health > 0)
                    let targetableEnemies = aliveEnemies.filter(bb => !bb.effects?.includes('Eaten'))
                    if (!targetableEnemies.length) throw new Error('No live enemies')
                    let randomEnemyNum = Math.floor(Math.random() * targetableEnemies.length)
                    targetedEnemy = targetableEnemies[randomEnemyNum]
                }

                // Target 1 ally (always excluding ourselves for the moment)
                let targetedAlly
                if (skill.needsAllyTarget) {
                    let aliveAllies = battleBros.filter(bb => bb.team == battleBro.team && bb.health > 0 && bb != battleBro)
                    let randomAllyNum = Math.floor(Math.random() * aliveAllies.length)
                    targetedAlly = aliveAllies[randomAllyNum]
                }

                // Attack
                await attack({
                    battleBroNumber: selectedBattleBroNumber,
                    skill: skill,
                    skillData: battleBro.skillsData[skillNum],
                    targetedEnemy: targetedEnemy,
                    targetedAlly: targetedAlly,
                })
            }

            // Update to get ready for next turn
            //  reduce skills' cooldowns
            battleBro.skillsData.map(skillData => skillData.cooldown = skillData.cooldown ? (skillData.cooldown - 1) : 0)
            await updateCurrentBattleBroSkillImages()
            selectedBattleBroNumber = -1 // Ready for next turn's selection
        }
    }
    catch (e) {
        console.log(e.toString())
        selectedBattleBroNumber = -1 // In case we're stuck on a char without skills, move to next char
    }
}


async function attack(inputs) {
    await logFunctionCall('attack', ...arguments)
    console.log('Attack: ' + inputs.battleBroNumber + ' uses ' + inputs.skill.name + (inputs.targetedEnemy ? ' on ' + inputs.targetedEnemy.character : ''))
    if (inputs.skill.attackFct) {
        await inputs.skill.attackFct(inputs)
    } else {
        inputs.targetedEnemy.health -= inputs.skill.abilityDamage
    }

    inputs.skillData.cooldown = inputs.skill.cooldownAfterUse
    await updateBattleBrosHtmlText()
}


async function damageEnemy(inputs) {
    await logFunctionCall('damageEnemy', ...arguments)
    console.log('damageEnemy')
    inputs.targetedEnemy.health -= inputs.skill.abilityDamage
}
async function damageAllEnemies(inputs) {
    await logFunctionCall('damageAllEnemies', ...arguments)
    console.log('damageAllEnemies')
    let battleBro = battleBros[inputs.battleBroNumber]
    let aliveEnemies = battleBros.filter(bb => bb.team != battleBro.team && bb.health > 0)
    for (let enemy of aliveEnemies) {
        enemy.health -= inputs.skill.abilityDamage
    }
}
async function applyEffectsToEnemy(inputs, effects) {
    await logFunctionCall('applyEffectsToEnemy', ...arguments)
    console.log('applyEffectsToEnemy')
    for (let effect of effects) {
        inputs.targetedEnemy.effects.push(effect)
        switch (effect) {
            case 'Eaten':
                {
                    //inputs.targetedEnemy.health = -1
                }
                break
        }
    }
}
async function applyEffectsToSelf(inputs, effects) {
    await logFunctionCall('applyEffectsToSelf', ...arguments)
    console.log('applyEffectsToSelf')

}


async function logFunctionCall(fctName, args) {
    if (runningDelay > 0) {
        let stackDepth = new Error().stack.split('\n').length
        console.log("  ".repeat(stackDepth), fctName, args)
        if (runningDelay > 1) {
            await wait(runningDelay)
        }
    }
}