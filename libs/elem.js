/**
 * elem模块解决元素初始化
 */
import {getHTMLElement, getAttrs} from './util'

/**
 * 初始元素
 */
class Elem {
  constructor() { 
    this.config = null;
  }

  /**
   * 设置初始配置
   * @param {*} config 
   * {
   *  
   * }
   */
  setConfig(config) {
    this.config = config || null;
  }

  /**
   * 初始化元素
   * @param {HTMLElement} elem  html节点
   * @param {Boolean} force  默认为false 是否强制重新获取节点信息
   */
  get(elem, force = false) {
    elem = getHTMLElement(elem);
    if (!elem) return null;
    if (!force && elem.epgConf) return elem.epgConf;
    let attrs = getAttrs(elem);
    let data = {};
    //初始化所有有效的data
    Object.keys(attrs).forEach(k => {
      if (/^data-/.test(k)) {
        data[k.replace(/^data-/, '')] = attrs[k];
      }
    })
    return {
      $el: elem,
      data: data,
      attrs: attrs
    }
  }
}

export default new Elem()
