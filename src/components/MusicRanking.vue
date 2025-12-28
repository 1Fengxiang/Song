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
      v-model="searchQuery"
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
  

  <div class="music-rank-container">
    <!-- 温馨风格标题区 -->
    <div class="header">
      <h1 class="title" style="margin-right: 160px;">音乐榜</h1>
      <p class="subtitle">发现那些温暖心灵的旋律</p>
    </div>

    <!-- 榜单分类 -->
    <div class="category-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="currentTab = tab.id"
        :class="{ active: currentTab === tab.id }"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 音乐列表 -->
    <div class="music-list">
      <div 
        v-for="(song, index) in filteredSongs" 
        :key="song.songId"
        class="music-item"
        :class="{ playing: nowSong && nowSong.id === song.songId }"
        @click="playSong(song.songFilepath,index)"
      >
        <div class="rank-number" :class="getRankClass(index + 1)">
          {{ index + 1 }}
        </div>
        
        <div class="cover-container">
          <img :src="song.songImg" class="cover" alt="专辑封面">
          <div class="play-icon">
            <i class="el-icon-caret-right"></i>
          </div>
        </div>
        
        <div class="song-info">
          <h3 class="song-title">{{ song.songName }}</h3>
          <p class="singer">{{ song.songSinger }}</p>
        </div>
        
        <div class="duration">{{ formatTime(song.songTime) }}</div>
        
        <div class="like-btn">
          <i 
          
        
            @click.stop="toggleLike(song)"
          ></i>
        </div>
      </div>
    </div>

   
    
  </div>

    




    <div class="player" :class="{ visible: isPlayerVisible }" @mouseenter="showPlayer" @mouseleave="hidePlayer">
      <audio ref="audio" :src="audioSrc" preload="auto" @loadedmetadata="setDuration" @timeupdate="updateProgress"  id="audio"  @ended="playNext" ></audio>
    <div class="controls">
      <i class="el-icon-caret-left icon-button"  @click="switchSongs(-1)"></i>
      <i @click="play" class="el-icon-video-play icon-button" v-if="this.$store.state.isplay" ></i>
      <i @click="pause" v-if="!this.$store.state.isplay" class="el-icon-video-pause icon-button" ></i>
      <i class="el-icon-caret-right icon-button" @click="switchSongs(1)" style="margin-right: 40px;"></i>
      
      <img  @click="lyc" :src=" this.$store.state.img" alt="歌曲图片"  class="personal_img" style="cursor: pointer; "  v-if="this.$store.state.isShow"  />
      <label for="progress" class="progress-label" v-if="this.$store.state.isShow" >{{this.$store.state.title}}</label>
      <div
      class="heart"
      :class="{ active: getActive(musicId) }"
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
 
<div class="modal-mask" v-if="showModal" @click.self="closeModal">
      <div class="music-modal">
        <div class="modal-header">
          <span>搜索结果</span>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <div class="search-result-content">
          <div class="result-count" v-if="!loading">
            找到 {{ searchResults.length }} 条与 "{{ searchQuery }}" 相关的结果
          </div>
          
          <div class="loading" v-if="loading">
            正在搜索中...
          </div>
          
          <div class="no-result" v-else-if="searchResults.length === 0">
            没有找到相关歌曲
          </div>
          
          <div class="song-list" v-else>
            <div 
              class="song-item" 
              v-for="song,index in searchResults" 
              :key="song.songId"
              :class="{ active: currentSong && currentSong.songId === song.songId }"
              @click="playSongTemp(song.songFilepath,index,0)"
            >
              <img :src="song.songImg" class="song-cover">
              <div class="song-info">
                <div class="song-name">{{ song.songName }}</div>
                <div class="song-artist">{{ song.songSinger }} - {{ song.songAlbum }}</div>
              </div>
              <div class="song-duration">{{ formatDuration(song.songTime) }}</div>
              <button 
                class="play-btn"
                @click.stop="playSongTemp(song.songFilepath,index,0)"
              >
                {{ currentSong && currentSong.songId === song.songId && isPlaying ? '❚❚' : '▶' }}
              </button>
            </div>
          </div>
        </div>
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
      <a @click="closeCommentDrawer" class="el-icon-close" style="font-size: 25px; color: white;"></a>
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

<script>
import axios from 'axios';
import _ from 'lodash';
import { EventBus } from '@/eventBus';

export default {
  data() {
    return {
     playMode: 1, // 默认顺序播放
      showModal: false,     // 是否显示弹框
      loading: false,        // 搜索加载状态
         searchQuery: '',  // 默认搜索词
        searchResults: [],    // 搜索结果
        hasUnreadMessage: true,
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
            duration: 0,           //总时长
            activeIndex2:"3",
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
      tabs: [
        { id: 'all', name: '全部' },
        { id: '流行', name: '流行' },
        { id: 'DJ', name: 'DJ' },
        { id: '英文', name: '英文' }
      ],
      currentTab: 'all',
      songs: [
        
      ],
      allsongs:[],
      currentSong: null,
      nowSong:null,
      isPlaying: false,
      progress: 0,
      volume: 70,
      audio: null
    }
  },
  computed: {
    filteredSongs() {
    
      if (this.currentTab === 'all') return this.allsongs;
      return this.allsongs.filter(song => song.songType === this.currentTab);
    } ,
    isLoggedIn() {
      return !!this.token; // 判断是否存在 token
    },
  },
  methods: {
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
    getRankClass(rank) {
      return {
        'top1': rank === 1,
        'top2': rank === 2,
        'top3': rank === 3,
      }
    },
    
    togglePlay() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    },
    prevSong() {
      const currentIndex = this.songs.findIndex(song => song.id === this.nowSong.id);
      const prevIndex = (currentIndex - 1 + this.songs.length) % this.songs.length;
      this.playSong(this.songs[prevIndex].filteredSongs);
    },
    nextSong() {
      const currentIndex = this.songs.findIndex(song => song.id === this.nowSong.id);
      const nextIndex = (currentIndex + 1) % this.songs.length;
      this.playSong(this.songs[nextIndex].filteredSongs);
    },
   
    toggleLike(song) {
      song.liked = !song.liked;
    },
   
    handleRedirect(){
         window.location.href = 'http://192.168.3.186:8016/';
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
        commId:this.Nowcomment.commId,
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
        
        let id='';
        console.log(this.Nowcomment);
        
        if(this.Nowcomment.commFather==0)
         id=this.Nowcomment.commUserid;
        else
        id=this.Nowcomment.commUserid;
        console.log(id);
        
        this.$store.state.ws.send(this.data.userId+"-"+id+"@"+res.data.data)

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
        console.log("下一首");
        
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
      updateCountdown() {
        if(this.token)
      {
        const now = new Date();
      const year = now.getFullYear();
      const [month, day] = this.data.birthday.split('-').map(Number);
      const nextBirthday = new Date(year, month - 1, day); // 目标生日日期

      // 如果生日已经过了今年的生日，则计算明年的生日
      if (now > nextBirthday) {
        nextBirthday.setFullYear(year + 1);
      }

      const timeDiff = nextBirthday - now; // 时间差（毫秒）
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // 转换为天数

      this.countdown = days;
      }
      
    },
      playSong(song,index){
       
      console.log("这是进入播放");
       if(this.currentSong==true)
      {     
        this.currentSong=false
        let tempSongs = [...this.searchResults, ...this.songs];
        
        console.log("你会哦啊");
        console.log(tempSongs);
        this.$store.commit('setSongs',tempSongs);
      }
      else
      {
              if(this.currentTab!='all')
            { console.log("进入到选择");
            
              console.log(this.allsongs);  
              this.songs=this.allsongs.filter(item => item.songType === this.currentTab);
                  
            }
            else{
                  this.songs=this.allsongs;
            }
       
       this.$store.commit('setSongs',this.songs);
      }
       
        


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
      updateClock() {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');

                    // 获取星期几
                    const days = ['日', '一', '二', '三', '四', '五', '六'];
                    this.dayOfWeek = days[now.getDay()];

                    // 获取日期
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const date = String(now.getDate()).padStart(2, '0');

                    // 更新数据
                    this.time = `${hours}:${minutes}:${seconds}`;
                    this.formattedDate = `${year}-${month}-${date}`;
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
     
     FindSong()
      { 
        
        if (!this.searchQuery.trim()) return
      
      this.loading = true
      this.showModal = true
      this.searchResults = [] // 清空之前的结果

      this.currentSong=false;
       axios.post("http://localhost:1111/api/history",{
        name:this.searchQuery,
        userId:this.data.userId
      }).then(()=>{
        console.log("搜索记录已保存");
        
      }); 


      // 模拟API请求延迟
      setTimeout(() => {
      this.getMockData(this.searchQuery)
        this.loading = false
        }, 800)
      },
      getMockData(query) {
        // 模拟搜索结果
        axios.get("http://localhost:1111/api/search",{
          params:{
            name:query  
          }
        }).then((result)=>{
          this.searchResults = result.data.data;
          
          console.log(this.searchResults);
          
        });
        
      },
       formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    },
    playSongTemp(song,index,flag){
      if(flag==1)
      this.currentSong=false;
    else
     this.currentSong=true;
       this.playSong(song,index);
    },
     closeModal() {
      this.showModal = false
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
      play() {
        if(this.duration==0)
      {
        EventBus.$emit('changeSong',JSON.parse(localStorage.getItem('Nowsong')).songFilepath);
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
  created() {
    // 预加载第一首歌
    if (this.songs.length > 0) {
      this.nowSong = this.songs[0];
      // 实际项目中这里会初始化audio对象
      this.audio = {
        play: () => {},
        pause: () => {}
      };
    }
  },
  mounted(){
    this.data=JSON.parse(localStorage.getItem('User')) || {};
    axios.get("http://localhost:1111/api/home").then((result)=>
      {
         
        
         if(!localStorage.getItem('Nowsong'))
           {
              localStorage.setItem('Nowsong',JSON.stringify(result.data.data[0]));
           }
          //console.log(this.$store.state.songs);
          this.$store.state.isShow=true;
      });
    axios.get("http://localhost:1111/api/ranking").then((result)=>
      {
         
         this.allsongs=result.data.data;
          this.$store.commit('setSongs',this.allsongs);
      });
       

        this.musicId=JSON.parse(localStorage.getItem('Nowsong')).songId; 
       
       
       this.$store.state.img=JSON.parse(localStorage.getItem('Nowsong')).songImg;
       this.$store.state.title=JSON.parse(localStorage.getItem('Nowsong')).songName;
       this.$store.state.lyc=JSON.parse(localStorage.getItem('Nowsong')).songLyc;
        this.doms.audio = document.getElementById('audio');
        this.doms.ul = document.getElementById('ul');
      this.doms.divcontroller = document.getElementById('divcontroller');
      this.$parent.$refs.MusicPlay.volume=JSON.parse(localStorage.getItem('setSong')).volume;
      this.setDuration();
     
      this.data=JSON.parse(localStorage.getItem('User'));
     
      this.updateCountdown();
      //console.log(this.data); 
      window.addEventListener('mousemove', this.handleMouseMove);
      this.startUpdateTimer();
     
    EventBus.$on('updateSong',this.updateSong);
  
 
    
  }
}
</script>

<style scoped>
/* 温馨风格基础样式 */
.music-rank-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #fff9f9;
  color: #5a4a4a;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  color: #ff7b92;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
}

.subtitle {
  font-size: 1rem;
  color: #a78a8a;
  margin: 0;
}

.category-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 10px;
}

.category-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  background-color: #ffecec;
  color: #cc7a8f;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tabs button.active {
  background-color: #ff7b92;
  color: white;
}

.category-tabs button:hover {
  background-color: #ffb3c1;
  color: white;
}

.music-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.music-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(255, 123, 146, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.music-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 123, 146, 0.15);
}

.music-item.playing {
  background-color: #fff0f3;
}

.rank-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 15px;
  font-weight: bold;
  color: #8c7f7f;
  background-color: #f5e6e6;
}

.rank-number.top1 {
  background-color: #ff7b92;
  color: white;
}

.rank-number.top2 {
  background-color: #ff9eb1;
  color: white;
}

.rank-number.top3 {
  background-color: #ffc0d0;
  color: white;
}

.cover-container {
  position: relative;
  margin-right: 15px;
}

.cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.play-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 123, 146, 0.6);
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.music-item:hover .play-icon {
  opacity: 1;
}

.play-icon i {
  color: white;
  font-size: 20px;
}

.song-info {
  flex: 1;
}

.song-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #5a4a4a;
}

.singer {
  margin: 0;
  font-size: 14px;
  color: #a78a8a;
}

.duration {
  margin-right: 20px;
  font-size: 14px;
  color: #8c7f7f;
}

.like-btn i {
  font-size: 18px;
  color: #d9b4ba;
  transition: all 0.3s ease;
}

.like-btn i.liked {
  color: #ff7b92;
}

.like-btn i:hover {
  transform: scale(1.2);
}

/* 播放控制条 */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  border-top: 1px solid #ffecec;
  padding: 10px 0;
}

.player-progress {
  height: 4px;
  background-color: #f0e1e4;
  cursor: pointer;
}

.progress-bar {
  height: 100%;
  background-color: #ff7b92;
  transition: width 0.1s linear;
}

.player-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 15px;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 15px;
}

.now-playing-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.now-playing-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #5a4a4a;
}

.now-playing-info p {
  margin: 0;
  font-size: 14px;
  color: #a78a8a;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.control-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #ff7b92;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  color: #ff506f;
  transform: scale(1.1);
}

.play-btn {
  background-color: #ff7b92;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn i {
  color: white;
  font-size: 16px;
}

.play-btn:hover {
  background-color: #ff506f;
  transform: scale(1.1);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-control i {
  color: #ff7b92;
}

.volume-slider {
  width: 80px;
  -webkit-appearance: none;
  height: 4px;
  background: #f0e1e4;
  border-radius: 2px;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff7b92;
  cursor: pointer;
}


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
.countdown {
  font-size: 1.3em; /* 设置倒计时文本的大小 */
  margin-top: 10px; /* 倒计时与其他内容的间距 */
}
.text-container {
    overflow: hidden; /* 隐藏溢出部分 */
    white-space: nowrap; /* 不换行 */
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
.song-box {
  width: 200px; /* 固定宽度 */
  height: 520px; /* 固定高度 */
  border: 2px solid white; /* 边框 */
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3); /* 阴影 */
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 纵向排列内容 */
  color: black; /* 文字颜色 */
  padding: 20px; /* 内边距 */
  margin-left: 10px; /* 左边距 */
  min-width: 200px; /* 最小宽度 */
  min-height: 200px; /* 最小高度 */
  margin-top:1px ;
}

.song-card {
    display: flex; /* 使用 Flexbox 布局 */
    align-items: center; /* 垂直居中对齐 */
    margin-bottom: 8px; /* 每行之间的间距 */
}

.song-title {
    font-size: 15px; /* 字体大小 */
    color: #333; /* 字体颜色 */
    text-decoration: none; /* 去掉下划线 */
    margin-left: 10px; /* 按钮与歌曲名称之间的间距 */
}

.song-title:hover {
    text-decoration: underline; /* 悬停时添加下划线 */
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
  margin: 20px 35px;
}
   .custom-link {
    font-size: 14px;
    max-width: 150px; /* 设置最大宽度 */
    display: flex;
    overflow-wrap: break-word; /* 允许长单词换行 */
    white-space: normal; /* 允许文本正常换行 */
    
  }
 .song-total-box
 {
  display: flex; /* 使盒子并排 */
  overflow: hidden; /* 隐藏滚动条 */
 }
 .song-img {
    margin: 0px 35px;
  }
.box-top{
    margin:20px 30px;
    overflow: hidden; /* 隐藏滚动条 */
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
  margin-left: 247px;
}

.clock-box {
  width: 200px; /* 固定宽度 */
  height: 200px; /* 固定高度 */
  border: 2px solid white; /* 边框 */
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3); /* 阴影 */
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 纵向排列内容 */
  justify-content: center; /* 垂直居中内容 */
  align-items: center; /* 水平居中内容 */
  color: black; /* 文字颜色 */
  padding: 20px; /* 内边距 */
  margin-left: 10px; /* 左边距 */
  min-width: 200px; /* 最小宽度 */
  min-height: 200px; /* 最小高度 */
  margin-top:1px;
}
.personal-box {
  width: 200px; /* 固定宽度 */
  height: 200px; /* 固定高度 */
  border: 2px solid white; /* 边框 */
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3); /* 阴影 */
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 纵向排列内容 */
  align-items: center; /* 水平居中内容 */
  color: black; /* 文字颜色 */
  padding: 20px; /* 内边距 */
  margin-left: 10px; /* 左边距 */
  min-width: 200px; /* 最小宽度 */
  min-height: 200px; /* 最小高度 */
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
