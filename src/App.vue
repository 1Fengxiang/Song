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
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
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
   
     
      
      this.lastPlayTime = Date.now();
      this.timer = setInterval(() => {
        
           console.log("开始计时");
        // 只在播放状态且未拖动时累计
        if (!this.$refs.MusicPlay.paused && !this.isSeeking) {
          
          const now = Date.now();
          this.effectivePlayTime += (now - this.lastPlayTime);
          this.lastPlayTime = now;
          
          // 动态计算（支持倍速播放）
          const requiredTime = (this.duration * 500) / (this.$refs.MusicPlay.playbackRate || 1);
          
          if (this.effectivePlayTime >= requiredTime && !this.hasCounted) {
            this.incrementPlayCount();
            this.clearTimer();
          }
        }
      }, this.checkInterval);
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
      if (document.hidden) {
        // 页面隐藏时暂停计时
        if (this.timer) {
          this.clearTimer();
        }
      } else if (!this.$refs.MusicPlay.paused) {
        // 页面重新显示时恢复计时
        this.startTimer();
      }
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
       axios.put("http://192.168.3.226:1111/api/addNumber",{
            songId:JSON.parse(localStorage.getItem('Nowsong')).songId,
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
