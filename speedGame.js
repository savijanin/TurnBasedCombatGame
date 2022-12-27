var numberOfAvatars = 16
var avatarTurnMeters = Array(numberOfAvatars).fill(0)
var avatarSpeeds = [6, 5, 12, 9, 7, 11, 10, 4, 12, 6, 5, 12, 9, 7, 11, 10]
//var avatarHtmlElements
var selectedGuys = ['CloneWarsChewbacca','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba','jabba']

var infoAboutCharacters = {
    'jabba': {
        image: 'jabba.png',
        baseSpeed: 7,
        health: 50,
        damage: 10,
        critical_chance: 50,
        critical_damage: 150,
        defence_penetration: 0,
        protection: 2,
        potency: 15,
        tenacity: 15,
        special_critical_chance: 20,
        defence: 30,
        special_defence: 10,
        dodge_chance: 2,
        critical_avoidance: 0,
        accuracy: 0,
        gear_level: 1,
        tags: ['light_side'],
    },
    'CloneWarsChewbacca': {
        image: 'CloneWarsChewbacca.png',
        baseSpeed: 126,
        health: 43470,
        damage: 3267,
        critical_chance: 28.46,
        critical_damage: 150,
        defence_penetration: 0,
        protection: 26186,
        potency: 28,
        tenacity: 55,
        special_critical_chance: 12.92,
        defence: 48.23,
        special_defence: 41.81,
        dodge_chance: 4,
        critical_avoidance: 0,
        accuracy: 0,
        gear_level: 13,
        tags: ['light_side','galactic_republic','leader','scoundrel','tank'],        
    },
    'MassiveJabba': {
        image: 'jabba.png',
        imageSize: 200,
        baseSpeed: 10,
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
        character: 'jabba',
        x:400,
        y:700,
        team: 0,
    },
    {
        character: 'jabba',
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

    $('#jabbaBlue2').attr("src",'CloneWarsChewbacca.png')

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
    $('.selected').removeClass('selected')
    let avatarHtmlElement = battleBros[avatarWithMaxTurnMeter].avatarHtmlElement
    avatarHtmlElement.addClass('selected')
    avatarTurnMeters[avatarWithMaxTurnMeter] -= 100
    console.log('avatarTurnMeters after processing:', avatarTurnMeters)

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