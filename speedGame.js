/* eslint-disable no-unused-vars */
/* global $, ActionInfo */

var selectedBattleBroNumber = -1
var team2abilitiesAlwaysVisible = false
var pendingAbility = null
var aliveBattleBros = []
//var isAnythingElseRunningHereAtTheSameTime = 0
var engagingCounters = false
var promises = []
var checkingPromises = null
const wait = ms => new Promise(res => setTimeout(res, ms))
const floatingTextQueues = new Map()
// CONDITIONS
var headbutt = true

var runningDelay = 0;

var battleBros = [
    // Team 0 (left side)
    {
        id: "01",
        character: 'Red (Samurai)',
        x: 400,
        y: 100,
        team: 0,
        isLeader: false,
        // Defined elsewhere
        // - avatarHtmlElement
        // - isTargeted

    },
    {
        id: "02",
        character: 'Shadow Menace (Original)',
        x: 400,
        y: 300,
        team: 0,
        isLeader: false,
    },
    {
        id: "03",
        character: 'Super Striker',
        x: 400,
        y: 500,
        team: 0,
        isLeader: false,
    },
    {
        id: "04",
        character: 'Yoda',
        x: 400,
        y: 700,
        team: 0,
        isLeader: false,
    },
    {
        id: "05",
        character: 'jabba',
        x: 250,
        y: 200,
        team: 0,
        isLeader: false,
    },
    {
        id: "06",
        character: 'Clone Wars Chewbacca',
        x: 250,
        y: 400,
        team: 0,
        isLeader: true,
    },
    {
        id: "07",
        character: 'Mace Windu',
        x: 250,
        y: 600,
        team: 0,
        isLeader: false,
    },
    {
        id: "08",
        character: 'MassiveJabba',
        x: 0,
        y: 350,
        team: 0,
        isLeader: false,
    },

    // Team 1 (right side)
    {
        id: "11",
        character: 'Super Striker',
        x: 1400,
        y: 100,
        team: 1,
        isLeader: false,
    },
    {
        id: "12",
        character: 'Clone Wars Chewbacca',
        x: 1400,
        y: 300,
        team: 1,
        isLeader: false,
    },
    {
        id: "13",
        character: 'Yoda',
        x: 1400,
        y: 500,
        team: 1,
        isLeader: false,
    },
    {
        id: "14",
        character: 'Mace Windu',
        x: 1400,
        y: 700,
        team: 1,
        isLeader: true,
    },
    {
        id: "15",
        character: 'jabba',
        x: 1550,
        y: 200,
        team: 1,
        isLeader: false,
    },
    {
        id: "16",
        character: 'Red (Samurai)',
        x: 1550,
        y: 400,
        team: 1,
        isLeader: false,
    },
    {
        id: "17",
        character: 'Shadow Menace (Original)',
        x: 1550,
        y: 600,
        team: 1,
        isLeader: false,
    },
    {
        id: "18",
        character: 'MassiveJabba',
        x: 1700,
        y: 350,
        team: 1,
        isLeader: false,
    },
]

const infoAboutCharacters = {
    'jabba': {
        image: 'images/Jabba.png',
        health: 50000,
        protection: 15000,
        speed: 200,
        potency: 100,
        tenacity: 100,
        critChance: 50,
        physicalDamage: 5000,
        specialDamage: 5000,
        armour: 50,
        resistance: 50,
        healthSteal: 100,
        tags: ['lightSide'],
        abilities: ['test1', 'test2'],
        passiveAbilities: ['test3'],
        charDesc: 'insert funny description here',
    },
    'MassiveJabba': {
        image: 'images/Jabba.png',
        imageSize: 200,
        health: 100000,
        protection: 10000,
        speed: 60,
        potency: 100,
        tenacity: 100,
        critChance: 60,
        physicalDamage: 18000,
        specialDamage: 10000,
        armour: 60,
        resistance: 30,
        healthSteal: 20,
        tags: ['lightSide'],
        abilities: ['test1', 'test2'],
        passiveAbilities: ['test3'],
        charDesc: 'insert funny description here',
    },
    'Clone Wars Chewbacca': {
        image: 'images/avatars/CloneWarsChewbacca.png',
        health: 43470 + 52371,
        protection: 0,
        speed: 126,
        potency: 28,
        tenacity: 55,
        critChance: 28.46,
        physicalDamage: 3267,
        specialDamage: 2043,
        armour: 48.23,
        resistance: 41.81,
        healthSteal: 10,
        tags: ['lightSide', 'tank', 'leader', 'galacticRepublic', 'scoundrel'],
        abilities: ['bowcaster', 'wookieRage', 'defiantRoar'],
        passiveAbilities: ['wookieResolve'],
        charDesc: 'Durable Tank with both Taunt and self-Healing',
    },
    'Darth Vader': {
        image: 'images/avatars/DarthVader.png',
        imageSize: 100,
        health: 32156,
        protection: 47828,
        speed: 141,
        potency: 50,
        tenacity: 43,
        critChance: 37.67,
        physicalDamage: 3447,
        specialDamage: 2570,
        armour: 43.36,
        resistance: 34.38,
        healthSteal: 15,
        tags: ['darkSide', 'attacker', 'leader', 'empire', 'sith', 'fleetCommander'],
        abilities: ['terrifyingSwing', 'forceCrush', 'cullingBlade', 'mercilessMassacre'],
        passiveAbilities: ['inspiringThroughFear', 'noEscape'],
        charDesc: 'Fearsome Attacker that applies AoE Damage Over Time, and crushes debuffed targets for extra turns',
    },
    'Mace Windu': {
        image: 'images/avatars/MaceWindu.png',
        imageSize: 100,
        health: 36040,
        protection: 39209,
        speed: 143,
        potency: 46,
        tenacity: 47,
        critChance: 23.33,
        physicalDamage: 2689,
        specialDamage: 4679,
        armour: 31.19,
        resistance: 43.31,
        healthSteal: 15,
        tags: ['lightSide', 'tank', 'leader', 'galacticRepublic', 'jedi', 'fleetCommander'],
        abilities: ['invincibleAssault', 'smite', 'thisPartysOver'],
        passiveAbilities: ['takeaSeat', 'vaapad', 'senseWeakness'],
        charDesc: 'Aggressive Jedi tank with devastating damage if left unchecked',
    },
    'Talia': {
        image: 'images/avatars/Talia.png',
        imageSize: 100,
        health: 67332,
        protection: 9435,
        speed: 135,
        potency: 41,
        tenacity: 30,
        critChance: 25.29,
        physicalDamage: 2772,
        specialDamage: 4500,
        armour: 30.8,
        resistance: 42.2,
        healthSteal: 10,
        tags: ['darkSide', 'healer', 'leader', 'nightsister'],
        abilities: ['Draining Strike', 'Water of Life', 'Harrowing Assault'],
        passiveAbilities: ['Nightsister Nimbleness'],
        charDesc: 'Aggressive Healer that sacrifices Health so allies can recover Health and Turn Meter',
    },
    'Yoda': {
        image: 'images/avatars/GrandmasterYoda.png',
        imageSize: 100,
        health: 33753,
        protection: 18937,
        speed: 177,
        potency: 56,
        tenacity: 39,
        critChance: 28.42,
        physicalDamage: 2527,
        specialDamage: 4492,
        armour: 31.85,
        resistance: 19.46,
        healthSteal: 5,
        tags: ['lightSide', 'support', 'leader', 'galacticRepublic', 'jedi'],
        abilities: ['ataru', 'masterstroke', 'unstoppableForce', 'battleMeditation'],
        passiveAbilities: ['grandMastersGuidance'],
        charDesc: 'Masterful Jedi support that can replicate enemy buffs and share them with allies',
    },
    // --------------------------------------------------------OLIV'S CHARACTERS
    'Super Striker': {
        image: 'images/avatars/superStriker.png',
        imageSize: 100,
        health: 28450,
        protection: 37828,
        speed: 172,
        potency: 55,
        tenacity: 22,
        critChance: 47.23,
        physicalDamage: 4447,
        specialDamage: 4570,
        armour: 23.36,
        resistance: 32.34,
        healthSteal: 20,
        tags: ['neutral', 'attacker', 'mercenary', 'oliv', 'unalignedForceUser'],
        abilities: ['Lethal Swing', 'Piercing Edge', 'Disruptor Blade', 'Super Strike'],
        passiveAbilities: ['Elimination Protocol'],
        charDesc: 'Powerful foe who crushes enemies with repeated target locks and combos down upon killing an enemy.',
    },
    // --------------------------------------------------------JAMES' CHARACTERS
    'Shadow Menace (Original)': {
        image: 'images/avatars/shadowMenaceOriginal.png',
        imageSize: 100,
        health: 32945,
        protection: 39273,
        speed: 163,
        potency: 49,
        tenacity: 42,
        critChance: 57.23,
        physicalDamage: 3290,
        specialDamage: 3870,
        armour: 37.36,
        resistance: 28.34,
        healthSteal: 8,
        tags: ['darkSide', 'attacker', 'mandalorian', 'scoundrel', 'shadowMenace'],
        abilities: ['Cloning Strike', 'Sabre Storm', 'Rotating Blades', 'Cut it short'],
        passiveAbilities: ['Prime Era', 'Reign of Mandalore'],
        charDesc: 'Powerful mandalorian adversary who attacks many times.',
    },
    // --------------------------------------------------------OUR CHARACTERS
    'Goosey': {

    },
    // --------------------------------------------------------ANGRY BIRDS EPIC CHARACTERS
    'Red (Samurai)': {
        image: 'images/avatars/redSamurai.png',
        imageSize: 100,
        health: 60000,
        protection: 3000,
        speed: 132,
        potency: 32,
        tenacity: 56,
        critChance: 60.23,
        physicalDamage: 8000,
        specialDamage: 3570,
        armour: 33.36,
        resistance: 32.34,
        healthSteal: 20,
        tags: ['neutral', 'tank', 'bird'],
        abilities: ['Dragon Strike', 'Defensive Formation', 'Heroic Strike'],
        passiveAbilities: [],
        charDesc: 'Protects the party. A real hero!',
    },
    'Chuck (Rainbird': {
        image: 'images/avatars/chuckRainbird.png',
        imageSize: 100,
        health: 27000,
        protection: 3000,
        speed: 171,
        potency: 54,
        tenacity: 15,
        critChance: 30,
        physicalDamage: 4250,
        specialDamage: 4250,
        armour: 25.36,
        resistance: 42.34,
        healthSteal: 10,
        tags: ['neutral', 'healer', 'bird'],
        abilities: ['Acid Rain', 'Healing Rain', 'Speed of Light'],
        passiveAbilities: [],
        charDesc: 'A powerful wizard. Deals damage to all enemies at once!',
    },
    'Matilda (Druid)': {
        image: 'images/avatars/matildaDruid.png',
        imageSize: 100,
        health: 40000,
        protection: 3000,
        speed: 145,
        potency: 49,
        tenacity: 50,
        critChance: 40,
        physicalDamage: 6350,
        specialDamage: 4250,
        armour: 35.36,
        resistance: 22.34,
        healthSteal: 20,
        tags: ['neutral', 'healer', 'bird'],
        abilities: ['Thorny Vine', 'Regrowth', 'Matildas Medicine'],
        passiveAbilities: [],
        charDesc: 'A strong healer who also packs quite a punch!',
    },
    // --------------------------------------------------------KRAYT DRAGON RAID
    'KraytDragon': {
        image: 'images/KraytDragon.png',
        imageSize: 200,
        speed: 120 * 10,
        health: 1000000,
        abilities: ['kraytBasicAttack', 'kraytAcidPuke', 'kraytEatEnemy', 'kraytBurrow', 'kraytUnburrow'],
        attacksPerTurn: 2,
    },
    'Explosives': {
        image: 'images/Explosives.png',
        imageSize: 100,
        speed: 0,
        health: 5,
    },
    'Dathcha': {
        image: 'images/Dathcha.png',
        imageSize: 100,
        speed: 157,
        health: 30000,
        abilities: ['dathchaHitAndRun'],
    },
    'Boba Fett': {
        image: 'images/BobaFett.png',
        imageSize: 100,
        speed: 167,
        health: 29000,
        abilities: ['bobaEE3Carbine'],
    },
    'Mando': {
        image: 'images/Mando.png',
        imageSize: 100,
        speed: 164,
        health: 36000,
        abilities: ['mandoSwiftShot'],
    },
    'Jango Fett': {
        image: 'images/JangoFett.png',
        imageSize: 100,
        speed: 178,
        health: 35000,
        abilities: ['jangoUnscrupulousGunfire'],
    },
    'Cad Bane': {
        image: 'images/CadBane.png',
        imageSize: 100,
        speed: 133,
        health: 33000,
        abilities: ['cadBaneGunSlinger'],
    },
}

const infoAboutAbilities = {
    'test1': {
        displayName: 'JABBA Bowcaster',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage', 'projectile_attack'],
        abilityDamage: 100,
        desc: 'This is a test, deal physical damage to target enemy.',
        use: async function (actionInfo) {
            //await logFunctionCall('method: use (', ...arguments,)
            await dealDmg(actionInfo, this.abilityDamage, 'physical')
            await applyEffect(actionInfo.withSelfAsTarget(), 'offenceUp', 2)
        }
    },
    'test2': {
        displayName: 'Jabba take a seat',
        image: 'images/abilities/abilityui_passive_takeaseat.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['target_ally', 'attack', 'special_damage', 'health_recovery'],
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
    'bowcaster': {
        displayName: 'Bowcaster',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage', 'projectile_attack'],
        projectile: 'redLaser',
        abilityDamage: 117.8,
        desc: 'Deal Physical damage to target enemy with a 55% chance to remove 50% Turn Meter.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hits = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            let hit = hits[0]
            if (hit > 0 && Math.random() < 0.55) {
                await TMchange(actionInfo.battleBro, actionInfo.target, -50)
            }
        }
    },
    'wookieRage': {
        displayName: 'Wookie Rage',
        image: 'images/abilities/clonewarschewbacca_wookierage.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['buff_gain'],
        desc: 'Chewbacca Taunts and gains 2 stacks of Health Up for 2 turns.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            await applyEffect(actionInfo.withSelfAsTarget(), 'taunt', 2, 1, false, true);
            await applyEffect(actionInfo.withSelfAsTarget(), 'healthUp', 2, 2);
        }
    },
    'defiantRoar': {
        displayName: 'Defiant Roar',
        image: 'images/abilities/clonewarschewbacca_defiantroar.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['dispel', 'health_recovery', 'buff_gain', 'turnmeter_recovery'],
        desc: 'Chewbacca recovers 40% of his Max Health and gains Defense Up for 3 Turns, with a 25% Chance to also gain 25% Turn Meter.',
        zeta_desc: 'Chewbacca dispels all debuffs from himself, recovers 50% of his Max Health, gains Defense Up for 3 Turns, and has a 50% Chance to gain 25% Turn Meter.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            await dispel(actionInfo.withSelfAsTarget(), 'debuff')
            await heal(actionInfo.withSelfAsTarget(), actionInfo.battleBro.maxHealth * 0.5)
            await applyEffect(actionInfo.withSelfAsTarget(), 'defenceUp', 3);
            if (Math.random() < 0.5) {
                await TMchange(actionInfo.battleBro, actionInfo.battleBro, 25)
            }
        }
    },
    'ataru': {
        displayName: 'Ataru',
        image: 'images/abilities/ability_grandmasteryoda_basic.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'turnmeter_recovery', 'buff_gain', 'special_damage', 'debuff_gain'],
        abilityDamage: 208,
        desc: 'Deal Special damage to target enemy and inflict Potency Down for 1 Turn. If that enemy has 50% or more Health, Yoda gains 40% Turn Meter and Foresight for 2 turns. If that enemy has less than 50% Health, Yoda gains Offense Up and Defense Penetration Up for 2 turns.',
        use: async function (actionInfo) {
            let hits = await dealDmg(actionInfo, this.abilityDamage, 'special')
            let hit = hits[0]
            if (hit > 0) {
                await applyEffect(actionInfo, 'potencyDown', 1);
            }
            if (actionInfo.target.health >= actionInfo.target.maxHealth * 0.5) {
                await TMchange(actionInfo.battleBro, actionInfo.battleBro, 40)
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
    'masterstroke': {
        displayName: 'Masterstroke',
        image: 'images/abilities/ability_grandmasteryoda_special01.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'bonus_turn', 'special_damage', 'buff_gain', 'copy'],
        abilityDamage: 60.2,
        desc: 'Deal Special damage to all enemies. Then, for each buff an enemy has, Grand Master Yoda gains that effect for 3 turns. (Unique status effects can\'t be copied.) Grand Master Yoda takes a bonus turn as long as there is one other living Jedi ally.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            const enemies = aliveBattleBros // multi-enemy-team functionality
                .filter((_, i) => i !== actionInfo.battleBro.team) // removes this character's team from the array
                .flat() // flattens nested arrays into just one
            for (let enemy of enemies) {

                let actionInfo_targetEnemy = actionInfo.setTarget(enemy)
                await dealDmg(actionInfo_targetEnemy, this.abilityDamage, 'special')
                let copiedEffects = enemy.buffs.filter(effect => effect.type === 'buff' && effect.isLocked !== true)
                for (let buff of copiedEffects) {
                    await applyEffect(actionInfo.withSelfAsTarget(), buff.name, 3)
                }
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team].filter(ally => ally !== actionInfo.battleBro)) {
                if (infoAboutCharacters[ally.character].tags.includes('jedi') == true) {
                    actionInfo.battleBro.turnMeter += 100
                    return
                }
            }
        }
    },
    'unstoppableForce': {
        displayName: 'Unstoppable Force',
        image: 'images/abilities/ability_grandmasteryoda_special02.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['attack', 'debuff_gain', 'special_damage'],
        abilityDamage: 299.9,
        desc: 'Deal Special damage to target enemy and remove 70% Turn Meter. If that enemy had less than 100% Health, they are also Stunned for 1 turn.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'special')
            if (hit[0] > 0) {
                await TMchange(actionInfo.battleBro, actionInfo.target, -70)
                if (actionInfo.target.health < actionInfo.target.maxHealth) await applyEffect(actionInfo, 'stun', 1)
            }
        }
    },
    'battleMeditation': {
        displayName: 'Battle Meditation',
        image: 'images/abilities/ability_grandmasteryoda_special03.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['turnmeter_recovery', 'buff_gain'],
        desc: 'Yoda gains Tenacity Up, Protection Up (30%), and Foresight for 2 turns, then grants each ally every non-unique buff he has (excluding Stealth and Taunt) for 2 turns. Yoda grants himself +35% Turn Meter and an additional +10% Turn Meter for each other living Jedi ally.',
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            await applyEffect(actionInfo.withSelfAsTarget(), 'tenacityUp', 2)
            await applyEffect(actionInfo.withSelfAsTarget(), 'protectionUp', 2, 2)
            await applyEffect(actionInfo.withSelfAsTarget(), 'foresight', 2)
            const copiedEffects = actionInfo.battleBro.buffs.filter(effect => effect.type === 'buff' && effect.isLocked !== true)
            let bonusTurnMeter = 0
            for (let ally of aliveBattleBros[actionInfo.battleBro.team].filter(ally => ally !== actionInfo.battleBro)) {
                for (let buff of copiedEffects) {
                    await applyEffect(actionInfo.withTarget(ally), buff.name, 2)
                }
                if (infoAboutCharacters[ally.character].tags.includes('jedi') == true) {
                    bonusTurnMeter += 10
                }
            }
            await TMchange(actionInfo.battleBro, actionInfo.battleBro, 35 + bonusTurnMeter)
        }
    },
    'invincibleAssault': {
        displayName: 'invincibleAssault',
        image: 'images/abilities/ability_macewindu_basic.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'special_damage'],
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
                await TMchange(actionInfo.battleBro, actionInfo.battleBro, 15)
            } else {
                await heal(actionInfo.withSelfAsTarget(), hit[0] + hit2[0])
            }
        }
    },
    'smite': {
        displayName: 'smite',
        image: 'images/abilities/ability_macewindu_special01.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'special_damage'],
        abilityDamage: 184,
        desc: "Mace Windu deals Special damage to target enemy and dispels all buffs on them. If target enemy had Shatterpoint, Stun them for 1 turn and remove 50% Turn Meter, then Mace gains 50% Turn Meter.",
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let enemyHadShatterpoint = actionInfo.target.buffs?.find(e => e.name === 'shatterpoint')
            await dispel(actionInfo, 'buff')
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'special')
            if (enemyHadShatterpoint) {
                await applyEffect(actionInfo, 'stun', 1)
                await TMchange(actionInfo.battleBro, actionInfo.target, -50)
                await TMchange(actionInfo.battleBro, actionInfo.battleBro, 50)
            }
        }
    },
    'thisPartysOver': {
        displayName: "This party's over",
        image: 'images/abilities/ability_macewindu_special02.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['target_ally', 'attack', 'special_damage'],
        abilityDamage: 184,
        desc: "Deal Special damage to target enemy and call target other ally to assist. If target enemy had Shatterpoint and target ally is Galactic Republic, swap Turn Meter with target ally. If target enemy had Shatterpoint and target ally is Jedi, Mace gains 2 stacks of Resilient Defense (max 8) for the rest of the encounter. Both Mace and target ally recover 30% Protection.",
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'special')
        },
        allyUse: async function (battleBro, ally, target) {
            await logFunctionCall('method: allyUse (', ...arguments,)
            let enemyHadShatterpoint = target.buffs?.find(e => e.name == 'shatterpoint')
            let actionInfo = new ActionInfo({ battleBro: ally, target: target })
            await assist(actionInfo, battleBro)
            await heal(actionInfo, ally.maxProtection * 0.3, 'protection')
            await heal(actionInfo.withSelfAsTarget(), battleBro.maxProtection * 0.3, 'protection')
            if (enemyHadShatterpoint) {
                await TMchange(ally, battleBro, ally.turnMeter)
                await TMchange(battleBro, ally, 100 - ally.turnMeter)
                console.log(100 - ally.turnMeter)
                await applyEffect(actionInfo.withSelfAsTarget(), 'resilientDefence', 999, 2) // infinite duration effects = 999 duration
            }
        }
    },
    'Draining Strike': {
        displayName: 'Draining Strike',
        image: 'images/abilities/ability_talia_basic.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage'],
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
                heal(actionInfo.withTarget(ally), hit)
            }
        }
    },
    // --------------------------------------------------------OLIV'S CHARACTERS
    'Lethal Swing': {
        displayName: "Lethal Swing",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage'],
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
        displayName: "Piercing Edge",
        image: 'images/abilities/superStriker2.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'physical_damage'],
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
        displayName: "Disruptor Blade",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['attack', 'physical_damage'],
        abilityDamage: 135,
        use: async function (actionInfo) {
            await logFunctionCall('method: use (', ...arguments,)
            let locked = false
            if (actionInfo.target.buffs.find(effect => effect.name === 'targetLock')) {
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
        displayName: "Super Strike",
        image: 'images/abilities/superStrike.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['attack', 'physical_damage', 'initialCooldown'],
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
    // --------------------------------------------------------JAMES' CHARACTERS
    'Cloning Strike': {
        displayName: "Cloning Strike",
        image: 'images/abilities/shadowMenaceOriginal1.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage', 'healthSteal'],
        abilityDamage: 45,
        desc: 'Deal physical damage 5 times to target enemy and recover health equal to the damage dealt. On 3 or more critical hits inflict offense down for 3 turns.',
        use: async function (actionInfo) {
            let hits = []
            for (let i = 0; i < 5; i++) {
                hits[i] = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            }
            let critCounter = 0
            for (let hit in hits) {
                if (hit[1] == true) {
                    critCounter++
                }
            }
            if (critCounter >= 3) {
                await applyEffect(actionInfo, 'offenceDown', 3)
            }
        },
    },
    'Sabre Storm': {
        displayName: "Sabre Storm",
        image: 'images/abilities/shadowMenaceOriginal2.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'ultra_damage'],
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
        displayName: "Rotating Blades",
        image: 'images/abilities/shadowMenaceOriginal3.png',
        abilityType: 'special',
        cooldown: 7,
        abilityTags: ['buffGain'],
        desc: 'Gain the Rotation effect and defense up for 4 turns, and recover 35% protection. Rotating: Reflect projectile attacks such as blaster shots, absorb force/magic attacks, and reduce melee attacks by 50%.',
        use: async function (actionInfo) {
            await heal(actionInfo.withSelfAsTarget(), actionInfo.battleBro.maxProtection * 0.35, 'protection')
            await applyEffect(actionInfo.withSelfAsTarget(), 'rotating', 4)
            await applyEffect(actionInfo.withSelfAsTarget(), 'defenceUp', 4)
        }
    },
    'Cut it short': {
        displayName: "Cut it short",
        image: 'images/abilities/shadowMenaceOriginal4.png',
        abilityType: 'special',
        cooldown: 10,
        abilityTags: ['buffGain'],
        desc: 'Shadow menace gains a bonus turn and heals all allies by 20% of their max health for each fallen ally. Shadow menace gains 1 stack of fallen ally for each fallen ally. Fallen ally When attacking an enemy revive a random fallen ally with 1 health who assists dealing 10% damage for each stack. Then defeat these allies.',
        use: async function (actionInfo) {
            await TMchange(actionInfo.battleBro, actionInfo.battleBro, 100) // bonus turn
            let fallenAllies = battleBros.filter(bro => bro.team === actionInfo.battleBro.team && bro.isDead === true)
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                await heal(actionInfo.withTarget(ally), ally.maxHealth * 0.2 * fallenAllies.length)
            }
            await applyEffect(actionInfo.withSelfAsTarget(), 'fallenAlly', 999, fallenAllies.length, false, true) // infinite duration effects = 999 duration
        },
    },
    // --------------------------------------------------------ANGRY BIRDS EPIC CHARACTERS
    'Dragon Strike': {
        displayName: "Dragon Strike",
        image: 'images/abilities/dragonStrike.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage'],
        abilityDamage: 50,
        desc: 'Deals physical damage thrice.',
        use: async function (actionInfo) {
            for (let i = 0; i < 3; i++) {
                await dealDmg(actionInfo, this.abilityDamage, 'physical')
            }
        },
    },
    'Defensive Formation': {
        displayName: "Defensive Formation",
        image: 'images/abilities/defensiveFormation.png',
        abilityType: 'special',
        cooldown: 2,
        abilityTags: ['target_ally', 'buffGain'],
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
        displayName: "Heroic Strike",
        image: 'images/abilities/ability_darthvader_basic.png',
        abilityType: 'special',
        cooldown: 6,
        abilityTags: ['attack', 'physical_damage', 'initialCooldown'],
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
    // --------------------------------------------------------KRAYT RAID
    'jangoUnscrupulousGunfire': {
        displayName: "Unscrupulous Gunfire",
        image: 'images/abilities/ability_jangofett_basic.png',
        desc: "Deal Physical damage to target enemy and gain 15% Offense for each enemy suffering a debuff during this attack. If the target enemy was suffering a debuff, Jango Fett attacks again.",
        abilityDamage: (6823 + 7541) / 2, // "6823 - 7541"
        abilityDamageVariance: -(6823 - 7541) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'dathchaHitAndRun': {
        displayName: "HitAndRun",
        image: 'images/abilities/ability_dathcha_basic.png',
        desc: "",
        abilityDamage: (5921 + 6543) / 2,
        abilityDamageVariance: -(5921 - 6543) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'bobaEE3Carbine': {
        displayName: "EE-3 Carbine",
        image: 'images/abilities/ability_bobafett_basic.png',
        desc: "",
        abilityDamage: (6813 + 7529) / 2,
        abilityDamageVariance: -(6813 - 7529) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'cadBaneGunSlinger': {
        displayName: "Gun Slinger",
        image: 'images/abilities/ability_cadbane_basic.png',
        desc: "",
        abilityDamage: (5898 + 6518) / 2,
        abilityDamageVariance: -(5898 - 6518) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'mandoSwiftShot': {
        displayName: "Swift Shot",
        image: 'images/abilities/ability_mandalorian_basic.png',
        desc: "",
        abilityDamage: (6622 + 7318) / 2,
        abilityDamageVariance: -(6622 - 7318) / 2,
        // New
        needsEnemyTarget: 1,
    },
    'kraytBasicAttack': {
        displayName: "Krayt 1",
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
        displayName: "Acid Puke",
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
        displayName: "Eat Enemy",
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
        displayName: "Burrow",
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
        displayName: "Unburrow",
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
        displayName: 'Battle mooditation',
        image: 'images/abilities/ability_grandmasteryoda_special01.png',
        desc: 'jabba\'s blubber grants him 50% counter chance',
        abilityType: 'unique',
        abilityTags: [],
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
            return "ok"
        }
    },
    'wookieResolve': {
        displayName: 'Wookie Resolve',
        image: 'images/abilities/abilityui_passive_def.png',
        desc: 'All allies have +50 Defense, and a 50% chance to gain Defense Up for 3 turns whenever they are damaged.',
        omicron_desc: 'At the start of battle, if no allies are galactic legends, allied light side tanks gain Max Health and Protection equal to 50% of Chewbacca\'s Max Health and Protection and Chewbacca gains bonus Max Health and Protection equal to 20% of every allied light side tank\'s max health and protection.',
        abilityType: 'leader',
        abilityTags: ['buff_gain', 'grand_arena_omicron'],
        start: async function (actionInfo) {
            await logFunctionCall('method: start (', ...arguments,)
            let owner = actionInfo?.battleBro

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw('owner is not the battleBro in attacked passive')
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
                throw('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw('target is not the target in attacked passive')
            if (attacker !== actionInfo.parentActionInfo.battleBro)
                throw('attacker is not the attacker in attacked passive')

            if (Math.random() < 0.5 && owner.team == target.team) {
                let actionInfo = new ActionInfo({ battleBro: owner, target: target })
                await applyEffect(actionInfo, 'defenceUp', 3)
            }
        }
    },
    'grandMastersGuidance': {
        displayName: 'Grand Master\'s Guidance',
        image: 'images/abilities/abilityui_passive_removeharmful.png',
        desc: 'Jedi allies have +25% Tenacity. Whenever a Jedi ally Resists a debuff, they gain 25% Turn Meter.',
        zeta_desc: 'Jedi allies have +30% Tenacity. Whenever a Jedi ally Resists a debuff, they gain the following: 30% Turn Meter, Critical Chance Up for 2 turns, and Critical Damage Up for 2 turns. Whenever they suffer a debuff, they gain Tenacity Up for 1 turn at the end of that turn. Grand Master Yoda is immune to Shock.',
        omicron_desc: 'At the start of battle if there are no galactic legends and all allies are Galactic Republic Jedi, the leadership abilities of all other allies are active until the end of battle.',
        abilityType: 'leader',
        abilityTags: ['buff_gain', 'grand_arena_omicron'],
    },
    'takeaSeat': {
        displayName: 'Take a Seat',
        image: 'images/abilities/abilityui_passive_takeaseat.png',
        desc: 'Jedi allies gain 20% Max Health and Offense, and recover 10% of their Health when they score a critical hit.',
        abilityType: 'leader',
        abilityTags: ['health_recovery'],
        start: async function (actionInfo, owner) {
            await logFunctionCall('method: start (', ...arguments,)

            // Checking new actionInfo values
            if (owner !== actionInfo.battleBro)
                throw('owner is not the battleBro in attacked passive')
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
                throw('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw('target is not the target in attacked passive')
            if (attacker !== actionInfo.parentActionInfo.battleBro)
                throw('attacker is not the attacker in attacked passive')
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
    'vaapad': {
        displayName: 'Vaapad',
        image: 'images/abilities/abilityui_passive_def.png',
        zeta_desc: 'Mace gains 30% Max Health. At the end of each turn, if another ally with Protection was damaged by an attack that turn, Mace gains 3 stacks of Resilient Defense (max 8) for the rest of the encounter if he has not gained Resilient Defense this way since his last turn. While Mace has Resilient Defense, he has +10% Offense per stack and 100% counter chance. Whenever Mace gains Taunt, he dispels it and gains 2 stacks of Resilient Defense.\n Resilient Defense: Enemies will target this unit; lose one stack when damaged by an attack',
        abilityType: 'unique',
        abilityTags: ['dispel', 'buff_gain'],
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
                throw('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw('target is not the target in attacked passive')
            if (attacker !== actionInfo.parentActionInfo.battleBro)
                throw('attacker is not the attacker in attacked passive')
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
                throw('owner is not the battleBro in attacked passive')
            if (target !== actionInfo.parentActionInfo.target)
                throw('target is not the target in attacked passive')
            // We can start using those definitions:
            var owner = actionInfo.battleBro
            var target = actionInfo.parentActionInfo.target

            if (effect.name === 'taunt' && target == owner) {
                await removeEffect(actionInfo, owner, null, 'taunt')
                await applyEffect(new ActionInfo({ target: owner }), 'resilientDefence', 999, 2)
            }
        }
    },
    'senseWeakness': {
        displayName: 'Sense Weakness',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        zeta_desc: 'Mace gains 30% Offense. At the start of Mace\'s turn, dispel Stealth on all enemies and a random enemy (excluding raid bosses and Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. Shatterpoint is dispelled at the end of each ally\'s turn. When an ally damages an enemy with Shatterpoint, all allies recover 10% Protection, and all Jedi allies gain Foresight for 1 turn. \n Shatterpoint: Receiving damage dispels Shatterpoint and reduces Defense, Max Health, and Offense by 10% for the rest of the encounter; enemies can ignore Taunt to target this unit',
        omicron_desc: 'At the start of each other Light Side ally\'s turn, a random enemy (excluding Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. When an ally damages an enemy with Shatterpoint, all allies gain 5% Turn Meter.',
        abilityType: 'unique',
        abilityTags: ['territory_war_omicron', 'dispel', 'debuff_gain', 'protection_recovery', 'turnmeter_recovery'],
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
    'Elimination Protocol': {
        displayName: 'Elimination Protocol',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'Super Striker has +25% Critical Chance and +30% Defense Penetration. Whenever he attacks an enemy with Target Lock, he gains +10% Offense (stacking, max 50%) for the rest of the encounter. If Super Striker defeats an enemy, he gains Stealth for 1 turn and resets the cooldown of Super Strike. While Stealthed, Super Striker gains +100% Accuracy and his attacks deal +20% damage.',
        abilityType: 'unique',
        abilityTags: ['cooldownReset'],
        start: async function (actionInfo, owner) {
            await logFunctionCall('method: start (', ...arguments,)
            owner.critChance += 25
            owner.defencePenetration += 30
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
            await logFunctionCall('method: attacked (', ...arguments,)
            await createLimitedAction({
                limitedActions: {
                    action: {
                        fn(owner, target, attacker) {
                            console.log('' + attacker)
                            if (owner === attacker && target.buffs.find(e => e.name === 'targetLock')) {
                                owner.physicalDamage += 10;
                                owner.specialDamage += 10;
                                //console.log('thing1 buffAttack applied');
                                return true
                            }
                            return false
                        },
                        limit: 5,
                    }
                }
            })
        }
    },
    'Prime Era': {
        displayName: 'Prime Era',
        image: 'images/abilities/shadowMenaceOriginal5.png',
        desc: 'Shadow menace grants a random ally heal over time whenever he critically hits an enemy. He gains +0.5% max health every time he gains a stack of heal over time, and half that much whenever an ally gains heal over time. Heal over times last for 3 turns.',
        abilityType: 'unique',
        abilityTags: ['health_recovery'],
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            if (owner === attacker && crit === true) {
                let randomAlly = aliveBattleBros[owner.team][Math.floor(Math.random() * aliveBattleBros[owner.team].length)]
                await applyEffect(actionInfo.withTarget(randomAlly), 'healOverTime', 3)
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
    'Prime Era Old': {
        displayName: 'Prime Era',
        image: 'images/abilities/shadowMenaceOriginal5.png',
        desc: 'Shadow menace grants his allies heal over time whenever he critically hits an enemy. He gains +0.5% max health every time he gains a stack of heal over time. Whenever an ally with heal over time hits an enemy, they gain another stack of it. These heal over times recover 5% health each turn for 3 turns.',
        abilityType: 'unique',
        abilityTags: ['health_recovery'],
        damaged: async function (actionInfo, owner, target, attacker, dealtdmg, type, crit, hitPointsRemaining) {
            if (owner === attacker && crit === true) {
                for (let ally of aliveBattleBros[owner.team]) {
                    await applyEffect(actionInfo.withTarget(ally), 'healOverTime', 3)
                }
            }
            if (owner.team == attacker.team && attacker.buffs.find(e => e.name == 'healOverTime') && target.team !== owner.team) {
                await applyEffect(actionInfo.withTarget(attacker), 'healOverTime', 3)
            }
        },
        gainedEffect: async function (actionInfo, owner, target, effect) {
            if (owner === target && effect.name === 'healOverTime') {
                owner.maxHealth += owner.maxHealth * 0.005 // increase max health by 0.5%
            }
        }
    },
    'Reign of Mandalore': {
        displayName: 'Reign of Mandalore',
        image: 'images/abilities/shadowMenaceOriginal6.png',
        desc: 'All mandalorian allies have the Power of Mandalore buff at the start of the battle for 1 turn. Power of Mandalore: When an ability is used then gain all up buffs for 3 turns. If these buffs are dispelled, gain 5% turn metre for each buff dispelled.',
        abilityType: 'unique',
        abilityTags: ['buffGain','mandalorian'],
        start: async function (actionInfo, owner) {
            for (let ally of aliveBattleBros[owner.team].filter(unit => infoAboutCharacters[unit.character].tags.includes('mandalorian'))) {
                await applyEffect(actionInfo.withTarget(ally), 'powerOfMandalore', 4)
            }
        },
    },
}

const infoAboutEffects = {
    'accuracyUp': {
        name: 'accuracyUp',
        image: 'images/effects/accuracyUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'accuracy'],
        opposite: 'accuracyDown',
        apply: async function (actionInfo, unit) {
            unit.accuracy += 100
        },
        remove: async function (actionInfo, unit) {
            unit.accuracy -= 100
        }
    },
    'criticalChanceUp': {
        name: 'criticalChanceUp',
        image: 'images/effects/criticalChanceUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'critChance'],
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
        effectTags: ['stack', 'up', 'critDamage'],
        opposite: 'criticalDamageDown',
        apply: async function (actionInfo, unit) {
            unit.critDamage += 50
        },
        remove: async function (actionInfo, unit) {
            unit.critDamage -= 50
        }
    },
    'defenceUp': {
        name: 'defenceUp',
        image: 'images/effects/defenceUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'defence'],
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
        effectTags: ['stack', 'up', 'defence'],
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
        effectTags: ['stack', 'up', 'evasion'],
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
        effectTags: ['stack', 'fallenAlly'],
        apply: async function (actionInfo, unit) {
            // create memory space
            if (!unit.customData) unit.customData = {}
            if (!unit.customData.fallenAlly) unit.customData.fallenAlly = unit.customData.fallenAlly || {
                alliesAlreadySummoned: [],
            }
        },
        remove: async function (actionInfo, unit) {
            unit.customData.fallenAlly = null // clear the memory space
        },
        usedAbility: async function (actionInfo, unit, effect, abilityName, user, target, type, dmgPercent) {
            if (unit == user && infoAboutAbilities[abilityName].abilityTags.includes('attack')) {
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
                await assist(assistActionInfo, unit, stackCount*10) // assist with the fallen ally
            }
        },
        endedAbility: async function (actionInfo, unit, effect, abilityName, user, target, type, dmgPercent, savedActionInfo) {
            if(unit?.customData?.fallenAlly?.alliesAlreadySummoned) unit.customData.fallenAlly.alliesAlreadySummoned = [] // clear the memory space at the end of the attack
        },
    },
    'foresight': {
        name: 'foresight',
        image: 'images/effects/foresight.png',
        type: 'buff',
        effectTags: ['stack', 'singleUse', 'loseOnDodge', 'evasion'],
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
        effectTags: ['stack', 'healOverTime'],
        opposite: 'damageOverTime',
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let healInfo = new ActionInfo({ target: unit })
                await heal(healInfo, unit.maxHealth * 0.05)
            }
        }
    },
    'healthStealUp': {
        name: 'healthStealUp',
        image: 'images/effects/healthStealUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'healthSteal'],
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
        effectTags: ['stack', 'up', 'maxHealth', 'heal'],
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
        effectTags: ['stack', 'up', 'offence'],
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
        effectTags: ['stack', 'up', 'potency'],
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
        effectTags: ['stack', 'buffGain'],
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
        effectTags: ['stack', 'up', 'accuracy', 'critChance', 'critDamage', 'defencePenetration', 'defence', 'evasion', 'healthSteal', 'maxHealth', 'offence', 'potency', 'maxProtection', 'protection', 'speed', 'tenacity'],
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
        effectTags: ['stack', 'up', 'protection', 'protectionHeal'],
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
    'resilientDefence': {
        name: 'resilientDefence',
        image: 'images/effects/resilientDefence.png',
        type: 'buff',
        effectTags: ['stack', 'taunt', 'target', 'loseOnHit'],
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.taunting = true
            await removeEffect(actionInfo, unit, 'stealth')
            if (battleBros.filter(battleBro => battleBro.team == unit.team).filter(battleBro => battleBro.taunting == true).length == 1) await changingTarget(unit) // don't switch the target if there's another member of this character's team taunting
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            if (!(unit.buffs.find(e => e.effectTags.includes('taunt')))) {
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
    'rotating': {
        name: 'rotating',
        image: 'images/effects/rotating.png',
        type: 'buff',
        effectTags: ['deflection'],
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
            if (infoAboutAbilities[actionInfo.abilityName].abilityTags.includes('projectile_attack')) {
                unit.customData.rotating.wasTriggered = true // mark that this effect was triggered
                unit.customData.rotating.savedFlatDamageReceived = unit.flatDamageReceived // save the flat damage received before it is set to 0
                unit.flatDamageReceived=0 // deflects all projectile attacks
            } else if (infoAboutAbilities[actionInfo.abilityName].abilityTags.includes('attack')) {
                unit.customData.rotating.wasTriggered = true // mark that this effect was triggered
                unit.customData.rotating.savedFlatDamageReceived = unit.flatDamageReceived // save the flat damage received before it is set to 0
                unit.flatDamageReceived/=2 // reduces other attacks by 50%
            }
        },
        endOfDamage: async function (actionInfo, unit, effect, target, attacker) {
            if( unit.customData?.rotating?.wasTriggered) {
                unit.flatDamageReceived = unit.customData.rotating.savedFlatDamageReceived // restore the flat damage received
                unit.customData.rotating.wasTriggered = false // reset the flag
            }
        },
    },
    'speedUp': {
        name: 'speedUp',
        image: 'images/effects/speedUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'speed'],
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
        effectTags: ['stealth', 'target'],
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
        effectTags: ['taunt', 'target'],
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
        effectTags: ['stack', 'up', 'tenacity'],
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
    // ----------------------------------------------------------------- DEBUFFS -----------------------------------------------------------------
    'abilityBlock': {
        name: 'abilityBlock',
        image: 'images/effects/abilityBlock.png',
        type: 'debuff',
        effectTags: ['stifle', 'abilityBlock'],
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
        effectTags: ['stack', 'down', 'accuracy'],
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
        effectTags: ['stack', 'speed', 'tenacity', 'maxHealth', 'loseOnHeal'],
        opposite: 'healOverTime',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)
            unit.tenacity -= 5
            unit.speedPercent -= 5
        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.tenacity += 5
            unit.speedPercent += 5
        },
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(actionInfo, 5, 'percentage', false, true, true, this.name)
                unit.maxHealth *= 0.95
            }
        }
    },
    'buffImmunity': {
        name: 'buffImmunity',
        image: 'images/effects/buffImmunity.png',
        type: 'debuff',
        effectTags: ['buffImmunity'],
        opposite: 'debuffImmunity',
    },
    'criticalChanceDown': {
        name: 'criticalChanceDown',
        image: 'images/effects/criticalChanceDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'critChance'],
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
        effectTags: ['stack', 'down', 'critDamage'],
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
        effectTags: ['stack', 'damageOverTime'],
        opposite: 'healOverTime',
        startedTurn: async function (actionInfo, unit, effect, selectedBro) {
            if (unit == selectedBro) {
                let actionInfo = new ActionInfo({ battleBro: effect.caster, target: unit })
                await dealDmg(actionInfo, 5, 'percentage', false, true, false, this.name)
            }
        }
    },
    'daze': {
        name: 'daze',
        image: 'images/effects/daze.png',
        type: 'debuff',
        effectTags: ['stopAssist', 'stopCounter', 'stopTMgain'],
        opposite: 'retribution',
    },
    'defenceDown': {
        name: 'defenceDown',
        image: 'images/effects/defenceDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'defence'],
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
    'doomed': {
        name: 'doomed',
        image: 'images/effects/doomed.png',
        type: 'debuff',
        effectTags: ['stopRevive', 'conditional'],
        opposite: 'instantDefeatImmunity',
        apply: async function (actionInfo, unit) {
            await logFunctionCall('method: apply (', ...arguments,)

        },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            if (unit.isDead == true) unit.cantRevive = true
        }
    },
    'evasionDown': {
        name: 'evasionDown',
        image: 'images/effects/evasionDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'evasion'],
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
    'fear': {
        name: 'fear',
        image: 'images/effects/fear.png',
        type: 'debuff',
        effectTags: ['stack', 'singleUse', 'loseOnHit', 'stun'],
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
    'healthDown': {
        name: 'healthDown',
        image: 'images/effects/healthDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'maxHealth'],
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
        effectTags: ['stack', 'down', 'healthSteal'],
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
    'offenceDown': {
        name: 'offenceDown',
        image: 'images/effects/offenceDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'offence'],
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
        effectTags: ['stack', 'down', 'potency'],
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
        effectTags: ['stack', 'down', 'accuracy', 'critChance', 'critDamage', 'defencePenetration', 'defence', 'evasion', 'healthSteal', 'maxHealth', 'offence', 'potency', 'maxProtection', 'protection', 'speed', 'tenacity'],
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
    'protectionDown': {
        name: 'protectionDown',
        image: 'images/effects/protectionDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'maxProtection'],
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
    'shatterpoint': {
        name: 'shatterpoint',
        image: 'images/effects/shatterpoint.png',
        type: 'debuff',
        effectTags: ['stack', 'speed', 'taunt', 'loseOnHit', 'defence', 'maxHealth', 'offence'],
        opposite: 'barrier',
        apply: async function (actionInfo, unit) { },
        remove: async function (actionInfo, unit) {
            await logFunctionCall('method: remove (', ...arguments,)
            unit.armour *= 0.9
            unit.resistance *= 0.9
            unit.maxHealth /= 1.1
            unit.health /= 1.1
            unit.offence *= 0.9
        }
    },
    'speedDown': {
        name: 'speedDown',
        image: 'images/effects/speedDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'speed'],
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
    'stun': {
        name: 'stun',
        image: 'images/effects/stun.png',
        type: 'debuff',
        effectTags: ['stun', 'evasion'],
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
        effectTags: ['targetLock'],
        opposite: 'chaff',
    },
    'tenacityDown': {
        name: 'tenacityDown',
        image: 'images/effects/tenacityDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'potency'],
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
}

async function createLimitedAction({
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
}

const argsMap = {
    start: (arg1, arg2, arg3, arg4, arg5, arg6) => [], // selects the arguments needed for the function. The first (or zeroth in this case) argument is always the owner
    damaged: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5, arg6], // target,attacker,dealtdmg,'damagetype',crit true/false, total hit points minus dealtdmg
    endOfDamage: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5, arg6], // target,attacker,dealtdmg,'damagetype',crit true/false, total hit points remaining
    attacked: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3], //target,attacker,actionInfoPLACEHOLDER
    gainedEffect: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2], // target, effect
    lostEffect: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4], // target, effect, removalType, dispeller
    startedTurn: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1], // guy who started their turn
    endedTurn: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1], // guy who ended their turn
    usedAbility: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5], // abilityName, battleBro, target, type(assist or counter etc), dmgPercent (like when reduced from assists)
    endedAbility: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5, arg6], // abilityName, battleBro, target, type(assist or counter etc), dmgPercent (like when reduced from assists), savedActionInfo
}
async function eventHandle(type, actionInfo, arg1, arg2, arg3, arg4, arg5, arg6) {
    //await logFunctionCall('eventHandle', ...arguments)
    console.log("eventHandle", type, arg1, arg2, arg3, arg4, arg5, arg6)
    if (arg1?.isDead == true || arg2?.isDead == true) return
    if (argsMap[type]) {
        const args = argsMap[type]?.(arg1, arg2, arg3, arg4, arg5, arg6)
        for (let battleBro of battleBros) {
            // Prepare actionInfo for this battleBro
            var childActionInfo = new ActionInfo({ battleBro: battleBro })  
            childActionInfo.abilityName = actionInfo?.abilityName // Copying this manually for the moment, because it is not in the ActionInfo constructor
            childActionInfo.parentActionInfo = actionInfo

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
                }
            }
        }
    }
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

async function createBattleBroVars() {
    await logFunctionCall('createBattleBroVars', ...arguments)
    for (let battleBro of battleBros) {
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
        battleBro.speedPercent = 100 // using this to manipulate speed via buffs etc
        battleBro.flatDamageDealt = 100
        battleBro.flatDamageReceived = 100
        battleBro.isDead = false
        battleBro.cantRevive = false
        battleBro.queuedAttacks = []
        battleBro.taunting = false
        battleBro.buffs = []
        battleBro.effects = []
        battleBro.passives = infoAboutCharacters[battleBro.character].passiveAbilities || []
        battleBro.passives = battleBro.passives.filter(passive => {
            return !(infoAboutPassives[passive].abilityType === 'leader' && !battleBro.isLeader);
        }) // remove leader passives of characters that aren't leaders
        battleBro.abilityImageDivs = []
        const abilities = infoAboutCharacters[battleBro.character].abilities || [];
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
        battleBro.cooldowns = {}
        for (let abilityName of infoAboutCharacters[battleBro.character].abilities) {
            const ability = infoAboutAbilities[abilityName]
            battleBro.cooldowns[abilityName] = ability.abilityTags.includes('initialCooldown') ? ability.cooldown : 0
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
    }
}

async function updateBattleBrosHtmlText() {
    await logFunctionCall('updateBattleBrosHtmlText', ...arguments)
    for (let battleBro of battleBros) {
        let avatarHtmlElement = battleBro.avatarHtmlElement
        //let broHtmlElement = battleBro.avatarHtmlElement.get(0)
        if (battleBro.health > 0 && battleBro.isDead !== true) {
            battleBro.avatarHtmlElement.children()[1].firstElementChild.firstChild.nodeValue = '' + Math.ceil(battleBro.health)
        } else if (battleBro.isDead !== true) {
            battleBro.avatarHtmlElement.children()[1].firstElementChild.firstChild.nodeValue = 'dead'
            battleBro.isDead = true
            aliveBattleBros[battleBro.team].splice(aliveBattleBros[battleBro.team].indexOf(battleBro), 1) // remove it from the array of alive guys on their team
            let actionInfo = new ActionInfo({ battleBro: battleBro })
            await removeEffect(actionInfo, battleBro, null, null, null, true)
            await switchTarget(battleBro)
            // change avatar look to be dead
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
        }
        battleBro.avatarHtmlElement.children()[3].firstElementChild.firstChild.nodeValue = '' + Math.ceil(battleBro.protection)
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
    let characterAbilities = infoAboutCharacters[battleBro.character].abilities//[0]
    if (battleBro.skillsData) {
        for (let i = 0; i < battleBro.skillsData.length; i++) {
            let processedAbility = battleBro.skillsData[i]
            let imagePngPath = processedAbility.skill.image

            // set the image png and set display=block
            //let abilityImagesDivsForCurrentTeam = abilityImagesDivsPerTeam[battleBro.team]
            //let indexReversedForTeam2 = battleBro.team == 0 ? i : (characterAbilities.length - i - 1)
            //let abilityImageDiv = abilityImagesDivsForCurrentTeam[indexReversedForTeam2]
            let index = battleBro.team === 1
                ? (battleBro.abilityImageDivs.length - i - 1)
                : i;
            let abilityImageDiv = battleBro.abilityImageDivs[index];
            let abilityImage = abilityImageDiv.find(".image_ability_cropped")
            let abilityCooldown = abilityImageDiv.find(".cooldown")[0]
            abilityImage.attr("src", imagePngPath)
            abilityImageDiv.css({ 'display': 'block' });
            if (!abilityImage.dataset) {
                abilityImage.dataset = {}
            }
            abilityImage.attr("data-mydata", JSON.stringify({
                battleBroNumber: selectedBattleBroNumber,
                abilityNumber: i,
            }))
            abilityCooldown.innerText = processedAbility.cooldown ? processedAbility.cooldown : ''
        }
    }
    await changeCooldowns(battleBro, -1)
    let characterPassives = infoAboutCharacters[battleBro.character].passiveAbilities
    if (characterPassives) {
        for (let i = 0; i < characterPassives.length; i++) {
            let processingPassive = characterPassives[i]
            let imagePngPath = infoAboutPassives[processingPassive].image

            // set the image png and set display=block
            let passiveImagesForCurrentTeam = passiveImagesPerTeam[battleBro.team]
            let passiveImage = passiveImagesForCurrentTeam[i]
            passiveImage.attr("src", imagePngPath)
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
        await createBattleBroVars()
        await createBattleBroImages()
        await updateBattleBrosHtmlText()
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
    if (battleBros[closestAvatar].buffs.find(e => e.effectTags.includes('stun'))) {
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
        if (!(target.buffs.find(effect => effect.effectTags.includes('stealth')) || target.isDead == true)) {
            await changingTarget(target)
        }
    } else if (target.buffs.find(e => e.effectTags.includes('taunt'))) {
        await changingTarget(target)
    } else {
        return
    }
}

async function switchTarget(battleBro) {
    await logFunctionCall('switchTarget', ...arguments)
    if (battleBro.isTarget == true) { // if this guy is the target, we need to set the target to another member of the same team
        let otherAllies = aliveBattleBros[battleBro.team].filter(ally => ally !== battleBro)
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
    let characterAbilities = infoAboutCharacters[battleBro.character].abilities
    let abilityName = characterAbilities[abilityNumber]
    let tags = infoAboutAbilities[abilityName].abilityTags
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
    await endTurn(actionInfo, battleBros[selectedBattleBroNumber])
    promises = []
}
async function useAbility(abilityName, actionInfo, hasTurn = false, type = 'main', dmgPercent = 100) {
    await logFunctionCall('useAbility', ...arguments)
    actionInfo.abilityName = abilityName
    let ability = infoAboutAbilities[abilityName]
    let animation = null
    if (ability.abilityTags.includes("projectile_attack")) {
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

    } else if (ability.abilityTags.includes("attack")) {
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
    let savedActionInfo = actionInfo.copy()
    await ability?.use(actionInfo)//executeAbility(abilityName, actionInfo)
    await eventHandle('endedAbility', actionInfo, abilityName, actionInfo.battleBro, actionInfo.target, type, dmgPercent, savedActionInfo)


    actionInfo.battleBro.flatDamageDealt /= dmgPercent * 0.01
    if (!abilityName || !infoAboutAbilities[abilityName]) {
        console.warn("Ability not found:", abilityName);
        return;
    }
    if (animation == 'melee') {
        await wait(200)
    }
    actionInfo.battleBro.cooldowns[abilityName] = ability.cooldown || 0
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
                    let actionInfo_assist = new ActionInfo({ battleBro: ally, target: firstQueuedAttack[0] })
                    let promise = useAbility(assistAbilityName, actionInfo_assist, false, firstQueuedAttack[1], firstQueuedAttack[2])
                    promises.push(promise) // add the ability being used to promises so we can wait for all of them to finish later
                }
            }
        }
        if (actionInfo.battleBro.queuedAttacks.length > 0) { // start bonus/counters if this character has some queued
            let firstQueuedAttack = actionInfo.battleBro.queuedAttacks[0] // target, type, dmg multipler, abilityIndex
            let nextAbilityName = infoAboutCharacters[actionInfo.battleBro.character].abilities[firstQueuedAttack[3]] // chosen ability index (usually the basic)
            let actionInfo_extra = actionInfo.withTarget(firstQueuedAttack[0])
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
    if (actionInfo.battleBro.buffs.find(effect => effect.effectTags.includes('stopAssist'))) return
    actionInfo.battleBro.queuedAttacks.unshift([actionInfo.target, 'assist', dmgPercent, abilityIndex])
}

async function addAttackToQueue(actionInfo, dmgPercent = 100, abilityIndex = 0) {
    if (actionInfo.battleBro.buffs.find(e => e.effectTags.includes('stun'))) return
    await logFunctionCall('addAttackToQueue', ...arguments)
    if (battleBros[selectedBattleBroNumber].team !== actionInfo.battleBro.team) {
        if (actionInfo.battleBro.buffs.find(effect => effect.effectTags.includes('stopCounter'))) return
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
    /*let promises = []
    for (let battleBro of battleBros) {
        if (battleBro.queuedAttacks.length > 0) {
            let abilityName = infoAboutCharacters[battleBro.character].abilities[battleBro.queuedAttacks[0][3]]
            let promise = useAbility(abilityName, battleBro, battleBro.queuedAttacks[0][0], false, battleBro.queuedAttacks[0][1]) // add AWAIT in the case of bug
            promises.push(promise)
        }
    }
    await Promise.all(promises)*/
}

/*async function engageQueuedAttacks() { await logFunctionCall('engageQueuedAttacks', ...arguments)
    for (const [type,attacker,target] of queuedAttacks) {
        let abilityName = infoAboutCharacters[attacker.character].abilities[0]
        if (await useAbility(abilityName,attacker,target,false,type)) {
            setTimeout(() => {},601)
        }
        console.log(attacker.character+' '+type+'s on '+target.character+' using '+abilityName)
    }
    console.log(queuedAttacks)
    queuedAttacks = [] // all attacks have been iterated over so we don't need them anymore
      -----------------------------------AI Generated helpful code that provides an alternate method of removing attacks from queuedAttacks
    while (queuedEffects.length > 0) {
        const [type, applier, target] = queuedEffects.shift();

        if (thing === true) {
            queuedEffects.push([newType, newApplier, newTarget]);
        }

        // No need to remove the current one — it's already removed by shift()
    }
}*/

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
    for (let i = 0; i < Math.min(numberOfSparks,250); i++) {
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

async function applyEffect(actionInfo, effectName, duration = 1, stacks = 1, resistable = true, isLocked = false) {
    actionInfo.actionDetails = {
        category: 'applyEffect',
        effectName: effectName,
        duration: duration,
        stacks: stacks,
        resistable: resistable,
        isLocked: isLocked,
    }
    if (actionInfo.target.isDead == true || actionInfo.target.buffs.find(effect => effect.effectTags.includes('buffImmunity'))) return // don't apply the effect if the target is dead
    await logFunctionCall('applyEffect', ...arguments)
    const info = infoAboutEffects[effectName];
    for (let i = 0; i < stacks; i++) {
        if (info.type == 'debuff' && resistable == true && Math.random() < (actionInfo.target.tenacity - actionInfo.battleBro.potency) * 0.01) {
            await addFloatingText(actionInfo.target.avatarHtmlElement.children()[7].firstElementChild, 'RESISTED', 'white')
            return
        }
        const effect = {
            ...info,
            duration: actionInfo.target === actionInfo.battleBro ? duration + 1 : duration, // if the caster applies effects to themself, the duration is knocked down by 1 at the end of their turn
            isLocked: isLocked,
            caster: actionInfo.battleBro,
            apply: info?.apply,
            remove: info?.remove,
        }
        actionInfo.target.buffs.push(effect)
        if (!(effect.effectTags.includes('stack') == false && actionInfo.target.buffs.filter(e => e.name == effectName).length > 1)) {
            if (effect?.apply) await effect.apply(actionInfo, actionInfo.target, effect) //the effect's apply effect activates unless it isn't stackable and there's already an effect with the same name
            await eventHandle('gainedEffect', actionInfo, actionInfo.target, effect)
            await playStatusEffectGlow(actionInfo.target.avatarHtmlElement, effectName)
            console.log('effect applied')
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
            battleBro.buffs.splice(i, 1)
            let actionInfo = new ActionInfo({ battleBro: battleBro })
            if (effect?.remove) await effect.remove(actionInfo, battleBro, effect, 'expired')
            await eventHandle('lostEffect', actionInfo, battleBro, effect, 'expired')
        }
    }
    await updateEffectIcons(battleBro);
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

        if (!effectInfo.effectTags.includes("stack")) {
            // Find the instance with the longest duration
            let longest = instances.reduce((prev, current) => {
                return (prev.duration > current.duration) ? prev : current;
            });

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

        if (effectInfo.effectTags.includes("stack")) {
            // STACKABLE: Show one icon with a counter
            displayEffects.push({
                name: effectName,
                isLocked: isLocked,
                image: effectInfo.image,
                count: instances.length,
                duration: Math.max(...instances.map(e => e.duration)), // for optional sorting or tooltip
            });
        } else {
            // NON-STACKABLE: There will only be a single instance remaining so we set that to 1
            displayEffects.push({
                name: effectName,
                isLocked: isLocked,
                image: effectInfo.image,
                count: 1, // always going to be just a single instance
                duration: Math.max(...instances.map(e => e.duration)),
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

async function dispel(actionInfo, type = null, tag = null, name = null, dispelLocked = false) {
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
        dispelledEffects = dispelledEffects.filter(effect => infoAboutEffects[effect.name].effectTags.includes(tag) == true && (effect.isLocked !== true || dispelLocked == true))
    } else if (name) { // otherwise we might be dispelling an effect with a specific name
        dispelledEffects = dispelledEffects.filter(effect => effect.name === name && (effect.isLocked !== true || dispelLocked == true))
    } else if (!type) { // dispel all effects if all of the above is null
        dispelledEffects = dispelledEffects.filter(effect => effect.isLocked !== true || dispelLocked == true)
    }

    for (let i = actionInfo.target.buffs.length - 1; i >= 0; i--) {
        const effect = actionInfo.target.buffs[i];
        if (dispelledEffects.includes(effect)) {
            actionInfo.target.buffs.splice(i, 1)
            if (effect?.remove) await effect.remove(actionInfo, actionInfo.target, effect, 'dispelled')
            await eventHandle('lostEffect', actionInfo, actionInfo.target, effect, 'dispelled', actionInfo.battleBro)
        }
    }
    await updateEffectIcons(actionInfo.target)
}

async function removeEffect(actionInfo, target, bufftag = null, name = null, type = null, all = false) {
    //console.log(target.evasion)
    let filteredEffects = target.buffs
    if (type) {
        filteredEffects = filteredEffects.filter(effect => effect.type === type)
    }
    if (bufftag) {
        filteredEffects = filteredEffects.filter(effect => infoAboutEffects[effect.name].effectTags.includes(bufftag) == true)
    } else if (name) {
        filteredEffects = filteredEffects.filter(effect => effect.name === name)
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

async function changeCooldowns(battleBro, amount = -1) {
    await logFunctionCall('changeCooldowns', ...arguments)
    /*for (let abilityName in battleBro.cooldowns) {
        if (battleBro.cooldowns[abilityName] > 0) {
            battleBro.cooldowns[abilityName] --;
            await pdateAbilityCooldownUI(battleBro, abilityName);
        }
    }*/
    for (let abilityName of infoAboutCharacters[battleBro.character].abilities) {
        //console.log(abilityName)
        if (battleBro.cooldowns[abilityName] > 0) {
            battleBro.cooldowns[abilityName] += amount;
        }
        await updateAbilityCooldownUI(battleBro, abilityName)
    }
    for (let skillData of battleBro.skillsData) {
        if (skillData.cooldown > 0) {
            skillData.cooldown += amount;
            //await updateAbilityCooldownUI(battleBro, skillData.skill.name);
        }
    }
    /*if (!!battleBro.buffs.find(effect => effect.name === 'abilityBlock')) {
        for (let abilityName of infoAboutCharacters[battleBro.character].abilities) {
            console.log(abilityName)
            await updateAbilityCooldownUI(battleBro, abilityName)
        }
    }*/
}

async function updateAbilityCooldownUI(battleBro, abilityName) {
    await logFunctionCall('updateAbilityCooldownUI', ...arguments)
    if (battleBro !== battleBros[selectedBattleBroNumber]) return;
    const cooldown = battleBro.cooldowns[abilityName] || 0

    const characterAbilities = infoAboutCharacters[battleBro.character].abilities
    const abilityIndex = battleBro.team == 0 ? characterAbilities.indexOf(abilityName) : (characterAbilities.length - characterAbilities.indexOf(abilityName) - 1)
    if (abilityIndex === -1) console.log("no ability index found")

    /*const abilityImagesDivsForCurrentTeam = abilityImagesDivsPerTeam[battleBro.team]
    const index = battleBro.team === 0 ? abilityIndex : (characterAbilities.length - abilityIndex - 1);
    const abilityImageDiv = abilityImagesDivsForCurrentTeam[index]*/
    const abilityImageDiv = battleBro.abilityImageDivs[abilityIndex]
    if (!abilityImageDiv) console.log("no ability Image Div found")
    if (!abilityImageDiv) return;

    const img = abilityImageDiv.get(0).querySelector('img');
    const cooldownSpan = abilityImageDiv.get(0).querySelector('#cooldown');

    //console.log(!!battleBro.buffs.find(effect => effect.name === 'abilityBlock'))
    //console.log(infoAboutAbilities[abilityName].abilityType !== 'basic')
    if (cooldown > 0 || (!!battleBro.buffs.find(effect => effect.name === 'abilityBlock') == true && infoAboutAbilities[abilityName].abilityType !== 'basic')) {
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

async function dealDmg(actionInfo, dmg, type, triggerEventHandlers = true, effectDmg = false, ignoreProtection = false, sourceName = null) {
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
    if (type !== 'shadow' && triggerEventHandlers == true) {
        if (!actionInfo.hitEnemies) actionInfo.hitEnemies = []
        actionInfo.hitEnemies.push(target)
        await eventHandle('attacked', actionInfo, target, user, actionInfo) // activate passive conditions upon being attacked unless the damage is shadow damage
    }
    if (Math.random() > (target.evasion - user.accuracy) * 0.01 || ['shadow', 'massive', 'percentage', 'ultra'].includes(type)) { // shadow, massive, percentage, and ultra damage can't be evaded.
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
            dealtdmg = ((dmg * physicalDamage * 0.01) * (Math.max(1 - (Math.max(target.armour - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001 // 20=100-80 where 80 is the max damage negation from defence
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
            dealtdmg = ((dmg * specialDamage * 0.01) * (Math.max(1 - (Math.max(target.resistance - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001 // uses resistance/special damage instead of armour/physical damage
            colour = 'cornflowerblue'
            secondaryColour = 'cyan'
        } else if (type === 'true') {
            dealtdmg = Math.max(dmg * user.flatDamageDealt * target.flatDamageReceived * 0.0001, 0) // nice and simple true damage doesn't have damage variance
            colour = 'white'
        } else if (type == 'ultra') {
            dealtdmg = ((dmg * (physicalDamage + specialDamage) * 0.01) * (Math.max(1 - (Math.max(target.armour + target.resistance - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001
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
            dealtdmg = ((dmg * specialDamage * 0.015) * (Math.max(1 - (Math.max(infoAboutCharacters[target.character].resistance - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * dmg * specialDamage * 0.01)) * user.flatDamageDealt * target.flatDamageReceived * 0.000001 * user.critDamage // lots of damage variance and ignores resistance buffs
            colour = 'silver'
            secondaryColour = 'platinum'
            crit = true // always crits
        } else if (type == 'shadow') {
            dealtdmg = Math.max((dmg - Math.floor(Math.random() * 501)) * Math.min(user.flatDamageDealt, 100) * Math.max(target.flatDamageReceived, 100) * 0.0001, 0)
            colour = 'midnightblue'
            secondaryColour = 'black'
        } else if (type == 'massive') {
            dealtdmg = 99999
            colour = 'white'
        } else if (type == 'percentage') {
            dealtdmg = Math.max(dmg * target.maxHealth * target.flatDamageReceived * 0.0001, 0) // in this case 'dmg' would the the percentage of health dealt as damage
            colour = 'white'
        }

        if (dealtdmg > 0) {
            await playSparkImpact(endX, endY, colour, secondaryColour, Math.ceil(dealtdmg / 625))
            // } else if (target.buffs.find(e => e.effectTags.includes('taunt'))) {
            if (type !== 'shadow' && triggerEventHandlers == true) await eventHandle('damaged', actionInfo, target, user, dealtdmg, type, crit, target.health + target.protection - dealtdmg) // passive effects upon damage that isn't shadow damage
            if (target.buffs.find(e => e.effectTags.includes('loseOnHit'))) await removeEffect(actionInfo, target, 'loseOnHit')
        }
        if (ignoreProtection == false) {
            let prot = target.protection
            target.protection -= Math.min(dealtdmg, prot)
            if (prot < dealtdmg) {
                target.health -= dealtdmg - prot
            }
            if (user.healthSteal > 0 && prot < dealtdmg && effectDmg == false) {
                await heal({ battleBro: user, target: user }, (dealtdmg - prot) * user.healthSteal * 0.01, 'health', true)
            }
        } else {
            target.health -= dealtdmg
            if (user.healthSteal > 0 && effectDmg == false) {
                await heal({ battleBro: user, target: user }, dealtdmg * user.healthSteal * 0.01, 'health', true)
            }
        }

        await addFloatingText(logElement, `-${Math.ceil(dealtdmg)}`, colour)
        if (type !== 'shadow' && triggerEventHandlers == true) await eventHandle('endOfDamage', actionInfo, target, user, dealtdmg, type, crit, target.health + target.protection - dealtdmg)
        await updateBattleBrosHtmlText()
        return [dealtdmg, crit]
    } else {
        await dodge(actionInfo, user, target)
        if (triggerEventHandlers == true) await eventHandle('endOfDamage', actionInfo, target, user, 0, type, false, target.health + target.protection)
        return [0, 'dodged']
    }
}

async function heal(actionInfo, healing, type = 'health', isHealthSteal = false) {
    await logFunctionCall('heal', ...arguments)
    actionInfo.actionDetails = {
        category: 'heal',
        type: type,
        healing: healing,
        isHealthSteal: isHealthSteal,
    }
    let user = actionInfo.battleBro
    let target = actionInfo.target
    const logElement = target.avatarHtmlElement.children()[7].firstElementChild
    if (isHealthSteal == false && target.buffs.find(e => e.effectTags.includes('loseOnHeal'))) await removeEffect(actionInfo, target, 'loseOnHeal')
    if (type == 'health') {
        await addFloatingText(logElement, `+${Math.ceil(Math.min(target.maxHealth - target.health, healing))}`, 'green');
        target.health = Math.min(target.health + healing, target.maxHealth)
    } else { // healing protection
        await addFloatingText(logElement, `+${Math.ceil(Math.min(target.maxProtection - target.protection, healing))}`, 'turquoise');
        target.protection = Math.min(target.protection + healing, target.maxProtection)
    }
}

async function TMchange(user, target, change, resistable = true) {
    if (target.buffs.find(effect => effect.effectTags.includes('stopTMgain') && change > 0)) return
    if (resistable == true && change < 0 && Math.random() < (target.tenacity - user.potency) * 0.01) {
        await addFloatingText(target.avatarHtmlElement.children()[7].firstElementChild, 'RESISTED', 'white')
        return
    }
    target.turnMeter += change
    target.turnMeter = (target.turnMeter < 0) ? 0 : target.turnMeter // turn meter shouldn't be less than 0
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
    console.log('Attack: ' + inputs.battleBroNumber + ' uses ' + inputs.skill.displayName + (inputs.targetedEnemy ? ' on ' + inputs.targetedEnemy.character : ''))
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