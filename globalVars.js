
export var selectedBattleBroNumber = -1
export var team2abilitiesAlwaysVisible = false
export var pendingAbility = null
export var aliveBattleBros = []
export var ultimateCharge = []
export var ultimateBeingUsed = false
//var isAnythingElseRunningHereAtTheSameTime = 0
export var engagingCounters = false
export var characterDying = false
export var promises = []
export var checkingPromises = null
export const wait = ms => new Promise(res => setTimeout(res, ms))
export const floatingTextQueues = new Map()
// FUNNY CONDITIONS
export var omicron = true // activates omicron bonuses on some abilities
export var headbutt = true   // characters will headbutt enmies with melee attacks
export var oldSchool = false // characters will use old school abilities (incredibly overpowered)
export var sharePassives = false // doesn't work
export var startingUltCharge = 0

export var runningDelay = 0;
