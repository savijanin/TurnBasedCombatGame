class ActionInfo {
    /*
    constructor(battleBro, target, damage = undefined) {
        this.battleBro = battleBro;
        this.target = target;
        this.damage = damage;
    }
    */
    constructor(obj) {
        // If only one of battleBro or target is specified, use this value for both
        this.battleBro = obj.battleBro ? obj.battleBro : obj.target;
        this.target = obj.target ? obj.target : obj.battleBro;

        this.damage = obj.damage;
    }

    // --- COPY ---
    copy() {
        return new ActionInfo({ battleBro: this.battleBro, target: this.target, damage: this.damage });
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

    setDamage(value) {
        this.damage = value;
        return this;
    }

    // Special ones that clone at the same time, to avoid issues during parallel execution
    withTarget(value) {
        let newObj = new ActionInfo({ battleBro: this.battleBro, target: this.target, damage: this.damage });
        newObj.target = value;
        return newObj;
    }

    withSelfAsTarget() {
        let newObj = new ActionInfo({ battleBro: this.battleBro, target: this.battleBro, damage: this.damage });
        return newObj;
    }
}
