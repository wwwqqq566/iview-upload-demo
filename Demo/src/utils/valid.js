import {getsuffix} from './utils';
const validate = {
 /**
   * @description 手机号格式验证
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  formPhoneNumber: function (rule, value, callback) {
    let re = /^1[345678]\d{9}$/;
    if (!re.test(value)) {
      callback(new Error('手机号格式错误'));
    } else {
      callback();
    }
  },
  /**
   * @description 邮箱
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  formEmail: function (rule, value, callback) {
    let re = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if (value.length > 20) {
      callback(new Error('邮箱长度不能大于20'));
    } else if (!re.test(value)) {
      callback(new Error('请填写正确的邮箱账号'));
    } else {
      callback();
    }
  },
  /**
   * @description 身份证号格式验证
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  formCardId: function (rule, value, callback) {
    let re = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/;
    if (!re.test(value)) {
      callback(new Error('身份证号格式错误'));
    } else {
      callback();
    }
  },
  formRealname:function(rule,value,callback){
    let re = /^[-\w\u4E00-\u9FFF]{1,25}$/;
    if(!re.test(value)){
      callback(new Error('固件名称错误，请输入数字字母下划线组成的名称如800g_gam'));
    } else {
      callback();
    }
  },
  formVersion:function(rule,value,callback){
    let re = /^(\d+\.\d+)(\.\w{3})$/i;
    let val = value.replace(getsuffix(value),"");
    if (!re.test(value)) {
      callback(new Error('版本号格式错误，请输入如1.2.gam'));
    } else {
      callback();
    }
  }
}
export default validate