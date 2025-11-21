<template>
    <el-container>
  <el-header >
    <el-menu
  :default-active="activeIndex2"
  class="el-menu-demo"
  mode="horizontal"
  @select="handleSelect"
  background-color="#545c64"
  text-color="#fff"
  active-text-color="#ffd04b">
  <span class="title_text">风闲</span>
  <router-link to="/api/home" class="del-decoration">
    <el-menu-item index="1">音乐中心</el-menu-item>
  </router-link>
    <router-link :to="{ path: '/api/music', query: { id: data!=null?data.userId:0 } }" class="del-decoration">
      <el-menu-item index="2" >我的音乐</el-menu-item>
    </router-link>
  <el-menu-item index="3" >排行榜</el-menu-item>
  <el-menu-item index="4">我也不知道填啥</el-menu-item>
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
  <el-main class="image-container">
    <div>
      <img src="../assets/PersonHome.jpg" alt="图片无法显示"  class="img">
      <div class="main_box">
        <div class="container">
        <dt id="ava">
          <a   class="upload"  @click="changeHeadShot">
                <img :src="data.headshot" alt="头像">
                <span class="hover-text">更换头像</span>
            </a>
        </dt>
        <div class="f-cb">
          <h2 style="flex: 1; display: flex; align-items: center; padding-left: 200px; margin: 0;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 300px;">{{data.userName}}</span>
            <i class="el-icon-male" style="padding-left: 10px; color: blue;" v-if="data.sex==='男'"></i>
            <i class="el-icon-female" style="padding-left: 10px; color: blue;" v-if="data.sex==='女'"></i>
        </h2>
          <div style="padding: 0px 0px 0px 73px;">
          <el-button @click="changePerson">资料修改</el-button>
          
          </div>
        </div>
      </div>
      
      <hr width="400px">
      <div>
        <span style="padding:0px 0px 0px 230px; color: gray; font-size: 16px;">账号:{{data.account}}</span>
        </div>
      <div>
        <span style="padding:0px 0px 0px 230px; color: gray; font-size: 16px;">所在地区:{{data.region}}</span>
        </div>
        <div>
          <span style="padding:0px 0px 0px 230px; color: gray; font-size: 16px; white-space: normal; overflow: hidden; display: inline-block; max-width: 600px;">介绍:{{data.briefIntroduction}}</span>
        </div>
        <div style="margin: 70px 0px 0px 0px ;">
        <i class="el-icon-headset" style="margin: 50px 0px 0px 30px; color: grey;">收藏的歌单</i>
        <hr style="border: none; border-top: 3px solid red; width: 98%;  display: block;">
        </div>
        <div>
          <el-empty :image-size="200" description="暂无歌单" v-if="Issong"></el-empty>
          <div class="song-total-box" v-for="outerIndex in collectList.length>4?2:1" :key="outerIndex">
      <div v-for="index in 4" :key="index" :class="outerIndex === 2 ? 'new-class' : 'song-img'">
        <router-link  style="text-decoration: none !important;"  v-if="collectList[(outerIndex-1)*4+index-1]" :to="{ path: '/api/songList', query: { id: collectList[(outerIndex-1)*4+index-1].listId } }">
          <a  target="_self">
          <el-image class="everysongs"
           v-if="collectList[(outerIndex-1)*4+index-1]"
            :src="collectList[(outerIndex-1)*4+index-1].listImg"
            fit="cover"
            style="width: 160px; height: 160px">
          </el-image>
          
        </a>
        <el-link  v-if="collectList[(outerIndex-1)*4+index-1]"  target="_blank" style="font-size: 14px;" class="custom-link">{{collectList[(outerIndex-1)*4+index-1].listTitle}}</el-link>
        </router-link>
        
      </div>
    </div>
          
        </div>
        <div style="text-align: right;" v-if="collectList.length>8"><router-link :to="{ path: '/api/music', query: { id: data!=null?data.userId:0 } }"><a  class="view-more">查看更多&gt;</a></router-link> </div>
      </div>
    </div>





    <div class="player" :class="{ visible: isPlayerVisible }" @mouseenter="showPlayer" @mouseleave="hidePlayer">
      <audio ref="audio" :src="audioSrc" preload="auto" @loadedmetadata="setDuration" @timeupdate="updateProgress"  ></audio>
    <div class="controls">
      <i class="el-icon-caret-left icon-button"  @click="switchSongs(-1)"></i>
      <i @click="play" class="el-icon-video-play icon-button" v-if="this.$store.state.isplay" ></i>
      <i @click="pause" v-if="!this.$store.state.isplay" class="el-icon-video-pause icon-button" ></i>
      <i class="el-icon-caret-right icon-button" @click="switchSongs(1)" style="margin-right: 40px;"></i>
      <img  @click="lyc" :src=" this.$store.state.img" alt="歌曲图片"  class="personal_img" style="cursor: pointer; "  v-if="this.$store.state.isShow"  />
      <label for="progress" class="progress-label" v-if="this.$store.state.isShow">{{this.$store.state.title}}</label>
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
                <span style="margin-top: 10px; margin-left: 160px; font-size: 20px;">歌手:风闲</span>
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


    <el-dialog title="信息修改" :visible.sync="dialogFormVisible">
        <el-form  ref="PerFormRef"  :model="Persong" :rules="rules">
      <el-form-item label="昵称" :label-width="formLabelWidth"  prop="name">
      <el-input v-model="Persong.name" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="邮件" :label-width="formLabelWidth"  prop="email">
      <el-input v-model="Persong.email" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="生日" :label-width="formLabelWidth" autocomplete="off" prop="birthday">
    <el-col :span="11">
      <el-date-picker type="date" placeholder="选择日期" v-model="Persong.birthday" style="width: 100%;"></el-date-picker>
    </el-col>
  </el-form-item>
    <el-form-item label="性别"  :label-width="formLabelWidth">
    <el-radio-group v-model="Persong.sex">
      <el-radio label="女"></el-radio>
      <el-radio label="男"></el-radio>
    </el-radio-group>
  </el-form-item>
    <el-form-item label="省份" :label-width="formLabelWidth">
      <el-select v-model="Persong.province" @change="onProvinceChange" placeholder="选择省份">
        <el-option v-for="province in provinces" :key="province.value" :label="province.label" :value="province.label" />
      </el-select>
    </el-form-item>

    <el-form-item label="城市" :label-width="formLabelWidth" v-if="Persong.province!='北京' && Persong.province!='上海' && Persong.province!='重庆'">
      <el-select v-model="Persong.city" placeholder="选择城市" >
        <el-option   v-for="city in filteredCities" :key="city.value" :label="city.label" :value="city.label" />
      </el-select>
    </el-form-item>
    <el-form-item label="介绍" :label-width="formLabelWidth" prop="brief">
      <el-input v-model="Persong.brief" autocomplete="off"></el-input>
    </el-form-item>
    
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="dialogFormVisible = false">取 消</el-button>
    <el-button type="primary" @click="summit">确 定</el-button>
  </div>
</el-dialog>


<el-dialog title="更改头像" :visible.sync="diaheadshotVisible">
        <el-form  ref="imgHeadShot" :model="Persong"  :rules="rules">
      <el-form-item label="图片url" :label-width="formLabelWidth"  prop="url">
      <el-input v-model="Persong.url" autocomplete="off"></el-input>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="diaheadshotVisible = false">取 消</el-button>
    <el-button type="primary" @click="summitHeadShot">确 定</el-button>
  </div>
</el-dialog>




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
          music:[1],
          isActive:false, // 初始状态为未激活
          diaheadshotVisible:false,
          headshot:'',
          formLabelWidth: '120px',//输入框的大小
          Persong: {
          name: '',
          email: '',
          birthday: '',
          sex: '',
          province:'',
          city: '',
          brief: '',
          url:'',
        },
          rules:{
              name:[
                    { required: true, message: '请输入昵称', trigger: 'blur' },
                    { min: 1, trigger: 'blur' }
                ],
                email: [
                { required: true, message: '请输入邮箱', trigger: 'blur' },
                { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
                ],
                birthday: [
        { required: true, message: '请输入生日', trigger: 'blur' },
          
        ],
          brief:[
                    { required: true, message: '请输入介绍', trigger: 'blur' },
                    { min: 1,max:100, message:'范围在1到100',trigger: 'blur' }
                ],
                url: [
              { required: true, message: '请输入 URL', trigger: 'blur' },
              { type:'url', trigger: 'blur' }
          ],
            },

          provinces: [
        { label: '湖南', value: 'hunan' },
        { label: '广东', value: 'guangdong' },
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '江苏', value: 'jiangsu' },
        { label: '浙江', value: 'zhejiang' },
        { label: '山东', value: 'shandong' },
        { label: '河南', value: 'henan' },
        { label: '四川', value: 'sichuan' },
        { label: '陕西', value: 'shanxi' },
        { label: '河北', value: 'hebei' },
        { label: '湖北', value: 'hubei' },
        { label: '云南', value: 'yunnan' },
        { label: '广西', value: 'guangxi' },
        { label: '海南', value: 'hainan' },
        { label: '贵州', value: 'guizhou' },
        { label: '重庆', value: 'chongqing' },
        { label: '吉林', value: 'jilin' },
        { label: '黑龙江', value: 'heilongjiang' },
        { label: '甘肃', value: 'gansu' },
        { label: '宁夏', value: 'ningxia' },
        { label: '新疆', value: 'xinjiang' },
        { label: '西藏', value: 'xizang' },
        { label: '青海', value: 'qinghai' },
        { label: '台湾', value: 'taiwan' },
      ],
      cities: {
        湖南: [
        { label: '长沙', value: 'changsha' },
        { label: '株洲', value: 'zhuzhou' },
        { label: '湘潭', value: 'xiangtan' },
        { label: '衡阳', value: 'hengyang' },
        { label: '邵阳', value: 'shaoyang' },
        { label: '岳阳', value: 'yueyang' },
        { label: '常德', value: 'changde' },
        { label: '张家界', value: 'zhangjiajie' },
        { label: '益阳', value: 'yiyang' },
        { label: '郴州', value: 'chenzhou' },
        { label: '永州', value: 'yongzhou' },
        { label: '怀化', value: 'huaihua' },
        { label: '娄底', value: ' Loudi' },
],
广东: [
        { label: '广州', value: 'guangzhou' },
        { label: '韶关', value: 'shaoguan' },
        { label: '深圳', value: 'shenzhen' },
        { label: '珠海', value: 'zhuhai' },
        { label: '汕头', value: 'shantou' },
        { label: '佛山', value: 'foshan' },
        { label: '江门', value: 'jiangmen' },
        { label: '湛江', value: 'zhanjiang' },
        { label: '茂名', value: 'maoming' },
        { label: '肇庆', value: 'zhaoqing' },
        { label: '惠州', value: 'huizhou' },
        { label: '梅州', value: 'meizhou' },
        { label: '汕尾', value: 'shanwei' },
        { label: '河源', value: 'heyuan' },
        { label: '阳江', value: 'yangjiang' },
        { label: '清远', value: 'qingyuan' },
        { label: '东莞', value: 'dongguan' },
        { label: '中山', value: 'zhongshan' },
        { label: '潮州', value: 'chaozhou' },
        { label: '揭阳', value: 'jieyang' },
        { label: '云浮', value: 'yunfu' },
],
江苏: [
    { label: '南京', value: 'nanjing' },
    { label: '无锡', value: 'wuxi' },
    { label: '徐州', value: 'xuzhou' },
    { label: '常州', value: 'changzhou' },
    { label: '苏州', value: 'suzhou' },
    { label: '南通', value: 'nantong' },
    { label: '连云港', value: 'lianyungang' },
    { label: '淮安', value: 'huaian' },
    { label: '盐城', value: 'yancheng' },
    { label: '扬州', value: 'yangzhou' },
    { label: '镇江', value: 'zhenjiang' },
    { label: '泰州', value: 'taizhou' },
    { label: '宿迁', value: 'suqian' },
],
浙江: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '宁波市', value: 'ningbo' },
    { label: '温州市', value: 'wenzhou' },
    { label: '嘉兴市', value: 'jiaxing' },
    { label: '湖州市', value: 'huzhou' },
    { label: '绍兴市', value: 'shaoxing' },
    { label: '金华市', value: 'jinhua' },
    { label: '衢州市', value: 'quzhou' },
    { label: '舟山市', value: 'zhoushan' },
    { label: '台州市', value: 'taizhou' },
    { label: '丽水市', value: 'lishui' },
],
山东: [
    { label: '济南市', value: 'jinan' },
    { label: '青岛市', value: 'qingdao' },
    { label: '淄博市', value: 'zibo' },
    { label: '枣庄市', value: 'zaozhuang' },
    { label: '东营市', value: 'dongying' },
    { label: '烟台市', value: 'yantai' },
    { label: '潍坊市', value: 'weifang' },
    { label: '济宁市', value: 'jining' },
    { label: '泰安市', value: 'taian' },
    { label: '威海市', value: 'weihai' },
    { label: '日照市', value: 'rizhao' },
    { label: '临沂市', value: 'linyi' },
    { label: '德州市', value: 'dezhou' },
    { label: '聊城市', value: 'liaocheng' },
    { label: '滨州市', value: 'binzhou' },
    { label: '菏泽市', value: 'heze' },
],
河南: [
    { label: '郑州市', value: 'zhengzhou' },
    { label: '开封市', value: 'kaifeng' },
    { label: '洛阳市', value: 'luoyang' },
    { label: '平顶山市', value: 'pingdingshan' },
    { label: '安阳市', value: 'anyang' },
    { label: '鹤壁市', value: 'hebi' },
    { label: '新乡市', value: 'xinxiang' },
    { label: '焦作市', value: 'jiaozuo' },
    { label: '濮阳市', value: 'puyang' },
    { label: '许昌市', value: 'xuchang' },
    { label: '漯河市', value: 'luohe' },
    { label: '三门峡市', value: 'sanmenxia' },
    { label: '南阳市', value: 'nanyang' },
    { label: '商丘市', value: 'shangqiu' },
    { label: '信阳市', value: 'xinyang' },
    { label: '周口市', value: 'zhoukou' },
    { label: '驻马店市', value: 'zhumadian' },
],
四川: [
    { label: '成都市', value: 'chengdu' },
    { label: '自贡市', value: 'zigong' },
    { label: '攀枝花市', value: 'panzhihua' },
    { label: '泸州市', value: 'luzhou' },
    { label: '德阳市', value: 'deyang' },
    { label: '绵阳市', value: 'mianyang' },
    { label: '广元市', value: 'guangyuan' },
    { label: '遂宁市', value: 'suining' },
    { label: '内江市', value: 'neijiang' },
    { label: '乐山市', value: 'leshan' },
    { label: '南充市', value: 'nanchong' },
    { label: '眉山市', value: 'meishan' },
    { label: '宜宾市', value: 'yibin' },
    { label: '广安市', value: 'guangan' },
    { label: '达州市', value: 'dazhou' },
    { label: '雅安市', value: 'yaan' },
    { label: '巴中市', value: 'bazhong' },
    { label: '资阳市', value: 'ziyang' },
],
陕西: [
    { label: '西安市', value: 'xian' },
    { label: '铜川市', value: 'tongchuan' },
    { label: '宝鸡市', value: ' Baoji' },
    { label: '咸阳市', value: 'xianyang' },
    { label: '渭南市', value: 'weinan' },
    { label: '延安市', value: 'yanan' },
    { label: '汉中市', value: 'hanzhong' },
    { label: '榆林市', value: 'yulin' },
    { label: '安康市', value: 'ankang' },
    { label: '商洛市', value: 'shangluo' },
],
河北: [
    { label: '石家庄市', value: 'shijiazhuang' },
    { label: '唐山市', value: 'tangshan' },
    { label: '秦皇岛市', value: 'qinhuangdao' },
    { label: '邯郸市', value: 'handan' },
    { label: '邢台市', value: 'xingtai' },
    { label: '保定市', value: 'baoding' },
    { label: '张家口市', value: 'zhangjiakou' },
    { label: '承德市', value: 'chengde' },
    { label: '沧州市', value: 'cangzhou' },
    { label: '廊坊市', value: 'langfang' },
    { label: '衡水市', value: 'hengshui' },
],
湖北: [
    { label: '武汉市', value: 'wuhan' },
    { label: '黄石市', value: 'huangshi' },
    { label: '十堰市', value: 'shiyan' },
    { label: '宜昌市', value: 'yichang' },
    { label: '襄阳市', value: 'xiangyang' },
    { label: '鄂州市', value: 'ezhou' },
    { label: '荆门市', value: 'jingmen' },
    { label: '孝感市', value: 'xiaogan' },
    { label: '荆州市', value: 'jingzhou' },
    { label: '黄冈市', value: 'huanggang' },
    { label: '咸宁市', value: 'xianning' },
    { label: '随州市', value: 'suizhou' },
],
云南: [
    { label: '昆明市', value: 'kunming' },
    { label: '曲靖市', value: 'qujing' },
    { label: '玉溪市', value: 'yuxi' },
    { label: '保山市', value: 'baoshan' },
    { label: '昭通市', value: 'zhaotong' },
    { label: '丽江市', value: 'lijiang' },
    { label: '普洱市', value: 'puer' },
    { label: '临沧市', value: 'lincang' },
],
海南: [
    { label: '海口市', value: 'haikou' },
    { label: '三亚市', value: 'sanya' },
    { label: '三沙市', value: 'sansha' },
    { label: '儋州市', value: 'danzhou' },
],
贵州: [
    { label: '贵阳市', value: 'guiyang' },
    { label: '六盘水市', value: 'liupanshui' },
    { label: '遵义市', value: 'zunyi' },
    { label: '安顺市', value: 'anshun' },
    { label: '毕节市', value: 'bijie' },
    { label: '铜仁市', value: 'tongren' },
],
吉林: [
    { label: '长春市', value: 'changchun' },
    { label: '吉林市', value: 'jilin' },
    { label: '四平市', value: 'siping' },
    { label: '辽源市', value: 'liaoyuan' },
    { label: '通化市', value: 'tonghua' },
    { label: '白山市', value: 'baishan' },
    { label: '松原市', value: 'songyuan' },
    { label: '白城市', value: 'baicheng' },
],
黑龙江: [
    { label: '哈尔滨市', value: 'haerbin' },
    { label: '齐齐哈尔市', value: 'qiqihar' },
    { label: '鹤岗市', value: 'hegang' },
    { label: '双鸭山市', value: 'shuangyashan' },
    { label: '鸡西市', value: 'jixi' },
    { label: '大庆市', value: 'daqing' },
    { label: '伊春市', value: 'yichun' },
    { label: '佳木斯市', value: 'jiamusi' },
    { label: '七台河市', value: 'qitaihe' },
    { label: '黑河市', value: 'heihe' },
    { label: '绥化市', value: 'suihua' },
    { label: '大兴安岭地区', value: 'daxinganling' },
],
甘肃: [
    { label: '兰州市', value: 'lanzhou' },
    { label: '嘉峪关市', value: 'jiayuguan' },
    { label: '金昌市', value: 'jinchang' },
    { label: '白银市', value: 'baiyin' },
    { label: '天水市', value: 'tianshui' },
    { label: '武威市', value: 'wuwei' },
    { label: '酒泉市', value: 'jiuquan' },
    { label: '张掖市', value: 'zhangye' },
    { label: '平凉市', value: 'pingliang' },
    { label: '庆阳市', value: 'qingyang' },
    { label: '定西市', value: 'dingxi' },
    { label: '陇南市', value: 'longnan' },
    { label: '临夏回族自治州', value: 'linxia' },
    { label: '甘南藏族自治州', value: 'gannan' },
],
宁夏: [
    { label: '银川市', value: 'yinchuan' },
    { label: '石嘴山市', value: 'shizuishan' },
    { label: '吴忠市', value: 'wuzhong' },
    { label: '固原市', value: 'guyuan' },
    { label: '中卫市', value: 'zhongwei' },
],
新疆: [
    { label: '乌鲁木齐市', value: 'wulumuqi' },
    { label: '克拉玛依市', value: 'kelamayi' },
    { label: '吐鲁番市', value: 'tulufan' },
    { label: '哈密市', value: 'hami' },
    { label: '和田市', value: 'hetian' },
    { label: '阿克苏市', value: 'akesu' },
    { label: '喀什市', value: 'kashi' },
    { label: '博尔塔拉蒙古自治州', value: 'boertala' },
    { label: '巴音郭楞蒙古自治州', value: 'bayinguoleng' },
    { label: '昌吉回族自治州', value: 'changji' },
    { label: '伊犁哈萨克自治州', value: 'yili' },
    { label: '塔城地区', value: 'tacheng' },
    { label: '阿勒泰地区', value: 'aletai' },
],
西藏: [
    { label: '拉萨市', value: 'lasa' },
    { label: '日喀则市', value: 'rikaze' },
    { label: '昌都市', value: 'changdu' },
    { label: '林芝市', value: 'linzhi' },
    { label: '山南市', value: 'shannan' },
    { label: '那曲市', value: 'naqu' },
    { label: '阿里地区', value: 'ali' },
],
青海: [
    { label: '西宁市', value: 'xining' },
    { label: '海东市', value: 'haidong' },
    { label: '海北藏族自治州', value: 'haibei' },
    { label: '黄南藏族自治州', value: 'huangnan' },
    { label: '海南藏族自治州', value: 'hainan' },
    { label: '果洛藏族自治州', value: 'guoluo' },
    { label: '玉树藏族自治州', value: 'yushu' },
    { label: '海西蒙古族藏族自治州', value: 'haixi' },
],
台湾: [
    { label: '台北市', value: 'taipei' },
    { label: '高雄市', value: 'kaohsiung' },
    { label: '台中市', value: 'taichung' },
    { label: '台南市', value: 'tainan' },
    { label: '新北市', value: 'newtaipei' },
    { label: '桃园市', value: 'taoyuan' },
    { label: '彰化县', value: 'zhanghua' },
    { label: '新竹市', value: 'hsinchu' },
    { label: '嘉义市', value: 'chiayi' },
    { label: '基隆市', value: 'keelung' },
    { label: '宜兰县', value: 'yilan' },
    { label: '花莲县', value: 'hualien' },
    { label: '台东县', value: 'tainan' },
    { label: '南投县', value: 'nantou' },
    { label: '屏东县', value: 'pingdong' },
    { label: '苗栗县', value: 'miaoli' },
    { label: '澎湖县', value: 'penghu' },
    { label: '金门县', value: 'kinmen' },
    { label: '连江县', value: 'lianjiang' },
],

      },
        
          
          dialogFormVisible:false,
          collectList:[],
          doms: {   //切歌变量  在钩子函数有设置
        audio: null, // 确保你的页面中有一个ID为'audio'的元素
        ul:null, // 这行代码可以正确获取到ID为'ul'的<ul>元素
        divcontroller:null // 这行代码可以正确获取到ID为'divcontroller'的<div>元素
      },
          arr:"",    //歌词数组
          lyric:false,
          setSong:{
            volume:"",
            isplay:"",
          },
          audioSrc: "", // 替换为你的音乐文件路径
          isPlayerVisible: false,
          activeIndex2:"0",
            volume: localStorage.getItem('volume'),
            progress: 0,          // 当前进度
            duration: 0,           //总时长
            updateTimeInterval: null,
            Issong:false,
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
            token:  (JSON.parse(localStorage.getItem('User')) || {}).token || "", // 从session存储获取 token
            restaurants:[],
            Search:"",
        };
 },
    methods:{
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
      axios.post("http://192.168.3.226:1111/api/comment",{
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
      axios.get("http://192.168.3.226:1111/api/comments",
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
        axios.post("http://192.168.3.226:1111/api/comment",{
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
     axios.put("http://192.168.3.226:1111/api/addmusic",{
        userId:this.data.userId,
        songId:songId 
     });
   }
  else
  {
   this.$message('已取消收藏');
   this.music = this.music.filter(song => song !== songId); 
   axios.delete("http://192.168.3.226:1111/api/delmusic",{
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
     
      summitHeadShot()
      { 
        this.$refs.imgHeadShot.validate((valid)=>{
               if(!valid) return ;
              console.log(this.Persong.url);
              this.data.headshot=this.Persong.url;
              localStorage.setItem('User',JSON.stringify(this.data));
              this.diaheadshotVisible=false;
              axios.put("http://192.168.3.226:1111/api/person",{
              userId:this.data.userId,
              userName:null,
              email:null,
              birthday:null,
              sex:null,
              region:null,
              briefIntroduction:null,
              headshot:this.data.headshot
        });
      });
        
      },
      changeHeadShot()
      {
        this.diaheadshotVisible=true;
        this.Persong.url='';
      },
       formatDateToMMDD(dateString) {
    const date = new Date(dateString);
    
    // 获取月份和日期
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${month}-${day}`;
},
      onProvinceChange() {
     
        
      this.Persong.city = ''; // 清空城市选择
    },
     summit()
     {
      this.$refs.PerFormRef.validate((valid)=>{
        if(!valid) return;
      this.data.userName=this.Persong.name;
      this.data.email=this.Persong.email;
      this.data.birthday=this.formatDateToMMDD(this.Persong.birthday);
      console.log(this.data.birthday);
      
      this.data.sex=this.Persong.sex;     
      if(this.Persong.province!='北京'&&this.Persong.province!='上海'&&this.Persong.province!='重庆')
      this.data.region=this.Persong.province+"-"+this.Persong.city;
      else
      this.data.region=this.Persong.province;
      this.data.briefIntroduction=this.Persong.brief;
      localStorage.setItem('User',JSON.stringify(this.data));
      this.dialogFormVisible=false;
      axios.put("http://192.168.3.226:1111/api/person",{
        userId:this.data.userId,
        userName:this.data.userName,
        email:this.data.email,
        birthday:this.data.birthday,
        sex:this.data.sex,
        region:this.data.region,
        briefIntroduction:this.data.briefIntroduction,
        headshot:null
        });
      });
     },
     changePerson()
     {
      this.Persong.name=this.data.userName;
      this.Persong.birthday=this.data.birthday;
      this.Persong.email=this.data.email;
      this.Persong.sex=this.data.sex;
      if(this.data.region!='北京'&&this.data.region!='上海'&&this.data.region!='重庆')
     {
      this.Persong.province=this.data.region.split("-")[0];
      this.Persong.city=this.data.region.split("-")[1];
     }
      else
      this.Persong.province=this.data.region;
      this.Persong.brief=this.data.briefIntroduction;
      this.dialogFormVisible=true;
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
      getLyric(text)
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
          { 
            let time=1000;
          let lyricContent="";
          finalLyric.push({ time, lyricContent});
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
       lyc()
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
        handleSelect(item){
           console.log(item);
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
        {
            if (this.$route.path !== '/api/Personalhome') {
            this.$router.push('/api/Personalhome');
        }
        }
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
    updateSong(totalTime)
      {
        this.duration=totalTime;
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
        this.progress = this.$parent.$refs.MusicPlay.currentTime;
       
        
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
          //console.log(this.progress + "-----" + this.duration);
          //console.log(this.progress + 0.9 >= this.duration + "这个第二个");
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
      this.restaurants =  this.loadAll();
      this.data=JSON.parse(localStorage.getItem('User'));
      const userId=this.data.userId;
    
      this.$store.state.img=JSON.parse(localStorage.getItem('Nowsong')).songImg;
        this.$store.state.title=JSON.parse(localStorage.getItem('Nowsong')).songName;
        this.$store.state.lyc=JSON.parse(localStorage.getItem('Nowsong')).songLyc;
        
       
      axios.get(`http://192.168.3.226:1111/api/collectList/${userId}`).then((result)=>{
                  this.collectList=result.data.data;
                  console.log(this.collectList);
                  
          });
          if(this.data)
  {
    axios.get("http://192.168.3.226:1111/api/music",{
        params:{
          userId:this.data.userId
        }
      }).then((result)=>
    {
     
      this.music=result.data.data;
      console.log(this.music);
      
    });
  }
      this.setDuration();
      //console.log(this.data); 
      window.addEventListener('mousemove', this.handleMouseMove);
      EventBus.$on('updateSong',this.updateSong);
      this.startUpdateTimer();
    },
    computed: {
    isLoggedIn() {
      return !!this.token; // 判断是否存在 token
    },
    filteredCities() {
      return this.Persong.province ? this.cities[this.Persong.province] : [];
    }
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    EventBus.$off('updateSong',this.updateSong);
    this.stopUpdateTimer();
  },
  created() {
    axios.get("http://192.168.3.226:1111/api/home").then((result)=>
      {
         this.$store.commit('setSongs',result.data.data);
          //console.log(this.$store.state.songs);
          this.$store.state.isShow=true;
      });


    if(localStorage.getItem('setSong')!=null)
     {
      this.setSong.volume=JSON.parse(localStorage.getItem('setSong')).volume;
      this.setSong.isplay=JSON.parse(localStorage.getItem('setSong')).isplay;
     }
     else
      localStorage.setItem('setSong',JSON.stringify(this.setSong));
    this.progress = this.$parent.$refs.MusicPlay.currentTime;
  },
  deactivated() {
    this.stopUpdateTimer();
  },
  activated() {
    this.startUpdateTimer();
  },
  
}
</script>

<style scoped>
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
  color: #ffffff; /* 设置字体颜色为白色（你可以根据需要修改颜色） */
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
.view-more {
  color: gray; /* 设置颜色为灰色 */
  text-decoration: none; /* 去掉默认下划线 */
}

.view-more:hover {
  text-decoration: underline; /* 鼠标悬停时添加下划线 */
}
  .custom-link {
    
    font-size: 14px;
    max-width: 150px; /* 设置最大宽度 */
    display: flex; 
    overflow-wrap: break-word; /* 允许长单词换行 */
    white-space: normal; /* 允许文本正常换行 */
  }
.everysongs{
  overflow: hidden; /* 确保放大后不会超出容器 */
  width: 100%; /* 设置图片宽度为容器的100% */
    transition: transform 0.3s ease; /* 添加过渡效果 */ 
}
.everysongs:hover {
    transform: scale(1.1); /* 鼠标悬停时放大10% */
}
.song-img {
    margin: 0px 20px;
  }
.new-class
{
  margin: 20px 20px;
}
.song-total-box
 {
  display: flex; /* 使盒子并排 */
  overflow: hidden; /* 隐藏滚动条 */
 }
.f-cb {
    display: flex; /* 使信息部分也使用Flexbox布局 */
    justify-content: space-between; /* 元素之间均匀分布 */
    
}
.container {
    margin: 30px 0px 0px 30px;
    justify-content: space-between; /* 元素之间均匀分布 */
}

#ava {
    position: absolute; /* 为绝对定位的子元素提供参考 */
}

#ava img {
    width: 180px; /* 自适应宽度 */
    height: 180px; /* 保持比例 */
    display: block; /* 避免底部留白 */
    border: 2px solid #000; /* 添加边框 */
}
.hover-text {
    display: none; /* 默认隐藏超链接文字 */
    position: absolute; /* 绝对定位 */
    bottom: 10px; /* 距离底部10px */
    left: 50%; /* 水平居中 */
    transform: translateX(-50%); /* 使其完全居中 */
    background-color: rgba(255, 255, 255, 0.8); /* 背景颜色 */
    padding: 5px;
    border-radius: 5px; /* 圆角边框 */
    z-index: 10; /* 确保超链接在最上层 */
    white-space: nowrap; /* 防止换行 */
    transition: display 0.3s; /* 添加过渡效果 */
    cursor: pointer; /* 悬停时鼠标变成手形 */
}

#ava:hover .hover-text {
    display: block; /* 鼠标悬停时显示超链接文字 */
}

.upload {
    display: block; /* 将链接转换为块级元素，以便包含整个区域 */
    position: relative; /* 为内部元素提供参考 */
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
.footer{
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
.image-container {
  margin: 0; /* 外边距为0 */
    padding: 0; /* 内边距为0 */
   
    
}

.img {
    margin: 0; /* 外边距为0 */
    padding: 0; /* 内边距为0 */
    width: 100%; /* 图片宽度为100% */
    height: 120vh;
    display: block; /* 去掉底部空隙 */
}
.main_box {
    width: 50%; /* 固定宽度 */
    height: 105%; /* 固定高度 */
    max-width: 50%;
    max-height: 120%;
    position: absolute; /* 绝对定位 */
    top: 50%; /* 垂直居中 */
    left: 50%; /* 水平居中 */
    transform: translate(-50%, -30%); /* 使元素完美居中 */
    background-color: rgba(255, 255, 255, 0.5); /* 设置背景色和透明度 */
    padding: 10px; /* 内边距 */
    border-radius: 5px; /* 圆角 */
    box-shadow: 0 2px 8px rgba(153, 55, 55, 0.2); /* 添加阴影 */
    overflow: auto; /* 如果内容超出，允许滚动 */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 隐藏滚动条 */
    
}
.button-container {
  position: relative; /* 为定位红点做准备 */
}
.rounded-button {
  border-radius: 20px; /* 设置按钮的圆角 */
  margin: 0 10px;
}

.red-dot {
  position: absolute;
  top: -3px; /* 调整红点位置 */
  right: 10px; /* 调整红点位置 */
  width: 10px; /* 红点的宽度 */
  height: 10px; /* 红点的高度 */
  background-color: red; /* 红点颜色 */
  border-radius: 50%; /* 圆形 */
}
.del-decoration{
    text-decoration: none; /* 去掉下划线 */
}
.login_div{
    padding: 0 40px;;
    display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
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
  background-color: black;
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
</style>