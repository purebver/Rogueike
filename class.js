import {achieve} from './server.js';

class Player {
    constructor(hp, power) {
      this.hp = hp;
      this.power = power;
      this.twice = 30;
      this.defense = 20;
    }
  
    attack(target) {
      // 플레이어의 공격
      let ap = Math.floor(this.power * (Math.random() * 0.21 + 0.9))
      target.hp -= ap;
      achieve.attack++;
      return ap;
    }
    recovery() {
      this.hp += this.power
    }
  }

  class Monster {
    constructor(mul) {
      this.hp = Math.floor(20 * mul * (Math.random() * 0.9 + 0.6));
      this.power = Math.floor(5 * mul * (Math.random() * 0.9 + 0.6));
    }
  
    attack(target) {
      // 몬스터의 공격
      let ap = Math.floor(this.power * (Math.random() * 0.21 + 0.9))
      target.hp -= ap;
      return ap;
    }
  }

  export {Player, Monster};