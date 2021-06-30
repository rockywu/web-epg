/**
 * 用于解决EPG背景下播放器无法正常露出问题
 */
import $ from 'jquery'
import { getClientRect } from './util'

const bgHtml = `
 <div class="epg-body_bg" id="epg-body_bg">
   <div class="epg-body_bg-top"></div>
   <div class="epg-body_bg-right"></div>
   <div class="epg-body_bg-bottom"></div>
   <div class="epg-body_bg-left"></div>
 </div>`

const shadeId = "#epg-body_bg";

class Bg {

  constructor() {
    this.color = 'transparent';
    this.image = ''
    this.boxWidth = Math.floor(document.documentElement.clientWidth)
    this.boxHeight = Math.floor(document.documentElement.clientHeight)
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.bootstrap = false
  }

  /**
   * 初始化背景层
   */
  init() {
    let bg = $(shadeId);
    if (bg.length) {
    } else {
      bg = $(bgHtml);
    }
    $('body').append(bg);
  }

  show() {
    $(shadeId).show();
    this.setHollow();
  }

  hide() {
    $(shadeId).hide()
  }

  /**
   * 设置区域空心更具元素
   */
  setHollowByElement(elem) {
    elem = $(elem).get(0)
    if (elem) {
      let pos = getClientRect(elem)
      this.setHollow(pos.l, pos.t, pos.w, pos.h)
    }
  }

  /**
   * 设置空心
   * @param {*} x 左上角x坐标 单位px
   * @param {*} y 左上角y坐标 单位px
   * @param {*} w 宽度 单位px
   * @param {*} h 高度 单位px
   */
  setHollow(x = 0, y = 0, w = 0, h = 0) {
    this.init();
    let bw = this.boxWidth;
    let bh = this.boxHeight;
    x = Math.floor(x);
    y = Math.floor(y);
    w = Math.floor(w);
    h = Math.floor(h);
    if (this.x === x && this.y === y && this.w === w && this.h === h && this.bootstrap) {
      console.log("无需修改背景设置")
      return;
    }
    this.bootstrap = true;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    let pos = {
      top: {
        w: x + w,
        h: y
      },
      right: {
        w: bw - x - w,
        h: y + h
      },
      bottom: {
        w: bw - x,
        h: bh - y - h
      },
      left: {
        w: x,
        h: bh - y
      }
    }
    Object.keys(pos).forEach(k => {
      let v = pos[k];
      let elm = $(shadeId).find(".epg-body_bg-" + k).eq(0);
      let css = {
        width: v.w + "px",
        height: v.h + "px",
        backgroundSize: `${bw}px ${bh}px`,
      }
      elm.css(css)
    })
  }

  /**
   * 设置背景图片和颜色
   * @param {*} color 
   * @param {*} bgImage 
   */
  setBackground(opt) {
    opt = opt || {};
    if (opt.color) {
      this.color = opt.color;
    } else {
      this.color = 'transparent';
    }
    this.image = opt.image || 'none';
    ['top', 'right', 'bottom', 'left'].forEach(k => {
      let elm = $(shadeId).find(".epg-body_bg-" + k).eq(0);
      let css = {}
      if (this.color) {
        css.backgroundColor = this.color;
      }
      if (this.image === 'none') {
        css.backgroundImage = 'none';
      } else {
        css.backgroundImage = `url(${this.image})`
      }
      elm.css(css)
    })
  }

}

export default new Bg();;