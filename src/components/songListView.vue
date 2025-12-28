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
<span class="title_text">风闲</span>
  <router-link :to="{path:'/api/home'}" class="del-decoration"><el-menu-item index="1">音乐中心</el-menu-item></router-link>
    <router-link :to="{ path: '/api/music', query: { id: data!=null?data.userId:0 } }" class="del-decoration">
      <el-menu-item index="2" >我的音乐</el-menu-item>
    </router-link>
   <router-link :to="{path:'/api/ranking'}" class="del-decoration"><el-menu-item index="3" >排行榜</el-menu-item></router-link>
  <router-link :to="{path:'/api/upload'}" class="del-decoration"><el-menu-item index="4"  >上传音乐</el-menu-item></router-link>
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
  
  <el-dropdown-menu slot="dropdown">
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
<el-main class="dark">



<div class="container">
<div class="footer-box">
  <!-- 主界面的内容 -->
   
  <div class="Listcontainer">
  
    <img :src="songList.listImg" alt="无法显示" class="songListImg">
 
  <div class="text-container">
    <div class="spans-container">
      
      <h1 class="title">{{songList.listTitle}}</h1>
      <span style="font-size: 15px; color: blue;">风闲<span style="padding-left: 100px; color: gray;">{{songList.listTime}}创建</span></span>
      <div>
        <a> 
          <button  class="playcollection-button"  @click="playSong(newSong[0].songFilepath,0)">播放全部</button>
          <button v-if="this.data" :class="Iscollection==1?'scollection-button':'collection-button'"   @click="ChangeCollection ">{{Iscollection == 0 ? '收藏' : '已收藏'}}</button>
        </a>
       
      </div>
     
      <div style="font-size: 15px; color: gray;">标签:
         <a v-for="item in songList.listType" :key="item">
          <button class="round-button" >{{item}}</button>        
         </a> 
      </div>
      <span style="font-size: 13px; color: gray;">介绍:{{songList.listDetails}}</span>
    </div>
  </div>
  </div>
   
   

  <i class="el-icon-headset" style="margin: 50px 0px 0px 30px; color: black;">歌曲列表<span style="margin-left: 30px; font-size: 15px; color: gray;">{{total}}首</span></i>
  <hr style="border: none; border-top: 3px solid red; width: 98%; margin: 20px auto; display: block;">
  <el-table
   v-loading="loading"
     :data="paginatedData"
    style="width: 100%;" >
    <el-table-column
      type="index"
       :index="GetIndex"
      >
      
    </el-table-column>
    <el-table-column
      label="歌曲"
      width="210"
      >
      <template slot-scope="scope">
      <i class="el-icon-video-play icon-button" style="font-size: 25px;" @click="playSong(scope.row.songFilepath,scope.$index+(currentPage-1)*pageSize)"></i>
      <span style="margin-left: 10px">{{ scope.row.songName }}</span>
    </template>
    </el-table-column>
    <el-table-column
      label="时长"
      width="200" >
      <template slot-scope="scope" >
    
        <span style="font-size: 15px; color: gray">{{ scope.row.songTime || '加载中...' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="歌手">
      <template slot-scope="scope">
        <span style="margin-left: 10px">{{ scope.row.songSinger}}</span>
      </template>
    </el-table-column>
    <el-table-column label="喜欢" width="100">
    <template slot-scope="scope">
      <div >
        <a
          class="heart"
          :class="{ active: getActive(scope.row.songId) }"
          @click="toggleHeart(scope.row.songId)">
          &#9829;
        </a>
      </div>
    </template>
    </el-table-column>
  </el-table>

    <div>
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage"
      :page-size="pageSize"
      layout=" prev, pager, next"
      :total="total"
      style="margin:50px 0px 0px 350px;"
      class="custom-large-pagination"
      >
    </el-pagination>
    </div>

</div>
</div>


  




  <div class="player" :class="{ visible: isPlayerVisible }" @mouseenter="showPlayer" @mouseleave="hidePlayer">
    <audio ref="audio" :src="audioSrc" preload="auto" @loadedmetadata="setDuration" @timeupdate="updateProgress"  id="audio"></audio>
  <div class="controls">
    <i class="el-icon-caret-left icon-button"  @click="switchSongs(-1)"></i>
    <i @click="play" class="el-icon-video-play icon-button" v-if="this.$store.state.isplay" ></i>
    <i @click="pause" v-if="!this.$store.state.isplay" class="el-icon-video-pause icon-button" ></i>
    <i class="el-icon-caret-right icon-button" @click="switchSongs(1)" style="margin-right: 40px;"></i>
    <img  @click="lyc" :src=" this.$store.state.img" alt="歌曲图片"  class="personal_img" style="cursor: pointer; "  v-if="this.$store.state.isShow"  />
    <label for="progress" class="progress-label" v-if="this.$store.state.isShow">{{this.$store.state.title}}</label>
    <div
      class="heart"
      :class="{ active:getActive(musicId) }"
      @click="toggleHeart(musicId)"
    >
      &#9829;
    </div>
     <input type="range" 
       v-model="progress" 
       min="0" 
       :max="duration" 
       @input="changeCurrentTime" 
       class="progress-slider">     
<span class="time-display">{{ formatTime(progress) }} / {{ formatTime(duration) }}</span>
<i class="el-icon-headset" style="color:black ; font-size: 20px;"></i>
<input type="range" 
       v-model="setSong.volume" 
       min="0" 
       max="1" 
       step="0.01" 
       @input="changeVolume" 
       class="volume-slider">
       <i style="" 
        class="icon-button play-mode-btn" 
        :class="getPlayModeIcon()" 
        @click="togglePlayMode"
        :title="getPlayModeTitle()"
      ></i>
  </div>
</div>


<transition name="slide">
    <div v-show="lyric" class="drawer">
      <div class="header">
        <a @click="closeDrawer" class="el-icon-close" style="font-size: 25px;"></a>
      </div> 
      <div class="song_lyric">
            <div class="song-container">
              <img :src="this.$store.state.img" alt="图片" class="lyricImg">
              
            </div>
            <div  class="lyric-container">
              <span style="margin-top: 100px; margin-left: 160px; font-size: 30px;">{{this.$store.state.title}}</span>
              <span style="margin-top: 10px; margin-left: 160px; font-size: 20px;">歌手:{{this.$store.state.songs[this.$store.state.palySongindex].songSinger}}</span>
              <span style="margin-top: 10px; margin-left: 150px; font-size: 20px;"> <button size="small" @click="openCommentDrawer" >评论</button></span>
             
             
            <div class="lyricScroll">
                <div class="controller" id="divcontroller">
                  <li class="active" v-if="this.arr.length==1" style="margin-left: 100px">纯音乐，请欣赏</li>
                    <ul id="ul">
                    </ul>
                </div>
              </div>
        </div>
      </div>
    </div>
  </transition>


  <transition name="slider">
  
      <div v-if="showCommentDrawer" class="comment-drawer">
        <div class="comment-header">
          <a @click="closeCommentDrawer" class="el-icon-close" style="font-size: 25px;"></a>
        </div>
        <div style="margin-left: 270px;">
          <span style="font-size: 20px; color: white;">评论列表</span>
        </div>
        <div class="text_box" ref="commentBox" >
         
          <div style="margin: 20px 0px; width: 100%;"  >
            <el-empty description="快来写下您的第一条评论"  v-if="!comments.length"></el-empty>
            <div style=" padding: 10px 0px; display: flex;" v-for="(comment,index) in comments" :key="index">
             <div style="width: 60px;"><el-avatar :size="50" :src="comment.commHeadShot"></el-avatar></div>
              <div style="flex: 1;">
                <div style="font-size: 15px; color: rgb(63,124,189) ;  cursor: pointer;">{{comment.commUserName}}</div>
                <div style="margin-top: 10px; margin-left: 10px;">{{comment.commDetails}}</div>
                <div style="margin-top: 14px; color: gray; font-size: 15px;">{{comment.commTime.split('T')[0]}}</div>
                <div style=" color: rgb(63,124,189) ;    text-align: right ; padding: 0px 20px 0px 0px" >
                  <span @click="reply(comment)" style="cursor: pointer;">回复</span>
                </div>
                <div style="margin: 0px 100px; font-size: 14px; color: gray;  "   v-if="comment.children.length" v-show="!commentsIndex.includes(index)" ><span @click="AddCommentsIndex(index)" style="cursor: pointer;">展开更多回复</span></div>
                <div style="margin: 0px 100px; font-size: 14px; color: gray;  cursor: pointer;" @click="AddCommentsIndex(index)"  v-if="commentsIndex.includes(index)">收起回复</div>
                <div v-if="commentsIndex.includes(index)">
                    <div style=" padding: 10px 0px; display: flex;"   v-for="(child,Cindex) in comment.children" :key="Cindex" >
                    
                      <div style="width: 40px; margin-left: 90px;"><el-avatar :size="40" :src="child.commHeadShot"></el-avatar></div>
                        
                      <div style="flex: 1;">
                        <div style="font-size: 15px ; margin-left: 10px;"> {{child.commUserName}}</div>
                        <div style="font-size: 15px ; margin: 10px 10px;"> <span style="color: rgb(63,124,189);">回复了@ {{child.commReplyName}}</span> : {{child.commDetails}}</div>
                        <div style="margin-top: 15px; color: gray; font-size: 12px;">{{comment.commTime.split('T')[0]}}</div>
                       <div style=" color: rgb(63,124,189) ;    text-align: right ; padding: 0px 20px 0px 0px" >
                          <span @click="reply(child)" style="cursor: pointer; font-size: 14px;">回复</span>
                            </div>

                     </div>
                      </div>
                  </div>
               
                <div style="margin: 5px 0px; border-bottom:1px solid #ccc ; padding: 10px 0px; width: 100%;"></div>
              </div> 
           
                      <el-dialog
          
            :visible.sync="replyShow"
            :modal="false"
            custom-class="custom-dialog"
            style="text-align: center ;"
            >
            <span style="font-size: 20px;">回复评论</span>
            <el-form>
              <el-form-item  >
                <el-input
                  v-model="replytext"
                  type="textarea"
                  :rows="4"              
                  :maxlength="140"         
                  autocomplete="off"
                  
                  :placeholder="'回复 : @'+Nowcomment.commUserName" 
                >
                </el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="replySend">确 定</el-button>
            </div>
            </el-dialog>                                                           
            </div>
          </div>
         
       </div>
<div class="comment-content">
  <input 
    type="text" 
    placeholder="请输入评论..." 
    v-model="commentText" 
    @keyup.enter="submitComment" 
    class="comment-input"
    :maxlength="140"
  />
  <button @click="submitComment" class="submit-btn">发送</button>
</div>
        
      </div>
      
    </transition>

</el-main>
<el-footer class="footer">
  欢迎来到风闲的世界
</el-footer>
</el-container>
</template>
<script >
import { EventBus } from '@/eventBus';
import axios from 'axios';
import _ from 'lodash';




export default {
  
  data() {
      return {
        playMode: 1,
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
        loading: true,
        newSong:[],
        SongDurations:{},
        total:0,
        currentPage:1,
        pageSize:11,
        Iscollection:0,
        songList:{   
        },
        doms: {
      audio: null, // 确保你的页面中有一个ID为'audio'的元素
      ul:null, // 这行代码可以正确获取到ID为'ul'的<ul>元素
      divcontroller:null // 这行代码可以正确获取到ID为'divcontroller'的<div>元素
    },
        arr:"",
        audioSrc: "", // 替换为你的音乐文件路
        isPlayerVisible: false,
         lyric:false,
          progress: 0,          // 当前进度
          duration: 0,           //总时长
          activeIndex2:"1",
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
        
      };
},

  methods:{ 
     getPlayModeIcon() {
      switch (this.playMode) {
        case 0: return 'el-icon-refresh'; // 单曲循环
        case 1: return 'el-icon-sort';    // 顺序播放
        case 2: return 'el-icon-s-operation';    // 随机播放
        default: return 'el-icon-sort';
      }
    },
       togglePlayMode() {
      // 循环切换播放模式：顺序 → 随机 → 单曲
      this.playMode = (this.playMode + 1) % 3;
      this.saveToLocalStorage();
      
      
    },
     getPlayModeTitle() {
      switch (this.playMode) {
        case 0: return '单曲循环';
        case 1: return '顺序播放';
        case 2: return '随机播放';
        default: return '顺序播放';
      }
    },
    handleAvatarHover(){
        this.$store.state.haveAnymsg=false
      },
    replySend()
    { 
      const user=JSON.parse(localStorage.getItem('User'));
      if(user==null)
       {
        this.$message({
          showClose: true,
          message: '请先登录',
          type: 'warning'
        });
       }
       else
       {
        this.replyShow=false;
      axios.post("http://localhost:1111/api/comment",{
        commDetails:this.replytext,
          commUserid:this.data.userId,
          commType:1, 
          commTargetid:JSON.parse(localStorage.getItem('Nowsong')).songId,
          commFather:this.Nowcomment.commFather?this.Nowcomment.commFather:this.Nowcomment.commId,
          commReplyid:this.Nowcomment.commUserid,
      },{
        
    headers: {
        'token': user.token // 在请求头中加入 token
    }
      }
    ).then((res)=>{
        this.loadComment();
        console.log(res.data);
      }).catch((error=>{
       
       if(error.response.status===401)
     {
       
      this.$router.push('/api/login');
       this.$message({
         showClose: true,
         message: '登录信息已过期，请重新登录',
         type: 'error'
       });
       localStorage.removeItem('User');
     }
       
     })); this.replytext='';
      }      
    },
    reply(Nowcomment){
      this.Nowcomment=Nowcomment;      
      this.replyShow=true;
    },
    AddCommentsIndex(index){  
      if(this.commentsIndex.includes(index))
      this.commentsIndex = this.commentsIndex.filter(item => item !== index);
      else
     this.commentsIndex.push(index);

     
     
    },
    loadComment()
    {
      axios.get("http://localhost:1111/api/comments",
        {
          params:{
            id:JSON.parse(localStorage.getItem('Nowsong')).songId,
          }
        }
      ).then((res)=>
    {
      this.comments=res.data.data;
      if(this.commentShow==1)
    { this.commentShow=0;
      this.scrollToBottom();  // 自动滚动到底部 
    }

    });
    },
    openCommentDrawer() {
     this.loadComment();
      this.showCommentDrawer = true; // 显示评论抽屉
      console.log("点击评论");
      
    },
    closeCommentDrawer() {
      this.showCommentDrawer = false; // 隐藏评论抽屉
    },
    submitComment() {
      if (this.commentText.trim()) {
        //this.comments.push(this.commentText);  // 添加评论
        const user=JSON.parse(localStorage.getItem('User'));
        
        
      if(user==null)
       {
        this.$message({
          showClose: true,
          message: '请先登录',
          type: 'warning'
        }); 
       }
       else
       {
        axios.post("http://localhost:1111/api/comment",{
          commDetails:this.commentText,
          commUserid:this.data.userId,
          commType:1, 
          commTargetid:JSON.parse(localStorage.getItem('Nowsong')).songId
        },{
          headers:{
            "token":user.token
          }
        }).then((res)=>
      {
        console.log(res.data);
        
        this.commentShow=1;
        this.loadComment();
     
       
        this.commentText = '';  // 清空评论框
      }).catch((error=>{
       
        if(error.response.status===401)
      {
        
        this.$router.push('/api/login');
        this.$message({
          showClose: true,
          message: '登录信息已过期，请重新登录',
          type: 'error'
        });
        localStorage.removeItem('User');
      }
        
      }));
       }
      }
     
    },
    scrollToBottom() {
      // 确保内容滚动到最底部
      this.$nextTick(() => {
        const commentBox = this.$refs.commentBox;
        commentBox.scrollTop = commentBox.scrollHeight;
      });
    },

 


  
    toggleHeart: _.throttle(async function(songId) {
   
      
      if(this.data)
      {
        if(!this.music.includes(songId))
   {this.$message('已添加我喜欢的音乐');
     this.music.push(songId);
     axios.put("http://localhost:1111/api/addmusic",{
        userId:this.data.userId,
        songId:songId 
     });
   }
  else
  {
   this.$message('已取消收藏');
   this.music = this.music.filter(song => song !== songId); 
   axios.delete("http://localhost:1111/api/delmusic",{
    data: {
        userId: this.data.userId,
        songId: songId
    }
     });
  }
      }
      else
      {
        this.$message({
          message: '请先登录',
          type: 'warning'
        });
      }

  
// 请求处理代码
}, 2000), // 每2秒只能触发一次
  getActive(songId)
   {   
      for(let i=0;i<this.music.length;i++)
         {
          if(songId==this.music[i])
             return true;
         }
         return false;
   },
    GetIndex(index)
    {
      return index+(this.currentPage-1)*this.pageSize+1;
    },
    getAudioDurations() {
    console.log(this.songList.songs);
    
    const promises = this.songList.songs.map(song => {
  return new Promise((resolve, reject) => {  
    const audio = new Audio(song.songFilepath); // 创建音频元素
    audio.addEventListener('loadedmetadata', () => {
      this.SongDurations[song.songId] = this.formatDuration(audio.duration); // 获取并格式化音频时长
      resolve(); // 通知这个音频已经加载完成
    });
    
    
    audio.addEventListener('error', reject);  // 监听加载错误
    audio.load(); // 加载音频文件
   
  });
});

  // 等待所有音频都加载完成
  Promise.all(promises).then(() => {
    //console.log(this.SongDurations); // 所有时长加载完成后打印
    this.newSong=this.formattedSongs;
    //console.log(this.newSong);
    this.loading = false; // 开始加载数据
    //console.log("下面开始是全局变量了"); 
    this.$store.commit('setSongs',this.newSong);
    this.$store.state.palySongindex=0;
    //console.log(this.$store.state.songs);
    
  }).catch((error=>{
    console.log(error);
    console.log("出错了");
  }));
},
    formatDuration(duration) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
   
    handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(page) {
      this.currentPage = page;
    },
    ChangeCollection()
    {
      this.Iscollection=this.Iscollection==0?1:0; //1是收藏 0是未收藏
      //console.log(this.Iscollection);
      if(this.Iscollection==1)
    {
      axios.post("http://localhost:1111/api/collect",
       {
         userId:this.data.userId,
         listId:this.songList.listId
       }); 
    }
     else
     {
        axios.delete("http://localhost:1111/api/delcollect",{
          data:{
          userId:this.data.userId,
          listId:this.songList.listId
        }
      });
     }       
    },
     setOffset(){
      
      // 容器高度
  var containerHeight = this.doms.divcontroller.clientHeight;
// li高度
  var liHeight = this.doms.ul.children[0].clientHeight+20;
// 最大高度
  var maxOffset =this.doms.ul.clientHeight - containerHeight;
  let index = this.findIndex();
  var offset = liHeight * index + liHeight/2 - containerHeight/2;

  
  if(offset < 0){
      offset = 0;
  }
  if(offset > maxOffset){
      offset = maxOffset;
  }
  this.doms.ul.style.transform = `translateY(-${offset}px)`;

  // 去掉之前的active样式
  let li1 = this.doms.ul.querySelector('.active');
  if(li1){
      li1.classList.remove('active');
  }
 
  let li2 = this.doms.ul.children[index];
  if(li2){
      
      li2.classList.add('active');
    
      
  }
},
     createLrcElement(){
     
      
      this.doms.ul.innerHTML = '';
  for(let i=0; i<this.arr.length; i++){
      let li = document.createElement('li');
      li.textContent = this.arr[i].lyricContent;
      this.doms.ul.appendChild(li);
    }
  },
    findIndex(){
  // 获取播放器的当前时间
  
  let curTime = this.$parent.$refs.MusicPlay.currentTime*1000;
  for(let i = 0; i<this.arr.length; i++){
    //console.log(curTime+"----------"+this.arr[i].time);
    
      if(curTime<this.arr[i].time){
        //console.log(i+"这是歌词");
          
          return i-1;
      }
  }
  // 如果没有任何一句歌词显示，则返回-1
  // 如果找遍了都没有找到，说明播放到最后一句
  return this.arr.length-1;
    },
    playNext(){ //播放完后自动播放下一首
    
      this.switchSongs(1);
    },
    getLyric(text)  //歌词的处理
    {
      this.arr=null;
       const lrc=text.split('\\n');
       const ref=/\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
       let finalLyric = [];
      for(const item of lrc)
        {
        const timeArr = item.match(ref);
         if (!timeArr) continue
         const min = timeArr[1] * 60 * 1000;
         const second = timeArr[2] * 1000;
         const minSecond = timeArr[3].length === 3 ? timeArr[3] * 1 : timeArr[3] * 10;
         const time = min + second + minSecond
         const lyricContent = item.replace(ref, "").trim();
         finalLyric.push({ time, lyricContent })
         
        }
        if(finalLyric.length==0)
        { const time=1000;
           const lyricContent="";
          finalLyric.push({ time, lyricContent });
        }
        else
        {
          let time=finalLyric[finalLyric.length-1].time+6000000;
        let lyricContent="";
        for(let i=0;i<4;i++)
        {
          time=time+i+1;
          finalLyric.push({ time, lyricContent});
          
        }
        }
        this.$store.state.finalLyric=finalLyric;
        this.arr=finalLyric;
      
       //console.log(this.arr);
        
    }, 
    closeDrawer(){  
      this.lyric=false;
    },
     lyc()  //点击播放图片后展示歌词
     {
       this.lyric=!this.lyric;
       this.getLyric(this.$store.state.lyc);
       this.createLrcElement();
     },
    switchSongs(num)//切歌
    {
     
      this.$store.state.palySongindex=this.$store.state.palySongindex+num;
      if(this.$store.state.palySongindex>=this.$store.state.songs.length)
         {  this.$store.state.palySongindex=0;
           this.playSong(this.$store.state.songs[this.$store.state.palySongindex].songFilepath,this.$store.state.palySongindex);
           this.getLyric(this.$store.state.songs[0].songLyc);
           this.createLrcElement();
         } 
      else
      {
        if( this.$store.state.palySongindex<0)
        {
          this.$store.state.palySongindex=this.$store.state.songs.length-1;
        this.playSong(this.$store.state.songs[ this.$store.state.palySongindex].songFilepath, this.$store.state.palySongindex);
          this.getLyric(this.$store.state.songs[this.$store.state.songs.length-1].songLyc);
          this.createLrcElement();
        }
        else
        {
          this.playSong(this.$store.state.songs[ this.$store.state.palySongindex].songFilepath, this.$store.state.palySongindex);
          this.getLyric(this.$store.state.songs[this.$store.state.palySongindex].songLyc);
          this.createLrcElement();
        }
      }
      

    },
    
    playSong(song,index){ 
      
      
      EventBus.$emit('changeSong',song); // 触发事件，传递新歌曲
      this.$store.state.palySongindex=index;
      this.$store.state.isplay=false;
      this.$store.state.img=this.$store.state.songs[index].songImg;
        this.$store.state.title=this.$store.state.songs[index].songName;
        this.$store.state.lyc=this.$store.state.songs[index].songLyc;
        localStorage.setItem('Nowsong',JSON.stringify(this.$store.state.songs[index]));
        this.musicId=JSON.parse(localStorage.getItem('Nowsong')).songId; 
    },
    updateSong(totalTime)
    {
      this.duration=totalTime;
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
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    loadAll() {
      return [
        { "value": "三全鲜食（北新泾店）", "address": "长宁区新渔路144号" },
        { "value": "Hot honey 首尔炸鸡（仙霞路）", "address": "上海市长宁区淞虹路661号" },
        { "value": "新旺角茶餐厅", "address": "上海市普陀区真北路988号创邑金沙谷6号楼113" },
        { "value": "泷千家(天山西路店)", "address": "天山西路438号" },
        { "value": "胖仙女纸杯蛋糕（上海凌空店）", "address": "上海市长宁区金钟路968号1幢18号楼一层商铺18-101" },
        { "value": "贡茶", "address": "上海市长宁区金钟路633号" },
        { "value": "豪大大香鸡排超级奶爸", "address": "上海市嘉定区曹安公路曹安路1685号" },
        { "value": "茶芝兰（奶茶，手抓饼）", "address": "上海市普陀区同普路1435号" },
        { "value": "十二泷町", "address": "上海市北翟路1444弄81号B幢-107" },
        { "value": "星移浓缩咖啡", "address": "上海市嘉定区新郁路817号" },
        { "value": "阿姨奶茶/豪大大", "address": "嘉定区曹安路1611号" },
        { "value": "新麦甜四季甜品炸鸡", "address": "嘉定区曹安公路2383弄55号" },
        { "value": "Monica摩托主题咖啡店", "address": "嘉定区江桥镇曹安公路2409号1F，2383弄62号1F" },
        { "value": "浮生若茶（凌空soho店）", "address": "上海长宁区金钟路968号9号楼地下一层" },
        { "value": "NONO JUICE  鲜榨果汁", "address": "上海市长宁区天山西路119号" },
        { "value": "CoCo都可(北新泾店）", "address": "上海市长宁区仙霞西路" },
        { "value": "快乐柠檬（神州智慧店）", "address": "上海市长宁区天山西路567号1层R117号店铺" },
        { "value": "Merci Paul cafe", "address": "上海市普陀区光复西路丹巴路28弄6号楼819" },
        { "value": "猫山王（西郊百联店）", "address": "上海市长宁区仙霞西路88号第一层G05-F01-1-306" },
        { "value": "枪会山", "address": "上海市普陀区棕榈路" },
        { "value": "纵食", "address": "元丰天山花园(东门) 双流路267号" },
        { "value": "钱记", "address": "上海市长宁区天山西路" },
        { "value": "壹杯加", "address": "上海市长宁区通协路" },
        { "value": "唦哇嘀咖", "address": "上海市长宁区新泾镇金钟路999号2幢（B幢）第01层第1-02A单元" },
        { "value": "爱茜茜里(西郊百联)", "address": "长宁区仙霞西路88号1305室" },
        { "value": "爱茜茜里(近铁广场)", "address": "上海市普陀区真北路818号近铁城市广场北区地下二楼N-B2-O2-C商铺" },
        { "value": "鲜果榨汁（金沙江路和美广店）", "address": "普陀区金沙江路2239号金沙和美广场B1-10-6" },
        { "value": "开心丽果（缤谷店）", "address": "上海市长宁区威宁路天山路341号" },
        { "value": "超级鸡车（丰庄路店）", "address": "上海市嘉定区丰庄路240号" },
        { "value": "妙生活果园（北新泾店）", "address": "长宁区新渔路144号" },
        { "value": "香宜度麻辣香锅", "address": "长宁区淞虹路148号" },
        { "value": "凡仔汉堡（老真北路店）", "address": "上海市普陀区老真北路160号" },
        { "value": "港式小铺", "address": "上海市长宁区金钟路968号15楼15-105室" },
        { "value": "蜀香源麻辣香锅（剑河路店）", "address": "剑河路443-1" },
        { "value": "北京饺子馆", "address": "长宁区北新泾街道天山西路490-1号" },
        { "value": "饭典*新简餐（凌空SOHO店）", "address": "上海市长宁区金钟路968号9号楼地下一层9-83室" },
        { "value": "焦耳·川式快餐（金钟路店）", "address": "上海市金钟路633号地下一层甲部" },
        { "value": "动力鸡车", "address": "长宁区仙霞西路299弄3号101B" },
        { "value": "浏阳蒸菜", "address": "天山西路430号" },
        { "value": "四海游龙（天山西路店）", "address": "上海市长宁区天山西路" },
        { "value": "樱花食堂（凌空店）", "address": "上海市长宁区金钟路968号15楼15-105室" },
        { "value": "壹分米客家传统调制米粉(天山店)", "address": "天山西路428号" },
        { "value": "福荣祥烧腊（平溪路店）", "address": "上海市长宁区协和路福泉路255弄57-73号" },
        { "value": "速记黄焖鸡米饭", "address": "上海市长宁区北新泾街道金钟路180号1层01号摊位" },
        { "value": "红辣椒麻辣烫", "address": "上海市长宁区天山西路492号" },
        { "value": "(小杨生煎)西郊百联餐厅", "address": "长宁区仙霞西路88号百联2楼" },
        { "value": "阳阳麻辣烫", "address": "天山西路389号" },
        { "value": "南拳妈妈龙虾盖浇饭", "address": "普陀区金沙江路1699号鑫乐惠美食广场A13" }
      ];
    },
    FindSong()
    { 
      alert(this.Search);
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
        this.$router.push('/api/Personalhome');
       if(command==='Mymsg')
          this.$router.push('/api/msg');
    },
    play() {
      if(this.duration==0)
    {
      EventBus.$emit('changeSong',this.$store.state.songs[0].songFilepath);
      this.$store.state.palySongindex=0;
      this.$store.state.isplay=false;
    }
    else
    { 
      this.$parent.$refs.MusicPlay.play();
      this.$store.state.isplay=false;
    }
     
     
  },
  pause() {
    this.$parent.$refs.MusicPlay.pause();
    this.$store.state.isplay=true;
   
  },
  changeVolume() {
    this.$parent.$refs.MusicPlay.volume=this.setSong.volume;
    localStorage.setItem('setSong',JSON.stringify(this.setSong));
  },
  showPlayer() {
    this.isPlayerVisible = true;
  },
  hidePlayer() {
    this.isPlayerVisible = false;
  },
  updateProgress(){
   
  },
  changeCurrentTime() {
    this.$parent.$refs.MusicPlay.currentTime = this.progress;
  },
  setDuration() {
  this.duration =  this.$parent.$refs.MusicPlay.duration || 0;
  },
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; // 格式化为 mm:ss
  },
  handleMouseMove(event) {
    if (window.innerHeight - event.clientY < 120) {
      this.isPlayerVisible = true;
    } else {
    this.isPlayerVisible = false;
    }
  },
  startUpdateTimer() {
    this.updateTimeInterval = setInterval(() => {
      if (this.$parent.$refs.MusicPlay) {
        this.progress = this.$parent.$refs.MusicPlay.currentTime;
        if (this.$store.state.isplay == false && this.lyric == true) {
          this.setOffset();
        }
        if (this.duration != 0 && this.progress + 0.9 >= this.duration) {
          this.playNext();
        }
      }
    }, 1000); // 每秒更新一次
  },
  stopUpdateTimer() {
    if (this.updateTimeInterval) {
      clearInterval(this.updateTimeInterval);
      this.updateTimeInterval = null;
    }
  },
},
     mounted() {
     
      this.musicId=JSON.parse(localStorage.getItem('Nowsong')).songId; 
      this.doms.audio = document.getElementById('audio');
      this.doms.ul = document.getElementById('ul');
    this.doms.divcontroller = document.getElementById('divcontroller');
    this.$parent.$refs.MusicPlay.volume=JSON.parse(localStorage.getItem('setSong')).volume;
    this.setDuration();
    this.restaurants =  this.loadAll();
    this.data=JSON.parse(localStorage.getItem('User'));
   
    this.$store.state.img=JSON.parse(localStorage.getItem('Nowsong')).songImg;
        this.$store.state.title=JSON.parse(localStorage.getItem('Nowsong')).songName;
        this.$store.state.lyc=JSON.parse(localStorage.getItem('Nowsong')).songLyc;
      axios.get("http://localhost:1111/api/songList",{
      params:{
        id:this.$route.query.id,
        userId:this.data?this.data.userId:0,  //未登录的情况
      }
    }) .then((result)=>{
      this.loading = true; // 开始加载数据
       this.songList=result.data.data;
       this.getAudioDurations();   
       //console.log(this.newSong);
       this.total=this.songList.songs.length;
       //console.log(this.songList);
       if(this.songList.iscollect==true)
        this.Iscollection=1;
      else
       this.Iscollection=0;
    });
    
    
    if(this.data)
  {
    axios.get("http://localhost:1111/api/music",{
        params:{
          userId:this.data.userId
        }
      }).then((result)=>
    {
     
      this.music=result.data.data;
      console.log(this.music);
      
    });
  }
 
    window.addEventListener('mousemove', this.handleMouseMove);
    this.startUpdateTimer();

  EventBus.$on('updateSong',this.updateSong);
 

  




},
  computed: {
   
  isLoggedIn() {
    return !!this.token; // 判断是否存在 token
  },
  formattedSongs() {
      return this.songList.songs.map(song => {
        return {
          ...song,
          songTime: this.SongDurations[song.songId] || "未知" // 如果没有时间，默认显示“未知”
        };
        
      });
    },
    //分割歌曲数组
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.newSong.slice(start, start + this.pageSize);
    },
},
beforeDestroy() {
  window.removeEventListener('mousemove', this.handleMouseMove);
  EventBus.$off('updateSong',this.updateSong);
  this.stopUpdateTimer();
},
created() {
  

  axios.get("http://localhost:1111/api/home").then((result)=>
      {
         this.$store.commit('setSongs',result.data.data);
          //console.log(this.$store.state.songs);
          this.$store.state.isShow=true;
      });
  
  if(localStorage.getItem('setSong')!=null)
   {
    this.setSong.volume=JSON.parse(localStorage.getItem('setSong')).volume;
    this.setSong.isplay=true;
   }
   else
    localStorage.setItem('setSong',JSON.stringify(this.setSong));
  this.progress = this.$parent.$refs.MusicPlay.currentTime;
              
},
activated() {
  this.startUpdateTimer();
},
deactivated() {
  this.stopUpdateTimer();
},
}
</script>

<style  scoped>

::v-deep .custom-dialog .el-dialog {
  background-color: rgb(45, 45, 56) !important; /* 设置对话框背景颜色 */
  color: white !important; /* 设置文字颜色 */
}

/* 修改对话框的标题背景色 */
::v-deep .custom-dialog .el-dialog__header {
  background-color: rgb(45, 45, 56) !important; /* 设置标题背景 */
  color: white !important; /* 设置标题文字颜色为白色 */
}

/* 修改对话框内容区域的背景色 */
::v-deep .custom-dialog .el-dialog__body {
  background-color: rgb(45, 45, 56) !important; /* 设置内容区背景 */
  color: white !important; /* 设置文字颜色 */
}

/* 修改底部按钮区域的背景色 */
::v-deep .custom-dialog .el-dialog__footer {
  background-color: rgb(45, 45, 56) !important; /* 设置按钮区背景 */
  color: white !important; /* 设置按钮文字颜色 */
}

::v-deep .custom-dialog .el-button {
  background-color: rgb(60, 60, 70) !important; /* 修改按钮背景色 */
  border-color: rgb(60, 60, 70) !important; /* 修改按钮边框颜色 */
  color: white !important; /* 修改按钮文字颜色 */
}
::v-deep .el-textarea__inner {
  resize: none;  /* 禁用拉伸功能 */
  background-color: rgb(45, 45, 56) !important; /* 设置内容区背景 */
  color: white !important; /* 修改按钮文字颜色 */
} 

.text_box {
  overflow-y: auto; /* 开启垂直滚动 */
  border: 1px solid gray;
  margin-left: 270px;
  width: 1200px;
  height: 550px;
  background-color: rgba(128, 128, 128, 0.1); /* 半透明的灰色背景 */
  display: flex;
  text-align: left; /* 确保文本在水平轴上对齐 */
  color: white; /* 文字颜色为白色 */
}
.comment-drawer {
  
  position: fixed;
bottom: 0;
left: 0;
right: 0;
height: 100%; /* 根据需要调整高度 */
background-color: white; /* 背景颜色 */
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
z-index: 1000;
transform: translateY(0); /* 确保抽屉处于视口内 */
background:rgb(19,19,26); /* 红黑渐变 */
}
.slider-enter-active, .slider-leave-active {
  transition: transform 0.3s ease; /* 使用平滑过渡 */
}

.slider-enter, .slider-leave-to /* .slider-leave-active 在离开时生效 */
{
  transform: translateY(100%); /* 在关闭时，抽屉向上滑出 */
}
/* 其他样式 */
.comment-header {
  padding: 10px;
  text-align: right;
}

.comment-content {
  display: flex;                  /* 使用 Flexbox 布局 */
  align-items: center;            /* 垂直居中对齐 */
  justify-content: flex-start;    /* 将输入框和按钮靠左对齐 */
  gap: 10px;                      /* 输入框和按钮之间的间距 */
  margin-top: 10px;
}

.comment-input {
  margin-left: 270px;
  width: 70%; /* 设定输入框占据大部分宽度 */
  height: 36px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  transition: border-color 0.3s ease;
}

.comment-input:focus {
  border-color: #007bff; /* 输入框聚焦时，边框颜色变为蓝色 */
}

.submit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #0056b3; /* 鼠标悬停时按钮变为深蓝色 */
}

.submit-btn:active {
  background-color: #00408b; /* 按钮按下时背景色更深 */
}
.comment-list {
  list-style-type: none;
  padding-left: 20px;
}

.comment-item {
  padding: 5px;
  margin: 5px 0;
  border: 1px solid #ccc;
  background-color: rgba(255, 255, 255, 0.8);
}

.comment-item + .comment-item {
  margin-top: 10px;
}

.comment-item ul {
  margin-top: 10px;
  padding-left: 20px;
}




.heart {
  font-size: 40px;
  color: gray;
  cursor: pointer;
  transition: color 0.3s;
}

.heart:hover {
  color: pink; /* 悬停时的颜色 */
}

.heart.active {
  color: red; /* 激活时的颜色 */
}

.playcollection-button {
  width: 100px;
  margin: 15px 0px 0px 0px;
  transition: background-color 0.3s; /* 添加过渡效果 */
  background-color: blue; /* 默认文字颜色 */
}

.playcollection-button:hover {
  background-color:#007bff;
      
}
.scollection-button {
  width: 100px;
  margin: 15px 0px 0px 10px;
  transition: background-color 0.3s; /* 添加过渡效果 */
  background-color: gray; /* 默认文字颜色 */
}

.scollection-button:hover {
  background-color: rgb(255, 100, 100);
     
}
.collection-button {
  width: 100px;
  margin: 15px 0px 0px 10px;
  transition: background-color 0.3s; /* 添加过渡效果 */
  background-color: red; /* 默认文字颜色 */
}

.collection-button:hover {
  background-color:rgb(255, 100, 100);
      
}
.custom-large-pagination >>> .el-pagination {
  font-size: 18px; /* 调整字体大小 */
}

.custom-large-pagination >>> .el-pager li {
  font-size: 18px; /* 调整页码字体大小 */
  min-width: 40px; /* 调整页码按钮最小宽度 */
  height: 40px; /* 调整页码按钮高度 */
  line-height: 40px; /* 调整页码按钮行高 */
}

.custom-large-pagination >>> .el-pagination__editor .el-input__inner {
  height: 40px; /* 调整输入框高度 */
  line-height: 40px; /* 调整输入框行高 */
  padding: 0 16px; /* 调整输入框内边距 */
  font-size: 18px; /* 调整输入框字体大小 */
}

.custom-large-pagination >>> .el-pagination__editor {
  margin: 0 8px; /* 调整输入框外边距 */
}

.custom-large-pagination >>> .btn-prev, .custom-large-pagination >>> .btn-next {
  font-size: 18px; /* 调整前后按钮字体大小 */
  width: 40px; /* 调整前后按钮宽度 */
  height: 40px; /* 调整前后按钮高度 */
  line-height: 40px; /* 调整前后按钮行高 */
}

.custom-large-pagination >>> .el-pagination__sizes .el-select .el-input__inner {
  height: 40px; /* 调整每页显示数量选择器高度 */
  line-height: 40px; /* 调整每页显示数量选择器行高 */
  padding: 0 16px; /* 调整每页显示数量选择器内边距 */
  font-size: 18px; /* 调整每页显示数量选择器字体大小 */
}

.custom-large-pagination >>> .el-pagination__jump {
  font-size: 18px; /* 调整跳转输入框字体大小 */
  line-height: 40px; /* 调整跳转输入框行高 */
}
.round-button {
      border-radius: 30%;
      background-color: white;
      color: gray;
      padding: 10px 20px;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s; /* 平滑过渡效果 */
    }
 .round-button:hover {
      background-color: grey;
      color: white;
        }
.title {
  font-size: 25px;
  position: relative; /* 使伪元素相对于标题定位 */
  padding-left: 20px; /* 为挂件留出空间 */
}

.title::before {
  content: "🎵"; /* 你可以选择任何你喜欢的图标或字符 */
  position: relative;
  left: 0;
  top: 45%;
  transform: translateY(-50%); /* 垂直居中对齐 */
  font-size: 25px; /* 调整挂件的大小 */
  color: #333; /* 调整挂件的颜色 */
}
.Listcontainer {
  display: flex;
  
  
}



.text-container {
  margin-left: 20px; /* 可以根据需要调整间距 */
}

.spans-container {
  margin-top: 30px ;
  margin-left: 30px;
  display: flex;
  flex-direction: column; /* 使子元素垂直堆叠 */
  gap: 10px; /* 调整 span 之间的间距 */
}
.songListImg {
  margin: 30px 0px 0px 30px;
  width: 220px;
  height: 220px;
  border: 2px solid black; /* 添加黑色边框 */
 
}

.lyricScroll {
margin-top: 20px;
margin-left: 120px;
width: 100%;
height: 100%;
display: flex;
flex-direction: column;
align-content: center;
overflow: hidden;
}

::v-deep .controller {
font-size: 25px;
height: 420px;


}

::v-deep .controller ul {
transition: 0.3s;
list-style-type: none; /* 去掉小点 */ 
transition: all 0.3s ease; /* 平滑过渡效果 */ 
}

::v-deep .controller li {
list-style-type: none; /* 去掉小点 */ 
height: 30px;
line-height: 30px;
color: gray; /* 默认颜色 */
transform: scale(1); /* 默认大小 */
margin-top: 20px;
}

/* 设置激活歌词行的样式 */

::v-deep .controller li.active {
color: white; /* 文字颜色变为白色 */
transform: scale(1.2); /* 放大10% */
transform-origin: left center; /* 改变放大的基准点 */

}





.song_lyric{
display: flex; /* 使用 flexbox 布局 */
justify-content: center;
}
.lyric-container {
  display: flex; /* 使用 flexbox */
  flex-direction: column; /* 设置为列方向 */
  align-items: flex-start; /* 左对齐 */
}

.song-container {
display: flex; /* 使用 flexbox 布局 */
justify-content: center;
}


.lyricImg {
border-radius: 50%; /* 使图片变为圆形 */
width: 300px; /* 图片的宽度 */
height: 300px; /* 图片的高度 */
padding: 5px;
transition: transform 0.5s ease; /* 设置平滑过渡效果 */
margin: 150px auto; /* 上边距150px，左右自动（居中） */
display: block; /* 防止默认的行内元素间距 */
object-fit: cover;
animation: spin 10s linear infinite; /* 添加旋转动画 */
}

@keyframes spin {
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
}
.header {
display: flex;
justify-content: flex-end; /* 右对齐 */
padding: 10px; /* 可以根据需要调整内边距 */
}
.drawer {
position: fixed;
top: 0;
left: 0;
right: 0;
height: 1700px; /* 根据需要调整高度 */
background-color: white; /* 背景颜色 */
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
z-index: 1000;
transform: translateY(0); /* 确保抽屉处于视口内 */
background: linear-gradient(to bottom, rgb(109,20,50), rgb(54,18,27)); /* 红黑渐变 */
}

.slide-enter-active, .slide-leave-active {
transition: transform 0.3s ease;
}

.slide-enter, .slide-leave-to { /* .slide-leave-active 在离开时生效 */
transform: translateY(-100%); /* 抽屉在关闭时向上滑出 */
}
.progress-label,
.volume-label {
font-size: 14px; /* 字体大小 */
color: black; /* 字体颜色 */
margin-right: 10px; /* 右间距 */
}
.progress-slider,
.volume-slider {
      
-webkit-appearance: none; /* 去掉默认样式 */
appearance: none;
width: 200px; /* 设置宽度 */
height: 4px; /* 设置高度 */
background: #ddd; /* 背景颜色 */
border-radius: 5px; /* 圆角效果 */
}

.progress-slider::-webkit-slider-thumb,
.volume-slider::-webkit-slider-thumb {
-webkit-appearance: none; /* 去掉默认样式 */
appearance: none;
width: 16px; /* 滑块宽度 */
height: 16px; /* 滑块高度 */
border-radius: 50%; /* 圆形滑块 */
background: #3498db; /* 滑块颜色 */
cursor: pointer; /* 鼠标指针样式 */
}

.progress-slider::-moz-range-thumb,
.volume-slider::-moz-range-thumb {
width: 16px;
height: 16px;
border-radius: 50%;
background: #3498db;
cursor: pointer;
}

.time-display {
color: black;
font-size: 14px; /* 字体大小 */
margin: 0 10px; /* 时间文本的左右间距 */
}
.icon-button {
  background: none;           /* 去掉背景 */
  border: none;              /* 去掉边框 */
  font-size: 40px;           /* 设置图标大小 */
  color: black;              /* 设置图标颜色为黑色 */
  cursor: pointer;            /* 鼠标悬停时变为手型 */
  padding: 0;                /* 去掉内边距 */
  outline: none;             /* 去掉焦点框 */
  transition: color 0.2s ease; /* 添加颜色变化的过渡效果 */
}

.icon-button:hover {
  color: gray;               /* 鼠标悬停时改变颜色以增加视觉反馈 */
}

.icon-button:active {
  color: darkgray;           /* 点击时改变颜色 */
}
#animated-text {
  width: 100%; /* 设置宽度 */
  white-space: pre-wrap; /* 保留空格和换行符 */
  word-wrap: break-word; /* 在单词边界处换行 */
  overflow-wrap: break-word; /* 处理长单词的换行 */
  font-size: 1.5em; /* 可根据需要调整字体大小 */
  font-family: 'SimHei', sans-serif; /* 设置黑体字体 */
  font-weight: bold; /* 加粗字体 */
}



#animated-text {
  display: inline-block;
  border-right: 2px solid; /* 光标样式 */
}

.blink-caret {
  animation: blink-caret .75s step-end infinite; /* 光标闪烁效果 */
}

@keyframes blink-caret {
  from, to {
      border-color: transparent;
  }
  50% {
      border-color: black; /* 光标闪烁效果 */
  }
}







.content {
  height: 1500px; /* 模拟长页面 */
  padding: 20px;
}

.player {
position: fixed;
  bottom: -100px; /* 初始隐藏在页面底部之外 */
  left: 0;
  right: 0;
  background-color: #faf0e6; /* 修改为淡米色背景 */
  padding: 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  transition: bottom 0.8s;
  z-index: 9999; /* 确保在其他元素之上 */
}

.player.visible {
  bottom: 0; /* 显示播放器 */
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
}

button {
  margin: 0 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

#volumeSlider {
  margin-left: 10px;
}
input[type="range"] {
margin: 0 10px;
}
.footer {
  width: 100%;
  height: 10%;
  background: linear-gradient(to right, #FFB3D1, #FF6F91); /* 桃花粉渐变 */
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
.everysongs{
overflow: hidden; /* 确保放大后不会超出容器 */
width: 100%; /* 设置图片宽度为容器的100% */
  transition: transform 0.3s ease; /* 添加过渡效果 */ 
}
.everysongs:hover {
  transform: scale(1.1); /* 鼠标悬停时放大10% */
}
.new-class
{
margin: 20px 14px;
}
 .custom-link {
  font-size: 14px;
  max-width: 150px; /* 设置最大宽度 */
  display: inline-block; /* 使其支持宽度限制 */
  overflow-wrap: break-word; /* 允许长单词换行 */
  white-space: normal; /* 允许文本正常换行 */
}
.song-total-box
{
display: flex; /* 使盒子并排 */
overflow: hidden; /* 隐藏滚动条 */
}
.song-img {
  margin: 0px 14px;
}


.container {
display: flex; /* 使用 Flexbox 布局 */
justify-content: center; /* 在容器内居中对齐 */
align-items: flex-start; /* 垂直方向上对齐顶部 */
overflow: hidden; /* 隐藏溢出的内容 */
width: 100%; /* 使容器宽度占满 100% */
height: auto; /* 高度自适应 */
}

.footer-box {
width: 950px; /* 固定宽度 */
height: 1200px; /* 固定高度 */
border: 2px solid white; /* 盒子边框 */
box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3); /* 盒子阴影 */ 
color: black; /* 文字颜色 */
font-size: 20px; /* 文字大小 */
overflow: hidden; /* 防止内容溢出 */
padding: 20px; /* 内边距 */
min-width: 750px; /* 最小宽度 */
min-height: 1200px; /* 最小高度 */

}



.personal_img
{

border-radius: 50%; /* 使图片变为圆形 */
  width: 68px; /* 图片的宽度 */
  height: 65px; /* 图片的高度 */
  padding: 5px;
  transition: transform 0.5s ease; /* 设置平滑过渡效果 */
}
.personal_img:hover {
  animation: rotate 0.5s forwards; /* 鼠标悬停时应用旋转动画 */
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

.search-trigger {
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.search-trigger input {
  padding: 10px 15px;
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 20px;
}

.search-trigger button {
  padding: 10px 20px;
  background: #ff4e50;
  color: white;
  border: none;
  border-radius: 20px;
  margin-left: 10px;
  cursor: pointer;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.music-modal {
  width: 90%;
  max-width: 400px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalFadeIn 0.3s;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 15px 20px;
  background-color: #ff4e50;
  color: white;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.search-result-content {
  padding: 20px;
}

.result-count {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.song-list {
  max-height: 400px;
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.song-item:hover {
  background-color: #f9f9f9;
}

.song-item.active {
  background-color: #fff0f0;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  margin-right: 15px;
  object-fit: cover;
}

.song-info {
  flex: 1;
}

.song-name {
  color: #000;
  font-weight: bold;
  margin-bottom: 5px;
}

.song-artist {
  color: #666;
  font-size: 14px;
}

.song-duration {
  color: #666;
  font-size: 13px;
  margin-right: 15px;
}

.play-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ff4e50;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.play-btn:hover {
  background-color: #ff2e3e;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-result {
  text-align: center;
  padding: 20px;
  color: #666;
}

.play-mode-btn {
  font-size: 18px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.play-mode-btn:hover {
  color: #409EFF;
  transform: scale(1.1);
}

/* 单曲循环特殊样式 */
.play-mode-btn.el-icon-refresh {
  animation: rotate 2s linear infinite;
}
</style>