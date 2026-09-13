// One authoritative magazine; insertion chambers automatically in 120ms.
// Assisted reload takes one second. Every manipulation blocks held triggers.
export function createWeapon() {
  return { energy: 12, seated: true, primed: true, travel: 0,
    trigger: false, blocked: false, assist: 0,
    press(down) { if (!down || !this.trigger && this.seated && this.primed && !this.assist) this.blocked = false; this.trigger = down; },
    stop() { this.blocked = true; },
    remove() {
      if (!this.seated) return false;
      this.stop(); this.seated = this.primed = false; this.travel = 0; return true;
    },
    seat() {
      if (this.seated) return false;
      this.stop(); this.seated = true; this.primed = false; this.travel = 1; return true;
    },
    cancel() {
      this.assist = this.travel = 0; this.primed = this.seated;
      this.stop(); this.trigger = false;
    },
    reload() {
      if (this.assist) return false;
      this.remove(); this.stop(); this.assist = .001; return true;
    },
    step(dt, demand = dt) {
      let chamberTime = dt;
      if (this.assist) {
        const before = this.assist; this.assist += dt;
        if (before < .85 && this.assist >= .85) {
          this.seat(); this.energy = 12; chamberTime = this.assist - .85;
        }
        if (this.assist >= 1) { this.assist = 0; this.stop(); }
      }
      if (this.travel) {
        this.travel = Math.max(0, this.travel - chamberTime / .12);
        if (!this.travel) { this.primed = this.seated; this.stop(); }
      }
      const firing = this.trigger && !this.blocked && this.seated && this.primed && !this.assist && this.energy > 0;
      const emitted = firing ? Math.min(Math.max(0, demand), this.energy) : 0;
      this.energy -= emitted; return emitted;
    }
  };
}
