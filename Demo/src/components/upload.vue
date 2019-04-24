<template>
  <div class="main">
    <Form ref="productform" :model="formValidate" :rules="ruleValidate" :label-width="120" class="form">
      <FormItem label="固件名称" prop="name">
        <Input v-model="formValidate.name" placeholder="请输入固件名称..."></Input>
      </FormItem>
      <FormItem label="选择固件" prop="uploadProduct" class="productchoose">
        <Row>
          <Col span="12">
            <Upload
              ref="upload"
              v-model="formValidate.uploadProduct"
              :action="uploadData.action"
              :show-upload-list="false"
              :disabled="uploadData.disable"
              :data="uploadData.uploadParams"
              :before-upload="handleBeforeUpload"
              :on-progress="handleProgress"
              :on-success="handleSuccess"
              :on-error="handleError"
              
            >
              <Button icon="ios-cloud-upload-outline" :class="uploadData.chooseProduct?'uploaderrorbtn':''">请选择固件</Button>
            </Upload> 
            </Col>
            <Col span="12">
              <Button type="primary" :loading="uploadloading" @click="upload">
                  <span v-if="!uploadloading">开始上传</span>
                  <span v-else>上传中...</span>
              </Button>
            </Col>
            <div class="tips" v-text="uploadData.uploadtips"></div>
            <div v-for="(item, index) in uploadData.uploadList" :key="item.keyID" class="list_wrap">
                  <div class="list">
                    上传文件: {{ item.name }} 
                    <a href="javascript:;"  @click="delectFile(item.keyID)">X</a>
                  </div>
                  <template v-if="uploadData.upstatus">
                      <Progress v-if="item.showProgress" :percent="item.percentage"></Progress>
                  </template>
              </div>
          </Row>               
      </FormItem>
      <FormItem>
        <Row>
          <Col span="24">
            <Button type="primary" :loading="submitLoading"  @click="handleSubmit('productform')">
                <span v-if="!submitLoading">保存</span>
                <span v-else>Loading...</span>
            </Button>
            <!-- <Button type="primary" @click="handleSubmit('productform')">保存</Button> -->
          </Col>
        </Row>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import {getsuffix} from '@/utils/utils';
import {addFirmwareAction} from '@/api.js';
import BMF from 'browser-md5-file';
export default {
  name: 'upload',
  data () {
    // 自定义验证上传组件方法
    const validateUpload = (rule, value, callback) => {
      console.log(11)
      if(this.uploadData.uploadList && this.uploadData.uploadList.length===0) {
        this.uploadData.chooseProduct = true;
        callback(new Error('请上传固件'));
      } else {
        this.uploadData.chooseProduct = false;
        callback()
      }
    }
    return {
        uploadloading:false,
        formValidate:{
          name:'',
          uploadProduct:''
        },
        submitLoading:false,
        uploadData:{
          action:'',//上传API
          upstatus:false,//控制进度条显示
          disable:true,//禁止上传选择
          uploadList:[],//上传数据列表
          uploadParams:{},//上传额外带的参数
          chooseProduct:false,//判断是否选择文件,用来做类名的选中与否
          uploadtips:'',//提示语
          isupload:false,//判断是否先上传文件
        },
        // 设置验证规则
        ruleValidate: {
          name: [
            { required: true, message: "输入不能为空", trigger: "blur" },
          ],
          // 上传的规则就是 自定义验证的规则
          uploadProduct: [
            { validator: validateUpload, trigger: 'change'}
          ],
        }
    }
  },
  computed:{
    uploadDisable(){//根据数据判断上传按钮是否可以使用 非disable
      let obj = {
        name:this.formValidate.name,
        len:this.uploadData.uploadList.length
      } 
      return obj
    }
  },
  watch:{
    uploadDisable:{
      handler(newval,oldval){
        if(!newval.name){
          this.uploadData.disable = true;
          this.uploadData.uploadtips = "温馨提示:请先填写固件名称";
        }else if(newval.len>=1){
          this.uploadData.disable = true;
          this.uploadData.chooseProduct = false;
          this.uploadData.uploadtips = "温馨提示:只可选择一个固件上传";
        }else{
          this.uploadData.disable = false;
          this.uploadData.uploadtips = "";
        }
      },
      deep:true,
      immediate:true
    }
  },
  methods:{
    //上传前钩子函数
    handleBeforeUpload(file){
      let re = /^(\d+\.\d+)(\.\w+)$/i;
      let handlefname = file.name.replace(getsuffix(file.name),"");
      //上传前做处理，因需求要把文件的md5值传过去所以在此我先做了md5之后再去请求api获取oss的数据
      //这里可改为自己的需求去做处理
      let bmf = new BMF();
      let md5fname='';
      //在此因需求又做了一次格式验证
      if(!(re.test(handlefname))){
        this.uploadData.uploadtips = "文件名不符合规则,请选择类似2.3.xxx组合的文件";
        return false;
      }else{
        bmf.md5(file,(err, md5) => {
          md5fname = md5;
          //把需要的参数传递给后端
          addFirmwareAction({params}).then(res=>{
            if(res.data){
              let obj = res.data;
              //获取到文件上传地址赋值给data
              this.uploadData.action = location.protocol+"//"+ obj['host'].split("://")[1];
              let resultfilename = handlefname+"."+md5fname;
              //上传文件额外带过去的数据
              this.uploadData.uploadParams = {
                "key":obj['dir']+"/"+resultfilename,
                "policy" : obj['policy'],
                "OSSAccessKeyId" : obj['accessid'],
                'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
                "signature" : obj['signature'],
              }
              // 选择文件后 这里判断文件类型 保存文件 自定义一个keyid 值 方便后面删除操作
              let keyID = Math.random().toString().substr(2);
              file['keyID'] = keyID;
              // 保存文件到需要上传的文件数组里
              this.uploadData.uploadList.push(file);
              //避免用户上传文件之后 删除文件 再次上传而在点击按钮的时候判断不生效
              this.uploadData.isupload = false;
              this.$refs['productform'].validate();
            }
          }).catch(err=>{
            this.$Modal.error({
                title: '提示',
                content: err.msg || '上传固件失败,请重新上传'
            });
          })
        },progress => {
          console.log('progress number:', progress);
        })
        // 返回 false 停止自动上传 我们需要手动上传
        return false;
      }  
    },
    //上传中钩子函数
    handleProgress(event, file, fileList){
      //处理数据 把进度值存到数组里，目前能想到的笨方法，如有更好的方法欢迎安利
      let f = this.uploadData.uploadList[0];
      f.showProgress = file.showProgress;
      f.percentage = Number(file.percentage.toFixed(2));
      f.status = file.status;
      this.uploadData.uploadList.splice(0,1,f);
    },
    //上传成功钩子函数
    handleSuccess(res, file, fileList){
      //因为上传成功我们还需要给它把进度条赋值到100 所以还需再处理一次...
      let f = this.uploadData.uploadList[0];
      f.showProgress = file.showProgress;
      f.percentage = Number(file.percentage.toFixed(2));
      f.status = file.status;
      this.uploadData.uploadList.splice(0,1,f);
      this.$Modal.success({
          title: '提示',
          content: res.msg || '上传固件成功'
      });
      //恢复上传按钮
      this.uploadloading=false; 
      this.uploadData.isupload = true;
      this.uploadData.uploadtips="";
    },
    //上传失败钩子函数
    handleError(err, file, fileList){
      if(err){
          this.$Modal.error({
              title: '提示',
              content: err.msg || '上传固件失败,请重新上传'
          });
          this.uploadloading=false;
      }
    },
    //手动上传
    upload(){
      //设置上传按钮loading
      this.uploadloading=true;
      if(this.uploadData.uploadList.length === 0 ) {
          this.$Message.error('未选择上传文件');
          //恢复上传按钮
          this.uploadloading=false; 
          return false;
      } 
      for (let i = 0; i < this.uploadData.uploadList.length; i++) {
          let item = this.uploadData.uploadList[i];
          //开始上传
          this.$refs.upload.post(item);
          //开始上传时把进度条设置为显示
          this.uploadData.upstatus = true;
      }
    },
    // 删除文件
    delectFile (keyID) { 
        // 删除需要上传文件数据里的当前文件
        this.uploadData.uploadList.forEach((item,index) => {
            if(item.keyID == keyID){
              this.uploadData.uploadList.splice(index,1);
              this.uploadData.isupload = false;
            }
        })
    },
    //改变loading
    changeLoading () {
        this.submitLoading = true;
        this.$nextTick(() => {
          this.submitLoading = false;
        })
    },
    //
    handleSubmit(form){
      this.$refs[form].validate((valid) => {
        if (valid){
          if(!this.uploadData.isupload){
            this.uploadData.uploadtips = "请先上传固件";
            this.uploadData.chooseProduct = true;
            this.changeLoading();
            return;
          }else{
            this.submitLoading = true;
            setTimeout(()=>{
              this.submitLoading = false;
              this.$Message.success('保存成功');
              console.log('ok')
            },5000)
          }
        }else{
          this.changeLoading();
          this.$refs['productform'].validate();
        }
      })
    }
  }
}
</script>
<style lang="scss">
  .productchoose .ivu-form-item-label:before{
    content: '*';
    display: inline-block;
    margin-right: 4px;
    line-height: 1;
    font-family: SimSun;
    font-size: 12px;
    color: #ed4014;
  }
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.form{
  width:500px;
  margin:auto;
}
.tips{color:red;text-align:left;}
.list_wrap{display:flex;flex-direction:column;align-items:flex-start;}
.uploaderrorbtn{
  border-color:#ed4014 !important;
}
</style>
