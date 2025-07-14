export const infoAboutAbilities = {
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
                await TMchange(actionInfo, -50)
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
                await TMchange(actionInfo.withSelfAsTarget(), 25)
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
                await applyEffect(actionInfo.withSelfAsTarget(), buff.name, 3)
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
                await TMchange(actionInfo, -70)
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
            await TMchange(actionInfo.withSelfAsTarget(), 35 + bonusTurnMeter)
        }
    },
    'Outwit': {
        displayName: 'Outwit',
        image: 'images/abilities/ability_hera_s3_basic.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'projectile_attack', 'debuff_gain'],
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
        displayName: 'Play to Strengths',
        image: 'images/abilities/ability_hera_s3_special01.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['target_ally', 'assist', 'buff_gain'],
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
        displayName: 'Backup Plan',
        image: 'images/abilities/ability_hera_s3_special02.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['target_ally', 'buff_gain'],
        desc: 'Target other ally gains locked Backup Plan for 3 turns. Backup Plan: Recover 10% Health per turn, revive with 80% Health and 30% Turn Meter when defeated',
        use: async function (actionInfo) { },
        allyUse: async function (battleBro, ally, target) {
            let effectActionInfo = new ActionInfo({ battleBro: battleBro, target: ally })
            await applyEffect(effectActionInfo, 'backupPlan', 3, 1, false, true)
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
                await TMchange(actionInfo.withSelfAsTarget(), 15)
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
                await TMchange(actionInfo, -50)
                await TMchange(actionInfo.withSelfAsTarget(), 50)
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
        displayName: 'Rattling Uppercut',
        image: 'images/abilities/ability_sm33_basic.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage', 'debuff_gain'],
        abilityDamage: 380,
        desc: "Deal physical damage to target enemy and stagger them for 2 turns. If the target is a challenger, remove 100% turn meter and inflict ability block and daze for 1 turn.",
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                await applyEffect(actionInfo, 'stagger', 2)
                if (actionInfo.target.buffs.find(effect => effect.effectTags.includes('challenger'))) {
                    await TMchange(actionInfo, -100)
                    await applyEffect(actionInfo, 'abilityBlock', 1)
                    await applyEffect(actionInfo, 'daze', 1)
                }
            }
        }
    },
    'Limb From Limb': {
        displayName: 'Limb From Limb',
        image: 'images/abilities/ability_sm33_special01.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['attack', 'physical_damage', 'debuff_gain'],
        abilityDamage: 210,
        desc: "Deal Physical damage 6 times to target enemy. This attack has +1000% Health Steal and deals 20% more damage for each 20% Health SM-33 is missing. If the target is a challenger, SM-33 deals 50% more damage. Omicron: If this attack defeats an enemy, they can't be revived. For each instance of damage done from this ability while SM-33 has 100% Health, he gains 20% bonus Protection for 2 turns. If the target is a challenger, reduce their max protection by 50%.",
        use: async function (actionInfo) {
            let battleBro = actionInfo.battleBro
            let target = actionInfo.target
            const chunkNum = Math.floor((battleBro.maxHealth - battleBro.health) / (battleBro.maxHealth * 0.2)) // missing health divided by chunk size (20%)
            let dmgPercent = 100 + (20 * chunkNum)
            let isChallenger = target.buffs.find(effect => effect.effectTags.includes('challenger'))
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
        displayName: 'Forearm Bucklers',
        image: 'images/abilities/ability_sm33_special02.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['attack', 'dispel', 'buff_gain', 'debuff_gain'],
        desc: "Dispel all buffs on target enemy then inflict buff immunity and burning for 2 turns. SM-33 gains defence up for 2 turns. If SM-33 was burning, recover 50% health and protection and inflict 5 stacks of damage over time. Omicron: SM-33 dispels all debuffs on himself and gains locked retribution for 1 turn. All Pirate allies gain 25% bonus Protection for 2 turns. If the target is a challenger, SM-33 gains burning for the rest of the battle.",
        use: async function (actionInfo) {
            let battleBro = actionInfo.battleBro
            let target = actionInfo.target
            await dispel(actionInfo, 'buff')
            await applyEffect(actionInfo, 'buffImmunity', 2)
            await applyEffect(actionInfo, 'burning', 2)
            await applyEffect(actionInfo.withSelfAsTarget(), 'defenceUp', 2)
            if (battleBro.buffs.find(effect => effect.effectTags.includes('burning'))) {
                await heal(actionInfo.withSelfAsTarget(), battleBro.maxHealth * 0.5)
                await heal(actionInfo.withSelfAsTarget(), battleBro.maxProtection * 0.5, 'protection')
                await applyEffect(actionInfo, 'damageOverTime', 2, 5)
            }
            if (omicron == true) {
                await dispel(actionInfo.withSelfAsTarget(), 'debuff')
                await applyEffect(actionInfo.withSelfAsTarget(), 'retribution', 1, 1, false, true)
                // add bonus prot
                if (target.buffs.find(effect => effect.effectTags.includes('challenger'))) {
                    await applyEffect(actionInfo.withSelfAsTarget(), 'burning', 999)
                }
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
                await heal(actionInfo.withTarget(ally), hit[0])
            }
        }
    },
    'Water of Life': {
        displayName: 'Water of Life',
        image: 'images/abilities/ability_talia_special01.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['dispel', 'heal', 'turnmeter_recovery'],
        desc: "Dispel all debuffs on allies. Talia consumes 20% of her Max Health and gains 15% Turn Meter for each active ally. Allies recover 50% Health and gain 30% Turn Meter.",
        use: async function (actionInfo) {
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                await dispel(actionInfo.withTarget(ally), 'debuff')
                if (ally !== actionInfo.battleBro) {
                    await heal(actionInfo.withTarget(ally), ally.maxHealth * 0.5)
                    await TMchange(actionInfo.withTarget(ally), 30)
                }
            }
            await dealDmg(actionInfo.withSelfAsTarget(), 20, 'percentage', false, false, true)
            await TMchange(actionInfo.withSelfAsTarget(), 15 * aliveBattleBros[actionInfo.battleBro.team].length)
        }
    },
    'Harrowing Assault': {
        displayName: 'Harrowing Assault',
        image: 'images/abilities/ability_talia_special02.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'special_damage', 'damageOverTime', 'stagger'],
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
    // --------------------------------------------------------SAVI'S CHARACTERS
    'Slipper Slam': {
        displayName: 'Slipper Slam',
        image: 'images/abilities/johnWok1.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'projectile_attack', 'physical_damage', 'debuff_gain'],
        projectile: 'slipper',
        abilityDamage: 68,
        desc: "Deals physical damage to target enemy then deals physical damage to all other enemies which can't be countered, inflicting knockback for 1 turn on all of them.",
        use: async function (actionInfo) {
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let enemy of enemies) {
                const isTarget = (enemy == actionInfo.target) ? 2 : 1
                const counterable = (enemy == actionInfo.target) ? true : false
                let hit = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage * isTarget, 'physical', true, false, false, this.displayName, counterable)
                if (hit[0] > 0) {
                    await applyEffect(actionInfo.withTarget(enemy), 'knockback', 1)
                }
            }
        }
    },
    'Belt Flashbang': {
        displayName: 'Belt Flashbang',
        image: 'images/abilities/johnWok2.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['debuff_gain'],
        abilityDamage: 48,
        desc: "Deals low special damage to all enemies, which can't be countered. Enemies over 100% health are stunned for 1 turn, and other enemies are blinded for 1 turn. Debuffed enemies are staggered for 1 turn and buffed enemies are dazed for 1 turn.",
        use: async function (actionInfo) {
            const enemies = aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()
            for (let enemy of enemies) {
                let hit = await dealDmg(actionInfo.withTarget(enemy), this.abilityDamage, 'special', true, false, false, this.displayName, false)
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
        displayName: 'Belt Nunchuck',
        image: 'images/abilities/johnWok3.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'physical_damage', 'debuff_gain'],
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
        displayName: 'Minute Rice in 59 Seconds',
        image: 'images/abilities/johnWok4.png',
        abilityType: 'ultimate',
        ultimateCost: '3500',
        abilityTags: ['attack', 'physical_damage', 'debuff_gain'],
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
        displayName: 'Thwart the Plan',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'projectile_attack', 'physical_damage'],
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
        displayName: 'Important Meeting',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['debuff_gain', 'buff_gain'],
        desc: "Business Pig must interrupt the battle for an important meeting. Inflicts Locked Stun on all enemies that can't be resisted and sets the turn meter of all Superpig's Bravado allies to 0. Business Pig's speed is set to 0 until all enemies have come out of stun. Then Business Pig activates his jetpack and gains Aerial Advantage for 2 turns. During this Aerial Advantage he can use all other abilities except for Important Meeting and Oinks of Approval.",
        use: async function (actionInfo) {
            for (let enemy of actionInfo.enemies) {
                await applyEffect(actionInfo.withTarget(enemy), 'stun', 1, 1, false, true)
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                ally.turnMeter = 0
            }
            actionInfo.battleBro.customData.importantMeeting = {
                enemiesStunned: true
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
            if (actionInfo.target.buffs.find(effect => effect.effectTags.includes('targetLock'))) {
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
        abilityType: 'ultimate',
        ultimateCost: 2600,
        abilityTags: ['attack', 'physical_damage'],
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
        abilityType: 'ultimate',
        ultimateCost: 2100,
        abilityTags: ['buffGain'],
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
        displayName: "Sword Slash",
        image: 'images/abilities/ninja1.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage'],
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
        displayName: "Sneak Attack",
        image: 'images/abilities/ninja2.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['attack', 'special_damage'],
        abilityDamage: 260,
        desc: 'Deals special damage and stealths for 2 turns.',
        use: async function (actionInfo) {
            await dealDmg(actionInfo, this.abilityDamage, 'special')
            await applyEffect(actionInfo.withSelfAsTarget(), 'stealth', 2)
        },
    },
    'Dread Slash': {
        displayName: "Dread Slash",
        image: 'images/abilities/ninja3.png',
        abilityType: 'ultimate',
        ultimateCost: 2700,
        abilityTags: ['attack', 'shadow_damage'],
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
        displayName: "Gooseballs",
        image: 'images/abilities/ability_jediconsular_special01.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'projectile_attack', 'physical_damage'],
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
        displayName: "Honk of Approval",
        image: 'images/abilities/KraytDragonSkill4.png',
        abilityType: 'special',
        cooldown: 5,
        abilityTags: ['target_ally', 'buff_gain'],
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
        displayName: "Belly Bounce",
        image: 'images/abilities/KraytDragonSkill3.png',
        abilityType: 'special',
        cooldown: 4,
        abilityTags: ['attack', 'debuff_gain'],
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
        displayName: "Gooseball Barrage",
        image: 'images/abilities/ability_dathcha_basic.png',
        abilityType: 'ultimate',
        ultimateCost: 2700,
        abilityTags: ['attack', 'projectile_attack', 'physical_damage'],
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
        displayName: "Bob Bash",
        image: 'images/abilities/ability_grandmasteryoda_basic.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage'],
        abilityDamage: 200,
        desc: 'Deals physical damage and inflicts a random locked debuff for 4 turns.',
        use: async function (actionInfo) {
            let hit = await dealDmg(actionInfo, this.abilityDamage, 'physical')
            if (hit[0] > 0) {
                const debuffs = Object.entries(infoAboutEffects).filter(effect => effect[1].type === 'debuff')
                let randomDebuffIndex = Math.floor(Math.random() * debuffs.length)
                await applyEffect(actionInfo, debuffs[randomDebuffIndex][1].name, 4, 1, false, true)
            }
        },
    },
    'Bob Force': {
        displayName: 'Bob Force',
        image: 'images/abilities/ability_jediconsular_special01.png',
        abilityType: 'special',
        cooldown: 3,
        abilityTags: ['target_ally', 'health_recovery'],
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
            await applyEffect(healInfo, buffs[randomBuffIndex][1].name, 4, 1, false, true)
        }
    },
    'Bob Blast': {
        displayName: "Bob Blast",
        image: 'images/abilities/ability_jediconsular_special02.png',
        abilityType: 'ultimate',
        ultimateCost: 2500,
        abilityTags: ['buff_gain', 'debuff'],
        desc: 'Inflicts 3 locked debuffs on all enemies for 3 turns and 3 locked buffs on all allies for 3 turns.',
        use: async function (actionInfo) {
            const effects = Object.entries(infoAboutEffects)
            const debuffs = effects.filter(effect => effect[1].type === 'debuff')
            const buffs = effects.filter(effect => effect[1].type === 'buff')
            for (let enemy of aliveBattleBros.filter((_, i) => i !== actionInfo.battleBro.team).flat()) {
                for (let i = 0; i < 5; i++) {
                    let randomDebuffIndex = Math.floor(Math.random() * debuffs.length)
                    await applyEffect(actionInfo.withTarget(enemy), debuffs[randomDebuffIndex][1].name, 3, 1, false, true)
                }
            }
            for (let ally of aliveBattleBros[actionInfo.battleBro.team]) {
                for (let i = 0; i < 5; i++) {
                    let randomBuffIndex = Math.floor(Math.random() * buffs.length)
                    await applyEffect(actionInfo.withTarget(ally), buffs[randomBuffIndex][1].name, 3, 1, false, true)
                }
            }
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
        cooldown: 1,
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
        image: 'images/abilities/rageChili.png',
        abilityType: 'ultimate',
        ultimateCost: 2300,
        abilityTags: ['attack', 'physical_damage'],
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
        displayName: "Acid Rain",
        image: 'images/abilities/acidRain.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'projectile_attack', 'physical_damage'],
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
        displayName: "Healing Rain",
        image: 'images/abilities/healingRain.png',
        abilityType: 'special',
        cooldown: 1,
        abilityTags: ['target_ally', 'heal', 'dispel'],
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
        displayName: "Speed of Light",
        image: 'images/abilities/rageChili.png',
        abilityType: 'ultimate',
        ultimateCost: 1750,
        abilityTags: ['assist'],
        desc: 'Unleash five attacks from allies.',
        use: async function (actionInfo) {
            for (let i = 0; i < 5; i++) {
                let randomAllyIndex = Math.floor(Math.random() * aliveBattleBros[actionInfo.battleBro.team].length)
                await assist(new ActionInfo({ battleBro: aliveBattleBros[actionInfo.battleBro.team][randomAllyIndex], target: actionInfo.target }), actionInfo.battleBro)
            }
        },
    },
    'Thorny Vine': {
        displayName: "Thorny Vine",
        image: 'images/abilities/thornyVine.png',
        abilityType: 'basic',
        abilityTags: ['attack', 'physical_damage'],
        abilityDamage: 35,
        desc: 'Deals physical damage to target enemy and inflicts 3 stacks of damage over time for 3 turns.',
        use: async function (actionInfo) {
            await dealDmg(actionInfo, this.abilityDamage, 'physical')
            await applyEffect(actionInfo, 'damageOverTime', 3, 3)
        },
    },
    'Regrowth': {
        displayName: "Regrowth",
        image: 'images/abilities/regrowth.png',
        abilityType: 'special',
        cooldown: 1,
        abilityTags: ['target_ally', 'heal'],
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
        displayName: "Matildas Medicine",
        image: 'images/abilities/rageChili.png',
        abilityType: 'ultimate',
        ultimateCost: 1400,
        abilityTags: ['heal', 'dispel'],
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