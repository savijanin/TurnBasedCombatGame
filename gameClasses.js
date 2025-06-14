class AttackInfo {
    constructor(battleBro, target, damage) {
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
}
