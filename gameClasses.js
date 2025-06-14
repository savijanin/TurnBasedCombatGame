class AttackInfo {
    constructor(battleBro, target, damage = undefined) {
        this.battleBro = battleBro;
        this.target = target;
        this.damage = damage;
    }

    // --- COPY ---
    copy() {
        return new AttackInfo(this.battleBro, this.target, this.damage);
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
        let newObj = new AttackInfo(this.battleBro, this.target, this.damage);
        newObj.target = value;
        return newObj;
    }
}





class EffectInfo {
    constructor(battleBro, target = undefined, effectName = undefined) {
        this.battleBro = battleBro;
        this.target = target ? target : battleBro;
        this.effectName = effectName;
    }

    // --- COPY ---
    copy() {
        return new EffectInfo(this.battleBro, this.target, this.effectName);
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

    setEffectName(value) {
        this.effectName = value;
        return this;
    }

    // Special ones that clone at the same time, to avoid issues during parallel execution
    withTarget(value) {
        let newObj = new AttackInfo(this.battleBro, this.target, this.effectName);
        newObj.target = value;
        return newObj;
    }
}
