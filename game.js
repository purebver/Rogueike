import chalk from 'chalk';
import readlineSync from 'readline-sync';
import fs from 'fs';
import {achieve} from './server.js';
import {Player, Monster} from './class.js'

export const delay = (delaytime) => new Promise((a) => setTimeout(a, delaytime))

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보`, '체력:' + player.hp, '공격력:' + player.power,
    ) +
    chalk.redBright(
      `| 몬스터 정보 |`, '체력:' + monster.hp, '공격력:' + monster.power,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];
  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 연속공격 한다(${player.twice}%)  3. 방어하며 회복한다(${player.defense}%) 4. 도망간다`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    console.log(chalk.green(`${choice}를 선택하셨습니다.`));
    await delay(1000);

    switch (choice) {
      case '1':
        console.log(chalk.blueBright(`공격`));
        await delay(1000);
        console.log(chalk.blueBright(`몬스터는${player.attack(monster)} 데미지를 받았다`));
        await delay(1000);
        if (monster.hp <= 0) {
          break;
        }
        console.log(chalk.redBright(`몬스터의 공격`));
        await delay(1000);
        console.log(chalk.redBright(`당신은${monster.attack(player)} 데미지를 받았다`));
        await delay(1000);
        break;
      case '2':
        if (Math.random() < player.twice / 100) {
          console.log(chalk.blueBright('연속공격!'));
          await delay(1000);
          console.log(chalk.blueBright(`몬스터는${player.attack(monster)} 데미지를 받았다`));
          console.log(chalk.blueBright(`몬스터는${player.attack(monster)} 데미지를 받았다`));
          await delay(1000);

          if (monster.hp <= 0) {
            break;
          }

          console.log(chalk.redBright(`몬스터의 공격`));
          await delay(1000);
          console.log(chalk.redBright(`당신은${monster.attack(player)} 데미지를 받았다`));
          await delay(1000);
        } else {
          console.log(chalk.blueBright('당신은 연속공격에 실패했다'));
          await delay(1000);
          console.log(chalk.redBright(`몬스터의 공격`));
          await delay(1000);
          console.log(chalk.redBright(`당신은${monster.attack(player)} 데미지를 받았다`));
          await delay(1000);
        }
        break;
      case '3':
        if (Math.random() < player.defense / 100) {
          console.log(chalk.blueBright('당신은 몬스터의 공격을 성공적으로 막으면 회복을 취했다!'));
          await delay(1000);
          console.log(chalk.blueBright(`체력+${player.power}`));
          player.recovery();
          await delay(1000);
        } else {
          console.log(chalk.blueBright('당신은 방어에 실패했다'));
          await delay(1000);
          console.log(chalk.redBright(`몬스터의 공격`));
          await delay(1000);
          console.log(chalk.redBright(`당신은${monster.attack(player)} 데미지를 받았다`));
          await delay(1000);
        }
        break;
      case '4':
        if (stage === 1) {
          console.log('더이상 뒤가 없다.');
          await delay(1000);
        } else {
          console.log('도망중 공격을 받았다.');
          await delay(1000);
          monster.attack(player);
          await delay(1000);
          return false; //도주 확인용
        }
        break;
      default:
        console.log(chalk.red('올바른 선택을 해주세요.'));
        await delay(1000);
    }
    if (player.hp <= 0) {
      console.log(chalk.redBright('당신은 죽었습니다.'));
      achieve.death++;
      fs.writeFileSync('achieve.json', JSON.stringify(achieve, null, 2), 'utf8');
      console.log('5초뒤 게임이 종료 됩니다');
      for (let i = 5; i > 0; i--) {
        console.log(i);
        await delay(1000);
      }
      process.exit(0);
    }
    if (monster.hp > 0) {
      continue;
    } else {
      break;
    }
  }
  return true; //도주한게 아님을 나타냄
};

// 게임시작
export async function startGame(hp, power) {
  achieve.start++;// 업적용

  console.clear();

  const player = new Player(hp, power);// 플레이어 생성

  let stage = 1;// 스테이지 생성

  //메인 스테이지 관리 로직
  while (stage <= 10) {
    const monster = new Monster(stage);
    const temp = await battle(stage, player, monster); //배틀 및 도주 확인용 리턴값

    // 스테이지에서 도주
    if (!temp) {
      if (player.hp <= 0) {
        //도주중 맞고 죽을경우
        console.log(chalk.redBright('당신은 죽었습니다.'));
        achieve.death++;
        fs.writeFileSync('achieve.json', JSON.stringify(achieve, null, 2), 'utf8');
        console.log('5초뒤 게임이 종료 됩니다');
        for (let i = 5; i > 0; i--) {
          console.log(i);
          await delay(1000);
        }
        process.exit(0);
      }
      stage--;
      continue;
    }

    // 스테이지 클리어 및 게임 종료 조건
    let reward = 0; //스테이지 클리어 보상 정산값 저장용

    if (monster.hp > 0) {
      continue;
    } else {
      console.log('당신은 몬스터를 쓰러뜨렸다.');
      await delay(1000);
      console.log(
        chalk.green(
          `\n1. 체력을 올린다 2. 공격력을 올린다 3. 연속공격 확률을 올린다 4. 방어률을 올린다`,
        ),
      );
      const choice = readlineSync.question('당신의 선택은? ');
      console.log(chalk.green(`${choice}를 선택하셨습니다.`));
      await delay(1000);
      switch (choice) {
        case '1':
          reward = Math.floor(stage * 12 * (Math.random() + 0.5));
          console.log(chalk.green(`체력이 ${reward} 올랐다`));
          player.hp += reward;
          break;
        case '2':
          reward = Math.floor(stage * 4 * (Math.random() + 0.5));
          console.log(chalk.green(`공격력이 ${reward} 올랐다`));
          player.power += reward;
          break;
        case '3':
          reward = Math.round(stage * (Math.random() + 2));
          console.log(chalk.green(`연속공격 확률이 ${reward}% 올랐다`));
          player.twice += reward;
          break;
        case '4':
          reward = Math.round(stage * (Math.random() + 2));
          console.log(chalk.green(`방어률이 ${reward}% 올랐다`));
          player.defense += reward;
          break;
        default:
          console.log(chalk.red('선택하지 않았습니다'));
      }
      await delay(1000);
    }
    stage++;
  }

  // while문 탈출은 클리어 했을 경우뿐
  console.log(chalk.blue('축하합니다 게임을 클리어 하셨습니다.'));

  achieve.clear++;
  fs.writeFileSync('achieve.json', JSON.stringify(achieve), 'utf8');
  await delay(1000);
  console.log('5초뒤 게임이 종료 됩니다');
  for (let i = 5; i > 0; i--) {
    console.log(i);
    await delay(1000);
  }
  process.exit(0);
}
