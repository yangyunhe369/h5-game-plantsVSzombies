/* by：弦云孤赫——David Yang
** github - https://github.com/yangyunhe369
*/
/**
 * 阳光类
 */
class SunNum{
  constructor () {
    let s = {
      img: null,                                                      // 当前显示阳光背景框
      sun_num: window._main.allSunVal,                                // 阳光总数量
      x: 105,                                                         // x 轴坐标
      y: 0,                                                           // y 轴坐标
    }
    Object.assign(this, s)
  }
  // 创建，并初始化当前对象
  static new () {
    let s = new this()
    s.img = imageFromPath(allImg.sunback)
    return s
  }
  // 绘制方法
  draw (cxt) {
    let self = this
    // 绘制阳光背景框
    cxt.drawImage(self.img, self.x + 120, self.y)
    // 绘制阳光数量
    cxt.fillStyle = 'black'
    cxt.font = '24px Microsoft YaHei'
    cxt.fontWeight = 700
    cxt.fillText(self.sun_num, self.x + 175, self.y + 27)
  }
  // 改变阳光数量值
  changeSunNum (num = 25) {
    let self = this
    window._main.allSunVal += num
    self.sun_num += num
  }
}
/**
 * 卡片类
 */
class Card{
  constructor (obj) {
    let c = {
      name: obj.name,                                              // 当前卡片名称
      canGrow: true,                                               // 阳光数量是否够种植植物
      canClick: true,                                              // 是否可点击，并放置卡片对应植物
      img: null,                                                   // 当前显示卡片对象
      images: [],                                                  // 当前卡片图片序列
      timer: null,                                                 // 定时器，每隔一段时间切换可点击状态
      timer_spacing: obj.timer_spacing,                            // 定时器时间间隔，卡片冷却时间
      timer_num: 1,                                                // 倒计时显示数字
      sun_val: obj.sun_val,                                        // 每次种植消耗阳光数量
      row: obj.row,                                                // 卡片行坐标
      x: 0,                                                        // 卡片 x 轴坐标
      y: obj.y,                                                    // 卡片 y 轴坐标，由行坐标计算得出
    }
    Object.assign(this, c)
  }
  // 创建，并初始化当前对象
  static new (obj) {
    let b = new this(obj)
    b.images.push(imageFromPath(allImg.plantsCard[b.name].img))       // 生成可点击卡片对象
    b.images.push(imageFromPath(allImg.plantsCard[b.name].imgG))      // 生成不可点击卡片对象
    b.canClick ? b.img = b.images[0] : b.img = b.images[1]
    b.timer_num = b.timer_spacing / 1000                              // 设置卡片冷却时间  
    return b
  }
  // 绘制卡片方法
  draw (cxt) {
    let self = this,
        marginLeft = 120
    // 根据阳光总数量判断能否种植植物
    self.sun_val > window._main.allSunVal ? self.canGrow = false : self.canGrow = true
    // 根据当前状态渲染对应卡片
    self.canGrow && self.canClick ? self.img = self.images[0] : self.img = self.images[1]
    // 绘制卡片
    cxt.drawImage(self.img, self.x + marginLeft, self.y)
    // 绘制消耗阳光数量
    cxt.fillStyle = 'black'
    cxt.font = '16px Microsoft YaHei'
    cxt.fillText(self.sun_val, self.x + marginLeft + 60, self.y + 55)
    // 绘制倒计时
    if (!self.canClick && self.canGrow) {
      cxt.fillStyle = 'rgb(255, 255, 0)'
      cxt.font = '20px Microsoft YaHei'
      cxt.fillText(self.timer_num, self.x + marginLeft + 30, self.y + 35)
    }
  }
  // 计算倒计时时间
  drawCountDown () {
    let self = this
    self.timer = setInterval(function () {
      if (self.timer_num !== 0) {
        self.timer_num--
      } else {
        clearInterval(self.timer)
        self.timer_num = self.timer_spacing / 1000
      }
    },1000)
  }
  // 切换当前状态（可点击、不可点击状态）
  changeState () {
    let self = this
    if (!self.canClick) {
      // 设置定时器，恢复可点击状态
      self.timer = setTimeout(()=> {
        self.canClick = true
      }, self.timer_spacing)
    }
  }
}
/**
 * 除草车类
 */
class Car{
  constructor (obj) {
    let c = {
      img: imageFromPath(allImg.car),           // 生成子弹普通形态图片对象
      state: 1,                                 // 当前状态值
      state_NORMALE: 1,                         // 正常状态
      state_ATTACK: 2,                          // 攻击状态
      w: 71,                                    // 图片宽度
      h: 57,                                    // 图片高度
      x: obj.x,                                 // x轴坐标
      y: obj.y,                                 // y轴坐标
      row: obj.row,                             // 角色初始化行坐标
    }
    Object.assign(this, c)
  }
  // 创建，并初始化当前对象
  static new (obj) {
    let c = new this(obj)
    return c
  }
  // 绘制方法
  draw (game, cxt) {
    let self = this
    self.canMove()
    // 移动除草车
    self.state === self.state_ATTACK && self.step(game)
    // 绘制除草车
    cxt.drawImage(self.img, self.x, self.y)
  }
  // 移动方法
  step (game) {
    // 只有在游戏运行状态除草车才能移动
    game.state === game.state_RUNNING ? this.x += 15 : this.x = this.x
  }
  // 判断是否移动小车 （zombie.x < 150时）
  canMove () {
    let self = this
    for (let zombie of window._main.zombies) {
      if (zombie.row === self.row) {
        if (zombie.x < 150) { // 当僵尸靠近房子时，启动除草车
          self.state = self.state_ATTACK
        }
        if (self.state === self.state_ATTACK) { // 当除草车启动时，清除整行僵尸
          if (zombie.x - self.x < self.w && zombie.x < 950) {
            zombie.life = 0
            zombie.changeAnimation('die')
          }
        }
      }
    }
  }
}
/**
 * 子弹类
 */
class Bullet{
  constructor (plant) {
    let b = {
      img: imageFromPath(allImg.bullet),          // 生成子弹普通形态图片对象
      w: 56,
      h: 34,
      x: 0,
      y: 0,
    }
    Object.assign(this, b)
  }
  // 创建，并初始化当前对象
  static new (plant) {
    let b = new this(plant)
    // 定义子弹的坐标值
    switch (plant.section) {
      case 'peashooter':
        b.x = plant.x + 30
        b.y = plant.y
        break
      case 'repeater':
        b.x = plant.x + 30
        b.y = plant.y
        break
      case 'gatlingpea':
        b.x = plant.x + 30
        b.y = plant.y + 10
        break
    }
    return b
  }
  // 绘制方法
  draw (game, cxt) {
    let self = this
    // 移动子弹
    self.step(game)
    // 绘制子弹
    cxt.drawImage(self.img, self.x, self.y)
  }
  // 移动方法
  step (game) {
    // 只有在游戏运行状态子弹才能移动
    game.state === game.state_RUNNING ? this.x += 4 : this.x = this.x
  }
}
/**
 * 动画类
 */
class Animation{
  constructor (role, action, fps) {
    let a = {
      type: role.type,                                   // 动画类型（植物、僵尸等等）
      section: role.section,                             // 植物或者僵尸类别（向日葵、豌豆射手）
      action: action,                                    // 根据传入动作生成不同动画对象数组
      images: [],                                        // 当前引入角色图片对象数组
      img: null,                                         // 当前显示角色图片
      imgIdx: 0,                                         // 当前角色图片序列号
      count: 0,                                          // 计数器，控制动画运行
      imgHead: null,                                     // 当前显示角色头部图片
      imgBody: null,                                     // 当前显示角色身体图片
      imgIdxHead: 0,                                     // 当前角色头部图片序列号
      imgIdxBody: 0,                                     // 当前角色身体图片序列号
      countHead: 0,                                      // 当前角色头部计数器，控制动画运行
      countBody: 0,                                      // 当前角色身体计数器，控制动画运行
      fps: fps,                                          // 角色动画运行速度系数，值越小，速度越快
    }
    Object.assign(this, a)
  }
  // 创建，并初始化当前对象
  static new (role, action, fps) {
    let a = new this(role, action, fps)
    // 濒死动画、死亡动画对象（僵尸）
    if (action === 'dying' || action === 'die') {
      a.images = {
        head: [],
        body: [],
      }
      a.create()
    } else {
      a.create()
      a.images[0].onload = function () {
        role.w = this.width
        role.h = this.height
      }
    }
    return a
  }
  /**
   * 为角色不同动作创造动画序列
   */
  create () {
    let self = this,
        section = self.section    // 植物种类
    switch (self.type) {
      case 'plant':
        for(let i = 0; i < allImg.plants[section][self.action].len; i++){
          let idx = i < 10 ? '0' + i : i,
              path = allImg.plants[section][self.action].path
          // 依次添加动画序列
          self.images.push(imageFromPath(path.replace(/\*/, idx)))
        }
        break
      case 'zombie':
        // 濒死动画、死亡动画对象，包含头部动画以及身体动画
        if (self.action === 'dying' || self.action === 'die') {
          for(let i = 0; i < allImg.zombies[self.action].head.len; i++){
            let idx = i < 10 ? '0' + i : i,
                path = allImg.zombies[self.action].head.path
            // 依次添加动画序列
            self.images.head.push(imageFromPath(path.replace(/\*/, idx)))
          }
          for(let i = 0; i < allImg.zombies[self.action].body.len; i++){
            let idx = i < 10 ? '0' + i : i,
                path = allImg.zombies[self.action].body.path
            // 依次添加动画序列
            self.images.body.push(imageFromPath(path.replace(/\*/, idx)))
          }
        } else { // 普通动画对象
          for(let i = 0; i < allImg.zombies[self.action].len; i++){
            let idx = i < 10 ? '0' + i : i,
                path = allImg.zombies[self.action].path
            // 依次添加动画序列
            self.images.push(imageFromPath(path.replace(/\*/, idx)))
          }
        }
        break
      case 'loading': // loading动画
        for(let i = 0; i < allImg.loading[self.action].len; i++){
          let idx = i < 10 ? '0' + i : i,
              path = allImg.loading[self.action].path
          // 依次添加动画序列
          self.images.push(imageFromPath(path.replace(/\*/, idx)))
        }
        break
    }
  }
}
/**
 * 角色类
 * 植物、僵尸类继承的基础属性
 */
class Role{
  constructor (obj) {
    let r = {
      id: Math.random().toFixed(6) * Math.pow(10, 6),      // 随机生成 id 值，用于设置当前角色 ID
      type: obj.type,                                      // 角色类型（植物或僵尸）
      section: obj.section,                                // 角色类别（豌豆射手、双发射手...）
      x: obj.x,                                            // x轴坐标
      y: obj.y,                                            // y轴坐标
      row: obj.row,                                        // 角色初始化行坐标
      col: obj.col,                                        // 角色初始化列坐标
      w: 0,                                                // 角色图片宽度
      h: 0,                                                // 角色图片高度
      isAnimeLenMax: false,                                // 是否处于动画最后一帧，用于判断动画是否执行完一轮
      isDel: false,                                        // 判断是否死亡并移除当前角色
      isHurt: false,                                       // 判断是否受伤
    }
    Object.assign(this, r)
  }
}
// 植物类
class Plant extends Role{
  constructor (obj) {
    super(obj)
    // 植物类私有属性
    let p = {
      life: 3,                                             // 角色血量
      idle: null,                                          // 站立动画对象
      idleH: null,                                         // 坚果高血量动画对象
      idleM: null,                                         // 坚果中等血量动画对象
      idleL: null,                                         // 坚果低血量动画对象
      attack: null,                                        // 角色攻击动画对象
      digest: null,                                        // 角色消化动画对象
      bullets: [],                                         // 子弹数组对象
      state: obj.section === 'wallnut' ? 2 : 1,            // 保存当前状态值
      state_IDLE: 1,                                       // 站立不动状态
      state_IDLE_H: 2,                                     // 站立不动高血量状态（坚果墙相关动画）
      state_IDLE_M: 3,                                     // 站立不动中等血量状态（坚果墙相关动画）
      state_IDLE_L: 4,                                     // 站立不动低血量状态（坚果墙相关动画）
      state_ATTACK: 5,                                     // 攻击状态
      state_DIGEST: 6,                                     // 待攻击状态（食人花消化僵尸状态）
      canShoot: false,                                     // 植物是否具有发射子弹功能
      canSetTimer: obj.canSetTimer,                        // 能否设置生成阳光定时器
      sunTimer: null,                                      // 生成阳光定时器
      sunTimer_spacing: 10,                                // 生成阳光时间间隔（秒）
    }
    Object.assign(this, p)
  }
  // 创建，并初始化当前对象
  static new (obj) {
    let p = new this(obj)
    p.init()
    return p
  }
  // 设置阳光生成定时器
  setSunTimer () {
    let self = this
    self.sunTimer = setInterval(function () {
      // 创建阳光元素
      let img = document.createElement('img'),                  // 创建元素
          container = document.getElementsByTagName('body')[0], // 父级元素容器
          id = self.id,                                         // 当前角色 ID
          top = self.y + 30,
          left = self.x - 130,
          keyframes1 = [                                        // 阳光移动动画 keyframes
            { transform: 'translate(0,0)', opacity: 0 },
            { offset: .3,transform: 'translate(0,0)', opacity: 1 },
            { offset: .5,transform: 'translate(0,0)', opacity: 1 },
            { offset: 1,transform: 'translate(-'+ (left - 110) +'px,-'+ (top + 50) +'px)',opacity: 0 }
          ]
      // 添加阳关元素
      img.src = 'images/sun.gif'
      img.className += 'sun-img plantSun' + id
      img.style.top = top + 'px'
      img.style.left = left + 'px'
      container.appendChild(img)
      // 添加阳光移动动画
      let sun = document.getElementsByClassName('plantSun' + id)[0]
      sun.animate(keyframes1,keyframesOptions)
      // 动画完成，清除阳光元素
      setTimeout(()=> {
        sun.parentNode.removeChild(sun)
        // 增加阳光数量
        window._main.sunnum.changeSunNum()
      }, 2700)
    }, self.sunTimer_spacing * 1000)
  }
  // 清除阳光生成定时器
  clearSunTimer () {
    let self = this
    clearInterval(self.sunTimer)
  }
  // 初始化
  init () {
    let self = this,
        setPlantFn = null
    // 初始化植物动画对象方法集
    setPlantFn = {
      sunflower () {  // 向日葵
        self.idle = Animation.new(self, 'idle', 12)
        // 定时生成阳光
        self.canSetTimer && self.setSunTimer()
      },
      peashooter () { // 豌豆射手
        self.canShoot = true
        self.idle = Animation.new(self, 'idle', 12)
        self.attack = Animation.new(self, 'attack', 12)
      },
      repeater () { // 双发射手
        self.canShoot = true
        self.idle = Animation.new(self, 'idle', 12)
        self.attack = Animation.new(self, 'attack', 8)
      },
      gatlingpea () { // 加特林射手
        // 改变加特林渲染 y 轴距离
        self.y -= 12
        self.canShoot = true
        self.idle = Animation.new(self, 'idle', 8)
        self.attack = Animation.new(self, 'attack', 4)
      },
      cherrybomb () { // 樱桃炸弹
        self.x -= 15
        self.idle = Animation.new(self, 'idle', 15)
        self.attack = Animation.new(self, 'attack', 15)
        setTimeout(()=> {
          self.state = self.state_ATTACK
        }, 2000)
      },
      wallnut () { // 坚果墙
        self.x += 15
        // 设置坚果血量
        self.life = 12
        // 创建坚果三种不同血量下的动画对象
        self.idleH = Animation.new(self, 'idleH', 10)
        self.idleM = Animation.new(self, 'idleM', 8)
        self.idleL = Animation.new(self, 'idleL', 10)
      },
      chomper () { // 食人花
        self.life = 5
        self.y -= 45
        self.idle = Animation.new(self, 'idle', 10)
        self.attack = Animation.new(self, 'attack', 12)
        self.digest = Animation.new(self, 'digest', 12)
      },
    }
    // 执行对应植物初始化方法
    for (let key in setPlantFn) {
      if (self.section === key) {
        setPlantFn[key]()
      }
    }
  }
  // 绘制方法
  draw (cxt) {
    let self = this,
        stateName = self.switchState()
    switch (self.isHurt) {
      case false:
        if (self.section === 'cherrybomb' && self.state === self.state_ATTACK) {
          // 正常状态，绘制樱桃炸弹爆炸图片
          cxt.drawImage(self[stateName].img, self.x - 60, self.y - 50)
        } else {
          // 正常状态，绘制普通植物图片
          cxt.drawImage(self[stateName].img, self.x, self.y)
        }
        break
      case true:
        // 受伤或移动植物时，绘制半透明图片
        cxt.globalAlpha = 0.5
        cxt.beginPath()
        cxt.drawImage(self[stateName].img, self.x, self.y)
        cxt.closePath()
        cxt.save()
        cxt.globalAlpha = 1
        break
    }
  }
  // 更新状态
  update (game) {
    let self = this,
        section = self.section,
        stateName = self.switchState()
    // 修改当前动画序列长度
    let animateLen = allImg.plants[section][stateName].len
    // 累加动画计数器
    self[stateName].count += 1
    // 设置角色动画运行速度
    self[stateName].imgIdx = Math.floor(self[stateName].count / self[stateName].fps)
    // 一整套动画完成后重置动画计数器
    self[stateName].imgIdx === animateLen - 1 ? self[stateName].count = 0 : self[stateName].count = self[stateName].count
    // 绘制发射子弹动画
    if (game.state === game.state_RUNNING) {
      // 设置当前帧动画对象
      self[stateName].img = self[stateName].images[self[stateName].imgIdx]
      if (self[stateName].imgIdx === animateLen - 1) {
        if (stateName === 'attack' && !self.isDel) {
          // 未死亡，且为可发射子弹植物时
          if (self.canShoot) {
            // 发射子弹
            self.shoot()
            // 双发射手额外发射子弹
            self.section === 'repeater' && setTimeout(()=> {self.shoot()}, 250)
          }
          // 当为樱桃炸弹时，执行完一轮动画，自动消失
          self.section === 'cherrybomb' ? self.isDel = true : self.isDel = false
          // 当为食人花时，执行完攻击动画，切换为消化动画
          if (self.section === 'chomper') {
            // 立即切换动画会出现图片未加载完成报错
            setTimeout(()=> {
              self.changeAnimation('digest')
            }, 0)
          }
        } else if (self.section === 'chomper' && stateName === 'digest') {
          // 消化动画完毕后，间隔一段时间切换为正常状态
          setTimeout(()=> {
            self.changeAnimation('idle')
          }, 30000)
        }
        self.isAnimeLenMax = true
      } else {
        self.isAnimeLenMax = false
      }
    }
  }
  // 检测植物是否可攻击僵尸方法
  canAttack () {
    let self = this
    // 植物类别为向日葵和坚果墙时，不需判定
    if (self.section === 'sunflower' || self.section === 'wallnut') return false
    // 循环僵尸对象数组
    for (let zombie of window._main.zombies) {
      if (self.section === 'cherrybomb') { // 当为樱桃炸弹时
        // 僵尸在以樱桃炸弹为圆心的 9 个格子内时
        if (Math.abs(self.row - zombie.row) <= 1 && Math.abs(self.col - zombie.col) <= 1 && zombie.col < 10) {
          // 执行爆炸动画
          self.changeAnimation('attack')
          zombie.life = 0
          // 僵尸炸死动画
          zombie.changeAnimation('dieboom')
        }
      } else if (self.section === 'chomper' && self.state === self.state_IDLE) { // 当为食人花时
        // 僵尸在食人花正前方时
        if (self.row === zombie.row && (zombie.col - self.col) <= 1 && zombie.col < 10) {
          self.changeAnimation('attack')
          setTimeout(()=> {
            zombie.isDel = true
          }, 1300)
        }
      } else if (self.canShoot && self.row === zombie.row) { // 当植物可发射子弹，且僵尸和植物处于同行时
        // 僵尸进入植物射程范围
        zombie.x < 940 && self.x < zombie.x + 10 && zombie.life > 0 ? self.changeAnimation('attack') : self.changeAnimation('idle')
        // 植物未被移除时，可发射子弹
        if (!self.isDel) {
          self.bullets.forEach(function (bullet, j) {
            // 当子弹打中僵尸，且僵尸未死亡时
            if (Math.abs(zombie.x + bullet.w - bullet.x) < 10 && zombie.life > 0) { // 子弹和僵尸距离小于 10 且僵尸未死亡
              // 移除子弹
              self.bullets.splice(j, 1)
              // 根据血量判断执行不同阶段动画
              if (zombie.life !== 0) {
                zombie.life--
                zombie.isHurt = true
                setTimeout(()=> {
                  zombie.isHurt = false
                }, 200)
              }
              if (zombie.life === 2) {
                zombie.changeAnimation('dying')
              } else if (zombie.life === 0) {
                zombie.changeAnimation('die')
              }
            }
          })
        }
      }
    }
  }
  // 射击方法
  shoot () {
    let self = this
    self.bullets[self.bullets.length] = Bullet.new(self)
  }
  /**
   * 判断角色状态并返回对应动画对象名称方法
   */
  switchState () {
    let self = this,
        state = self.state,
        dictionary = {
          idle: self.state_IDLE,
          idleH: self.state_IDLE_H,
          idleM: self.state_IDLE_M,
          idleL: self.state_IDLE_L,
          attack: self.state_ATTACK,
          digest: self.state_DIGEST,
        }
    for (let key in dictionary) {
      if (state === dictionary[key]) {
        return key
      }
    }
  }
  /**
   * 切换角色动画
   * game => 游戏引擎对象
   * action => 动作类型
   *  -idle: 站立动画
   *  -idleH: 角色高血量动画（坚果墙）
   *  -idleM: 角色中等血量动画（坚果墙）
   *  -idleL: 角色低血量动画（坚果墙）
   *  -attack: 攻击动画
   *  -digest: 消化动画（食人花）
   */
  changeAnimation (action) {
    let self = this,
        stateName = self.switchState(),
        dictionary = {
          idle: self.state_IDLE,
          idleH: self.state_IDLE_H,
          idleM: self.state_IDLE_M,
          idleL: self.state_IDLE_L,
          attack: self.state_ATTACK,
          digest: self.state_DIGEST,
        }
    if (action === stateName) return
    self.state = dictionary[action]
  }
}
// 僵尸类
class Zombie extends Role{
  constructor (obj) {
    super(obj)
    // 僵尸类私有属性
    let z = {
      life: 10,                                            // 角色血量
      canMove: true,                                       // 判断当前角色是否可移动
      attackPlantID: 0,                                    // 当前攻击植物对象 ID
      idle: null,                                          // 站立动画对象
      run: null,                                           // 奔跑动画对象
      attack: null,                                        // 攻击动画对象
      dieboom: null,                                       // 被炸死亡动画对象
      dying: null,                                         // 濒临死亡动画对象
      die: null,                                           // 死亡动画对象
      state: 1,                                            // 保存当前状态值，默认为1
      state_IDLE: 1,                                       // 站立不动状态
      state_RUN: 2,                                        // 奔跑状态
      state_ATTACK: 3,                                     // 攻击状态
      state_DIEBOOM: 4,                                    // 死亡状态
      state_DYING: 5,                                      // 濒临死亡状态
      state_DIE: 6,                                        // 死亡状态
      state_DIGEST: 7,                                     // 消化死亡状态
      speed: 3,                                            // 移动速度
      head_x: 0,                                           // 头部动画 x 轴坐标
      head_y: 0,                                           // 头部动画 y 轴坐标
    }
    Object.assign(this, z)
  }
  // 创建，并初始化当前对象
  static new (obj) {
    let p = new this(obj)
    p.init()
    return p
  }
  // 初始化
  init () {
    let self = this
    // 站立
    self.idle = Animation.new(self, 'idle', 12)
    // 移动
    self.run = Animation.new(self, 'run', 12)
    // 攻击
    self.attack = Animation.new(self, 'attack', 8)
    // 炸死
    self.dieboom = Animation.new(self, 'dieboom', 8)
    // 濒死
    self.dying = Animation.new(self, 'dying', 8)
    // 死亡
    self.die = Animation.new(self, 'die', 12)
  }
  // 绘制方法
  draw (cxt) {
    let self = this,
        stateName = self.switchState()
    if (stateName !== 'dying' && stateName !== 'die') { // 绘制普通动画
      if (!self.isHurt) { // 未受伤时，绘制正常动画
        cxt.drawImage(self[stateName].img, self.x, self.y)
      } else { // 受伤时，绘制带透明度动画
        // 绘制带透明度动画
        cxt.globalAlpha = 0.5
        cxt.beginPath()
        cxt.drawImage(self[stateName].img, self.x, self.y)
        cxt.closePath()
        cxt.save()
        cxt.globalAlpha = 1
      }
    } else { // 绘制濒死、死亡动画
      if (!self.isHurt) { // 未受伤时，绘制正常动画
        cxt.drawImage(self[stateName].imgHead, self.head_x + 70, self.head_y - 10)
        cxt.drawImage(self[stateName].imgBody, self.x, self.y)
      } else { // 受伤时，绘制带透明度动画
        // 绘制带透明度身体
        cxt.globalAlpha = 0.5
        cxt.beginPath()
        cxt.drawImage(self[stateName].imgBody, self.x, self.y)
        cxt.closePath()
        cxt.save()
        cxt.globalAlpha = 1
        // 头部不带透明度
        cxt.drawImage(self[stateName].imgHead, self.head_x + 70, self.head_y - 10)
      }
    }
  }
  // 更新状态
  update (game) {
    let self = this,
        stateName = self.switchState()
    // 更新能否移动状态值
    self.canMove ? self.speed = 3 : self.speed = 0
    // 更新僵尸列坐标值
    self.col = Math.floor((self.x - window._main.zombies_info.x) / 80 + 1)
    if (stateName !== 'dying' && stateName !== 'die') { // 普通动画（站立，移动，攻击）
      // 修改当前动画序列长度
      let animateLen = allImg.zombies[stateName].len
      // 累加动画计数器
      self[stateName].count += 1
      // 设置角色动画运行速度
      self[stateName].imgIdx = Math.floor(self[stateName].count / self[stateName].fps)
      // 一整套动画完成后重置动画计数器
      if (self[stateName].imgIdx === animateLen) {
        self[stateName].count = 0
        self[stateName].imgIdx = 0
        if (stateName === 'dieboom') { // 被炸死亡状态
          // 当死亡动画执行完一轮后，移除当前角色
          self.isDel = true
        }
        // 当前动画帧数达到最大值
        self.isAnimeLenMax = true
      } else {
        self.isAnimeLenMax = false
      }
      // 游戏运行状态
      if (game.state === game.state_RUNNING) {
        // 设置当前帧动画对象
        self[stateName].img = self[stateName].images[self[stateName].imgIdx]
        if (stateName === 'run') { // 当僵尸移动时，控制移动速度
          self.x -= self.speed / 17
        }
      }
    } else if (stateName === 'dying') { // 濒死动画，包含两个动画对象
      // 获取当前动画序列长度
      let headAnimateLen = allImg.zombies[stateName].head.len,
          bodyAnimateLen = allImg.zombies[stateName].body.len
      // 累加动画计数器
      if (self[stateName].imgIdxHead !== headAnimateLen - 1) {
        self[stateName].countHead += 1
      }
      self[stateName].countBody += 1
      // 设置角色动画运行速度
      self[stateName].imgIdxHead = Math.floor(self[stateName].countHead / self[stateName].fps)
      self[stateName].imgIdxBody = Math.floor(self[stateName].countBody / self[stateName].fps)
      // 设置当前帧动画对象，头部动画
      if (self[stateName].imgIdxHead === 0) {
        self.head_x = self.x
        self.head_y = self.y
        self[stateName].imgHead = self[stateName].images.head[self[stateName].imgIdxHead]
      } else if (self[stateName].imgIdxHead === headAnimateLen) {
        self[stateName].imgHead = self[stateName].images.head[headAnimateLen - 1]
      } else {
        self[stateName].imgHead = self[stateName].images.head[self[stateName].imgIdxHead]
      }
      // 设置当前帧动画对象，身体动画
      if (self[stateName].imgIdxBody === bodyAnimateLen) {
        self[stateName].countBody = 0
        self[stateName].imgIdxBody = 0
        // 当前动画帧数达到最大值
        self.isAnimeLenMax = true
      } else {
        self.isAnimeLenMax = false
      }
      // 游戏运行状态
      if (game.state === game.state_RUNNING) {
        // 设置当前帧动画对象
        self[stateName].imgBody = self[stateName].images.body[self[stateName].imgIdxBody]
        if (stateName === 'dying') { // 濒死状态，可以移动
          self.x -= self.speed / 17
        }
      }
    } else if (stateName === 'die') { // 死亡动画，包含两个动画对象
      // 获取当前动画序列长度
      let headAnimateLen = allImg.zombies[stateName].head.len,
          bodyAnimateLen = allImg.zombies[stateName].body.len
      // 累加动画计数器
      if (self[stateName].imgIdxBody !== bodyAnimateLen - 1) {
        self[stateName].countBody += 1
      }
      // 设置角色动画运行速度
      self[stateName].imgIdxBody = Math.floor(self[stateName].countBody / self[stateName].fps)
      // 设置当前帧动画对象，死亡状态，定格头部动画
      if (self[stateName].imgIdxHead === 0) {
        if (self.head_x == 0 && self.head_y == 0) {
          self.head_x = self.x
          self.head_y = self.y
        }
        self[stateName].imgHead = self[stateName].images.head[headAnimateLen - 1]
      }
      // 设置当前帧动画对象，身体动画
      if (self[stateName].imgIdxBody === 0) {
        self[stateName].imgBody = self[stateName].images.body[self[stateName].imgIdxBody]
      } else if (self[stateName].imgIdxBody === bodyAnimateLen - 1) {
        // 当死亡动画执行完一轮后，移除当前角色
        self.isDel = true
        self[stateName].imgBody = self[stateName].images.body[bodyAnimateLen - 1]
      } else {
        self[stateName].imgBody = self[stateName].images.body[self[stateName].imgIdxBody]
      }
    }
  }
  // 检测僵尸是否可攻击植物
  canAttack () {
    let self = this
    // 循环植物对象数组
    for (let plant of window._main.plants) {
      if (plant.row === self.row && !plant.isDel) { // 当僵尸和植物处于同行时
        if (self.x - plant.x < -20 && self.x - plant.x > -60) {
          if (self.life > 2) {
            // 保存当前攻击植物 hash 值，在该植物被删除时，再控制当前僵尸移动
            self.attackPlantID !== plant.id ? self.attackPlantID = plant.id : self.attackPlantID = self.attackPlantID
            self.changeAnimation('attack')
          } else {
            self.canMove = false
          }
          if (self.isAnimeLenMax && self.life > 2) {  // 僵尸动画每执行完一轮次
            // 扣除植物血量
            if (plant.life !== 0) {
              plant.life--
              plant.isHurt = true
              setTimeout(()=> {
                plant.isHurt = false
                // 坚果墙判断切换动画状态
                if (plant.life <= 8 && plant.section === 'wallnut') {
                  plant.life <= 4 ? plant.changeAnimation('idleL') : plant.changeAnimation('idleM')
                }
                // 判断植物是否可移除
                if (plant.life <= 0) {
                  // 设置植物死亡状态
                  plant.isDel = true
                  // 清除死亡向日葵的阳光生成定时器
                  plant.section === 'sunflower' && plant.clearSunTimer()
                }
              }, 200)
            }
          } 
        }
      }
    }
  }
  /**
   * 判断角色状态并返回对应动画对象名称方法
   */
  switchState () {
    let self = this,
        state = self.state,
        dictionary = {
          idle: self.state_IDLE,
          run: self.state_RUN,
          attack: self.state_ATTACK,
          dieboom: self.state_DIEBOOM,
          dying: self.state_DYING,
          die: self.state_DIE,
          digest: self.state_DIGEST,
        }
    for (let key in dictionary) {
      if (state === dictionary[key]) {
        return key
      }
    }
  }
  /**
   * 切换角色动画
   * game => 游戏引擎对象
   * action => 动作类型
   *  -idle: 站立不动
   *  -attack: 攻击
   *  -die: 死亡
   *  -dying: 濒死
   *  -dieboom: 爆炸
   *  -digest: 被消化
   */
  changeAnimation (action) {
    let self = this,
        stateName = self.switchState(),
        dictionary = {
          idle: self.state_IDLE,
          run: self.state_RUN,
          attack: self.state_ATTACK,
          dieboom: self.state_DIEBOOM,
          dying: self.state_DYING,
          die: self.state_DIE,
          digest: self.state_DIGEST,
        }
    if (action === stateName) return
    self.state = dictionary[action]
  }
}
