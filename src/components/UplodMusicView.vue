<template>
     <div>
    <!-- 添加顶部过渡区域 -->
    <div class="page-header"></div>
 <div class="music-upload-container">
      <div class="upload-header">
        <!-- 添加返回按钮 -->
        <el-button 
          class="back-button" 
          type="text" 
          icon="el-icon-arrow-left" 
          @click="goBack">
          返回
        </el-button>
        <h2>分享你的音乐</h2>
        <p>让世界听到你的声音</p>
      </div>
    
    <div class="upload-form">
      <el-form ref="form" :model="song" label-width="120px" :rules="rules">
        <!-- 歌曲基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-form-item label="歌曲名称" prop="reviewSongName" >
            <el-input v-model="song.reviewSongName" placeholder="请输入歌曲名称"></el-input>
          </el-form-item>
          
          <el-form-item label="歌手" prop="reviewSinger">
            <el-select v-model="song.reviewSinger" filterable placeholder="请选择歌手">
              <el-option
                v-for="singer in singers"
                :key="singer.id"
                :label="singer.name"
                :value="singer.id">
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="专辑" prop="reviewSongAlbum"  >
            <el-select v-model="song.reviewSongAlbum" filterable placeholder="请选择专辑">
              <el-option
                v-for="album in albums"
                :key="album.id"
                :label="album.name"
                :value="album.id">
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="歌曲类型" prop="reviewType">
            <el-select v-model="song.reviewType" placeholder="请选择歌曲类型">
              <el-option label="流行" value="流行"></el-option>
              <el-option label="摇滚" value="摇滚"></el-option>
              <el-option label="民谣" value="民谣"></el-option>
              <el-option label="电子" value="电子"></el-option>
              <el-option label="古典" value="古典"></el-option>
              <el-option label="爵士" value="爵士"></el-option>
              <el-option label="其他" value="其他"></el-option>
            </el-select>
          </el-form-item>
        </div>
        
        <!-- 文件上传 -->
        <div class="form-section">
          <h3 class="section-title">上传文件</h3>
          <el-form-item label="音乐文件" prop="reviewFilepath">
            <el-upload
    class="upload-file"
    :auto-upload="false"
    action="#"
    :before-upload="beforeMusicUpload"
    :on-success="handleMusicSuccess"
    :on-error="handleMusicError"
    :limit="1"
    :show-file-list="true"
    accept="audio/*"
    
    :on-change="handleMusicChange"
    :file-list="fileList">
    <el-button size="small" type="primary">点击上传</el-button>
    <div slot="tip" class="el-upload__tip">请上传MP3、WAV等音频文件，大小不超过50MB</div>
    <div v-if="uploadProgress > 0" class="progress-bar">
      <el-progress :percentage="uploadProgress"></el-progress>
    </div>
  </el-upload>
          </el-form-item>
          
          <el-form-item label="封面图片" prop="reviewImg">
    <el-upload
      class="upload-image"
      :auto-upload="false"
      action="#"
      :before-upload="beforeImageUpload"
      :on-success="handleImageSuccess"
      :on-error="handleImageError"
      :show-file-list="false"
      :on-change="handleImageChange">
      <img v-if="song.reviewImg" :src="song.reviewImg" class="cover-image">
      <i v-else class="el-icon-plus cover-uploader-icon"></i>
    </el-upload>
    <div slot="tip" class="el-upload__tip">建议尺寸: 300x300像素，大小不超过2MB</div>
  </el-form-item>
        </div>
        
        <!-- 歌词 -->
        <div class="form-section">
          <h3 class="section-title">歌词</h3>
          <el-form-item prop="reviewLyc">
            <el-input
              type="textarea"
              :rows="8"
              placeholder="请输入歌词内容，支持LRC格式"
              v-model="song.reviewLyc">
            </el-input>
          </el-form-item>
        </div>
        
        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="submitForm" :loading="loading">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
  </div>

</template>


<script>
import axios from 'axios';
export default {
  data() {
    return {
      playMode: 1,
      fileList:[],
      uploadProgress: 0,
      imageUploadProgress: 0,
      imageFile: null ,// 存储选中的图片文件
      loading: false,
      song: {
        reviewSongName: '',
        reviewSinger: '',
        reviewFilepath: '',
        reviewSongAlbum: '',
        reviewLyc: '',
        reviewImg: '',
        reviewType: '',
        reviewTime: 0
      },
      singers: [], // 从API获取的歌手列表
      albums: [], // 从API获取的专辑列表
      rules: {
        reviewSongName: [
          { required: true, message: '请输入歌曲名称', trigger: 'blur' },
          { min: 1, max: 255, message: '长度在1到255个字符', trigger: 'blur' }
        ],
        reviewSinger: [
          { required: true, message: '请选择歌手', trigger: 'change' }
        ],
        reviewFilepath: [
          { required: true, message: '请上传音乐文件', trigger: 'change' }
        ],
        reviewType: [
          { required: true, message: '请选择歌曲类型', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchSingers();
    this.fetchAlbums();
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
   handleImageChange(file) {
      if (file) {
       const formData = new FormData();
      formData.append('file', file.raw);
      this.imageUploadProgress = 0;
      axios.post('http://localhost:1111/api/upload/image', formData)
      .then(response => {
       this.song.reviewImg=response.data.data
        // console.log(this.song.song_img);
        
      })
      .catch(error => {
        this.imageUploadProgress = 0;
        console.error('图片上传错误:', error);
       
      });

      }
    },
     handleMusicChange(file) {
      if (file) {
       const formData = new FormData();
      formData.append('file', file.raw);
    console.log(file.raw); // File 对象，包含 name/size/type 等属性
     axios.post('http://localhost:1111/api/upload/music', formData)
     
      .then(response => {
        this.song.reviewFilepath=response.data.data;
        console.log('收到上传的消息',response.data);
        
      })
      }
    },
    
     goBack() {
      this.$router.go(-1); // 返回上一页
      // 或者使用以下方式返回特定路由
      // this.$router.push('/music-list'); // 返回到音乐列表页
    },
    fetchSingers() {
      // 调用API获取歌手列表
      axios.get('http://localhost:1111/api/upload/singer').then(response => {
        console.log(response.data);
        
        this.singers = response.data.data;
      }).catch(error => {
        console.error('获取歌手列表失败:', error);
      });
    },
    fetchAlbums() {
      // 调用API获取专辑列表
     axios.get('http://localhost:1111/api/upload/albums').then(response => {
        this.albums = response.data.data;
      }).catch(error => {
        console.error('获取专辑列表失败:', error);
      });
    },
    beforeMusicUpload(file) {
      const isAudio = file.type.includes('audio/');
      const isLt50M = file.size / 1024 / 1024 < 50;
      
      if (!isAudio) {
        this.$message.error('只能上传音频文件!');
      }
      if (!isLt50M) {
        this.$message.error('音频文件大小不能超过50MB!');
      }
      
      return isAudio && isLt50M;
    },
    handleMusicSuccess(response, file) {
      console.log(file);
      
      this.song.reviewFilepath = response.filepath;
      // 获取音频时长
      this.getAudioDuration(file.raw);
    },
    handleMusicError(err) {
      console.error('Axios上传错误:', err);
      
      if (err.response) {
        // 服务器返回了错误状态码
        const status = err.response.status;
        if (status === 404) {
          this.$message.error('上传接口不存在 (404)');
        } else if (status === 413) {
          this.$message.error('文件太大，服务器拒绝接收');
        } else if (status >= 500) {
          this.$message.error('服务器内部错误，请稍后重试');
        } else {
          this.$message.error(`上传失败: ${err.response.data.message || '未知错误'}`);
        }
      } else if (err.request) {
        // 请求已发出但没有收到响应
        this.$message.error('网络错误，请检查连接');
      } else {
        // 其他错误
        this.$message.error('上传失败: ' + err.message);
      }
    },
  beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB!');
        return false;
      }
      
      return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const width = img.width;
          const height = img.height;
          const ratio = Math.max(width / height, height / width);
          
          if (ratio > 2.5) {
            this.$message.error('图片长宽比不能超过1:2.5');
            resolve(false);
          } else {
            resolve(true);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(true);
        };
        
        img.src = objectUrl;
      });
    },
    
    checkImageDimensions(file) {
      return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const width = img.width;
          const height = img.height;
          
          // 检查长宽比（1:2.5以内）
          const ratio = Math.max(width / height, height / width);
          if (ratio > 2.5) {
            this.$message.error('图片长宽比不能超过1:2.5');
            resolve(false);
          } else {
            resolve(true);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(true); // 如果无法读取尺寸，也允许上传
        };
        
        img.src = objectUrl;
      });
    },
    
    handleImageSuccess(response) {
      if (response && response.filepath) {
        this.song.reviewImg = response.filepath;
        this.$message.success('封面图片上传成功!');
      } else {
        this.$message.error('上传成功但未返回文件路径');
      }
    },
   handleImageError(err) {
      console.error('图片上传错误详情:', err);
      
      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          this.$message.error('图片上传接口不存在 (404)');
        } else if (status === 413) {
          this.$message.error('图片文件太大，服务器拒绝接收');
        } else if (status === 415) {
          this.$message.error('不支持的图片格式');
        } else if (status >= 500) {
          this.$message.error('服务器内部错误，请稍后重试');
        } else {
          const errorMsg = err.response.data?.message || '上传失败';
          this.$message.error(`图片上传失败: ${errorMsg}`);
        }
      } else if (err.request) {
        this.$message.error('网络错误，请检查连接后重试');
      } else {
        this.$message.error('图片上传失败: ' + err.message);
      }
    },
    getAudioDuration(file) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        this.song.reviewTime = Math.round(audio.duration);
      };
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true;
          console.log(this.song);
          
          axios.post('http://localhost:1111/api/upload/submit', this.song)
            .then(response => {
                console.log(response);
                
              this.$message.success('歌曲上传成功!');
              this.resetForm();
            })
            .catch(error => {
              console.log(error);
              
              this.$message.error('歌曲上传失败: ' + error.message);
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    resetForm() {
      this.$refs.form.resetFields();
    }
  }
}
</script>

<style scoped>

/* 添加整体背景色 */
body {
  background-color: #f5f5f0; /* 米色背景 */
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.upload-header {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  padding: 20px 0;
  position: relative; /* 为绝对定位的返回按钮提供参照 */
}

.back-button {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #6b8e23;
  font-size: 16px;
  padding: 0 15px;
}

.back-button:hover {
  color: #5a7a1b;
  background-color: rgba(107, 142, 35, 0.1);
}

/* 顶部渐变过渡效果 */
.page-header {
  height: 100px;
  background: linear-gradient(to bottom, #f8f4e8, #f5f5f0);
  position: relative;
  margin-bottom: 40px;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, rgba(245,245,240,0.8), rgba(245,245,240,0));
}

.music-upload-container {
  max-width: 800px;
  margin: -100px auto 50px;
  padding: 30px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}



.upload-header h2 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #6b8e23; /* 橄榄绿色标题 */
  font-weight: 300;
  letter-spacing: 1px;
}

.upload-header p {
  font-size: 16px;
  color: #888;
  font-style: italic;
}

.form-section {
  margin-bottom: 25px;
  padding: 25px;
  background-color: #fafafa;
  border-radius: 10px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #6b8e23;
  font-size: 18px;
  font-weight: 400;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.upload-file {
  width: 100%;
}

.cover-image {
  width: 150px;
  height: 150px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.cover-image:hover {
  transform: scale(1.02);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #ccc;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
  border: 1px dashed #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.cover-uploader-icon:hover {
  border-color: #6b8e23;
  color: #6b8e23;
  background-color: #f5f5f0;
}

.form-actions {
  text-align: center;
  margin-top: 30px;
}

.el-button {
  padding: 12px 30px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.el-button--primary {
  background-color: #6b8e23;
  border-color: #6b8e23;
}

.el-button--primary:hover {
  background-color: #5a7a1b;
  border-color: #5a7a1b;
}

.el-upload__tip {
  color: #888;
  font-size: 13px;
  margin-top: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .music-upload-container {
    margin: -60px 15px 30px;
    padding: 20px;
  }
  
  .page-header {
    height: 150px;
  }
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