/* by：弦云孤赫——David Yang
** github - https://github.com/yangyunhe369
*/
/**
 * 游戏引擎函数
 */
class Game {
  constructor () {
    let g = {
      actions: {},                                                  // 注册按键操作
      keydowns: {},                                                 // 按键事件对象
      cardSunVal: null,                                             // 当前选中植物卡片index以及需消耗阳光值
      cardSection: '',                                              // 绘制随鼠标移动植物类别
      canDrawMousePlant: false,                                     // 能否绘制随鼠标移动植物
      canLayUp: false,                                              // 能否放置植物
      mousePlant: null,                                             // 鼠标绘制植物对象
      mouseX: 0,                                                    // 鼠标 x 轴坐标
      mouseY: 0,                                                    // 鼠标 y 轴坐标
      mouseRow: 0,                                                  // 鼠标移动至可种植植物区域的行坐标
      mouseCol: 0,                                                  // 鼠标移动至可种植植物区域的列坐标
      state: 0,                                                     // 游戏状态值，初始默认为 0
      state_LOADING: 0,                                             // 准备阶段
      state_START: 1,                                               // 开始游戏
      state_RUNNING: 2,                                             // 游戏开始运行
      state_STOP: 3,                                                // 暂停游戏
      state_PLANTWON: 4,                                            // 游戏结束，玩家胜利
      state_ZOMBIEWON: 5,                                           // 游戏结束，僵尸胜利
      canvas: document.getElementById("canvas"),                    // canvas元素
      context: document.getElementById("canvas").getContext("2d"),  // canvas画布
      timer: null,                                                  // 轮询定时器
      fps: window._main.fps,                                        // 动画帧数
    }
    Object.assign(this, g)
  }
  // 创建，并初始化当前对象
  static new () {
    let g = new this()
    g.init()
    return g
  }
  // 清除当前游戏定时器
  clearGameTimer () {
    let g = this
    clearInterval(g.timer)
  }
  // 绘制场景
  drawBg () {
    let g = this,
        cxt = g.context,
        sunnum = window._main.sunnum,               // 阳光数量对象
        cards = window._main.cards,                 // 植物卡片对象
        img = imageFromPath(allImg.bg)              // 背景图片对象
    // 绘制背景
    cxt.drawImage(img, 0, 0)
    // 绘制阳光数量框
    sunnum.draw(cxt)
  }
  // 绘制小汽车
  drawCars () {
    let g = this,
        cxt = g.context,
        cars = window._main.cars                    // 小汽车对象
    // 绘制植物卡片
    cars.forEach(function (car, idx) {
      if (car.x > 950) { // 移除使用过的小汽车
        cars.splice(idx, 1)
      }
      car.draw(g, cxt)
    })
  }
  // 绘制植物卡片
  drawCards () {
    let g = this,
        cxt = g.context,
        cards = window._main.cards                  // 植物卡片对象
    // 绘制植物卡片
    for (let card of cards) {
      card.draw(cxt)
    }
  }
  // 绘制玩家胜利动画
  drawPlantWon () {
    let g = this,
        cxt = g.context, 
        text = '恭喜玩家获得胜利！'          // 胜利文案
    // 绘制胜利动画
    cxt.fillStyle = 'red'
    cxt.font = '48px Microsoft YaHei'
    cxt.fillText(text, 354, 300)
  }
  // 绘制僵尸胜利动画
  drawZombieWon () {
    let g = this,
        cxt = g.context, 
        img = imageFromPath(allImg.zombieWon)          // 胜利图片对象
    // 绘制胜利动画
    cxt.drawImage(img, 293, 66)
  }
  // 绘制loading首屏画面
  drawLoading () {
    let g = this,
        cxt = g.context,
        img = imageFromPath(allImg.startBg)
    // 绘制loading图片
    cxt.drawImage(img, 119, 0)
  }
  // 绘制Start动画
  drawStartAnime () {
    let g = this,
        stateName = 'write',
        loading = window._main.loading,
        cxt = g.context,
        canvas_w = g.canvas.width,
        canvas_h = g.canvas.height,
        animateLen = allImg.loading[stateName].len     // 修改当前动画序列长度
    // 累加动画计数器
    if (loading.imgIdx !== animateLen) {
      loading.count += 1
    }
    // 设置角色动画运行速度
    loading.imgIdx = Math.floor(loading.count / loading.fps)
    // 一整套动画完成后重置动画计数器，并设置当前帧动画对象
    if (loading.imgIdx === animateLen) {
      loading.img = loading.images[loading.imgIdx - 1]
    } else {
      loading.img = loading.images[loading.imgIdx]
    }
    // 绘制Start动画
    cxt.drawImage(loading.img, 437, 246)
  }
  // 绘制所有子弹的函数
  drawBullets (plants) {
    let g = this,
        context = g.context,
        canvas_w = g.canvas.width - 440
    for (let item of plants) {
      item.bullets.forEach(function (bullet, idx, arr) {
        // 绘制子弹
        bullet.draw(g, context)
        // 移除超出射程的子弹
        if (bullet.x >= canvas_w) {
          arr.splice(idx, 1)
        }
      })
    }
  }
  // 绘制角色血量
  drawBlood (role) {
    let g = this,
        cxt = g.context,
        x = role.x,
        y = role.y
    cxt.fillStyle = 'red'
    cxt.font = '18px Microsoft YaHei'
    if (role.type === 'plant') {
      cxt.fillText(role.life, x + 30, y - 10)
    } else if (role.type === 'zombie') {
      cxt.fillText(role.life, x + 85, y + 10)
    }
  }
  // 更新角色状态
  updateImage (plants, zombies) {
    let g = this,
        cxt = g.context
    plants.forEach(function (plant, idx) {
      // 判断是否进入攻击状态
      plant.canAttack()
      // 更新状态
      plant.update(g)
    })
    zombies.forEach(function (zombie, idx) {
      if (zombie.x < 50) { // 僵尸到达房屋，获得胜利
        g.state = g.state_ZOMBIEWON
      }
      // 判断是否进入攻击状态
      zombie.canAttack()
      // 更新状态
      zombie.update(g)
    })
  }
  // 绘制角色
  drawImage (plants, zombies) {
    let g = this,
        cxt = g.context,
        delPlantsArr = []             // 被删除植物元素集合
    plants.forEach(function (plant, idx, arr) {
      if (plant.isDel) { // 移除死亡对象
        delPlantsArr.push(plant)
        arr.splice(idx, 1)
      } else { // 绘制未死亡角色
        plant.draw(cxt)
        // g.drawBlood(plant)
      }
    })
    zombies.forEach(function (zombie, idx) {
      if (zombie.isDel) { // 移除死亡对象
        zombies.splice(idx, 1)
        // 当僵尸被消灭完，玩家获得胜利
        if (zombies.length === 0) {
          g.state = g.state_PLANTWON
        }
      } else { // 绘制未死亡角色
        zombie.draw(cxt)
        // g.drawBlood(zombie)
      }
      // 使僵尸在植物死亡后可正确移动
      for (let plant of delPlantsArr) {
        if (zombie.attackPlantID === plant.id) {
          zombie.canMove = true
          if (zombie.life > 2) {
            zombie.changeAnimation('run')
          }
        }
      }
    })
  }
  // 检测当前鼠标移动坐标，并处理相关事件
  getMousePos () {
    let g = this,
        _main = window._main,
        cxt = g.context,
        cards = _main.cards,
        x = g.mouseX,
        y = g.mouseY
    // 鼠标移动绘制植物
    if (g.canDrawMousePlant) {
      g.mousePlantCallback(x, y)
    }
  }
  // 鼠标移动绘制植物
  mousePlantCallback (x, y) {
    let g = this,
        _main = window._main,
        cxt = g.context,
        row = Math.floor((y - 75) / 100) + 1,               // 定义行坐标
        col = Math.floor((x - 175) / 80) + 1                // 定义列坐标
    // 绘制植物信息
    let plant_info = {
          type: 'plant',
          section: g.cardSection,
          x: _main.plants_info.x + 80 * (col - 1),
          y: _main.plants_info.y + 100 * (row - 1),
          row: row,
          col: col,
        }
    g.mouseRow = row
    g.mouseCol = col
    // 判断是否在可种植区域
    if (row >= 1 && row <= 5 && col >= 1 && col <= 9) {
      g.canLayUp = true
      // 判断当前位置是否可放置植物
      for (let plant of _main.plants) {
        if (row === plant.row && col === plant.col) {
          g.canLayUp = false
        }
      }
    } else {
      g.canLayUp = false
    }
    // 绘制随鼠标移动植物函数
    if (g.canDrawMousePlant) {
      g.drawMousePlant(plant_info)
    }
  }
  // 绘制随鼠标移动植物
  drawMousePlant (plant_info) {
    let g = this,
        cxt = g.context,
        plant = null,
        mousePlant_info = {       // 随鼠标移动植物信息
          type: 'plant',
          section: g.cardSection,
          x: g.mouseX + 82,
          y: g.mouseY - 40,
          row: g.mouseRow,
          col: g.mouseCol,
        }
    // 判断是否允许放置
    if (g.canLayUp) {
      // 绘制半透明植物
      plant = Plant.new(plant_info)
      plant.isHurt = true
      plant.update(g)
      plant.draw(cxt)
    }
    // 绘制随鼠标移动植物
    g.mousePlant = Plant.new(mousePlant_info)
    g.mousePlant.update(g)
    g.mousePlant.draw(cxt)
  }
  // 注册事件
  registerAction (key, callback) {
    this.actions[key] = callback
  }
  // 设置逐帧动画
  setTimer (_main) {
    let g = this,
        plants = _main.plants,             // 植物对象数组
        zombies = _main.zombies            // 僵尸对象数组
    // 事件集合
    let actions = Object.keys(g.actions)
    for (let i = 0; i < actions.length; i++) {
      let key = actions[i]
      if(g.keydowns[key]) {
        // 如果按键被按下，调用注册的action
        g.actions[key]()
      }
    }
    // 清除画布
    g.context.clearRect(0, 0, g.canvas.width, g.canvas.height)
    if (g.state === g.state_LOADING) {
      // 绘制场景
      g.drawLoading()
    } else if (g.state === g.state_START) {
      // 绘制场景
      g.drawBg()
      // 绘制小汽车
      g.drawCars()
      // 绘制植物卡片
      g.drawCards()
      // 绘制 Start 动画
      g.drawStartAnime()
    } else if (g.state === g.state_RUNNING) {
      // 绘制场景
      g.drawBg()
      // 更新所有植物，僵尸状态
      g.updateImage(plants, zombies)
      // 绘制所有植物，僵尸
      g.drawImage(plants, zombies)
      // 绘制小汽车
      g.drawCars()
      // 绘制植物卡片
      g.drawCards()
      // 绘制所有子弹
      g.drawBullets(plants)
      // 绘制随鼠标移动植物
      g.getMousePos()
    } else if (g.state === g.state_STOP) {
      // 绘制场景
      g.drawBg()
      // 更新所有植物，僵尸状态
      g.updateImage(plants, zombies)
      // 绘制所有植物，僵尸
      g.drawImage(plants, zombies)
      // 绘制小汽车
      g.drawCars()
      // 绘制植物卡片
      g.drawCards()
      // 绘制所有子弹
      g.drawBullets(plants)
      // 清除全局生成阳光定时器
      _main.clearTiemr()
    } else if (g.state === g.state_PLANTWON) { // 玩家胜利
      // 绘制场景
      g.drawBg()
      // 绘制小汽车
      g.drawCars()
      // 绘制植物卡片
      g.drawCards()
      // 绘制玩家胜利画面
      g.drawPlantWon()
      // 清除全局生成阳光定时器
      _main.clearTiemr()
    } else if (g.state === g.state_ZOMBIEWON) { // 僵尸胜利
      // 绘制场景
      g.drawBg()
      // 绘制小汽车
      g.drawCars()
      // 绘制植物卡片
      g.drawCards()
      // 绘制僵尸胜利画面
      g.drawZombieWon()
      // 清除全局生成阳光定时器
      _main.clearTiemr()
    }
  }
  /**
   * 初始化函数
   * _main: 游戏入口函数对象
   */
  init () {
    let g = this,
        _main = window._main

    // 设置键盘按下及松开相关注册函数
    window.addEventListener('keydown', function (event) {
      g.keydowns[event.keyCode] = 'down'
    })
    window.addEventListener('keyup', function (event) {
      g.keydowns[event.keyCode] = 'up'
    })
    g.registerAction = function (key, callback) {
      g.actions[key] = callback
    }
    // 设置轮询定时器
    g.timer = setInterval(function () {
      g.setTimer(_main)
    }, 1000/g.fps)
    // 注册鼠标移动事件
    document.getElementById('canvas').onmousemove = function (event) {
      let e = event || window.event,
          scrollX = document.documentElement.scrollLeft || document.body.scrollLeft,
          scrollY = document.documentElement.scrollTop || document.body.scrollTop,
          x = e.pageX || e.clientX + scrollX,
          y = e.pageY || e.clientY + scrollY
      // 设置当前鼠标坐标位置
      g.mouseX = x
      g.mouseY = y
    }
    // 查看更新日志按钮点击事件
    document.querySelectorAll('.change-log-btn').forEach(function (el, idx) {
      el.onclick = function () {
        let updateLog = document.getElementsByClassName('update-log')[0]
        updateLog.style.display === 'none' ? updateLog.style.display = 'block' : updateLog.style.display = 'none'
      }
    })
    // 开始游戏按钮点击事件
    document.getElementById('js-startGame-btn').onclick = function () {
      // 播放Start动画
      g.state = g.state_START
      // 设置定时器，切换至开始游戏状态
      setTimeout(function () {
        g.state = g.state_RUNNING
        // 显示控制按钮
        document.getElementById('pauseGame').className += ' show'
        document.getElementById('restartGame').className += ' show'
        // 设置全局生成阳光、僵尸定时器
        _main.clearTiemr()
        _main.setTimer()
      }, 2500)
      // 显示卡片列表信息
      document.getElementsByClassName('cards-list')[0].className += ' show'
      // 显示控制按钮菜单
      document.getElementsByClassName('menu-box')[0].className += ' show'
      // 隐藏开始游戏按钮，游戏介绍，查看更新日志按钮
      document.getElementById('js-startGame-btn').style.display = 'none'
      document.getElementById('js-intro-game').style.display = 'none'
      document.getElementById('js-log-btn').style.display = 'none'
    }
    // 植物卡片点击事件
    document.querySelectorAll('.cards-item').forEach(function (card, idx) {
      card.onclick = function () {
        let plant = null,                                 // 鼠标放置植物对象
            cards = _main.cards
        // 当卡片可点击时
        if (cards[idx].canClick) {
          // 设置当前随鼠标移动植物类别
          g.cardSection = this.dataset.section
          // 可绘制随鼠标移动植物
          g.canDrawMousePlant = true
          // 设置当前选中植物卡片idx以及需消耗阳光数量
          g.cardSunVal = {
            idx: idx,
            val: cards[idx].sun_val,
          }
        }
      }
    })
    // 鼠标点击画布事件
    document.getElementById('canvas').onclick = function (event) {
      let plant = null,                                 // 鼠标放置植物对象
          cards = _main.cards,
          x = g.mouseX,
          y = g.mouseY,
          plant_info = {                                // 鼠标放置植物对象初始化信息
            type: 'plant',
            section: g.cardSection,
            x: _main.plants_info.x + 80 * (g.mouseCol - 1),
            y: _main.plants_info.y + 100 * (g.mouseRow - 1),
            row: g.mouseRow,
            col: g.mouseCol,
            canSetTimer: g.cardSection === 'sunflower' ? true : false,      // 能否设置阳光生成定时器
          }
      // 判断当前位置是否可放置植物
      for (let item of _main.plants) {
        if (g.mouseRow === item.row && g.mouseCol === item.col) {
          g.canLayUp = false
          g.mousePlant = null
        }
      }
      // 在可放置时，绘制植物
      if (g.canLayUp && g.canDrawMousePlant) {
        let cardSunVal = g.cardSunVal
        if (cardSunVal.val <= _main.allSunVal) { // 在阳光数量足够时绘制
          // 禁用当前卡片
          cards[cardSunVal.idx].canClick = false
          // 定时改变卡片可点击状态
          cards[cardSunVal.idx].changeState()
          // 绘制倒计时
          cards[cardSunVal.idx].drawCountDown()
          // 放置对应植物
          plant = Plant.new(plant_info)
          _main.plants.push(plant)
          // 改变阳光数量
          _main.sunnum.changeSunNum(-cardSunVal.val)
          // 禁止绘制随鼠标移动植物
          g.canDrawMousePlant = false
        } else { // 阳光数量不足
          // 禁止绘制随鼠标移动植物
          g.canDrawMousePlant = false
          // 清空随鼠标移动植物对象
          g.mousePlant = null
        }
      } else {
        // 禁止绘制随鼠标移动植物
        g.canDrawMousePlant = false
        // 清空随鼠标移动植物对象
        g.mousePlant = null
      }
    }
    // 暂停按钮事件
    document.getElementById('pauseGame').onclick = function (event) {
      g.state = g.state_STOP
    }
    // 重启游戏按钮事件
    document.getElementById('restartGame').onclick = function (event) {
      if (g.state === g.state_LOADING) { // 加载动画
        g.state = g.state_START
      } else {
        g.state = g.state_RUNNING
        // 开启向日葵的阳光生成定时器
        for (let plant of _main.plants) {
          if (plant.section === 'sunflower') {
            plant.setSunTimer()
          }
        }
      }
      // 设置全局生成阳光、僵尸定时器
      _main.setTimer()
    }
  }
}