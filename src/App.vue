<template>
  <div id="app">
    <router-view />
    <audio
      loop="loop"
      preload="auto"
      id="bgmusic"
      controls="controls"
      ref="MusicPlay"
      style="display: none;"
      @loadedmetadata="setDuration"
      @ended="handleSongEnd"
      @play="startTimer"
      @pause="clearTimer"
      @seeking="handleSeeking"  
    >
      <source :src="song" type="audio/mpeg" />
    </audio>
  </div>
</template>

<script>
import { EventBus } from './eventBus';
import axios from 'axios';
export default {
  data() {
    return {
      timer: null,
      checkInterval: 1000,
      song: "",
      duration: 0,
      hasCounted: false,
      currentSongId: null,       // 新增当前歌曲ID记录
      effectivePlayTime: 0,      // 新增有效播放时长累计
      lastPlayTime: 0,           // 用于检测暂停时间
      isSeeking: false           // 标记是否正在拖动进度条
    }
  },
  mounted() {
    EventBus.$on('changeSong', this.changeSong);
    this.$refs.MusicPlay.volume = JSON.parse(localStorage.getItem('setSong')).volume;
    
    // 新增页面可见性监听
    // document.addEventListener('visibilitychange', this.handleVisibilityChange);
    // window.addEventListener('blur', this.handleWindowBlur);
  },
  beforeDestroy() {
    EventBus.$off('changeSong', this.changeSong);
    this.clearTimer();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
  },
  methods: {
    changeSong(song) {
      this.clearTimer();
      this.song = song; // 假设song对象包含url属性
     
      this.hasCounted = false;
      this.effectivePlayTime = 0;
      
      const musicPlayer = this.$refs.MusicPlay;
      musicPlayer.load();
      
      musicPlayer.addEventListener('canplaythrough', () => {
        musicPlayer.play().catch(error => {
          this.$message.error('播放错误，请等待');
          console.error('播放失败:', error);
        });
      }, { once: true });
    },
    setDuration() {
      this.duration = this.$refs.MusicPlay.duration;
      EventBus.$emit('updateSong', this.duration);
    },
    startTimer() {
   
     
       this.clearTimer();
    console.log(this.duration);
    
    // 重置计时相关变量
    this.lastPlayTime = Date.now();
    this.effectivePlayTime = 0;
    this.hasCounted = false;
     
      this.timer = setInterval(() => {
      this.updatePlayTime();
    }, this.checkInterval || 1000); // 默认1秒检查一次
  },
   updatePlayTime() {
  // 检查音频是否还在播放
  if (!this.$refs.MusicPlay || this.$refs.MusicPlay.paused) {
    console.log("音频已暂停，停止计时");
    this.clearTimer();
    return;
  }
  
  // 只在播放状态且未拖动时累计
  if (!this.$refs.MusicPlay.paused && !this.isSeeking) {
    const now = Date.now();
    
    // 计算实际播放时长（考虑暂停、拖动等）
    if (this.lastPlayTime) {
      this.effectivePlayTime += (now - this.lastPlayTime);
    }
    
    this.lastPlayTime = now;
    
    // 转换为秒，便于理解和比较
    const playedSeconds = this.effectivePlayTime / 1000;
    
    // console.log(`累计播放时间: ${playedSeconds.toFixed(1)}秒`);
    
    // 计算需要的时间（秒）：总时长的一半 ÷ 播放速度
    // this.duration 是秒，playbackRate 是倍速
    const requiredSeconds = (this.duration * 0.5) / (this.$refs.MusicPlay.playbackRate || 1);
    
    // console.log(`需要时间: ${requiredSeconds.toFixed(1)}秒, 已播放: ${playedSeconds.toFixed(1)}秒`);
    
    // 比较秒数
    if (playedSeconds >= requiredSeconds && !this.hasCounted) {
      console.log("达到播放条件，增加播放次数");
      this.incrementPlayCount();
      this.clearTimer();
      this.hasCounted = true;
    }
  }
},
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    handleSeeking() {
      this.isSeeking = true;
      // 短暂延迟后重置状态，避免快速拖动产生多次事件
      setTimeout(() => {
        this.isSeeking = false;
        this.lastPlayTime = Date.now(); // 重置最后播放时间
      }, 200);
    },
    handleVisibilityChange() {
      // if (document.hidden) {
      //   // 页面隐藏时暂停计时
      //   if (this.timer) {
      //     this.clearTimer();
      //   }
      // } else if (!this.$refs.MusicPlay.paused) {
      //   // 页面重新显示时恢复计时
      //   this.startTimer();
      // }
    },
    handleWindowBlur() {
      // 窗口失去焦点时同样暂停计时
      if (this.timer) this.clearTimer();
    },
    incrementPlayCount() {
      this.hasCounted = true;
      console.log("计数成功", {
        songId: 1,
        duration: this.duration
      });
       axios.put("http://localhost:1111/api/addNumber",{
            songId:JSON.parse(localStorage.getItem('Nowsong')).songId,
            userId:JSON.parse(localStorage.getItem('User')).userId,
            
            playTime:parseInt(this.duration)
          },
         );
    },
    handleSongEnd() {
      if (!this.hasCounted && this.currentSongId) {
        this.incrementPlayCount();
      }
      this.clearTimer();
    }
  }
}
</script>
