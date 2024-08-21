import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame, delay } from "./game.js";
import fs from 'fs';

export let achieve;

async function loadachieve() {
    if (fs.existsSync('./achieve.json')) {
        const data = await fs.promises.readFile('./achieve.json', 'utf8');
        achieve = JSON.parse(data);
    } else {
        console.log('achieve.json 파일이 없어 새로 생성합니다.');
        achieve = {
            start: 0,
            death: 0,
            attack: 0,
            clear: 0,
        };
        fs.writeFileSync('achieve.json', JSON.stringify(achieve), 'utf8');
    }
}


//플레이어 기본 능력치
let hp = 100;
let power = 10;

//업적 달성 시 추가 능력치
const bonus = [0, 0];
async function achievebonus() {
    await loadachieve();

    if (achieve.start > 0) {
        bonus[0] += 10;
    }
    if (achieve.death > 4) {
        bonus[0] += 40;
    }
    if (achieve.death > 9) {
        bonus[0] += 50;
    }
    if (achieve.attack > 9) {
        bonus[1] += 2;
    }
    if (achieve.attack > 19) {
        bonus[1] += 3;
    }
    if (achieve.attack > 49) {
        bonus[1] += 5;
    }
    if (achieve.clear > 0) {
        bonus[0] += 100;
        bonus[1] += 10;
    }
}


// 로비 화면을 출력하는 함수
function displayLobby() {
    console.clear();

    // 타이틀 텍스트
    console.log(
        chalk.cyan(
            figlet.textSync('RL- Javascript', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );

    // 상단 경계선
    const line = chalk.magentaBright('='.repeat(50));
    console.log(line);

    // 게임 이름
    console.log(chalk.yellowBright.bold('CLI 게임에 오신것을 환영합니다!'));

    // 설명 텍스트
    console.log(chalk.green('옵션을 선택해주세요.'));
    console.log();

    // 옵션들
    console.log(chalk.blue('1.') + chalk.white(' 새로운 게임 시작'));
    console.log(chalk.blue('2.') + chalk.white(' 업적 확인하기'));
    console.log(chalk.blue('3.') + chalk.white(' 옵션'));
    console.log(chalk.blue('4.') + chalk.white(' 종료'));

    // 하단 경계선
    console.log(line);

    // 하단 설명
    console.log(chalk.gray('1-4 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
async function handleUserInput() {
    const choice = readlineSync.question('입력: ');

    switch (choice) {
        case '1':
            console.log(chalk.green('게임을 시작합니다.'));
            hp += bonus[0];
            power += bonus[1];
            await delay(1000);
            // 여기에서 새로운 게임 시작 로직을 구현
            startGame(hp, power);
            break;
        case '2':
            // 업적 확인하기 로직을 구현
            console.log(chalk.yellow('달성된 업적 목록 입니다.'));
            achieve.start > 0 ? console.log('산뜻한 출발 - 업적 완료') : console.log('숨겨진 업적');
            achieve.death > 4 ? console.log('좀비? - 업적 완료') : console.log('숨겨진 업적');
            achieve.attack > 19 ? console.log('일단공격해! - 업적 완료') : console.log('숨겨진 업적');
            achieve.clear > 0 ? console.log('클리어! WOW 축하해요 - 업적 완료') : console.log('숨겨진 업적');
            const temp = readlineSync.question('아무글자나 눌러주세요:');
            displayLobby();
            handleUserInput();
            break;
        case '3':
            // 옵션 메뉴 로직을 구현
            console.log(
                chalk.blue(
                    `\n1. 초기 체력 수치를 더한다 2. 초기 공격력을 더한다 3. 초기선택화면으로`,
                ),
            );
            const choice = readlineSync.question('원하시는 옵션을 선택해 주세요 ');
            switch (choice) {
                case '1':
                    console.log(chalk.blue('초기 체력 수치 조정 100 ~ 200'));
                    const hpupdown = Number(readlineSync.question('원하시는 수치를 입력해 주세요.'));
                    if (hpupdown < 100 && hpupdown > 200) {
                        console.log(chalk.blue('값이 이상합니다'));
                        await delay(1000);
                        break;
                    }
                    hp = hpupdown;
                    break;
                case '2':
                    console.log(chalk.blue('초기 공격력 수치 조정 10 ~ 20'));
                    const poupdown = Number(readlineSync.question('원하시는 수치를 입력해 주세요:'));
                    if (poupdown < 10 && poupdown > 20) {
                        console.log(chalk.blue('값이 이상합니다'));
                        await delay(1000);
                        break;
                    }
                    power = poupdown;
                    break;
                default:
                    displayLobby();
                    handleUserInput();
            }
            displayLobby();
            handleUserInput();
            break;
        case '4':
            console.log(chalk.red('게임을 종료합니다.'));
            // 게임 종료 로직을 구현
            process.exit(0); // 게임 종료
            break;
        default:
            console.log(chalk.red('올바른 선택을 하세요.'));
            handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
    }
}

// 게임 시작 함수
async function start() {
    displayLobby();
    await achievebonus();
    handleUserInput();
}

// 게임 실행
start();