/**
 * route模块，用于管理页面本地路由
 */
import { query2String, formatUrl } from './tools'
const prefix = "_!_";//用于替换baseUrl的占位符
const regexPrefix = new RegExp("^" + prefix)
class Route {

  /**
   * 返回模块初始化
   * @param {*} options {baseUrl, referKey, max, commons: {} }
   */
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.referKey = options.referKey || 'returnurl';
    this.max = options.max || 10;
    //用于将公共参数从querys中提取到hash中
    this.commons = options.commons || {};
    this.backing = false;
    console.log("router", JSON.stringify(this.getUrlFormat(), '', 2))
  }

  /**
   * 链接格式化
   * @param {*} url 
   */
  formatUrl(url) {
    return formatUrl(url)
  }

  /**
   * 获取Url格式化信息
   * @returns 
   */
  getUrlFormat() {
    let { path, querys, hashs } = this.formatUrl(window.location.href)
    let hbus = [];
    if (hashs.hbu && hashs.hbu.length) {
      hbus = hashs.hbu;
      delete hashs.hbu;
    }
    let rfus = "";
    if (querys[this.referKey]) {
      rfus = querys[this.referKey];
    }
    delete querys[this.referKey];
    if (hashs.rfu) {
      if (!rfus) {
        rfus = hashs.rfu;
      }
    }
    delete hashs.rfu;
    //采集公共参数
    let commons = {};
    Object.keys(this.commons).forEach(k => {
      let hk = this.commons[k];
      //存在公共参数
      if (querys[k] !== undefined) {
        commons[hk] = querys[k]
      }
      delete querys[k]
      if (hashs[hk] !== undefined) {
        if (!commons[hk]) {
          commons[hk] = hashs[hk]
        }
      }
      delete hashs[hk]
    })
    //获取当前链接信息
    return {
      path: path.replace(this.baseUrl, prefix),
      //其他query参数
      querys: querys,
      //其他hash参数
      hashs: hashs,
      //历史路由集合
      hbu: hbus,
      //最终的跳出地址
      rfu: rfus,
      commons: commons
    }
  }

  /**
   * 将格式化参数转换为URL
   * @param {*} format 
   */
  buildUrl(path, querys = {}, hashs = {}) {
    let url = path;
    let queryStr = query2String(querys)
    url += queryStr ? '?' + queryStr : '';
    if (!hashs.hbu || hashs.hbu.length < 1) {
      delete hashs.hbu;
    }
    if (!hashs.rfu) {
      delete hashs.rfu;
    }
    let hashStr = query2String(hashs);
    url += hashStr ? '#' + hashStr : '';
    return url;
  }

  /**
   * 追加当前项目下的路由地址，基于baseUrl
   * @param {*} url 
   * @param {*} query 
   */
  push(path, querys = {}, hashs = {}, replace = false) {
    //获取当前链接参数
    let format = this.getUrlFormat();
    //当前页面链接
    let curUrl = this.buildUrl(format.path, format.querys, format.hashs);
    //追加路由
    let hbu = format.hbu;
    let rfu = format.rfu;
    if (typeof replace === 'function') {
      replace = replace(hbu) === true ? true : false;
    }
    if (hbu.length && this.buildUrl(format.path, format.querys) == this.buildUrl(prefix + path, querys)) {
      //判断是否是两个相同的链接非hash相同，如果是相同链接则使用替换逻辑
      replace = true;
    }
    if (replace === false) {
      //执行替换逻辑
      hbu.push(curUrl)
    }
    if (hbu.length > this.max) {
      //如果历史链接数量大于等于最大长度
      hbu.pop();
    }
    let nextUrl = this.buildUrl(this.baseUrl + path, querys, Object.assign({}, hashs, { hbu, rfu }, format.commons));
    window.location.href = nextUrl;
  }

  /**
   * 替换当前不追加当前项目下的路由地址，基于baseUrl
   * @param {*} url 
   * @param {*} query 
   */
  replace(path, querys = {}, hashs = {}) {
    this.push(path, querys, hashs, true);
  }

  /**
   * 尝试跳出
   * @param {*} url 前往的url
   * @param {*} addRefer 追加当前地址
   */
  redirect(url, addRefer = false) {
    //需要追加referKey
    if (addRefer) {
      let tmp = this.formatUrl(url);
      let back = {};
      back[this.referKey] = window.location.href;
      url = this.buildUrl(tmp.path, Object.assign({}, tmp.querys, back), tmp.hashs)
    }
    window.location.href = url;
  }

  /**
   * 触发返回跳转,只负责路由内的跳转,支持通过cb函数的控制跳出
   * @param {Boolean|Promise<Boolean>} cb cb(nextLocation:{path, querys, hashs}, hbu, nextUrl)
   * @returns 
   */
  back(cb = () => { return true; }) {
    if (this.backing) return;
    this.backing = true;
    let format = this.getUrlFormat();
    let hbu = format.hbu
    let rfu = /^https?:\/\//.test(format.rfu) ? format.rfu : '';
    let backUrl = hbu.pop();
    let nextUrl = '';
    if (backUrl) {
      //处理返回链接地址
      let tmp = this.formatUrl(backUrl);
      let path = tmp.path.replace(regexPrefix, this.baseUrl)
      nextUrl = this.buildUrl(path, tmp.querys, Object.assign({}, tmp.hashs, { hbu, rfu }, format.commons))
    }
    if (!nextUrl && rfu) {
      //不存在本业务页面， 尝试跳回到来源页面
      nextUrl = rfu;
    }
    let cbrs = typeof cb === 'function' ? cb(nextUrl ? this.formatUrl(nextUrl) : null, nextUrl, hbu) : null;
    if (cbrs && cbrs.then && nextUrl) {
      //如果cb函数是一个Promise,则判断结果是否为true
      cbrs.then(res => {
        if (res !== false) {
          window.location.href = nextUrl;
        }
        this.backing = false;
      }).catch(e => {
        this.backing = false;
      })
    } else if (cbrs !== false && nextUrl) {
      //存在来源地址并且执行了校验则进行来源跳转
      window.location.href = nextUrl;
      this.backing = false;
    } else {
      this.backing = false;
    }
  }
}

export default Route;

