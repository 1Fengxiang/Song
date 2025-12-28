<template>
  <div class="music-review-container">
    <!-- 顶部标题和搜索 -->
     <el-button 
         
          type="text" 
          icon="el-icon-arrow-left" 
          @click="goBack">
          返回
        </el-button>
    <div class="review-header">
      <h2><i class="el-icon-notebook-2"></i> 音乐审核中心</h2>
      
      <div class="search-box">
        <el-input
          placeholder="搜索歌曲、歌手或专辑..."
          prefix-icon="el-icon-search"
          v-model="searchQuery"
          clearable
          @clear="fetchReviewList"
          @keyup.enter.native="fetchReviewList"
        ></el-input>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-radio-group v-model="filterStatus" @change="fetchReviewList">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="0">待审核</el-radio-button>
        <el-radio-button label="1">已通过</el-radio-button>
        <el-radio-button label="2">已拒绝</el-radio-button>
      </el-radio-group>

      <el-select v-model="sortBy" placeholder="排序方式" class="sort-select" @change="fetchReviewList">
        <el-option label="最新上传" value="newest"></el-option>
        <el-option label="按名称排序" value="name"></el-option>
        <el-option label="按类型排序" value="type"></el-option>
      </el-select>
    </div>

    <!-- 音乐审核列表 -->
    <div class="review-list">
      <el-card 
        v-for="item in reviewList" 
        :key="item.reviewId"
        class="review-card"
        :class="{
          'pending-card': item.reviewStatus === '0',
          'approved-card': item.reviewStatus === '1',
          'rejected-card': item.reviewStatus === '2'
        }"
      >
        <div class="card-content">
          <!-- 左侧封面 -->
          <div class="music-cover" :style="{ backgroundImage: `url(${item.reviewImg || defaultCover})` }">
            <i v-if="!item.review_img" class="el-icon-headset"></i>
          </div>

          <!-- 中间内容 -->
          <div class="music-info">
            <h3>{{ item.reviewSongName }}</h3>
            <div class="meta-info">
              <span><i class="el-icon-user"></i> 歌手ID: {{ item.reviewSinger }}</span>
              <span><i class="el-icon-folder-opened"></i> 专辑ID: {{ item.reviewSongAlbum }}</span>
              <span><i class="el-icon-time"></i> {{ formatDate(item.reviewTime) }}</span>
            </div>

            <div class="music-type">
              <el-tag size="small" :type="getTagType(item.reviewType)">
                {{ item.reviewType || '未知类型' }}
              </el-tag>
            </div>

            <div class="music-player">
              <audio 
                controls
                class="audio-player"
                :src="item.reviewFilepath"
              >您的浏览器不支持音频元素</audio>
            </div>
          </div>

          <!-- 右侧操作 -->
          <div class="action-buttons">
            <div class="status-display">
              <el-tag 
                :type="getStatusTagType(item.reviewStatus)"
                effect="light"
                class="status-tag"
              >
                {{ getStatusText(item.reviewStatus) }}
              </el-tag>
            </div>

            <div v-if="item.reviewStatus === '0' " class="review-actions">
              <el-button 
                type="success" 
                size="small"
                icon="el-icon-check"
                @click="approveReview(item.reviewId)"
              >
                通过
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                icon="el-icon-close"
                @click="showRejectDialog(item.reviewId)"
              >
                拒绝
              </el-button>
            </div>

            <div v-if="item.reviewStatus === '2'" class="reject-reason">
              <p><strong>拒绝原因：</strong>{{  '无具体原因' }}</p>
            </div>
          </div>
        </div>

        <!-- 歌词预览 -->
        <div v-if="item.reviewLyc" class="lyrics-preview">
          <el-collapse>
            <el-collapse-item title="查看歌词">
              <pre class="lyrics-content">{{ item.reviewLyc }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      ></el-pagination>
    </div>

    <!-- 拒绝原因对话框 -->
    <el-dialog 
      title="填写拒绝原因" 
      :visible.sync="rejectDialogVisible" 
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectForm">
        <el-form-item prop="reason">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请详细说明拒绝原因..."
            v-model="rejectForm.reason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReject">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      // 审核列表数据
      reviewList: [],
      // 搜索查询
      searchQuery: '',
      // 筛选状态
      filterStatus: 'all',
      // 排序方式
      sortBy: 'newest',
      // 分页信息
      totalItems: 0,
      pageSize: 10,
      currentPage: 1,
      // 拒绝相关
      rejectDialogVisible: false,
      currentRejectId: null,
      rejectForm: {
        reason: ''
      },
      rejectRules: {
        reason: [
          { required: true, message: '请填写拒绝原因', trigger: 'blur' },
          { min: 10, message: '拒绝原因至少需要10个字符', trigger: 'blur' }
        ]
      },
      // 默认封面图
      defaultCover: 'https://via.placeholder.com/150x150?text=Music+Cover'
    }
  },
  created() {
    this.fetchReviewList();
  },
  methods: {
     goBack() {
      this.$router.go(-1); // 返回上一页
      // 或者使用以下方式返回特定路由
      // this.$router.push('/music-list'); // 返回到音乐列表页
    },
    // 获取审核列表
    fetchReviewList() {
      

      console.log(this.currentPage);
      
      axios.get('http://localhost:1111/api/review/list',
      {
        params:{
        page: this.currentPage,
        size: this.pageSize,
        search: this.searchQuery,
        status: this.filterStatus === 'all' ? null : this.filterStatus,
        sort: this.sortBy
        }
        
      })
        .then(response => {
         console.log(response);
         this.reviewList=response.data.data.list
        })  
        .catch(error => {
          this.$message.error('获取审核列表失败: ' + error.message);
        });
    },
    
    // 审核通过
    approveReview(reviewId) {
      this.$confirm('确定要通过这首音乐吗?', '审核确认', {
        confirmButtonText: '确定通过',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post(`http://localhost:1111/api/review/approve/${reviewId}`)
          .then(() => {
            this.$message.success('审核通过成功');
            this.fetchReviewList();
          })
          .catch(error => {
            this.$message.error('操作失败: ' + error.message);
          });
      }).catch(() => {
        this.$message.info('已取消操作');
      });
    },
    
    // 显示拒绝对话框
    showRejectDialog(reviewId) {
      this.currentRejectId = reviewId;
      this.rejectForm.reason = '无具体原因';
      this.rejectDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.rejectForm.clearValidate();
      });
    },
    
    // 确认拒绝
    confirmReject() {
      this.$refs.rejectForm.validate(valid => {
        if (valid) {
          axios.post(`http://localhost:1111/api/review/reject/${this.currentRejectId}`).then(() => {
            this.$message.success('拒绝成功');
            this.rejectDialogVisible = false;
            this.fetchReviewList();
          }).catch(error => {
            this.$message.error('操作失败: ' + error.message);
          });
        }
      });
    },
    
    // 分页变化
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchReviewList();
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未知时间';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    
    // 获取状态标签类型
    getStatusTagType(status) {
      switch (status) {
        case '1': return 'success';
        case '2': return 'danger';
        default: return 'warning';
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      switch (status) {
        case '1': return '已通过';
        case '2': return '已拒绝';
        default: return '待审核';
      }
    },
    
    // 获取类型标签样式
    getTagType(type) {
      const typeMap = {
        '流行': '',
        '摇滚': 'danger',
        '民谣': 'success',
        '古典': 'info',
        '电子': 'warning'
      };
      return typeMap[type] || '';
    }
  }
}
</script>

<style scoped>
.music-review-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.review-header h2 {
  color: #ff7eb9;
  font-weight: 500;
  margin: 0;
}

.search-box {
  width: 350px;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.sort-select {
  width: 150px;
}

.review-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.review-card {
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid #e6a23c;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.review-card.pending-card {
  border-left-color: #e6a23c;
}

.review-card.approved-card {
  border-left-color: #67c23a;
}

.review-card.rejected-card {
  border-left-color: #f56c6c;
}

.card-content {
  display: flex;
  padding: 15px;
}

.music-cover {
  width: 120px;
  height: 120px;
  background-color: #f5f7fa;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff7eb9;
  font-size: 40px;
  margin-right: 20px;
  flex-shrink: 0;
}

.music-info {
  flex-grow: 1;
  min-width: 0;
}

.music-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #909399;
  font-size: 13px;
  margin-bottom: 10px;
}

.music-type {
  margin: 10px 0;
}

.audio-player {
  width: 100%;
  margin: 10px 0;
}

.action-buttons {
  width: 200px;
  padding-left: 20px;
  border-left: 1px dashed #ebeef5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.status-tag {
  width: 100%;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
}

.review-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.reject-reason {
  margin-top: 15px;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}

.lyrics-preview {
  margin-top: 15px;
  border-top: 1px solid #ebeef5;
}

.lyrics-content {
  white-space: pre-wrap;
  font-family: 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
  color: #606266;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
}

.pagination {
  margin-top: 30px;
  text-align: center;
}

@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
  }
  
  .music-cover {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .action-buttons {
    width: 100%;
    padding-left: 0;
    border-left: none;
    border-top: 1px dashed #ebeef5;
    padding-top: 15px;
    margin-top: 15px;
  }
  
  .review-actions {
    justify-content: center;
  }
}
</style>