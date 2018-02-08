/* by：弦云孤赫——David Yang
** github - https://github.com/yangyunhe369
*/
// 封装打印日志方法
const log = console.log.bind(console)
// 生成图片对象方法
const imageFromPath = function (src) {
  let img = new Image()
  img.src = './images/' + src
  return img
}
// 原生动画参数
const keyframesOptions = {
  iterations: 1,
  iterationStart: 0,
  delay: 0,
  endDelay: 0,
  direction: 'alternate',
  duration: 3000,
  fill: 'forwards',
  easing: 'ease-out',
}
// 图片素材路径
const allImg = {
  startBg: 'coverBg.jpg',                         // 首屏背景图
  bg: 'background1.jpg',                          // 游戏背景
  bullet: 'bullet.png',                           // 子弹普通状态
  bulletHit: 'bullet_hit.png',                    // 子弹击中敌人状态
  sunback: 'sunback.png',                         // 阳光背景框
  zombieWon: 'zombieWon.png',                     // 僵尸胜利画面
  car: 'car.png',                                 // 小汽车图片
  loading: {                                      // loading 画面
    write: {
      path: 'loading/loading_*.png',
      len: 3,
    },
  },
  plantsCard: {                                               // 植物卡片
    sunflower: {  // 向日葵
      img: 'cards/plants/SunFlower.png',
      imgG: 'cards/plants/SunFlowerG.png',
    },
    peashooter: { // 豌豆射手
      img: 'cards/plants/Peashooter.png',
      imgG: 'cards/plants/PeashooterG.png',
    },
    repeater: { // 双发射手
      img: 'cards/plants/Repeater.png',
      imgG: 'cards/plants/RepeaterG.png',
    },
    gatlingpea: { // 加特林射手
      img: 'cards/plants/GatlingPea.png',
      imgG: 'cards/plants/GatlingPeaG.png',
    },
    cherrybomb: { // 樱桃炸弹
      img: 'cards/plants/CherryBomb.png',
      imgG: 'cards/plants/CherryBombG.png',      
    },
    wallnut: {  // 坚果墙
      img: 'cards/plants/WallNut.png',
      imgG: 'cards/plants/WallNutG.png',
    },
    chomper: {  // 食人花
      img: 'cards/plants/Chomper.png',
      imgG: 'cards/plants/ChomperG.png',
    },
  },
  plants: {                                                   // 植物 
    sunflower: {  // 向日葵
      idle: {
        path: 'plants/sunflower/idle/idle_*.png',
        len: 18,
      },
    },
    peashooter: { // 豌豆射手
      idle: {
        path: 'plants/peashooter/idle/idle_*.png',
        len: 8,
      },
      attack: {
        path: 'plants/peashooter/attack/attack_*.png',
        len: 8,
      },
    },
    repeater: { // 双发射手
      idle: {
        path: 'plants/repeater/idle/idle_*.png',
        len: 15,
      },
      attack: {
        path: 'plants/repeater/attack/attack_*.png',
        len: 15,
      },
    },
    gatlingpea: { // 加特林射手
      idle: {
        path: 'plants/gatlingpea/idle/idle_*.png',
        len: 13,
      },
      attack: {
        path: 'plants/gatlingpea/attack/attack_*.png',
        len: 13,
      },
    },
    cherrybomb: { // 樱桃炸弹
      idle: {
        path: 'plants/cherrybomb/idle/idle_*.png',
        len: 7,
      },
      attack: {
        path: 'plants/cherrybomb/attack/attack_*.png',
        len: 5,
      },
    },
    wallnut: { // 坚果墙
      idleH: { // 血量高时动画
        path: 'plants/wallnut/idleH/idleH_*.png',
        len: 16,
      },
      idleM: { // 血量中等时动画
        path: 'plants/wallnut/idleM/idleM_*.png',
        len: 11,
      },
      idleL: { // 血量低时动画
        path: 'plants/wallnut/idleL/idleL_*.png',
        len: 15,
      },
    },
    chomper: { // 食人花
      idle: { // 站立动画
        path: 'plants/chomper/idle/idle_*.png',
        len: 13,
      },
      attack: { // 攻击动画
        path: 'plants/chomper/attack/attack_*.png',
        len: 8,
      },
      digest: { // 消化阶段动画
        path: 'plants/chomper/digest/digest_*.png',
        len: 6,
      }
    },
  },
  zombies: {                                            // 僵尸
    idle: { // 站立动画
      path: 'zombies/idle/idle_*.png',
      len: 31,
    },
    run: { // 移动动画
      path: 'zombies/run/run_*.png',
      len: 31,
    },
    attack: { // 攻击动画
      path: 'zombies/attack/attack_*.png',
      len: 21,
    },
    dieboom: { // 被炸死亡动画
      path: 'zombies/dieboom/dieboom_*.png',
      len: 20,
    },
    dying: { // 濒死动画
      head: {
        path: 'zombies/dying/head/head_*.png',
        len: 12,
      },
      body: {
        path: 'zombies/dying/body/body_*.png',
        len: 18,
      },
    },
    die: { // 死亡动画
      head: {
        path: 'zombies/dying/head/head_*.png',
        len: 12,
      },
      body: {
        path: 'zombies/die/die_*.png',
        len: 10,
      },
    },
  }
}