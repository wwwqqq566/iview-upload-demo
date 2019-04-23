function getQueryString(name) { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return null; 
}
// 时间戳转时间 yyyy:mm:dd hh:mm:ss
function timestampToTime(timestamp){
    if(timestamp){
        let date = new Date(timestamp * 1000),//时间戳为10位需*1000，时间戳为13位的话不需乘1000
                Y = date.getFullYear() + '-',
                M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-',
                D = (date.getDate()< 10? '0'+date.getDate():date.getDate()) + ' ',
                h = date.getHours() + ':',
                m = date.getMinutes() + ':',
                s = date.getSeconds()<10 ? '0'+date.getSeconds():date.getSeconds();
        return Y+M+D+h+m+s;
    }else{
        return '--';
    }
}
//判断对象中所有属性是否为空
function paramsValidate(params) {
    for(var key in params){
      if(params[key]){
        return true;
      }
    }
    return false;
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
}
function getsuffix(filename)
{
    let pos = filename.lastIndexOf('.')
    let suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    return suffix;
}
export{
    getQueryString,
    timestampToTime,
    paramsValidate,
    deepClone,
    getsuffix
}