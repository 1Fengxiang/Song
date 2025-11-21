<template>
    <el-upload :auto-upload="false" :on-change="handleFileChange">
  <el-button>选择文件</el-button>
</el-upload>
</template>
<script>
import axios from 'axios';
export default {
    methods: {
  handleFileChange(file) {
    const formData = new FormData();
      formData.append('file', file.raw);
    console.log(file.raw); // File 对象，包含 name/size/type 等属性
     axios.post('http://192.168.3.226:1111/api/upload/music', formData)                   
      .then(response => {
        console.log('收到上传的消息',response.data);
        
      })
     
    },
  }
}
</script>