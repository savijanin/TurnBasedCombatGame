var numberOfAvatars = 16
var avatarTurnMeters = Array(numberOfAvatars).fill(0)
var avatarSpeeds = [6, 5, 12, 9, 7, 11, 10, 4, 12, 6, 5, 12, 9, 7, 11, 10]
var avatarHtmlImages


$(document).ready(function () {
    console.log('App started')

    // Fill array of avatar images
    avatarHtmlImages = [
        $('#jabbaBlue1'),
        $('#jabbaBlue2'),
        $('#jabbaBlue3'),
        $('#jabbaBlue4'),
        $('#jabbaBlue5'),
        $('#jabbaBlue6'),
        $('#jabbaBlue7'),
        $('#jabbaBlueMassive1'),
        $('#jabbaRed1'),
        $('#jabbaRed2'),
        $('#jabbaRed3'),
        $('#jabbaRed4'),
        $('#jabbaRed5'),
        $('#jabbaRed6'),
        $('#jabbaRed7'),
        $('#jabbaRedMassive1'),
    ]

    $('#button1').on('click', doMyStuff)

    console.log('avatarTurnMeters:', avatarTurnMeters)

})

function doMyStuff() {
    console.log('---------- Click detected ------------')

    // How to move an image
    var position = $('#jabba').position()
    $('#jabba').css({ 'left': position.left + 10 + 'px', 'top': position.top + 'px' });

    // How to change text
    $('#jabbaHealth').text("dead")

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
    avatarHtmlImages[avatarWithMaxTurnMeter].addClass('selected')
    avatarTurnMeters[avatarWithMaxTurnMeter] -= 100
    console.log('avatarTurnMeters after processing:', avatarTurnMeters)

}
