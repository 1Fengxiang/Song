<template>
    <div class="controller_ground">
        <video autoplay loop muted>
    <source src="../assets/Guitar-Girl-4K.mp4" type="video/mp4">
        </video>
        <div class="controller_box">
              <div class="login_img">
                <img src="../assets/img1.png" >
              </div>
              <el-form ref="loginFormRef" :model="form" :rules="rules" label-width="50px" class="login_form"  @keydown.enter="login">
                    <el-form-item  prop="account" >
                    <el-input v-model="form.account"  placeholder="用户名" prefix-icon="el-icon-user" ></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                    <el-input v-model="form.password" type="password" placeholder="密码" show-password prefix-icon="el-icon-lock"  ></el-input>
                    </el-form-item>

                  
                    <div class="captcha-wrapper">
    <!-- 验证码输入框 -->
    <div class="input-container">
      <el-input
        v-model="captchaCode"
        placeholder="请输入验证码"
        clearable
        style="width: 130px; padding-left: 50px;"
      ></el-input>
    </div>
    
    <!-- 验证码图片（带倒计时） -->
    <div 
      class="image-container" 
      @click="handleRefreshClick"
      :style="{
        cursor: isCounting ? 'not-allowed' : 'pointer',
        opacity: isCounting ? 0.7 : 1
      }"
    >
      <img :src="captchaImage" alt="验证码" class="captcha-img"/>
      
      <!-- 倒计时遮罩 -->
      <div v-if="isCounting" class="countdown-mask">
        {{ countdown }}秒后刷新
      </div>
      
    </div>
  </div>
  
                    <el-form-item class="button" style="margin-top: 10px;">
                        <el-button type="primary" round @click="login" >登录</el-button>
                    </el-form-item>
                    <div style="text-align: center; display: flex; padding-left: 80px;">
    <span style="color: #606266; ">还没有账号？</span>
    <el-link 
      type="primary" 
      @click="toRegister"
      :underline="false"
      style="font-size: 17px;"
    >
      立即注册
    </el-link>
  </div>
                </el-form>
        </div>
    </div> 
</template>
<script >
  import axios from 'axios';
  import { mapMutations } from 'vuex';
export default {
    data() {
        return {
            sessionId:"1",
            isCounting: false,  // 是否在倒计时中
      countdown: 5,      // 倒计时时长（秒）
      timer: null ,        // 计时器对象
      captchaImage: '',
      captchaCode: '',
      timestamp: Date.now(), // 用于强制刷新图片
            form:{
                account:"3088199729",
                password:"123456"
            },
            rules:{
                account:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 9, max: 12, message: '长度在 9 到 12 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 5, message: '长度在 5到 12 个字符', trigger: 'blur' }
                ]
            },
            result:{
                code:"",
                msg:"",
                data:{
                    userId:"",
                    account:"",
                    userName:"",
                    headshot:"",
                    email:"",
                    sex:"",
                    briefIntroduction:"",
                    birthday:"",
                    password:"",
                    region:"",
                    token:""
                }
            },
            user:{
                    userId:"",
                    account:"",
                    userName:"",
                    headshot:"",
                },
        };
    },
    beforeDestroy() {
    // 组件销毁前清除计时器
    clearInterval(this.timer);
  },
    methods: {
    toRegister(){

    },
        startCountdown() {
      this.isCounting = true;
      this.countdown = 3; // 重置倒计时
      
      this.timer = setInterval(() => {
        this.countdown--;
        
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.isCounting = false;
        }
      }, 1000);
    },
        handleRefreshClick() {
      if (this.isCounting) return;
      this.refreshCaptcha();
      this.startCountdown();
    },
        ...mapMutations(['setUserInfo']),
        login()
        {   
           
        
            this.$refs.loginFormRef.validate((valid)=>{
               
                
               if(!valid) return;
               console.log(this.seesionId);
               axios
            .post("http://localhost:1111/api/login",{
                account:this.form.account,
                password:this.form.password,
                sessionId:this.sessionId,
                code:this.captchaCode
            })
                .then((result) => {
                this.result=result.data;
                 if(this.result.code==1)
                 {
                   
                    //this.setUserInfo(this.result.data);
                    localStorage.setItem('User',JSON.stringify(this.result.data));
                    console.log(this.user); 
                    this.$message({
                    message: '登录成功',
                    type: 'success',
                    duration: 1500
                    });
                    //登录成功后得到后端返回的token,保存到客户端中的sessionStorage中
                    //登录成功后每一次请求都要查看token
                    //跳转页面
                    //alert(this.result.data.token);
                    this.$store.dispatch('initWebSocket') // 登录后建立连接
                    this.$router.push("/api/home")
                    
                 }
                 else
                 {
                    this.$message.error(result.data.msg);
                    this.captchaCode=''
                 }
                });
            });
        },
        refreshCaptcha() {
        this.sessionId = crypto.randomUUID();
      this.timestamp = Date.now();
      this.captchaImage = `http://localhost:1111/api/Imgcode?timestamp=${Date.now()}&sessionId=${this.sessionId}`;
      this.captchaCode = '';
    },
    
    },
    mounted() {
       
    this.refreshCaptcha();
  },
}
</script>
<style lang="less" scoped>
.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-container {
  position: relative;
  width: 120px;
  height: 40px;
  
  border-radius: 4px;
  overflow: hidden;
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 倒计时遮罩 */
.countdown-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 刷新提示 */
.refresh-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  text-align: center;
  font-size: 12px;
  padding: 2px 0;
}

.controller_ground
{     display: flex;
    height: 100vh;
    margin: 0;
    align-items: center;
    justify-content: center;
    position: relative; /* 确保视频和盒子可以相对定位 */
    overflow: hidden; /* 避免视频溢出 */
}
.controller_ground video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* 确保视频覆盖整个背景 */
    z-index: -1; /* 确保视频在盒子下方 */
}
.controller_box {
background-color: rgba(255, 255, 255, 0.4); 
  border-radius: 15px;
  padding: 20px;
  height: 300px;
  width: 600px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  position: relative;
  .login_img
  { height:130px;
    width:160px;
    padding: 5px;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-90%);
    img{
        width: 160px; /* 图片的宽度 */
        height: 160px; /* 图片的高度 */
        border-radius: 50%; /* 使图片变为圆形 */
        border: 5px solid white; /* 边框的样式和颜色 */
        object-fit: cover; /* 确保图片填充整个圆形 */
    }
  }
}
.button{
    display: flex;
    justify-content: center;
}
.login_form{
    position: absolute;
  width: 90%; /* 调整宽度为100% */
  padding: 0 150px; /* 适当调整内边距 */
  box-sizing: border-box;
  bottom: 20px; /* 添加一些底部内边距 */
    }
</style>