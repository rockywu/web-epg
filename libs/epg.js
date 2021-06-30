/**
 * EPG业务模块
 */
import Emitter from './emitter'
class EPG extends Emitter{

  static modules

  /**
   * 载入扩展模块
   * @param {*} name 扩展名
   * @param {*} model 模块对象
   */
  static extends = function(name, model) {
    EPG.modules[name] = model;
  }

  constructor() {}

}

export default EPG;
