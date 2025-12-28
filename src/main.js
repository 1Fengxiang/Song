import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';

import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/global.css'
import store from './store';  // 确保 store 文件存在
Vue.config.productionTip = false
Vue.use(ElementUI);
if (localStorage.getItem('User')) {
  store.dispatch('initWebSocket')
}

new Vue({
  store, 
  router,
  render: h => h(App)
}).$mount('#app')
 