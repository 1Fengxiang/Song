<template>
  <div>
    <!-- 搜索触发区域 -->
    <div class="search-trigger">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索歌曲..."
        @keyup.enter="searchMusic"
      >
      <button @click="searchMusic">搜索</button>
    </div>

    <!-- 搜索结果弹框 -->
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
              v-for="song in searchResults" 
              :key="song.id"
              :class="{ active: currentSong && currentSong.id === song.id }"
              @click="playSong(song)"
            >
              <img :src="song.cover" class="song-cover">
              <div class="song-info">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ song.artist }} - {{ song.album }}</div>
              </div>
              <div class="song-duration">{{ formatDuration(song.duration) }}</div>
              <button 
                class="play-btn"
                @click.stop="playSong(song)"
              >
                {{ currentSong && currentSong.id === song.id && isPlaying ? '❚❚' : '▶' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicSearchModal',
  data() {
    return {
      searchQuery: '青花',  // 默认搜索词
      searchResults: [],    // 搜索结果
      showModal: false,     // 是否显示弹框
      loading: false,       // 是否正在加载
      currentSong: null,    // 当前播放的歌曲
      isPlaying: false      // 是否正在播放
    }
  },
  methods: {
    // 搜索音乐
    searchMusic() {
      if (!this.searchQuery.trim()) return
      
      this.loading = true
      this.showModal = true
      this.searchResults = [] // 清空之前的结果
      
      // 模拟API请求延迟
      setTimeout(() => {
        this.searchResults = this.getMockData(this.searchQuery)
        this.loading = false
      }, 800)
    },
    
    // 获取模拟数据
    getMockData(query) {
      const mockData = [
        {
          id: 1,
          name: '青花瓷',
          artist: '周杰伦',
          album: '我很忙',
          duration: 239, // 秒
          cover: 'https://p2.music.126.net/s6zFxvXe5kOxub4_x4rZhQ==/109951163052847567.jpg'
        },
        {
          id: 2,
          name: '青花',
          artist: '周传雄',
          album: '蓝色土耳其',
          duration: 273,
          cover: 'https://p2.music.126.net/1N1q9qyA8X3GQk9Fq0x9iQ==/109951163052847567.jpg'
        },
        {
          id: 3,
          name: '青花梦',
          artist: '许嵩',
          album: '梦游计',
          duration: 210,
          cover: 'https://p2.music.126.net/fZFrplIVr6L4Lb3FpJl4nQ==/109951163052847567.jpg'
        }
      ]
      
      // 简单模拟搜索过滤
      return mockData.filter(song => 
        song.name.includes(query) || 
        song.artist.includes(query)
      )
    },
    
    // 播放歌曲
    playSong(song) {
      if (this.currentSong && this.currentSong.id === song.id) {
        // 如果是同一首歌，切换播放状态
        this.isPlaying = !this.isPlaying
      } else {
        // 新歌曲
        this.currentSong = song
        this.isPlaying = true
        
        // 在实际应用中，这里应该调用音频播放
        console.log('播放:', song.name)
      }
    },
    
    // 关闭弹框
    closeModal() {
      this.showModal = false
    },
    
    // 格式化歌曲时长
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }
  }
}
</script>

<style scoped>
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
</style>
