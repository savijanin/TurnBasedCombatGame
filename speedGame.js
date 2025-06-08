var selectedBattleBroNumber = -1
var team2abilitiesAlwaysVisible = false
var pendingAbility = null
//var isAnythingElseRunningHereAtTheSameTime = 0
var engagingCounters = false
const wait = ms => new Promise(res => setTimeout(res, ms))

var battleBros = [
    // Team 0 (left side)
    {
        id: "01",
        character: 'jabba',
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
        character: 'jabba',
        x: 400,
        y: 300,
        team: 0,
        isLeader: false,
    },
    {
        id: "03",
        character: 'CloneWarsChewbacca',
        x: 400,
        y: 500,
        team: 0,
        isLeader: true,
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
        character: 'Mace Windu',
        x: 250,
        y: 200,
        team: 0,
        isLeader: false,
    },
    {
        id: "06",
        character: 'jabba',
        x: 250,
        y: 400,
        team: 0,
        isLeader: false,
    },
    {
        id: "07",
        character: 'jabba',
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
        character: 'jabba',
        x: 1400,
        y: 100,
        team: 1,
        isLeader: false,
    },
    {
        id: "12",
        character: 'jabba',
        x: 1400,
        y: 300,
        team: 1,
        isLeader: false,
    },
    {
        id: "13",
        character: 'jabba',
        x: 1400,
        y: 500,
        team: 1,
        isLeader: false,
    },
    {
        id: "14",
        character: 'Super Striker',
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
        character: 'jabba',
        x: 1550,
        y: 400,
        team: 1,
        isLeader: false,
    },
    {
        id: "17",
        character: 'jabba',
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
        speed: 111,
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
    'CloneWarsChewbacca': {
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
    'Super Striker': {
        image: 'images/avatars/superStriker.png',
        imageSize: 100,
        health: 28450,
        protection: 0,
        speed: 172,
        potency: 55,
        tenacity: 22,
        critChance: 80.23,
        physicalDamage: 2447,
        specialDamage: 3570,
        armour: 23.36,
        resistance: 32.34,
        healthSteal: 20,
        tags: ['neutral', 'attacker', 'mercenary', 'oliv', 'unalignedForceUser'],
        abilities: ['Lethal Swing', 'Piercing Edge', 'Disruptor Blade', 'Super Strike'],
        passiveAbilities: ['Elimination Protocol'],
        charDesc: 'Powerful foe who crushes enemies with repeated target locks and combos down upon killing an enemy.',
    },
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
        use: async function (battleBro, target) {
            await dealDmg(battleBro, target, this.abilityDamage, 'physical')
            await applyEffect(battleBro, battleBro, 'offenceUp', 2);
        }
    },
    'test2': {
        displayName: 'Jabba take a seat',
        image: 'images/abilities/abilityui_passive_takeaseat.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'special_damage', 'health_recovery', 'target_ally'],
        abilityDamage: 160,
        desc: 'Heal target ally + special dmg dealt',
        use: async function (battleBro, target) {
            await dealDmg(battleBro, target, this.abilityDamage, 'special')
            // insert target ally part
            console.log('Waiting for ally target...')
        },
        allyUse: async function (battleBro, ally) {
            await heal(battleBro, ally, battleBro.physicalDamage)
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
        use: async function (battleBro, target) {
            let hits = await dealDmg(battleBro, target, this.abilityDamage, 'physical')
            let hit = hits[0]
            if (hit > 0 && Math.random() < 0.55) {
                await TMchange(battleBro, target, -50)
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
        use: async function (battleBro, target) {
            await applyEffect(battleBro, battleBro, 'taunt', 2, true);
            await applyEffect(battleBro, battleBro, 'healthUp', 2);
            await applyEffect(battleBro, battleBro, 'healthUp', 2);
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
        use: async function (battleBro, target) {
            await dispel(battleBro, battleBro, 'debuff')
            await heal(battleBro, battleBro, battleBro.maxHealth * 0.5)
            await applyEffect(battleBro, battleBro, 'defenceUp', 3);
            if (Math.random() < 0.5) {
                await TMchange(battleBro, battleBro, 25)
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
        use: async function (battleBro, target) {
            let hits = await dealDmg(battleBro, target, this.abilityDamage, 'special')
            let hit = hits[0]
            if (hit > 0) {
                await applyEffect(battleBro, target, 'potencyDown', 1);
            }
            if (target.health >= target.maxHealth * 0.5) {
                await TMchange(battleBro, battleBro, 40)
                await applyEffect(battleBro, battleBro, 'foresight', 2);
            } else {
                await applyEffect(battleBro, battleBro, 'offenceUp', 2);
                await applyEffect(battleBro, battleBro, 'defencePenetrationUp', 2);
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
        use: async function (battleBro, target) {
            for (let enemy of battleBros) {
                if (enemy.team !== battleBro.team) {
                    await dealDmg(battleBro, enemy, this.abilityDamage, 'special')
                    let copiedEffects = enemy.buffs.filter(effect => effect.type === 'buff' && effect.isLocked !== true)
                    console.log(copiedEffects)
                    for (let buff of copiedEffects) {
                        console.log(buff)
                        await applyEffect(battleBro, battleBro, buff.name, 3)
                    }
                }
            }
            for (let ally of battleBros.filter(ally => ally.team == battleBro.team && ally !== battleBro)) {
                if (infoAboutCharacters[ally.character].tags.includes('jedi') == true) {
                    battleBro.turnMeter += 100
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
        use: async function (battleBro, target) {
            let hit = await dealDmg(battleBro, target, this.abilityDamage, 'special')
            if (hit[0] > 0) {
                await TMchange(battleBro, target, -70)
                if (target.health < target.maxHealth) await applyEffect(battleBro, target, 'stun', 1)
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
        use: async function (battleBro, target) {

        }
    },
    'invincibleAssault': {
        displayName: 'invincibleAssault',
        image: 'images/abilities/ability_macewindu_basic.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'special_damage'],
        abilityDamage: 154.3,
        desc: "Meal Special damage to target enemy and inflict Ability Block for 1 turn. This attack deals bonus damage equal to 5% of Mace's Max Health. If Mace is above 50% Health, he gains 15% Turn Meter. If Mace is below 50% Health, he recovers Health equal to 100% of the damage dealt.",
        use: async function (battleBro, target) {
            let hit = await dealDmg(battleBro, target, this.abilityDamage, 'special')
            if (hit[0] > 0) {
                await applyEffect(battleBro, target, 'abilityBlock', 1)
            }
        }
    },
    'smite': {
        displayName: 'smite',
        image: 'images/abilities/ability_macewindu_special01.png',
        desc: "Mace Windu deals Special damage to target enemy and dispels all buffs on them. If target enemy had Shatterpoint, Stun them for 1 turn and remove 50% Turn Meter, then Mace gains 50% Turn Meter."
    },
    'thisPartysOver': {
        displayName: "This party's over",
        image: 'images/abilities/ability_macewindu_special02.png',
        desc: "Deal Special damage to target enemy and call target other ally to assist. If target enemy had Shatterpoint and target ally is Galactic Republic, swap Turn Meter with target ally. If target enemy had Shatterpoint and target ally is Jedi, Mace gains 2 stacks of Resilient Defense (max 8) for the rest of the encounter. Both Mace and target ally recover 30% Protection."
    },
    'Lethal Swing': {
        displayName: "Lethal Swing",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage'],
        abilityDamage: 117.8,
        desc: 'Deals physical damage and inflicts Tenacity Down and Potency Down, this ability ignores defence and can\'t be evaded. If this ability scores a critical hit, inflict Ability Block on a random enemy.',
        use: async function (battleBro, target) {
            let savedArmour = target.armour
            let savedEvasion = target.evasion
            target.armour = 0
            target.evasion = 0
            let hit = await dealDmg(battleBro, target, this.abilityDamage, 'physical')
            target.armour += savedArmour
            target.evasion += savedEvasion
            if (hit[0] > 0) {
                await applyEffect(battleBro, target, 'potencyDown', 1);
                await applyEffect(battleBro, target, 'tenacityDown', 1);
            }
            if (hit[1] == true) { // crit condition
                let enemyTeam = battleBros.filter(guy => guy.team == target.team)
                let randomIndex = Math.floor(Math.random() * enemyTeam.length)
                await applyEffect(battleBro, enemyTeam[randomIndex], 'abilityBlock', 2);
            }
        }
    },
    'Piercing Edge': {
        displayName: "Piercing Edge",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'physical_damage'],
        abilityDamage: 130,
        use: async function (battleBro, target) {
            let hit = await dealDmg(battleBro, target, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                let enemyLeaders = battleBros.filter(guy => guy.team == target.team).filter(guy => guy.isLeader == true)
                console.log(enemyLeaders)
                for (let enemyLeader of enemyLeaders) {
                    await applyEffect(battleBro, enemyLeader, 'targetLock', 3)
                }
            }
            if (hit[1] == true) {
                await dealDmg(battleBro, target, this.abilityDamage * 0.5, 'special')
            }
        }
    },
    'Disruptor Blade': {
        displayName: "Disruptor Blade",
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['attack', 'special_damage'],
        abilityDamage: 80,
        use: async function (battleBro, target) {
            let locked = false
            if (target.buffs.find(effect => effect.name === 'targetLock')) {
                battleBro.flatDamageDealt += 50
                locked = true
            }
            if (infoAboutCharacters[target.character].tags.includes('tank') == true) {
                battleBro.critChance += 30
                battleBro.critDamage += 30
                await dealDmg(battleBro, target, this.abilityDamage, 'special')
                battleBro.critChance -= 30
                battleBro.critDamage -= 30
            } else {
                await dealDmg(battleBro, target, this.abilityDamage, 'special')
            }
            if (locked == true) {
                battleBro.flatDamageDealt -= 50
                await applyEffect(battleBro, target, 'daze', 2)
                await applyEffect(battleBro, target, 'buffImmunity', 2)
            }
        }
    },
    'Super Strike': {
        displayName: "Super Strike",
        image: 'images/abilities/superStrike.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['attack', 'physical_damage'],
        abilityDamage: 10000,
        desc: 'Deal true damage to target enemy, inflict Doomed, Fear and Bleed for 3 turns to target enemy. If this ability scores a critical hit, use this ability again. If this ability defeats an enemy, inflict Fear to all enemies for 1 turn.',
        use: async function (battleBro, target) {
            let savedEvasion = target.evasion
            target.evasion -= savedEvasion
            await applyEffect(battleBro, target, 'doomed', 3)
            let hit = await dealDmg(battleBro, target, this.abilityDamage, 'true')
            await applyEffect(battleBro, target, 'fear', 3)
            await applyEffect(battleBro, target, 'bleed', 3)
            if (hit[1] == true) {
                await applyEffect(battleBro, target, 'doomed', 3)
                await dealDmg(battleBro, target, this.abilityDamage, 'true')
                await applyEffect(battleBro, target, 'fear', 3)
                await applyEffect(battleBro, target, 'bleed', 3)
            }
            if (target.isDead == true) {
                for (let enemy of battleBros) {
                    if (enemy.team !== battleBro.team) {
                        await applyEffect(battleBro, enemy, 'fear', 1)
                    }
                }
            }
            target.evasion+=savedEvasion
        }
    },
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
        attacked: async function (owner, target, attacker) {
            if (Math.random() < 1 && owner == target) {
                //let abilityName=infoAboutCharacters[owner.character].abilities[0]
                //await useAbility(abilityName,owner,attacker)
                await addAttackToQueue(owner, attacker)
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
        start: async function (owner) {
            for (let ally of battleBros.filter(unit => unit.team == owner.team)) {
                ally.armour += 10
                ally.resistance += 10
                console.log('bonus defence given out from wookie resolve!')
            }
        },
        damaged: async function (owner, target, attacker) {
            if (Math.random() < 0.5 && owner.team == target.team) {
                await applyEffect(owner, target, 'defenceUp', 3)
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
    },
    'vaapad': {
        displayName: 'Vaapad',
        image: 'images/abilities/abilityui_passive_def.png',
        desc: 'Mace gains 30% Max Health. At the end of each turn, if another ally with Protection was damaged by an attack that turn, Mace gains 3 stacks of Resilient Defense (max 8) for the rest of the encounter if he has not gained Resilient Defense this way since his last turn. Whenever Mace gains Taunt, he dispels it and gains 2 stacks of Resilient Defense.\n Resilient Defense: Enemies will target this unit; lose one stack when damaged by an attack',
        zeta_desc: 'Mace gains 30% Max Health. At the end of each turn, if another ally with Protection was damaged by an attack that turn, Mace gains 3 stacks of Resilient Defense (max 8) for the rest of the encounter if he has not gained Resilient Defense this way since his last turn. While Mace has Resilient Defense, he has +10% Offense per stack and 100% counter chance. Whenever Mace gains Taunt, he dispels it and gains 2 stacks of Resilient Defense.\n Resilient Defense: Enemies will target this unit; lose one stack when damaged by an attack',
        abilityType: 'unique',
        abilityTags: ['dispel', 'buff_gain'],
    },
    'senseWeakness': {
        displayName: 'Sense Weakness',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'Mace gains 30% Offense. At the start of Mace\'s turn, dispel Stealth on all enemies and a random enemy (excluding raid bosses and Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. Shatterpoint is dispelled at the end of each ally\'s turn. \n Shatterpoint: Receiving damage dispels Shatterpoint and reduces Defense, Max Health, and Offense by 10% for the rest of the encounter; enemies can ignore Taunt to target this unit',
        zeta_desc: 'Mace gains 30% Offense. At the start of Mace\'s turn, dispel Stealth on all enemies and a random enemy (excluding raid bosses and Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. Shatterpoint is dispelled at the end of each ally\'s turn. When an ally damages an enemy with Shatterpoint, all allies recover 10% Protection, and all Galactic Republic Jedi allies gain Foresight for 1 turn. \n Shatterpoint: Receiving damage dispels Shatterpoint and reduces Defense, Max Health, and Offense by 10% for the rest of the encounter; enemies can ignore Taunt to target this unit',
        omicron_desc: 'At the start of each other Light Side ally\'s turn, a random enemy (excluding Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. When an ally damages an enemy with Shatterpoint, all allies gain 5% Turn Meter.',
        abilityType: 'unique',
        abilityTags: ['territory_war_omicron', 'dispel', 'debuff_gain', 'protection_recovery', 'turnmeter_recovery']
    },
    'Elimination Protocol': {
        displayName: 'Elimination Protocol',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'Super Striker has +25% Critical Chance and +30% Defense Penetration. Whenever he attacks an enemy with Target Lock, he gains +10% Offense (stacking, max 50%) for the rest of the encounter. If Super Striker defeats an enemy, he gains Stealth for 1 turn and resets the cooldown of Super Strike. While Stealthed, Super Striker gains +100% Accuracy and his attacks deal +20% damage.',
        abilityType: 'unique',
        abilityTags: ['cooldownReset'],
        start: async function (owner) {
            owner.critChance += 25
            owner.defencePenetration += 30
        },
        defeat: async function (owner, target, attacker) {
            if (owner == attacker) {
                await applyEffect(owner, owner, 'stealth', 1)
                battleBro.cooldowns['Super Strike'] = 0
                await updateAbilityCooldownUI(owner, 'Super Strike')
            }
        },
        gainedEffect: async function (owner, target, caster, effectName) {
            if (owner == target && effectName == 'stealth') {
                console.log('power gained from stealth')
                owner.accuracy += 100
                owner.flatDamageDealt += 20
            }
        },
        lostEffect: async function (owner, target, caster, effectName) {
            if (owner == target && effectName == 'stealth') {
                console.log('power lost from stealth')
                owner.accuracy -= 100
                owner.flatDamageDealt -= 20
            }
        },
        attacked: async function (owner, target, attacker) {
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
}

const infoAboutEffects = {
    'defenceUp': {
        name: 'defenceUp',
        image: 'images/effects/defenceUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'defence'],
        apply: async function (unit) {
            unit.armour += 50
            unit.resistance += 50
        },
        remove: async function (unit) {
            unit.armour -= 50
            unit.resistance -= 50
        }
    },
    'defencePenetrationUp': {
        name: 'defencePenetrationUp',
        image: 'images/effects/defencePenetrationUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'defence'],
        apply: async function (unit) {
            unit.defencePenetration += 50
        },
        remove: async function (unit) {
            unit.defencePenetration -= 50
        }
    },
    'foresight': {
        name: 'foresight',
        image: 'images/effects/foresight.png',
        type: 'buff',
        effectTags: ['stack', 'singleUse', 'foresight', 'evasion'],
        apply: async function (unit) {
            unit.evasion += 100
        },
        remove: async function (unit) {
            unit.evasion -= 100
        }
    },
    'healthUp': {
        name: 'healthUp',
        image: 'images/effects/healthUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'maxhealth', 'heal'],
        apply: async function (unit) {
            unit.maxHealth *= 1.15;
            await heal(unit, unit, unit.maxHealth * 0.13)
        },
        remove: async function (unit) {
            unit.maxHealth /= 1.15;
            unit.health = Math.min(unit.health, unit.maxHealth) // Make sure health doesn't surpass max health when max health is lowered
        }
    },
    'offenceUp': {
        name: 'offenceUp',
        image: 'images/effects/offenceUp.png',
        type: 'buff',
        effectTags: ['stack', 'up', 'offence'],
        apply: async function (unit) {
            unit.physicalDamage += 50
            unit.specialDamage += 50
        },
        remove: async function (unit) {
            unit.physicalDamage -= 50
            unit.specialDamage -= 50
        }
    },
    'stealth': {
        name: 'stealth',
        image: 'images/effects/stealth.png',
        type: 'buff',
        effectTags: ['stealth', 'target'],
        apply: async function (unit) {
            await removeEffect(unit, 'taunt')
            if (unit.isTarget == true) { // if the guy who just got stealth is the target, we need to set the target to another member of the same team
                let unitTeam = battleBros.filter(battleBro => battleBro.team == unit.team)
                unitTeam = unitTeam.splice(indexOf(unit), 1)
                if (unitTeam.filter(battleBro => battleBro.taunting).length == 0) {
                    await changeTarget(unitTeam[0])
                } else { // if there's at least one other guy with taunt on the same team as the stealthed guy, make them the target
                    await changeTarget(unitTeam.filter(battleBro => battleBro.taunting)[0])
                }
            }
        },
        remove: async function (unit) { }
    },
    'taunt': {
        name: 'taunt',
        image: 'images/effects/taunt.png',
        type: 'buff',
        effectTags: ['taunt', 'target'],
        apply: async function (unit) {
            unit.taunting = true
            await removeEffect(unit, 'stealth')
            if (battleBros.filter(battleBro => battleBro.team == unit.team).filter(battleBro => battleBro.taunting == true).length = 1) await changeTarget(unit) // don't switch the target if there's another member of this character's team taunting
        },
        remove: async function (unit) {
            unit.taunting = false
            if (unit.isTarget == true) { // check if this taunter is the target
                let unitTeam = battleBros.filter(battleBro => battleBro.team == unit.team)
                if (unitTeam.filter(battleBro => battleBro.taunting).length > 0) { // if there's another taunter
                    await changeTarget(unitTeam.filter(battleBro => battleBro.taunting)[0]) // change the target to that one
                }
            }
        }
    },
    'abilityBlock': {
        name: 'abilityBlock',
        image: 'images/effects/abilityBlock.png',
        type: 'debuff',
        effectTags: [],
        apply: async function (unit) {
            /*console.log(infoAboutCharacters[unit.character].abilities)
            for (let abilityName of infoAboutCharacters[unit.character].abilities) {
                console.log(abilityName)
                await updateAbilityCooldownUI(unit, abilityName)
            }*/
        },
        remove: async function (unit) { }
    },
    'bleed': {
        name: 'bleed',
        image: 'images/effects/bleed.png',
        type: 'debuff',
        effectTags: ['stack', 'speed', 'tenacity', 'maxhealth', 'loseOnHeal'],
        apply: async function (unit) {
            unit.tenacity -= 5
            unit.speedPercent -= 5
        },
        remove: async function (unit) {
            unit.tenacity += 5
            unit.speedPercent += 5
        }
    },
    'buffImmunity': {
        name: 'buffImmunity',
        image: 'images/effects/buffImmunity.png',
        type: 'debuff',
        effectTags: ['buffImmunity'],
        apply: async function (unit) {

        },
        remove: async function (unit) {

        }
    },
    'daze': {
        name: 'daze',
        image: 'images/effects/daze.png',
        type: 'debuff',
        effectTags: ['stopAssist', 'stopCounter', 'stopTMgain'],
        apply: async function (unit) {

        },
        remove: async function (unit) {

        }
    },
    'doomed': {
        name: 'doomed',
        image: 'images/effects/doomed.png',
        type: 'debuff',
        effectTags: ['stopRevive', 'conditional'],
        apply: async function (unit) {

        },
        remove: async function (unit) {
            if (unit.isDead == true) unit.cantRevive = true
        }
    },
    'fear': {
        name: 'fear',
        image: 'images/effects/fear.png',
        type: 'debuff',
        effectTags: ['stack', 'singleUse', 'lostOnHit', 'stun'],
        apply: async function (unit) {
            unit.evasion -= 10000
        },
        remove: async function (unit, removalType) {
            unit.evasion += 10000
            if (removalType == 'removed') {
                changeCooldowns(unit, 1)
            }
        }
    },
    'healthDown': {
        name: 'healthDown',
        image: 'images/effects/healthDown.png',
        type: 'debuff',
        effectTags: ['stack', 'down', 'maxhealth'],
        apply: async function (unit) {
            unit.maxHealth /= 1.15
            unit.health /= 1.15
        },
        remove: async function (unit) {
            unit.maxHealth *= 1.15
            unit.health *= 1.15
        }
    },
    'potencyDown': {
        name: 'potencyDown',
        image: 'images/effects/potencyDown.png',
        type: 'debuff',
        effectTags: ['down', 'potency'],
        apply: async function (unit) {
            unit.potency -= 100
        },
        remove: async function (unit) {
            unit.potency += 100
        }
    },
    'stun': {
        name: 'stun',
        image: 'images/effects/stun.png',
        type: 'debuff',
        effectTags: ['stun'],
        apply: async function (unit) {
        },
        remove: async function (unit) {
        }
    },
    'targetLock': {
        name: 'targetLock',
        image: 'images/effects/targetLock.png',
        type: 'debuff',
        effectTags: ['targetLock'],
        apply: async function (unit) { },
        remove: async function (unit) { }
    },
    'tenacityDown': {
        name: 'tenacityDown',
        image: 'images/effects/tenacityDown.png',
        type: 'debuff',
        effectTags: ['down', 'potency'],
        apply: async function (unit) {
            unit.tenacity -= 100
        },
        remove: async function (unit) {
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
    damaged: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4, arg5], // target,attacker,dealtdmg,'damagetype',crit true/false
    attacked: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2], //target,attacker
    gainedEffect: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3], // target, caster, effectName
    lostEffect: (arg1, arg2, arg3, arg4, arg5, arg6) => [arg1, arg2, arg3, arg4], // target, caster, effectName, dispeller
}
async function eventHandle(type, arg1, arg2, arg3, arg4, arg5, arg6) {
    console.log("eventHandle", type, arg1, arg2, arg3, arg4, arg5, arg6)
    if (argsMap[type]) {
        const args = argsMap[type]?.(arg1, arg2, arg3, arg4, arg5, arg6)
        for (let battleBro of battleBros) {
            for (let passive of battleBro.passives) {
                fct = infoAboutPassives[passive]?.[type]
                if (fct) {
                    //console.log("Calling infoAboutPassives " + passive + " " + type)
                    ret = await fct(battleBro, ...args)
                    //console.log("Finished infoAboutPassives " + passive + " " + type + " " + ret)
                } else {
                    ret = "<not defined>"
                    //console.log("Checked infoAboutPassives " + passive + " " + type + " => <not defined>")
                }

            }
        }
    }
}
//var abilityImagesDivsPerTeam =[[],[]]
var passiveImagesPerTeam = [[], []]


async function clearScreen() {
    $('#myGuys').html("");
}

async function createBattleBroImages() {
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
    for (let battleBro of battleBros) {
        let infoAboutCharacter = infoAboutCharacters[battleBro.character]
        // battleBro.speed = infoAboutCharacter.speed
        battleBro.turnMeter = 0
        // battleBro.health = infoAboutCharacter.health
        for (let info in infoAboutCharacter) {
            if (infoAboutCharacter.hasOwnProperty(info)) {
                battleBro[info] = infoAboutCharacter[info];
            }
        }
        // add extra variables
        battleBro.critDamage = 150
        battleBro.critAvoidance = 0
        battleBro.accuracy = 0
        battleBro.evasion = 0
        battleBro.defencePenetration = 0
        battleBro.maxHealth = battleBro.health
        battleBro.maxProtection = battleBro.protection
        battleBro.speedPercent = 100 // using this to manipulate speed via buffs etc
        battleBro.flatDamageDealt = 100
        battleBro.flatDamageReceived = 100
        battleBro.isDead = false
        battleBro.cantRevive = false
        battleBro.queuedAttacks = []
        battleBro.buffs = []
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
        for (let abilityName in infoAboutCharacters[battleBro.character].abilities) {
            const ability = infoAboutAbilities[abilityName];
            battleBro.cooldowns[abilityName] = 0;
        }
        // Initialise skill cooldowns
        battleBro.skillsData = []
        for (let skillName of infoAboutCharacter?.abilities || []) {
            let skill = JSON.parse(JSON.stringify(infoAboutAbilities[skillName]))
            skillData = {
                skill: skill,
                cooldown: skill.initialCooldown,
            }
            battleBro.skillsData.push(skillData)

            // make sure cooldowns are keyed by name for checking and updating
            battleBro.cooldowns[skillName] = skill.initialCooldown || 0
        }
    }
    await eventHandle('start')
}

async function updateBattleBrosHtmlText() {
    for (let battleBro of battleBros) {
        let avatarHtmlElement = battleBro.avatarHtmlElement
        //let broHtmlElement = battleBro.avatarHtmlElement.get(0)
        if (battleBro.health > 0) {
            battleBro.avatarHtmlElement.children()[1].firstElementChild.firstChild.nodeValue = '' + Math.ceil(battleBro.health)
        } else {
            battleBro.avatarHtmlElement.children()[1].firstElementChild.firstChild.nodeValue = 'dead'
            battleBro.isDead = true
        }
        battleBro.avatarHtmlElement.children()[3].firstElementChild.firstChild.nodeValue = '' + Math.ceil(battleBro.protection)
        battleBro.avatarHtmlElement.children()[5].firstElementChild.firstChild.nodeValue = '' + Math.ceil(battleBro.turnMeter)
        battleBro.avatarHtmlElement.children()[7].firstElementChild.firstChild.nodeValue = ''
    }
}

async function updateCurrentBattleBroSkillImages() {
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
        for (i = 0; i < battleBro.skillsData.length; i++) {
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
        for (i = 0; i < characterPassives.length; i++) {
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
    })();
})

async function calculateNextTurnFromTurnMetersAndSpeeds() {
    console.log('---------- Click detected ------------')

    // Bring the battleBros data into a temporary working array, for convenience
    /*let avatarTurnMeters = battleBros.map(battleBro => battleBro.turnMeter)

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
    let avatarDistances = battleBros.map(battleBro => (100 - battleBro.turnMeter) / (battleBro.speed * battleBro.speedPercent * 0.01))
    let closestAvatarDistance = Math.min(...avatarDistances)
    for (let battleBro of battleBros) {
        if (battleBro.speed) {
            battleBro.turnMeter += battleBro.speed * battleBro.speedPercent * 0.01 * closestAvatarDistance
        }
    }
    console.log('avatar distances:', avatarDistances)
    console.log('closest distance:', closestAvatarDistance)
    let closestAvatar = avatarDistances.indexOf(closestAvatarDistance)
    console.log('closest avatar:', closestAvatar)

    console.log('Processing avatar------------------------- ', closestAvatar)
    $('#myText').html('Processing avatar------------------------- ' + closestAvatar)
    await selectBattleBro(closestAvatar)

    // Save our working array back into the main battleBros data
    /*for (var i = 0; i < battleBros.length; i++) {
        let battleBro = battleBros[i]
        battleBro.turnMeter += battleBro.speed*closestAvatarDistance
    }*/
    await updateBattleBrosHtmlText()
}

async function selectBattleBro(battleBroNumber) {
    selectedBattleBroNumber = battleBroNumber
    $('.selected').removeClass('selected')
    let battleBro = battleBros[battleBroNumber]
    let avatarHtmlElement = battleBro.avatarHtmlElement
    avatarHtmlElement.addClass('selected')

    await updateCurrentBattleBroSkillImages()
}


async function avatarClicked(clickedElement) {
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
            await pendingAbility.ability.allyUse?.(pendingAbility.user, foundBattleBro)
            //pendingAbility.ability.use?.(pendingAbility.user,pendingAbility.target)
            await useAbility(pendingAbility.abilityName, pendingAbility.user, pendingAbility.target, true)
            pendingAbility = null
            return
        } else {
            console.log('Not a valid ally target.')
            return
        }
    }

    let foundBrosteam = battleBros.filter(battleBro => battleBro.team == foundBattleBro.team)
    if (foundBrosteam.filter(battleBro => battleBro.taunting).length == 0) {
        if (!foundBattleBro.buffs.find(effect => effect.name === 'stealth')) {
            await changeTarget(foundBattleBro)
        }
    } else if (foundBattleBro.taunting == true) {
        await changeTarget(foundBattleBro)
    } else {
        return
    }
}

async function changeTarget(target) {
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

async function abilityClicked(clickedElement) {
    console.log('abilityClicked')
    let clickedElementParent = clickedElement.parentElement
    // Find which battleBro ability was clicked
    let eltData = JSON.parse(clickedElement.dataset.mydata)
    let battleBroNumber = eltData.battleBroNumber
    let abilityNumber = eltData.abilityNumber
    let battleBro = battleBros[battleBroNumber]
    // abort if battleBro is dead
    if (battleBro.isDead == true) {
        await endTurn(battleBro)
        return
    }
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
            await showFloatingText(battleBro.avatarHtmlElement.children()[7].firstElementChild, 'Ally Click', 'white')
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
    /*let target - old for loop finding
    for (let enemy of battleBros) {
        if (enemy.isTarget == true && enemy.team != battleBro.team) {
            target = enemy
            break
        }
    }*/
    if (!pendingAbility) await useAbility(abilityName, battleBro, target, true)
    /* old physical damage command that operated with tags
    if (tags) {
        for (let tag of tags) {
            if (tag == 'physical_damage') {
                console.log('Physical damage: ' + battleBro.character + ' uses ' + infoAboutAbilities[abilityName].displayName + ' on ' + target.character)
                await physicalDmg(battleBro,target,infoAboutAbilities[abilityName].abilityDamage)
            }
        }
    } else {
        console.log('tags haven\'t been defined!')
    }
    */

    // let a = clickedElement.attr("data-test1")
    // let b = clickedElement.attr("data-abilityNumber")
    // a = 0
}

async function useAbility(abilityName, battleBro, target, hasTurn = false, type = null) {
    let ability = infoAboutAbilities[abilityName]
    let animation = null
    if (ability.abilityTags.includes("projectile_attack")) {
        animation = 'projectile'
        let taskDone = false
        await playProjectileAttackAnimation(
            battleBro,
            target,
            abilityName,
            hasTurn,
            type,
            ability.projectile || null,
            "#00FFFF"
        )
        /*abilityFunction = await playProjectileAttackAnimation(
            battleBro,
            target,
            ability,
            hasTurn,
            type,
            "#00FFFF" // note-to-self-vary-colour
        );*/

    } else if (ability.abilityTags.includes("attack")) {
        animation = 'melee'
        await playMeleeAttackAnimation(
            battleBro,
            target,
            abilityName,
            hasTurn,
            type,
            ability.projectile || null,
            "#00FFFF"
        )
    }
    let abilityUsed
    if (ability.use)
        abilityUsed = await ability.use(battleBro, target)
    console.log(abilityName)
    if (!abilityName || !infoAboutAbilities[abilityName]) {
        console.warn("Ability not found:", abilityName);
        return;
    }
    if (animation=='melee') {
        await wait(200)
    }
    let attack
    if (type) {
        attack = (battleBro.queuedAttacks.length > 0) ? battleBro.queuedAttacks.shift() : null // if this attack is a counter, assist, or bonus then remove it from the list of queued attacks
    }
    if (battleBro.queuedAttacks.length > 0) {
        let abilityName = infoAboutCharacters[battleBro.character].abilities[0] // basic ability
        await useAbility(abilityName, battleBro, battleBro.queuedAttacks[0][0], hasTurn, battleBro.queuedAttacks[0][1]) // after the attack is done, use the next attack in the list of queued attacks
    } else {
        if (attack) {
            await checkAttacks(attack[1]) // check attacks with the type if it's an assist,counter, or bonus attack
        } else {
            await checkAttacks() // otherwise check normally
        }
    }
    battleBro.cooldowns[abilityName] = ability.cooldown || 0
    await updateAbilityCooldownUI(battleBro, abilityName)
    //if (hasTurn==true) await endTurn(battleBro)
}

async function playProjectileAttackAnimation(battleBro, target, abilityName, hasTurn, type, imageName, colour = '#00FFFF') {
    const attackerDiv = battleBro.avatarHtmlElement.children()//.eq(0),  or wherever the character image is
    const targetDiv = target.avatarHtmlElement.children()//.eq(0),    same here
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
        projectile.style.transition = 'transform 0.6s linear'
    } else {
        projectile.style.transition = 'transform 0.6s ease'
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
    await wait(600)
    projectile.remove();
    return 'projectile hit'
}

async function playMeleeAttackAnimation(attacker, target, abilityName, hasTurn, type, imageName, colour = '#00FFFF') {
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
    attackerDiv.css("transform", `translate(${deltaX * 0.9}px, ${deltaY * 0.9}px)`); // Move part of the way

    // Wait for lunge to complete
    await wait(200);

    // Wait a short moment after impact
    await wait(100);

    // Return to original position
    attackerDiv.css({
        transition: 'transform 0.2s ease',
        transform: originalTransform || 'none'
    });
}

async function playSparkImpact(x, y, primaryColour = 'yellow', secondaryColour = 'orange', numberOfSparks = 8) {
    for (let i = 0; i < numberOfSparks; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';

        // Random angle and distance
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.max(20,numberOfSparks*2.5) + Math.random() * 10;
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


async function endTurn(battleBro) {
    battleBro.turnMeter -= 100
    engagingCounters = false
    await updateBattleBrosHtmlText()
    await calculateNextTurnFromTurnMetersAndSpeeds()
    await updateEffectsAtTurnEnd(battleBro)
}

async function checkAttacks(type) {
    console.log('checkingattacks')
    let enemyTeamHasAttacks
    for (let battleBro of battleBros) {
        if (battleBro.queuedAttacks.length > 0) {
            if (battleBro.team == battleBros[selectedBattleBroNumber].team) {
                console.log('selected guys team still has some attacks to run through')
                return
            } else {
                enemyTeamHasAttacks = true
                console.log('enemyTeamHasAttacks')
            }
        }
    }
    if (enemyTeamHasAttacks == true && type !== 'counter') { // engage counters if the selected Bro's team's attacks are all spent
        await engageCounters()
        console.log('engaging counter attacks')
    } else if (enemyTeamHasAttacks !== true) { // end the turn when no-one has any attacks anymore
        await endTurn(battleBros[selectedBattleBroNumber])
    }
}

async function assist(battleBro, target, caller, abilityIndex = 0) {
    console.log(caller.character + ' calls ' + battleBro.character + ' to assist on ' + target)
    let abilityName = infoAboutCharacters[battleBro.character].abilities[abilityIndex] // use abilityIndex incase we assist with a non-basic
    battleBro.queuedAttacks.unshift([target, 'assist']) // add the current assist to the start of queued attacks so that the turn doesn't end before the assist is finished
    await useAbility(abilityName, battleBro, target, false, 'assist')
}

async function addAttackToQueue(battleBro, target) {
    if (battleBros[selectedBattleBroNumber].team !== battleBro.team) {
        console.log('counter attack logged')
        let currentTarget = battleBros.find(enemy => enemy.isTarget && enemy.team !== battleBro.team)
        currentTarget = (currentTarget.taunting == true) ? currentTarget : target
        battleBro.queuedAttacks.push([currentTarget, 'counter'])
    } else if (engagingCounters == false) {
        console.log('bonus attack logged')
        battleBro.queuedAttacks.push([target, 'bonus'])
    }
}

async function engageCounters() {
    engagingCounters = true // enemy team is now counter attacking!
    for (let battleBro of battleBros) {
        if (battleBro.queuedAttacks.length > 0) {
            let abilityName = infoAboutCharacters[battleBro.character].abilities[0]
            await useAbility(abilityName, battleBro, battleBro.queuedAttacks[0][0], false, battleBro.queuedAttacks[0][1])
        }
    }
}

/*async function engageQueuedAttacks() {
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

async function showFloatingText(targetElement, value, colour) {
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
}

async function playStatusEffectGlow(characterDiv, effectName) {
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

async function applyEffect(battleBro, target, effectName, duration = 1, isLocked = false) {
    const info = infoAboutEffects[effectName];
    if (info.type == 'debuff' && Math.random() < (target.tenacity - battleBro.potency) * 0.01) {
        await showFloatingText(target.avatarHtmlElement.children()[7].firstElementChild, 'RESISTED', 'white')
        return
    }
    const effect = {
        ...info,
        duration: target === battleBro ? duration + 1 : duration, // if the caster applies effects to themself, the duration is knocked down by 1 at the end of their turn
        locked: isLocked === true,
        caster: battleBro,
        apply: info.apply,
        remove: info.remove,
    };
    if (!(effect.effectTags.includes('stack') == false && target.buffs.find(e => e.name == effectName))) {
        await effect.apply(target) //the effect's apply effect activates unless it isn't stackable and there's already an effect with the same name
        await eventHandle('gainedEffect', target, battleBro, effectName)
        await playStatusEffectGlow(target.avatarHtmlElement, effectName)
        console.log('effect applied')
    } else {
        console.log('second instance of non-stackable effect detected: apply async function not called')
    }
    target.buffs.push(effect);
    await updateEffectIcons(target);
}

async function updateEffectsAtTurnEnd(battleBro) {

    for (let i = battleBro.buffs.length - 1; i >= 0; i--) {
        const effect = battleBro.buffs[i];
        effect.duration -= 1;
        if (effect.duration <= 0) {
            await effect.remove(battleBro, 'expired');
            await eventHandle('lostEffect', battleBro, effect.caster, effect.name)
            battleBro.buffs.splice(i, 1);
        }
    }
    await updateEffectIcons(battleBro);
}

async function updateEffectIcons(battleBro) {
    // group effects that are the same for stacking
    let groupedEffects = {}; // { effectName: { instances: [], effectInfo: {} } }

    for (let effect of battleBro.buffs) {
        // group together instances of the same existing effects
        let effectInfo = infoAboutEffects[effect.name]
        if (!groupedEffects[effect.name]) {
            groupedEffects[effect.name] = {
                instances: [],
                effectInfo: effectInfo
            };
        }
        groupedEffects[effect.name].instances.push(effect);
    }


    // delete all instances of non-stackable effects except the instance with the longest duration
    for (let effectName in groupedEffects) {
        let { instances, effectInfo } = groupedEffects[effectName]; // copy instances and effectInfo from the effect

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
        let { instances, effectInfo } = groupedEffects[effectName];

        if (effectInfo.effectTags.includes("stack")) {
            // STACKABLE: Show one icon with a counter
            displayEffects.push({
                name: effectName,
                image: effectInfo.image,
                count: instances.length,
                duration: Math.max(...instances.map(e => e.duration)), // for optional sorting or tooltip
            });
        } else {
            // NON-STACKABLE: There will only be a single instance remaining so we set that to 1
            displayEffects.push({
                name: effectName,
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
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '30px';
        wrapper.style.height = '30px';
        wrapper.style.marginRight = '4px'; // spacing between icons (optional)

        const img = document.createElement('img');
        img.src = effect.image;
        img.style.width = '30px';
        img.style.height = '30px';
        img.style.display = 'block';

        wrapper.appendChild(img);

        if (effect.count > 1) {
            const countDiv = document.createElement('div');
            countDiv.innerText = effect.count;
            countDiv.style.position = 'absolute';
            countDiv.style.top = '0';
            countDiv.style.right = '0';
            countDiv.style.backgroundColour = 'rgba(24, 1, 1, 0.06)';
            countDiv.style.colour = 'white';
            countDiv.style.fontSize = '12px';
            countDiv.style.padding = '1px 3px';
            countDiv.style.borderRadius = '8px';
            countDiv.style.lineHeight = '1';
            wrapper.appendChild(countDiv);
        }

        container.appendChild(wrapper);
    });
}

async function dispel(battleBro, target, type) {
    let dispelledEffects = target.buffs.filter(effect => effect.type === type && effect.isLocked !== true)
    /*target.buffs = target.buffs.filter(effect => 
        !dispelledEffects.includes(effect)
    )*/
    for (let i = battleBro.buffs.length - 1; i >= 0; i--) {
        const effect = battleBro.buffs[i];
        if (dispelledEffects.includes(effect)) {
            await effect.remove(battleBro, 'dispelled');
            await eventHandle('lostEffect', target, effect.caster, effect.name, battleBro)
            battleBro.buffs.splice(i, 1);
        }
    }
    await updateEffectIcons(target)
}

async function removeEffect(battleBro, bufftag) {
    //console.log(battleBro.evasion)
    let filteredEffects = battleBro.buffs.filter(effect => effect.effectTags.includes(bufftag) == true)
    if (filteredEffects.length > 0) {
        let shortestDurationEffect = filteredEffects.reduce((prev, current) => {
            return (prev.duration < current.duration) ? prev : current;
        })
        let shortestDurationEffectIndex = battleBro.buffs.indexOf(shortestDurationEffect)
        await shortestDurationEffect.remove(battleBro, 'removed')
        await eventHandle('lostEffect', battleBro, shortestDurationEffect.caster, shortestDurationEffect.name)
        battleBro.buffs.splice(shortestDurationEffectIndex, 1)
        /*console.log("filteredEffects - shortestDurationEffect - shortestDurationEffectIndex- evasion")
        console.log(filteredEffects)
        console.log(shortestDurationEffect)
        console.log(shortestDurationEffectIndex)
        console.log(battleBro.evasion)*/
        await updateEffectIcons(battleBro)
    } else {
        //console.log(bufftag + 'effect not found')
    }
}

async function changeCooldowns(battleBro, amount = -1) {
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

async function dodge(user, target) {
    const logElement = target.avatarHtmlElement.children()[7].firstElementChild
    if (target.protection > 0) {
        if (Math.random() > 0.5) {
            await showFloatingText(logElement, 'BLOCKED', 'white');
        } else {
            await showFloatingText(logElement, 'DEFLECTED', 'white');
        }
    } else {
        if (Math.random() > 0.5) {
            await showFloatingText(logElement, 'EVADED', 'white');
        } else {
            await showFloatingText(logElement, 'DODGED', 'white');
        }
    }
    await removeEffect(target, 'foresight')
}

async function dealDmg(user, target, dmg, type) {
    //if (user.team===battleBros[selectedBattleBroNumber].team) {
    if (type!=='shadow') await eventHandle('attacked', target, user) // activate passive conditions upon being attacke dunless the damage is shadow damage
    if (Math.random() > target.evasion * 0.01 || ['shadow', 'massive', 'percentage', 'ultra'].includes(type)) { // shadow, massive, percentage, and ultra damage can't be evaded.
        const logElement = target.avatarHtmlElement.children()[7].firstElementChild
        let crit = false // prepare crits in the case of physical damage!
        let colour // prepare the colour for the damage types
        const targetRect = target.avatarHtmlElement.children().get(0).getBoundingClientRect() // get the avatar location of the target for spark effects
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;
        let secondaryColour
        let dealtdmg
        if (type == 'physical') {
            dealtdmg = ((dmg * user.physicalDamage * 0.01) * (Math.max(1 - (Math.max(target.armour - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001 // 20=100-80 where 80 is the max damage negation from defence
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
            dealtdmg = ((dmg * user.specialDamage * 0.01) * (Math.max(1 - (Math.max(target.resistance - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001 // uses resistance/special damage instead of armour/physical damage
            colour = 'cornflowerblue'
            secondaryColour = 'cyan'
        } else if (type === 'true') {
            dealtdmg = Math.max(dmg * user.flatDamageDealt * target.flatDamageReceived * 0.0001, 0) // nice and simple true damage doesn't have damage variance
            colour = 'white'
        } else if (type == 'ultra') {
            dealtdmg = ((dmg * (user.physicalDamage + user.specialDamage) * 0.01) * (Math.max(1 - (Math.max(target.armour + target.resistance - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * 501)) * user.flatDamageDealt * target.flatDamageReceived * 0.0001
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
            dealtdmg = ((dmg * user.specialDamage * 0.015) * (Math.max(1 - (Math.max(infoAboutCharacters[target.character].resistance - user.defencePenetration, 0), 20) / 100)) - Math.floor(Math.random() * dmg * user.specialDamage * 0.01)) * user.flatDamageDealt * target.flatDamageReceived * 0.000001 * user.critDamage // lots of damage variance and ignores resistance buffs
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
            await playSparkImpact(endX,endY,colour,secondaryColour,Math.ceil(dealtdmg/625))
            if (type!=='shadow') await eventHandle('damaged', target, user, dealtdmg, type, crit) // passive effects upon damage that isn't shadow damage
        }
        let prot = target.protection
        target.protection -= Math.min(dealtdmg, prot)
        if (prot < dealtdmg) {
            target.health -= dealtdmg - prot
        }
        // user.health = Math.min(user.health+dealtdmg*healthsteal*0.01,infoAboutCharacters[user.character].health)
        if (user.healthSteal > 0 && prot < dealtdmg) {
            await heal(user, user, (dealtdmg - prot) * user.healthSteal * 0.01)
        }
        //logElement.innerHTML += `<span style="colour: red;">+${Math.ceil(dealtdmg)}</span>`;
        await showFloatingText(logElement, `-${Math.ceil(dealtdmg)}`, colour);
        return [dealtdmg, crit]
    } else {
        await dodge(user, target)
        return [0, 'dodged']
    }
}

async function heal(user, target, healing) {
    const logElement = target.avatarHtmlElement.children()[7].firstElementChild
    await showFloatingText(logElement, `-${Math.ceil(Math.min(target.maxHealth - target.health, healing))}`, 'green');
    target.health = Math.min(target.health + healing, target.maxHealth)
}

async function TMchange(user, target, change) {
    target.turnMeter += change
    target.turnMeter = (target.turnMeter < 0) ? 0 : target.turnMeter // turn meter shouldn't be less than 0
}

/////////////////////// KRAYT RAID stuff ///////////////////////////////////

async function startKraytRaid() {
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
    count = 0
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
                    let targetableEnemies = aliveEnemies.filter(bb => !bb.effects.includes('Eaten'))
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
    console.log('damageEnemy')
    inputs.targetedEnemy.health -= inputs.skill.abilityDamage
}
async function damageAllEnemies(inputs) {
    console.log('damageAllEnemies')
    let battleBro = battleBros[inputs.battleBroNumber]
    let aliveEnemies = battleBros.filter(bb => bb.team != battleBro.team && bb.health > 0)
    for (let enemy of aliveEnemies) {
        enemy.health -= inputs.skill.abilityDamage
    }
}
async function applyEffectsToEnemy(inputs, effects) {
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
    console.log('applyEffectsToSelf')

}
