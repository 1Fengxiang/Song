<template>
 <el-container>
    <el-header>
    <el-menu
  :default-active="activeIndex2"
  class="el-menu-demo"
  mode="horizontal"
  @select="handleSelect"
  background-color="#545c64"
  text-color="#fff"
  active-text-color="#ffd04b">
  <span class="title_text" style="padding-right: 40px;">风闲</span>
  <router-link to="/api/home" class="del-decoration"><el-menu-item index="1" style="padding-right: 20px;">音乐中心</el-menu-item></router-link>
    <router-link :to="{ path: '/api/music', query: { id: data!=null?data.userId:0 } }" class="del-decoration">
      <el-menu-item index="2" style="padding-right: 20px;">我的音乐</el-menu-item>
    </router-link>
  <el-menu-item index="3" style="padding-right: 20px;">排行榜</el-menu-item>
  <router-link to="/api/cal"><el-menu-item index="4" style="padding-right: 30px;">我也不知道填啥</el-menu-item></router-link>
  <div class="autocomplete-container">
    <el-autocomplete 
      class="inline-input"
      v-model="Search"
      :fetch-suggestions="querySearch"
      placeholder="请输入内容"
      @select="handleSelect"
      @keydown.enter.native="FindSong"
      prefix-icon="el-icon-search"
    ></el-autocomplete>
  </div>
  <div class="login_div" >
    <el-dropdown v-if="isLoggedIn" @command="handleCommand">
  <div 
    class="avatar-wrapper"
    @mouseenter="handleAvatarHover"  
  >
    <img :src="data.headshot" alt="下拉菜单" class="img_home" style="cursor: pointer;" />
    <!-- 红点显示逻辑绑定 Vuex 状态 -->
    <span class="notification-dot" v-if="this.$store.state.haveAnymsg"></span>
  </div>
  
  <el-dropdown-menu slot="dropdown" style="width: 120px; text-align: center;">
    <el-dropdown-item icon="el-icon-user" command="Personalhome">我的主页</el-dropdown-item>
    <el-dropdown-item icon="el-icon-s-tools" command="Mymsg">我的消息</el-dropdown-item>
    <el-dropdown-item icon="el-icon-switch-button" command="logout">退出</el-dropdown-item>
  </el-dropdown-menu>
</el-dropdown>
    <el-link v-if="!isLoggedIn">
    <router-link to="/api/login" style="color: wheat;">登录</router-link> 
    </el-link>
   </div>
</el-menu>
  </el-header>
  <div class="page-container">
    <div class="container">
      <div class="notification-card">
        <div class="notification-header">
          <div class="notification-title">消息中心</div>
          <div v-if="unreadCount > 0" class="unread-count">{{ unreadCount }}未读</div>
        </div>
        
        <div class="filter-tabs">
          <div 
            class="filter-tab" 
            :class="{ 'active': activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            <span>全部消息</span>
          </div>
          <div 
            class="filter-tab" 
            :class="{ 'active': activeTab === 'replies' }"
            @click="activeTab = 'replies'"
          >
            <span>回复我的</span>
            <span v-if="unreadReplyCount > 0" class="badge">{{ unreadReplyCount }}</span>
          </div>
          <div 
            class="filter-tab" 
            :class="{ 'active': activeTab === 'likes' }"
            @click="activeTab = 'likes'"
          >
          
          </div>
        </div>
        
        <ul class="message-list">
          <li 
            v-for="message in this.messages" 
            :key="message.messageId"
            class="message-item"
            :class="{ 'unread': !message.messageIsread }"
            @click="markAsRead(message)"
          >
            <div v-if="!message.messageIsread" class="unread-dot"></div>
            
            <div class="message-content">
              <div v-if="message.messageAvatar" class="avatar-wrapper">
                <img :src="message.messageAvatar" alt="加载错误" class="avatar">
              </div>
              <div v-else class="avatar-placeholder">
                {{ message.messageSenderId }}
              </div>
              
              <div class="message-body">
                <div class="message-header">
                  <div class="sender-name" :class="{ 'you': message.isYou }">
                    {{ message.messageSenderId.split('-')[1] }}
                    <template v-if="message.isYou">(我)</template>
                  </div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
                
                <div class="message-text" v-html="message.messageSenderContent"></div>
                
                <div v-if="message.replyTo" class="reply-context">
                  <div class="sender-name" :class="{ 'you': message.replyTo.messageIsyou }">
                    {{ message.replyTo.messageReplyerId.split('-')[1] }}
                    <template v-if="message.replyTo.messageIsyou">(我)</template>
                  </div>
                  <div>{{ message.replyTo.messageReplyerContent }}</div>
                </div>
                
                <div class="message-actions">
                  <div class="action-btn" @click.stop="replyTo(message)">
                    <span>回复</span>
                  </div>
                  <div class="action-btn" @click.stop="deleteMessage(message)">
                    <span>删除</span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
        
        <div v-if="this.messages.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <div v-if="activeTab === 'all'">暂时没有消息哦～</div>
          <div v-else-if="activeTab === 'replies'">暂时没有人回复你～</div>
          <div v-else>没有点赞通知～</div>
        </div>
        
      </div>
    </div></div>
    
 </el-container>   
    
  </template>
  
  <script>
import axios from 'axios';
import { EventBus } from '@/eventBus';

  export default {
    name: 'MessageCenter',
    data() {
      return {
        commentShow:0,
        Nowcomment:{},
        replyShow:false,
        replytext:'',
        commentsIndex:[],
        comments: [
        
      ],
        showCommentDrawer: false, // 控制评论抽屉的显示
        commentText: '' ,// 存储评论文本
          musicId:'',
          music:[],
          isActive:false, // 初始状态为未激活
          songList:[],
          doms: {
        audio: null, // 确保你的页面中有一个ID为'audio'的元素
        ul:null, // 这行代码可以正确获取到ID为'ul'的<ul>元素
        divcontroller:null // 这行代码可以正确获取到ID为'divcontroller'的<div>元素
      },
          arr:"",
          countdown:'', //生日
          time: '00:00:00',  //时间
          formattedDate: '',   //日期
          dayOfWeek: '',          //星期
          audioSrc: "https://music.163.com/song/media/outer/url?id=2614442789.mp3", // 替换为你的音乐文件路
          isPlayerVisible: false,
           lyric:false,
            progress: 0,          // 当前进度
            duration: 0,           //总时长
            activeIndex2:"0",
            updateTimeInterval: null,
            showRedDotComments:false,
            showRedDotReply:false,
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
                },
            setSong:{
              volume: 0.3,
              isplay:true,
            },
            token: (JSON.parse(localStorage.getItem('User')) || {}).token || "", // 从session存储获取 token
            restaurants:[],
            Search:"",
            images: [
    "https://ts1.cn.mm.bing.net/th/id/R-C.edb769def1eb436f22013aa50eba7e99?rik=DjNNChFwZa%2b4Jw&riu=http%3a%2f%2fimgs.aixifan.com%2flive%2f1492411286714%2f1492411286714.jpg&ehk=uyAGT4cwL%2bnBqDlA4vYPZGpSBsorxsNbs%2bBWI0AwQk4%3d&risl=&pid=ImgRaw&r=0",
    "https://pic3.zhimg.com/v2-5fb13110e1de13d4c11e6e7f5b8026da_r.jpg",
    "https://pic3.zhimg.com/v2-8d6aaa767ec5f0dad922bb3cf11b3847_r.jpg?source=1940ef5c",
    "https://file.moyublog.com/d/file/2023-11-06/735dccebb572ac4dbab2fe1735f7e893.jpg"
    ],
        activeTab: 'replies',
        currentUser: {
          id: '123',
          name: '我',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        messages: []
      }
    },
    mounted(){
        this.data=JSON.parse(localStorage.getItem('User'));
        axios.get("http://192.168.3.226:1111/api/message",
        {
          params:{
            id:JSON.parse(localStorage.getItem('User')).userId,
          }
        }  
        ).then((res=>{
          // console.log(res.data.data);
          this.messages=res.data.data;
          this.updateMessageTimes(); // 页面加载时更新消息时间
          this.messages.sort((a, b) => new Date(b.messageTime) - new Date(a.messageTime));
          // console.log(this.messages.length);
          
        }));
    },
    created() {
      console.log("全局触发创建");
      
    EventBus.$on('new-message', this.handleNewMessage);
  },
  beforeDestroy() {
    EventBus.$off('new-message'); // 避免内存泄漏
  },
    computed: {
        isLoggedIn() {
      return !!this.token; // 判断是否存在 token
    },
      unreadCount() {
        return this.messages.filter(m => !m.messageIsread).length;
      },
      unreadReplyCount() {
        return this.messages.filter(m => !m.messageIsread && m.messageType === 'reply').length;
      },
      filteredMessages() {
        let msgs = [...this.messages];
        
        if (this.activeTab === 'replies') {
          msgs = msgs.filter(m => m.messageType === 'reply');
        } else if (this.activeTab === 'likes') {
          msgs = msgs.filter(m => m.messageType === 'like');
        }
        
        msgs.sort((a, b) => b.messageTime - a.messageTime);
        
        return msgs;
      }
    },
    methods: {
      handleNewMessage(data){
        console.log("全局消息:"+data);
        this.messages.push(JSON.parse(data));
        //  this.updateMessageTimes(); // 页面加载时更新消息时间
        //  this.messages.sort((a, b) => new Date(b.messageTime) - new Date(a.messageTime));
      },
      showNotification(msg) {
      // 在这里实现页面更新逻辑（如弹窗、跳转等）
      console.log(msg);
      
    },
      updateMessageTimes() {
      // 为每条消息添加时间差字段
      this.messages.forEach(message => {
        message.time = this.formatTimeDifference(message.messageTime);
      });
    },
      formatTimeDifference(messageTime) {
      // 获取当前时间和消息时间的差异
      const currentTime = new Date();
      const messageDate = new Date(messageTime);
      const diffInMs = currentTime - messageDate; // 时间差（毫秒）

      const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); // 转换为分钟
      const diffInHours = Math.floor(diffInMinutes / 60); // 转换为小时
      const diffInDays = Math.floor(diffInHours / 24); // 转换为天数

      if (diffInDays > 0) {
        return `${diffInDays}天前`;
      } else if (diffInHours > 0) {
        return `${diffInHours}小时前`;
      } else if (diffInMinutes > 0) {
        return `${diffInMinutes}分钟前`;
      } else {
        return '刚刚';
      }
    },
      handleAvatarHover(){
        this.$store.state.haveAnymsg=false
      },
        handleCommand(command){
        if(command==='logout')
        {
          localStorage.removeItem('User');
           this.$router.push('/api/login');
           this.$message({
          message: '你已退出登录',
          type: 'success',
          duration:1500
        });
        }
        if(command==='Personalhome')
          this.$router.push({ path: '/api/Personalhome', query: { id: this.data.userId } });
          if(command==='Mymsg')
          this.$router.push('/api/msg');
      },
        handleSelect(item){
           console.log(item);
           this.activeIndex2=item;
        },
        querySearch(queryString, cb) {
        var restaurants = this.restaurants;
        var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      markAsRead(message) {
        if (!message.messageIsread) {
          message.messageIsread = true;
          console.log(message.messageId);
          
          axios.put("http://192.168.3.226:1111/api/updataRead",{
            messageId:message.messageId
          },{
             headers: {
        'token': JSON.parse(localStorage.getItem('User')).token// 在请求头中加入 token
    }
          }
           
         );
      }
      },
      replyTo(message) {
        this.$message({
          type: 'info',
          message: `回复给: ${message.sender}\n原内容: ${message.replyTo.content}`
        });
      },
      deleteMessage(message) {
       
        
        this.$confirm('确定删除这条消息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.messages = this.messages.filter(m => m.messageId !== message.messageId);
        axios.delete("http://192.168.3.226:1111/api/delMessage",{
          data: {
        messageId: message.messageId, 
      },headers: {
        'token': JSON.parse(localStorage.getItem('User')).token// 在请求头中加入 token
    }
     });
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }
    }
  }
  </script>
  
  <style scoped>
  .notification-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  background-color: red;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 1.5s infinite; /* 可选：添加呼吸动画 */
}
/* 呼吸动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    
  }
  .page-container {
   
  min-height: 100vh;  /* 至少占满整个视口高度 */
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  padding: 20px;           /* 添加内边距防止贴边 */
  background-image: linear-gradient(120deg, #fdfbfb 0%, #fce4e4 100%);
}
/* 修改原有的body和container样式 */
body {
    
  margin: 0;
  padding: 0;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
.container {
    
  max-width: 800px;
  width: 100%;
  animation: fadeIn 0.6s ease;
  /* 移除body中原来的flex设置，移动到了page-container */
}

  .notification-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(255, 180, 180, 0.15);
    overflow: hidden;
    border: 1px solid #ffeaea;
  }
  .notification-header {
    background-color: #ffefef;
    padding: 16px 20px;
    border-bottom: 1px solid #ffdada;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .notification-title {
    font-size: 20px;
    font-weight: 500;
    color: #ff7875;
  }
  .unread-count {
    background-color: #ff7875;
    color: white;
    border-radius: 12px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
  }
  .filter-tabs {
    display: flex;
    border-bottom: 1px solid #ffeaea;
    padding: 0 20px;
    background-color: #fffafa;
  }
  .filter-tab {
    padding: 12px 16px;
    font-size: 14px;
    color: #888;
    cursor: pointer;
    position: relative;
    margin-right: 8px;
    transition: all 0.3s ease;
  }
  .filter-tab:hover {
    color: #ff7875;
  }
  .filter-tab.active {
    color: #ff7875;
    font-weight: 500;
  }
  .filter-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #ff7875;
    border-radius: 2px 2px 0 0;
  }
  .filter-tab .badge {
    margin-left: 4px;
    background-color: #ff7875;
    color: white;
    border-radius: 10px;
    padding: 0 6px;
    font-size: 12px;
  }
  .message-list {
    
    padding: 0;
    margin: 0;
    list-style-type: none;
  }
  .message-item {
    
    padding: 16px 20px;
    border-bottom: 1px solid #ffeeee;
    transition: all 0.3s ease;
    position: relative;
    background: #fff;
  }
  .message-item:last-child {
    border-bottom: none;
  }
  .message-item:hover {
    background-color: #fff8f8;
    transform: translateX(4px);
  }
  .message-item.unread {
    background-color: #fff5f5;
  }
  .message-content {
    display: flex;
  }
  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
    border: 2px solid #ffdada;
  }
  .avatar-placeholder {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    margin-right: 12px;
    background-color: #ffeaea;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffa8a8;
    font-weight: bold;
    font-size: 18px;
    border: 2px solid #ffdada;
  }
  .message-body {
    flex: 1;
  }
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .sender-name {
    font-weight: 500;
    font-size: 15px;
    color: #555;
  }
  .sender-name.you {
    color: #ff7875;
  }
  .message-time {
    font-size: 12px;
    color: #aaa;
  }
  .message-text {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 8px;
    color: #666;
  }
  .reply-context {
    background-color: #fff5f5;
    border-radius: 6px;
    padding: 8px 12px;
    margin-top: 8px;
    font-size: 13px;
    color: #888;
    border-left: 3px solid #ffcccc;
  }
  .reply-context .sender-name {
    font-size: 13px;
    color: #888;
  }
  .message-actions {
    display: flex;
    gap: 16px;
    margin-top: 8px;
  }
  .action-btn {
    font-size: 13px;
    color: #bbb;
    cursor: pointer;
    transition: all 0.2s;
  }
  .action-btn:hover {
    color: #ff7875;
    transform: scale(1.05);
  }
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #aaa;
  }
  .empty-icon {
    font-size: 50px;
    margin-bottom: 15px;
    color: #ffd6d6;
    animation: pulse 2s infinite;
  }
  .unread-dot {
    position: absolute;
    left: 8px;
    top: 20px;
    width: 8px;
    height: 8px;
    background-color: #ff7875;
    border-radius: 50%;
    animation: blink 1.5s infinite;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }















  .title_text{
  text-align: center; /* 文字居中 */
    padding: 20px; /* 内边距，可以根据需要调整 */
    font-size: 16px; /* 字体大小，可以根据需要调整 */
    text-align: center; /* 文字居中 */
    padding: 20px; /* 内边距 */
    font-size: 24px; /* 字体大小，增大以突出 */
    color: white; /* 字体颜色 */
    font-weight: bold; /* 加粗字体 */
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 添加阴影效果，增强可读性 */
}

.del-decoration{
    text-decoration: none; /* 去掉下划线 */
}
.login_div{
    padding: 0 40px;;
    display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  perspective: 1000px; /* 添加透视效果 */
}
.inline-input {
  width: 300px; /* 设置输入框宽度 */
}
.autocomplete-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.no-margin {
  margin: 0; /* 去掉边距 */
  padding: 0; /* 去掉内边距 */
}
.carousel {
  width: 1000px; /* 设置固定宽度 */
  height: 300px; /* 设置固定高度 */
  margin: 0 auto; /* 居中显示 */
   overflow: hidden; /* 防止内容溢出 */
}
.carousel-image {
    width: 100%; /* 宽度占满容器 */
  height: 100%; /* 高度占满容器 */
  object-fit: cover; /* 保持比例，填满容器 */
  display: block; /* 去掉图片下方的空隙 */
}
.el-menu-demo {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.el-menu-demo .el-menu-item {
  text-align: center; /* 文字居中 */ 
}
.img_home{
    border-radius: 50%; /* 使图片变为圆形 */
    width: 68px; /* 图片的宽度 */
    height: 65px; /* 图片的高度 */
    padding: 5px;
    transition: transform 0.3s ease; /* 动画过渡效果 */
}
.login_div:hover .img_home {
  transform: scale(1.2)/* 放大和旋转 */
}
.el-header {
  margin: 0; /* 去除边距 */
  padding: 0; /* 去除内边距 */
  width: 100%; /* 确保宽度为100% */
}
.dark {
  background-color: #faf0e6; /* 更淡的米色 */
  color: white;
}
  </style>
  