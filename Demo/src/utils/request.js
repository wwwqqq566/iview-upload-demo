import axios from "axios";
import qs from "qs";
import {getQueryString} from './utils';
import iView from 'iview';
const _atoken = getQueryString("_atoken");
const Axios = axios.create({
    baseURL:process.env.API_BASEURL,
    timeout:30000,
    responseType:"json",
    headers:{
        "Content-Type": "application/json;charset=utf-8"
    },
})
// x-www-form-urlencoded
Axios.interceptors.request.use(
    config => {
        // if(config.method === "post" || config.method === "put"){
        //     config.data = qs.stringify(config.data)
        // }
        if (_atoken) {
            config.headers.common['atoken'] = _atoken;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

Axios.interceptors.response.use(
    response=>{
        let res = response.data;
        if(res.code == 1){
            return res;
        }else{
            if(res.code == 2111){
                iView.Modal.warning({
                    title: '提示',
                    content: '登录过期，请重新登录！',
                    onOk(){
                      location.href = 'http://www.fogpod.com'
                    }
                });
            }
            return Promise.reject(res);
        }
    },
    error => {
        if (error && error.response) {
            switch (error.response.status) {
                case 400: error.message = '请求错误(400)' ; break;
                case 401: error.message = '未授权，请重新登录(401)'; break;
                case 403: error.message = '拒绝访问(403)'; break;
                case 404: error.message = '请求出错(404)'; break;
                case 405: error.message = '请求出错(405)'; break;
                case 408: error.message = '请求超时(408)'; break;
                case 500: error.message = '服务器错误(500)'; break;
                case 501: error.message = '服务未实现(501)'; break;
                case 502: error.message = '网络错误(502)'; break;
                case 503: error.message = '服务不可用(503)'; break;
                case 504: error.message = '网络超时(504)'; break;
                case 505: error.message = 'HTTP版本不受支持(505)'; break;
                default: error.message = `连接出错(${error.response.status})!`;
            }
          }else{
            error.message = '服务器忙，请稍后重试!'
          }
          return Promise.reject(error);
    }
);

export default Axios;