import http from './utils/request';
/**
 * 
 * @param {model} data 可传可不穿
 * 增加固件 
 */
function addFirmwareAction(data){
    return http({
        url:'xxxx',
        method:'get',
        params:data
    })
}
export{
    addFirmwareAction,
}