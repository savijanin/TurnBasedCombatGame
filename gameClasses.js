
class ActionInfo {
    /*
    constructor(battleBro, target, abilityName = undefined) {
        this.battleBro = battleBro;
        this.target = target;
        this.abilityName = abilityName;
    }
    */
    constructor(obj) {
        // If only one of battleBro or target is specified, use this value for both
        this.battleBro = obj.battleBro ? obj.battleBro : obj.target;
        this.target = obj.target ? obj.target : obj.battleBro;

        this.abilityName = obj.abilityName;
    }

    // --- COPY ---
    copy() {
        return new ActionInfo({ battleBro: this.battleBro, target: this.target, abilityName: this.abilityName });
    }

    // --- METHOD-STYLE SETTERS (for chaining) ---
    setBattleBro(value) {
        this.battleBro = value;
        return this;
    }

    setTarget(value) {
        this.target = value;
        return this;
    }

    setabilityName(value) {
        this.abilityName = value;
        return this;
    }

    // Special ones that clone at the same time, to avoid issues during parallel execution
    withTarget(value) {
        let newObj = new ActionInfo({ battleBro: this.battleBro, target: this.target, abilityName: this.abilityName });
        newObj.target = value;
        return newObj;
    }

    withSelfAsTarget() {
        let newObj = new ActionInfo({ battleBro: this.battleBro, target: this.battleBro, abilityName: this.abilityName });
        return newObj;
    }
}


ActionInfo; // to remove unused variable warning
