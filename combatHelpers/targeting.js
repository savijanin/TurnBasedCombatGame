import { aliveBattleBros } from '../globalVars.js'
import { battleBros } from '../battleBros.js'

export async function changeTarget(target) {
    //await logFunctionCall('changeTarget', ...arguments)
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

export async function switchTarget(battleBro) {
    //await logFunctionCall('switchTarget', ...arguments)
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

export async function changingTarget(target) {
    //await logFunctionCall('changingTarget', ...arguments)
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