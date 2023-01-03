var numberOfAvatars = 16
var avatarTurnMeters = Array(numberOfAvatars).fill(0)
var avatarSpeeds = [6, 5, 12, 9, 7, 11, 10, 4, 12, 6, 5, 12, 9, 7, 11, 10]
//var avatarHtmlElements
var selectedGuys = ['CloneWarsChewbacca','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba']

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
        tags: ['lightSide','tank','leader','galacticRepublic','scoundrel'],
        abilities: ['bowcaster','wookieRage','defiantRoar'],
        passiveAbilities: ['wookieResolve'],
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
        tags: ['lightSide','support','leader','galacticRepublic','jedi'],
        abilities: ['ataru','masterstroke','unstoppableForce','battleMeditation'],
        passiveAbilities: ['grandMastersGuidance'],
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
        tags: ['lightSide','tank','leader','galacticRepublic','jedi','fleetCommander'],
        abilities: ['invincibleAssault','smite','thisPartysOver'],
        passiveAbilities: ['takeaSeat','vaapad','senseWeakness'],
    },
}

var battleBros = [
    // Team 0 (left side)
    {
        character: 'jabba',
        x:400,
        y:100,
        team: 0,
        // Defined elsewhere
        // - avatarHtmlElement
        // - isTargeted

    },
    {
        character: 'jabba',
        x:400,
        y:300,
        team: 0,
    },
    {
        character: 'CloneWarsChewbacca',
        x:400,
        y:500,
        team: 0,
    },
    {
        character: 'Yoda',
        x:400,
        y:700,
        team: 0,
    },
    {
        character: 'Mace Windu',
        x:250,
        y:200,
        team: 0,
    },
    {
        character: 'jabba',
        x:250,
        y:400,
        team: 0,
    },
    {
        character: 'jabba',
        x:250,
        y:600,
        team: 0,
    },
    {
        character: 'MassiveJabba',
        x:0,
        y:350,
        team: 0,
    },

    // Team 1 (right side)
    {
        character: 'jabba',
        x:1400,
        y:100,
        team: 1,
    },
    {
        character: 'jabba',
        x:1400,
        y:300,
        team: 1,
    },
    {
        character: 'jabba',
        x:1400,
        y:500,
        team: 1,
    },
    {
        character: 'jabba',
        x:1400,
        y:700,
        team: 1,
    },
    {
        character: 'jabba',
        x:1550,
        y:200,
        team: 1,
    },
    {
        character: 'jabba',
        x:1550,
        y:400,
        team: 1,
    },
    {
        character: 'jabba',
        x:1550,
        y:600,
        team: 1,
    },
    {
        character: 'MassiveJabba',
        x:1700,
        y:350,
        team: 1,
    },
]

var infoAboutAbilities = {
    'test1': {
        displayName: 'Battle meditation',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
    },
    'test2': {
        displayName: 'Battle meditation2',
        image: 'images/abilities/abilityui_passive_takeaseat.png',
    },
    'bowcaster': {
        displayName: 'Bowcaster',
        image: 'images/abilities/clonewarschewbacca_bowcaster.png',
    }
}

var abilityImagesPerTeam = [[],[]]


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

    for (let team=0; team<2; team++) {
        const maxNumberOfAbilities = 8
        for (let i=0; i<maxNumberOfAbilities; i++) {
            // Create new picture for ability
            let newAbilityImage = $('#abilityTemplate').clone().removeAttr("id")
            
            // Set position
            if (team==0) {
                newAbilityImage.css({ 'left': (i*115) + 'px' });
            }
            else {
                newAbilityImage.css({ 'right': (i*115) + 'px' });
            }

            newAbilityImage.appendTo('#myAbilities');
            abilityImagesPerTeam[team].push(newAbilityImage)
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
    // Find battlebro abilities
    let characterAbilities = infoAboutCharacters[battleBro.character].abilities//[0]
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

    // loop over battlebro abilities and display them
    if (characterAbilities) {
        for (i=0; i<characterAbilities.length; i++) {
            let processingAbility = characterAbilities[i]
            let imagePngPath = infoAboutAbilities[processingAbility].image

            // set the image png and set display=block
            let abilityImagesForCurrentTeam = abilityImagesPerTeam[battleBro.team]
            let abilityImage = abilityImagesForCurrentTeam[i]
            abilityImage.attr("src", imagePngPath)
            abilityImage.css({ 'display': 'block' });
        }
    }

}


function avatarClicked(clickedElement)
{
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