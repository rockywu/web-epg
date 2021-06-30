/**
 * 工具类
 */
import $ from 'jquery';
/**
 * 是否是html元素
 */
export function isHTMLElement(el) {
  return el instanceof HTMLElement;
}

/**
 * 是否是jQuery元素
 */
export function isJQUERYElement(el) {
  return el instanceof $;
}

/**
 * 是否是EPG元素
 */
export function isEPGElement(el) {
  return el && el.$el && el.id && el.epgConf ? true : false
}

/**
 * 节点格式化
 * @param {*} elem 
 * @returns 
 */
export function getHTMLElement(elem) {
  if (isJQUERYElement(elem)) {
    elem = elem.get(0);
  }
  if (elem && isHTMLElement(elem)) {
    return elem;
  }
  return null;
}

/**
 * 获取节点信息
 * @param {HTMLElement} elem
 */
export function getAttrs(elem) {
  let res = {};
  elem = elemFormat(elem)
  if (elem) {
    Array.from(elem.attributes).forEach((elm) => {
      if (elm.specified) {
        try {
          res[elm.name] = JSON.parse(elm.value)
        } catch (e) {
          res[elm.name] = elm.value;
        }
      }
    })
  }
  return res;
}

/**
 * 优先执行
 */
export function Priority(seconds) {
  let handle = null;
  seconds = parseInt(seconds, 10) || 1000;
  return function (cb) {
    if (handle) {
      console.log('不执行Priority')
      return;
    }
    setTimeout(() => {
      handle = null;
    }, seconds)
    handle = 1;
    cb && cb(seconds);
  }
}

/**
 * 返回元素在可视区域内的元素宽高
 * @param {*} e 元素
 * @param {*} parent 滚动区域
 */
export function getPostionInner(e, parent) {
  let pw = parent.offsetWidth;
  let ph = parent.offsetHeight;
  let {l, t, w ,h} = getPositionDefault(e, parent);
  let top = $(parent).scrollTop() || 0;
  let left = $(parent).scrollLeft() || 0;
  let r = 0, b = 0, oldw = w, oldh = h;
  //重新定义高度
  l = l - left;
  r = l + w;
  t = t - top;
  b = t + h;
  //计算左右和上下在可视区域的逻辑
  // debugger;
  if (r <= 0 || l >= pw || t >= ph || b <= 0) {
    //底部超界
    w = 0, h = 0;
  } else {
    //左右计算
    if (l < 0 && r < pw) {
      l = 0;
      w = r;
    } else if (l > 0 && r > pw) {
      w = pw - l;
      r = pw;
    }
    //上下计算
    if (t < 0 && b < ph) {
      t = 0;
      h = b;
    } else if (t > 0 && b > ph) {
      h = ph - t;
      b = ph;
    }
  }
  //手动计算，将超出部分宽度或高度设置为0
  return {
    sl: left - oldw + w,
    st: top - oldh + h,
    l: l,
    t: t,
    r: l + w,
    b: t + h,
    w: w,
    h: h,
  };
}
window.getPostionInner = getPostionInner;


/**
 * 获取默认在页面中的定位
 * @param {*} e 
 * @param {*} parent 
 * @returns 
 */
export function getPositionDefault(e, parent = null) {
  let l = 0, t = 0, w = e.offsetWidth, h = e.offsetHeight;
  while (e != null && (parent == null || parent !== e)) {
    l += e.offsetLeft;
    t += e.offsetTop;
    e = e.offsetParent;
  }
  return {
    l: l,
    t: t,
    r: l + w,
    b: t + h,
    w: w,
    h: h
  };
}


/**
 * 获取当前焦点元素在页面中的绝对位置
 * @param {当前获取的焦点的元素} e 
 */
export function getPosition(e, parent = null, scroller = null) {
  let {l, t, w, h} = getPositionDefault(e, parent);
  let top = 0, left = 0;
  if (scroller) {
    top = $(scroller).scrollTop()
    left = $(scroller).scrollLeft();
  }
  l = l - left;
  t = t - top;
  //判断是否在内轴中
  let innerConf = ((e.epgConf || {}).group || {}).scroll || {};
  let innerBox = $(innerConf.selector).get(0)
  let inner = {};
  if(innerBox) {
    inner = getPostionInner(e, innerBox);
  }
  w = inner.w === undefined ? w : inner.w;
  h = inner.h === undefined ? h : inner.h;
  l = l - (inner.sl === undefined ? 0 : inner.sl);
  t = t - (inner.st === undefined ? 0 : inner.st);
  return {
    l: l,
    t: t,
    r: l + w,
    b: t + h,
    w: w,
    h: h,
  };
}
window.getPosition = getPosition
/**
 * 获取元素位置和宽高信息
 * @param {*} target 
 * @returns 
 */
export function getClientRect(target) {
  let cr, width = 0, height = 0, centerx = 0, centery = 0;
  try {
    cr = target.getBoundingClientRect();
    centerx = cr.left + (cr.right - cr.left) / 2;
    centery = cr.top + (cr.bottom - cr.top) / 2;
    width = target.offsetWidth;
    height = target.offsetHeight;
  } catch (e) {
    console.log('no bounding', target)
    return false
  }
  return {
    l: centerx - width / 2,
    r: centerx + width / 2,
    t: centery - height / 2,
    b: centery + height / 2,
    w: width,
    h: height
  };
}
window.getClientRect = getClientRect;

/**
 * 计算两个左边间的距离
 * @param {*} cx 
 * @param {*} cy 
 * @param {*} nx 
 * @param {*} ny 
 * @returns 
 */
function distance(cx, cy, nx, ny) {
  return parseInt(Math.sqrt(Math.pow(cx - nx, 2) + Math.pow(cy - ny, 2)));
}

/**
 * 检查距离
 * @param {*} distances 
 * @param {*} el 
 * @param {*} nextObj {nextEl // 下个元素, minDistance, 最短距离}
 * 
 */
function checkDistances(distances, el, nextObj) {
  let min = Math.min.apply(null, distances);
  if (min < nextObj.distance) {
    nextObj.next = el;
    nextObj.distance = min;
  }
  return nextObj;
}

/**
 * 逐个检查可能的元素
 * 
 * @param {*} direction 方向
 * @param {*} prePosition 当前焦点元素定位信息
 * @param {*} elPosition  目标元素定位信息
 * @param {*} el 目标元素对象
 * @param {*} nextObj 对比信息
 * @returns 
 */
function checkNext(direction, prePosition, elPosition, el, nextObj) {
  //当前焦点元素定位信息
  let pi = prePosition;
  //需要检查的元素定位信息
  let ni = elPosition;
  if (ni.w === 0 || ni.h === 0) return nextObj;
  if (direction === 'up' && pi.t >= ni.b) {
    /* 当前 必须在 目标下方 */
    //检查并替换
    nextObj = checkDistances([
      //当前左上 到 目标左下
      distance(pi.l, pi.t, ni.l, ni.b),
      //当前右上 到 目标右下
      distance(pi.r, pi.t, ni.r, ni.b),
    ], el, nextObj);

  } else if (direction === 'right' && pi.r <= ni.l) {
    /* 当前 必须在 目标左侧 */
    //检查并替换
    nextObj = checkDistances([
      //当前右上 到 目标左上
      distance(pi.r, pi.t, ni.l, ni.t),
      //当前右下 到 目标左下
      distance(pi.r, pi.b, ni.l, ni.b),
    ], el, nextObj);

  } else if (direction === 'down' && pi.b <= ni.t) {
    /* 当前 必须在 目标上方 */
    //检查并替换
    nextObj = checkDistances([
      //当前左下 到 目标左上
      distance(pi.l, pi.b, ni.l, ni.t),
      //当前右下 到 目标右上
      distance(pi.r, pi.b, ni.r, ni.t)
    ], el, nextObj);
  } else if (direction === 'left' && pi.l >= ni.r) {
    /* 当前 必须 目标右侧 */
    //检查并替换
    nextObj = checkDistances([
      //当前左上 到 目标右上
      distance(pi.l, pi.t, ni.r, ni.t),
      //当前左下 到 目标右下
      distance(pi.l, pi.b, ni.r, ni.b),
    ], el, nextObj);
  }
  return nextObj;
}

/**
 * 获取 方向上的元素
 * @param {*} pointer 当前焦点元素, 结构$el存储dom元素,或者直接是dom元素
 * @param {Array} items  检查元素集合，结构$el存储dom元素,或者直接是dom元素
 * @param {*} direction 
 */
export function getNextElByDirection(pointer, items, direction, scroller, scrollerItems) {
  //附近元素
  let nextObj = {
    pointer: pointer,
    next: null, //下个元素
    distance: 9999999999, //最短距离
  }
  //获取元素信息
  let pi = getPosition(pointer.$el || pointer, null, scrollerItems.includes(pointer) ? scroller : null);
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let ni = getPosition(item.$el || item, null, scrollerItems.includes(pointer) ? scroller : null);
    nextObj = checkNext(direction, pi, ni, item, nextObj);
  }
  return nextObj;
}

export function time(name, auto = true) {
  let obj = {
    st: 0,
    et: 0,
    rs: 0,
    name: "time," + name + ("" + Math.random()).slice(2),
    getMill() {
      return window.performance.now();
    },
    start() {
      if (!this.st) {
        this.st = this.getMill();
      }
      return this;
    },
    end() {
      if (!this.et) {
        this.et = this.getMill();
        this.rs = this.et - this.st;
      }
      this.show();
      return this.rs;
    },
    show() {
      console.log("time-" + name, this.rs);
    }
  }
  if (auto) {
    obj.start();
  }
  return obj;
}


/**
 * 滚轴定位行为
 * @param {*} nextEl
 * @param {*} opt
 * {
 *   elScroll //滚轴元素
 *   elBox  //滚轴容器元素
 *   vertical  //是否垂直 默认为true 代表垂直方向
 *   align  //对其模式 默认居中模式 center, top, bottom
 *   alignLimit  //对其模式下，达到多少时触发对其行为 0 ~ 1,代表移动达到容器宽度的固定比例后则触发对其,当 为1时，为可见不滚动规则
 *   animateTime 
 *   gap 
 * }
 * @param {*} cb //行为结束后回调函数
 * @returns 
 */
export function nextScrollLocation(nextEl, opt, cb = function () { }, inner = false) {
  opt = Object.assign({
    elScroll: '',
    elBox: '',
    vertical: true,
    align: 'center',
    alignLimit: 1,
    animateTime: 0,
    gap: 0
  }, opt, { elBox: opt.elBox || opt.elScroll });
  let nexter = $(nextEl).eq(0);
  let scroller = $(opt.elScroll).eq(0);
  let boxer = $(opt.elBox).eq(0)
  //无滚轴元素或定位元素时，触发定位行为, 元素不在滚轴内
  if (scroller.length < 1 || boxer.length < 1 || nexter.length < 1 || scroller.find(nexter).length < 1) {
    //无定位行需要触发
    return cb(false);
  }
  let swh = 0;
  let slt = 0; //滚轴滚动方向上的滚轴位置
  let nlt = 0; //元素滚动主轴方向初点位置
  let nrb = 0; //元素滚动主轴方向尾点位置
  let nwh = 0; //元素滚动主轴方向上的宽高距离
  let animateKey = "";
  let alignLimit = opt.alignLimit > 0 && opt.alignLimit < 1 ? opt.alignLimit : 1;
  //获取 需要移动的目标元素定位
  let pos;
  if(inner) {
    pos = getPositionDefault(nexter.get(0), scroller.get(0))
  } else {
    pos = getPosition(nexter.get(0), scroller.get(0))
  }
  if (opt.vertical === true) {
    //垂直方向
    swh = boxer.height();
    slt = scroller.scrollTop();
    nlt = pos.t;
    nrb = pos.b;
    nwh = pos.h;
    animateKey = "scrollTop";
  } else {
    //水平方向
    swh = boxer.width();
    slt = scroller.scrollLeft();
    nlt = pos.l
    nrb = pos.r;
    nwh = pos.w;
    animateKey = "scrollLeft";
  }
  let stop = 0;
  let featureStop = 0;
  if (opt.align === 'top') { //主轴方向顶部
    featureStop = nlt - opt.gap;
  } else if (opt.align === 'bottom') { //主轴方向尾部
    featureStop = nrb - swh + opt.gap;
  } else { //主轴方向居中
    featureStop = nlt + nwh / 2 - swh / 2;
  }
  //判断元素是否完成展示 
  if (nlt > slt && nrb < slt + swh && alignLimit === 1) {
    if (nlt < swh && nrb < swh) {
      stop = 0;
    } else {
      stop = slt;
    }
  } else {
    if (nlt < swh * alignLimit && nrb < swh * alignLimit) {
      stop = 0;
    } else {
      stop = featureStop >= 0 ? Math.floor(featureStop) : 0;
    }
  }
  if (stop != slt) {
    //避免出现由于窗口过短导致无法全部展示，估修改元素必须完整展示, todo 
    scroller.animate({ [animateKey]: stop + 'px' }, opt.animateTime, () => {
      cb && cb(true, stop);
    });
  } else {
    cb && cb(true, stop);
  }
}