var numberOfAvatars = 16
var avatarTurnMeters = Array(numberOfAvatars).fill(0)
var avatarSpeeds = [6, 5, 12, 9, 7, 11, 10, 4, 12, 6, 5, 12, 9, 7, 11, 10]
//var avatarHtmlElements
var selectedGuys = ['CloneWarsChewbacca', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba', 'jabba']

var infoAboutCharacters = {
    'jabba': {
        image: 'images/jabba.png',
        physicalDamage: 18000,
        physicalCritChance: 50,
        armourPenetration: 200,
        health: 50000,
        protection: 15000,
        baseSpeed: 111,
        potency: 900,
        tenacity: 1,
        critDamage: 150,
        specialDamage: 10000,
        specialCritChance: 25,
        resistancePenetration: 200,
        armourPercent: 50,
        resistancePercent: 50,
        armourNumber: 500,
        resistanceNumber: 500,
        critAvoidance: 0,
        healthSteal: 100,
        accuracy: 0,
        tags: ['lightSide'],
        abilities: ['test1', 'test2'],
        passiveAbilities: ['test3'],
        charDesc: 'insert funny description here',
    },
    'CloneWarsChewbacca': {
        image: 'images/avatars/CloneWarsChewbacca.png',
        physicalDamage: 3267,
        physicalCritChance: 28.46,
        armourPenetration: 101,
        health: 43470,
        protection: 52371,
        baseSpeed: 126,
        potency: 28,
        tenacity: 55,
        critDamage: 150,
        specialDamage: 2043,
        specialCritChance: 12.92,
        resistancePenetration: 0,
        armourPercent: 48.23,
        resistancePercent: 41.81,
        armourNumber: 594,
        resistanceNumber: 458,
        critAvoidance: 0,
        healthSteal: 10,
        accuracy: 0,
        tags: ['lightSide', 'tank', 'leader', 'galacticRepublic', 'scoundrel'],
        abilities: ['bowcaster', 'wookieRage', 'defiantRoar'],
        passiveAbilities: ['wookieResolve'],
        charDesc: 'Durable Tank with both Taunt and self-Healing',
    },
    'MassiveJabba': {
        image: 'images/jabba.png',
        imageSize: 200,
        baseSpeed: 10,
    },
    'Yoda': {
        image: 'images/avatars/GrandmasterYoda.png',
        imageSize: 100,
        physicalDamage: 2527,
        physicalCritChance: 28.42,
        armourPenetration: 36,
        health: 33753,
        protection: 18937,
        baseSpeed: 177,
        potency: 56,
        tenacity: 39,
        critDamage: 150,
        specialDamage: 4492,
        specialCritChance: 22.92,
        resistancePenetration: 130,
        armourPercent: 31.85,
        resistancePercent: 19.46,
        armourNumber: 298,
        resistanceNumber: 154,
        critAvoidance: 0,
        healthSteal: 5,
        accuracy: 0,
        tags: ['lightSide', 'support', 'leader', 'galacticRepublic', 'jedi'],
        abilities: ['ataru', 'masterstroke', 'unstoppableForce', 'battleMeditation'],
        passiveAbilities: ['grandMastersGuidance'],
        charDesc: 'Masterful Jedi support that can replicate enemy buffs and share them with allies',
    },
    'Mace Windu': {
        image: 'images/avatars/MaceWindu.png',
        imageSize: 100,
        physicalDamage: 2689,
        physicalCritChance: 23.33,
        armourPenetration: 80,
        health: 36040,
        protection: 39209,
        baseSpeed: 143,
        potency: 46,
        tenacity: 47,
        critDamage: 150,
        specialDamage: 4679,
        specialCritChance: 18.13,
        resistancePenetration: 140,
        armourPercent: 31.19,
        resistancePercent: 43.31,
        armourNumber: 289,
        resistanceNumber: 487,
        critAvoidance: 0,
        healthSteal: 15,
        accuracy: 0,
        tags: ['lightSide', 'tank', 'leader', 'galacticRepublic', 'jedi', 'fleetCommander'],
        abilities: ['invincibleAssault', 'smite', 'thisPartysOver'],
        passiveAbilities: ['takeaSeat', 'vaapad', 'senseWeakness'],
        charDesc: 'Aggressive Jedi tank with devastating damage if left unchecked',
    },
    'Darth Vader': {
        image: 'images/avatars/DarthVader.png',
        imageSize: 100,
        physicalDamage: 3447,
        physicalCritChance: 37.67,
        armourPenetration: 175,
        health: 32156,
        protection: 47828,
        baseSpeed: 141,
        potency: 50,
        tenacity: 43,
        critDamage: 150,
        specialDamage: 2570,
        specialCritChance: 11.88,
        resistancePenetration: 0,
        armourPercent: 43.36,
        resistancePercent: 34.38,
        armourNumber: 488,
        resistanceNumber: 334,
        critAvoidance: 0,
        healthSteal: 15,
        accuracy: 0,
        tags: ['darkSide', 'attacker', 'leader', 'empire', 'sith', 'fleetCommander'],
        abilities: ['terrifyingSwing', 'forceCrush', 'cullingBlade','mercilessMassacre'],
        passiveAbilities: ['inspiringThroughFear', 'noEscape'],
        charDesc: 'Fearsome Attacker that applies AoE Damage Over Time, and crushes debuffed targets for extra turns',
    },
}

var battleBros = [
    // Team 0 (left side)
    {
        character: 'jabba',
        x: 400,
        y: 100,
        team: 0,
        // Defined elsewhere
        // - avatarHtmlElement
        // - isTargeted

    },
    {
        character: 'jabba',
        x: 400,
        y: 300,
        team: 0,
    },
    {
        character: 'CloneWarsChewbacca',
        x: 400,
        y: 500,
        team: 0,
    },
    {
        character: 'Yoda',
        x: 400,
        y: 700,
        team: 0,
    },
    {
        character: 'Mace Windu',
        x: 250,
        y: 200,
        team: 0,
    },
    {
        character: 'jabba',
        x: 250,
        y: 400,
        team: 0,
    },
    {
        character: 'jabba',
        x: 250,
        y: 600,
        team: 0,
    },
    {
        character: 'MassiveJabba',
        x: 0,
        y: 350,
        team: 0,
    },

    // Team 1 (right side)
    {
        character: 'jabba',
        x: 1400,
        y: 100,
        team: 1,
    },
    {
        character: 'jabba',
        x: 1400,
        y: 300,
        team: 1,
    },
    {
        character: 'jabba',
        x: 1400,
        y: 500,
        team: 1,
    },
    {
        character: 'jabba',
        x: 1400,
        y: 700,
        team: 1,
    },
    {
        character: 'jabba',
        x: 1550,
        y: 200,
        team: 1,
    },
    {
        character: 'jabba',
        x: 1550,
        y: 400,
        team: 1,
    },
    {
        character: 'jabba',
        x: 1550,
        y: 600,
        team: 1,
    },
    {
        character: 'MassiveJabba',
        x: 1700,
        y: 350,
        team: 1,
    },
]

var infoAboutAbilities = {
    'test1': {
        displayName: 'Battle meditation',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        desc: 'This is a test, deal physical damage to target enemy.',
        abilityType: 'basic',
        abilityTags: ['physical_damage','projectile_attack'],
        abilityDamage: 100,
        abilityDamageVariance: 500,
    },
    'test2': {
        displayName: 'Battle meditation2',
        image: 'images/abilities/abilityui_passive_takeaseat.png',
        desc: 'Heal target ally',
        abilityType: 'special',
        abilityTags: ['health_recovery'],
    },
    'bowcaster': {
        displayName: 'Bowcaster',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
        desc: 'Deal Physical damage to target enemy with a 55% chance to remove 50% Turn Meter.',
        abilityType: 'basic',
        abilityTags: ['physical_damage','projectile_attack'],
        abilityDamage: 117.8,
        abilityDamageVariance: 500,
    },
    'wookieRage': {
        displayName: 'Wookie Rage',
        image: 'images/abilities/clonewarschewbacca_wookierage.png',
        desc: 'Chewbacca Taunts and gains 2 stacks of Health Up for 2 turns.',
        abilityType: 'special',
        abilityTags: ['buff_gain'],
    },
    'defiantRoar': {
        displayName: 'Defiant Roar',
        image: 'images/abilities/clonewarschewbacca_defiantroar.png',
        desc: 'Chewbacca recovers 40% of his Max Health and gains Defense Up for 3 Turns, with a 25% Chance to also gain 25% Turn Meter.',
        zeta_desc: 'Chewbacca dispels all debuffs from himself, recovers 50% of his Max Health, gains Defense Up for 3 Turns, and has a 50% Chance to gain 25% Turn Meter.',
        abilityType: 'special',
        abilityTags: ['dispel','health_recovery','buff_gain','turnmeter_recovery'],
    },
    'ataru': {
        displayName: 'Ataru',
        image: 'images/abilities/ability_grandmasteryoda_basic.png',
        desc: 'Deal Special damage to target enemy and inflict Potency Down for 1 Turn. If that enemy has 50% or more Health, Yoda gains 40% Turn Meter and Foresight for 2 turns. If that enemy has less than 50% Health, Yoda gains Offense Up and Defense Penetration Up for 2 turns.',
        abilityType: 'basic',
        abilityTags: ['turnmeter_recovery','buff_gain','special_damage','debuff_gain'],
        abilityDamage: 208,
        abilityDamageVariance: 500,
    },
    'masterstroke': {
        displayName: 'Masterstroke',
        image: 'images/abilities/ability_grandmasteryoda_special01.png',
        desc: 'Deal Special damage to all enemies. Then, for each buff an enemy has, Grand Master Yoda gains that effect for 3 turns. (Unique status effects can\'t be copied.) Grand Master Yoda takes a bonus turn as long as there is one other living Jedi ally.',
        abilityType: 'special',
        abilityTags: ['bonus_turn','special_damage', 'buff_gain'],
        abilityDamage: 60.2,
        abilityDamageVariance: 500,
    },
    'unstoppableForce': {
        displayName: 'Unstoppable Force',
        image: 'images/abilities/ability_grandmasteryoda_special02.png',
        desc: 'Deal Special damage to target enemy and remove 70% Turn Meter. If that enemy had less than 100% Health, they are also Stunned for 1 turn.',
        abilityType: 'special',
        abilityTags: ['debuff_gain','special_damage'],
        abilityDamage: 299.9,
        abilityDamageVariance: 500,
    },
    'battleMeditation': {
        displayName: 'Battle Meditation',
        image: 'images/abilities/ability_grandmasteryoda_special03.png',
        desc: 'Yoda gains Tenacity Up and Protection Up (30%) for 2 turns, then grants each ally every non-unique buff he has (excluding Stealth and Taunt) for 2 turns, with a 50% chance to also grant Yoda 35% Turn Meter.',
        zeta_desc: 'Yoda gains Tenacity Up, Protection Up (30%), and Foresight for 2 turns, then grants each ally every non-unique buff he has (excluding Stealth and Taunt) for 2 turns. Yoda grants himself +35% Turn Meter and an additional +10% Turn Meter for each other living Jedi ally.',
        abilityType: 'special',
        abilityTags: ['turnmeter_recovery','buff_gain'],
    },
}

var infoAboutPassives = {
    'test3': {
        displayName: 'Battle mooditation',
        image: 'images/abilities/ability_grandmasteryoda_special01.png',
        desc: 'jabba\'s blubber grants him 50% counter chance',
        abilityType: 'unique',
        abilityTags: [],
    },
    'wookieResolve': {
        displayName: 'Wookie Resolve',
        image: 'images/abilities/abilityui_passive_def.png',
        desc: 'All allies have +50 Defense, and a 50% chance to gain Defense Up for 3 turns whenever they are damaged.',
        omicron_desc: 'At the start of battle, if no allies are galactic legends, allied light side tanks gain Max Health and Protection equal to 50% of Chewbacca\'s Max Health and Protection and Chewbacca gains bonus Max Health and Protection equal to 20% of every allied light side tank\'s max health and protection.',
        abilityType: 'leader',
        abilityTags: ['buff_gain','grand_arena_omicron'],
    },
    'grandMastersGuidance': {
        displayName: 'Grand Master\'s Guidance',
        image: 'images/abilities/abilityui_passive_removeharmful.png',
        desc: 'Jedi allies have +25% Tenacity. Whenever a Jedi ally Resists a debuff, they gain 25% Turn Meter.',
        zeta_desc: 'Jedi allies have +30% Tenacity. Whenever a Jedi ally Resists a debuff, they gain the following: 30% Turn Meter, Critical Chance Up for 2 turns, and Critical Damage Up for 2 turns. Whenever they suffer a debuff, they gain Tenacity Up for 1 turn at the end of that turn. Grand Master Yoda is immune to Shock.',
        omicron_desc: 'At the start of battle if there are no galactic legends and all allies are Galactic Republic Jedi, the leadership abilities of all other allies are active until the end of battle.',
        abilityType: 'leader',
        abilityTags: ['buff_gain','grand_arena_omicron'],
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
        abilityTags: ['dispel','buff_gain'],
    },
    'senseWeakness': {
        displayName: 'Sense Weakness',
        image: 'images/abilities/abilityui_passive_senseweakness.png',
        desc: 'Mace gains 30% Offense. At the start of Mace\'s turn, dispel Stealth on all enemies and a random enemy (excluding raid bosses and Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. Shatterpoint is dispelled at the end of each ally\'s turn. \n Shatterpoint: Receiving damage dispels Shatterpoint and reduces Defense, Max Health, and Offense by 10% for the rest of the encounter; enemies can ignore Taunt to target this unit',
        zeta_desc: 'Mace gains 30% Offense. At the start of Mace\'s turn, dispel Stealth on all enemies and a random enemy (excluding raid bosses and Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. Shatterpoint is dispelled at the end of each ally\'s turn. When an ally damages an enemy with Shatterpoint, all allies recover 10% Protection, and all Galactic Republic Jedi allies gain Foresight for 1 turn. \n Shatterpoint: Receiving damage dispels Shatterpoint and reduces Defense, Max Health, and Offense by 10% for the rest of the encounter; enemies can ignore Taunt to target this unit',
        omicron_desc: 'At the start of each other Light Side ally\'s turn, a random enemy (excluding Galactic Legends) is inflicted with Speed Down for 1 turn and Shatterpoint, which can\'t be evaded or resisted. When an ally damages an enemy with Shatterpoint, all allies gain 5% Turn Meter.',
        abilityType: 'unique',
        abilityTags: ['territory_war_omicron','dispel','debuff_gain','protection_recovery','turnmeter_recovery']
    },
}

var abilityImagesPerTeam = [[], []]
var passiveImagesPerTeam = [[],[]]


$(document).ready(function () {
    console.log('App started')

    // Fill array of avatar images
    //avatarHtmlElements = []

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
            let newAbilityImage = $('#abilityTemplate').clone().removeAttr("id")
            let newPassiveImage = $('#passiveTemplate').clone().removeAttr("id")

            // Set position
            if (team == 0) {
                newAbilityImage.css({ 'left': (i * 115 + 15) + 'px' });
                newPassiveImage.css({ 'left': (i * 85 + 15) + 'px' });
            }
            else {
                newAbilityImage.css({ 'right': (i * 115+ 15) + 'px' });
                newPassiveImage.css({ 'right': (i * 85 + 15) + 'px' });
            }

            newAbilityImage.appendTo('#myAbilities');
            abilityImagesPerTeam[team].push(newAbilityImage)

            newPassiveImage.appendTo('#myPassives');
            passiveImagesPerTeam[team].push(newPassiveImage)
        }
    }

    // ?
    //$('#jabbaBlue2').attr("src",'image/avatars/CloneWarsChewbacca.png')

    $('#button1').on('click', doMyStuff)

    console.log('avatarTurnMeters:', avatarTurnMeters)

})

function doMyStuff() {
    console.log('---------- Click detected ------------')

    // How to move an image
    /*
    var position = $('#jabbaTemplate').position()
    $('#jabbaTemplate').css({ 'left': position.left + 10 + 'px', 'top': position.top + 'px' });
    */

    // How to change text
    //$('#jabbaHealth').text("dead")

    var maxTurnMeter = Math.max(...avatarTurnMeters)
    while (maxTurnMeter < 100) {
        for (var i = 0; i < numberOfAvatars; i++) {
            if (avatarSpeeds[i]) {
                avatarTurnMeters[i] += avatarSpeeds[i]
            }
        }
        console.log('avatarTurnMeters after increase:', avatarTurnMeters)
        maxTurnMeter = Math.max(...avatarTurnMeters)
    }

    let avatarWithMaxTurnMeter = avatarTurnMeters.indexOf(maxTurnMeter);
    console.log('maxTurnMeter:', maxTurnMeter)
    console.log('avatarWithMaxTurnMeter:', avatarWithMaxTurnMeter)

    console.log('Processing avatar------------------------- ', avatarWithMaxTurnMeter)
    $('#myText').html('Processing avatar------------------------- ' + avatarWithMaxTurnMeter)
    selectBattleBro(avatarWithMaxTurnMeter)
    avatarTurnMeters[avatarWithMaxTurnMeter] -= 100
    console.log('avatarTurnMeters after processing:', avatarTurnMeters)

}


function selectBattleBro(battleBroNumber) {
    $('.selected').removeClass('selected')
    let battleBro = battleBros[battleBroNumber]
    let avatarHtmlElement = battleBro.avatarHtmlElement
    avatarHtmlElement.addClass('selected')

    // Update ability images
    let abilityImages = abilityImagesPerTeam[battleBro.team]
    let passiveImages = passiveImagesPerTeam[battleBro.team]
    // Find battlebro abilities
    let characterAbilities = infoAboutCharacters[battleBro.character].abilities//[0]
    let characterPassives = infoAboutCharacters[battleBro.character].passiveAbilities
    /*
    is the same as:
        let characterName = battleBro.character
        let infoAboutThisCharacter = infoAboutCharacters[characterName]
        let characterAbilities = infoAboutThisCharacter.abilities
    */

    // Hide all ability images
    for (let abilityImages of abilityImagesPerTeam) {
        for (let abilityImage of abilityImages) {
            abilityImage.css({ 'display': 'none' });
        }
    }
    for (let passiveImages of passiveImagesPerTeam) {
        for (let passiveImage of passiveImages) {
            passiveImage.css({ 'display': 'none' });
        }
    }

    // loop over battlebro abilities and display them
    if (characterAbilities) {
        for (i = 0; i < characterAbilities.length; i++) {
            let processingAbility = characterAbilities[i]
            let imagePngPath = infoAboutAbilities[processingAbility].image

            // set the image png and set display=block
            let abilityImagesForCurrentTeam = abilityImagesPerTeam[battleBro.team]
            let abilityImage = abilityImagesForCurrentTeam[i]
            abilityImage.attr("src", imagePngPath)
            abilityImage.css({ 'display': 'block' });
        }
    }
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


function avatarClicked(clickedElement) {
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

    // Set isTarget=false to all other battleBros from the same team
    for (let battleBro of battleBros) {
        if (battleBro.team == foundBattleBro.team) {
            battleBro.isTarget = false
        }
    }

    // Set isTarget=true to our newly-selected battleBro
    foundBattleBro.isTarget = true

    // Move team's target image
    let htmlElementName = '#targetTeam' + foundBattleBro.team
    $(htmlElementName).css({ 'left': foundBattleBro.x + 'px', 'top': foundBattleBro.y + 'px' });

}