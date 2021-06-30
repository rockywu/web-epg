
/**
 * util工具类
 */
 const decodeURIC = decodeURIComponent;
 const encodeURIC = encodeURIComponent;
 /**
  * 字符串格式化为Object支持一维数组
  * 例子格式如下：aaa=1&b[2]=12312&b[6]=阿斯顿发11&b[4]=afas&b[0]=阿斯顿发斯蒂芬
  * @param {*} str 
  * @returns 
  */
 export function string2Query(str) {
   var query = {};
   if (str) {
     var strs = str.split("&");
     for (var i = 0, ln = strs.length; i < ln; i++) {
       var tmp = strs[i].split("=");  //分离key与Value
       var match = ("" + tmp[0]).match(/^(\w+)(\[(\d+)\])*$/);
       var value = tmp[1] === void 0 ? '' : tmp[1]
       if (match && match[1] && match[2] == void 0) {
         //对象参数
         query[decodeURIC(match[1])] = decodeURIC(value);
       } else if (match && match[1] && match[3] >= 0) {
         //判断为数组对象进行设置
         if (!query[match[1]]) {
           query[match[1]] = [];
         }
         query[match[1]][Number(match[3])] = decodeURIC(value);
       }
     }
     Object.keys(query).map(function (k) {
       var value = query[k];
       if (value instanceof Array && value.length) {
         var tmp = [];
         for (var i = 0; i < value.length; i++) {
           if (value[i] !== void 0) {
             tmp.push(value[i])
           }
         }
         query[k] = tmp;
       }
     });
   }
   //进行数组结构处理
   return query;
 }
 
 /**
  * query对象格式化为对象
  * 例子：{
  *  aaa: 11,
  *  b: [1，2，3，4]
  * }
  * @param {*} query 
  * @returns 
  */
 export function query2String(query) {
   let strs = [];
   Object.keys(query).forEach(k => {
     let value = query[k];
     if (value instanceof Array && value.length) {
       for (var i = 0; i < value.length; i++) {
         strs.push(encodeURIC(k) + "[" + i + "]=" + encodeURIC(value[i]))
       }
     } else {
       //进行数组结构组装
       strs.push(encodeURIC(k) + '=' + encodeURIC(value))
     }
   })
   return strs.join("&");
 }
 
 /**
  * 链接格式化
  * @param {*} url 
  */
 export function formatUrl(url) {
   //处理返回链接地址
   let tmp = url.split("#");
   let hashs = {};
   let querys = {};
   if (tmp[1]) {
     hashs = string2Query(tmp[1])
   }
   let tpp = tmp[0].split("?");
   if (tpp[1]) {
     querys = string2Query(tpp[1]);
   }
   return {
     path: tpp[0],
     querys: querys,
     hashs: hashs
   }
 }