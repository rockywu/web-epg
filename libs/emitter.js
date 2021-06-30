/**
 * EPG用于解决业务使用EPG操作焦点,
 * 兼容jQuery/zepto
 */
 class emitter {
  constructor() {
    this._emitCache = {};
  }
  on(name, cb, context, once) {
    let _cache = this._emitCache;
    if (name && typeof cb == 'function') {
      context = context ? context : null;
      //初始化
      if (name && !_cache[name]) {
        _cache[name] = {
          name: name,
          listeners: []
        };
      }
      //捆绑事件
      _cache[name].listeners.push({
        context: context,
        func: cb,
        once: !!once
      });
    }
    return this;
  }
  off(name, handle) {
    let _cache = this._emitCache;
    let cache = _cache[name];
    if (name && cache) {
      if (!handle) {
        delete _cache[name];
      } else {
        cache.listeners = cache.listeners.filter(function (v) {
          return v.func !== handle;
        });
      }
    }
    return this;
  }
  once(name, cb, context) {
    return this.on(name, cb, context, true);
  }
  emit(name, options) {
    let _cache = this._emitCache;
    let cache = void 0;
    if (name && (cache = _cache[name]) && cache.listeners.length > 0) {
      cache.listeners.forEach(function (v, k) {
        v.func.apply(v.context, options);
        v.once === true && (cache.listeners[k] = null);
      });
      cache.listeners = cache.listeners.filter(function (v) {
        return !!v;
      });
    }
    return this;
  }
}
export default emitter;