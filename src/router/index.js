import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
 
  {
    path :'/',
    redirect: '/api/home'
  },
  {
    path: '/api/music',
    name: 'music',
    component:() => import( '../components/mysongsView.vue')
  },
  {
    path: '/api/login',
    name: 'login',
    component:() => import( '../components/loginView.vue')
  },
  {
    path: '/api/home',
    name: 'home',
    component:() => import( '../components/HomeView.vue')
  },
  {
    path: '/api/Personalhome',
    name: 'Personalhome',
    component:() => import( '../components/PersonalhomeView.vue')
  },
  {
    path: '/api/songList',
    name: 'songList',
    component:() => import( '../components/songListView.vue')
  },
  {
    path: '/api/sort',
    name: 'sort',
    component:() => import( '../components/sortView.vue')
  },
  {
    path: '/api/msg',
    name: 'msg',
    component:() => import( '../components/MymessageView.vue')
  },
   {
    path: '/api/ranking',
    name: 'ranking',
    component:() => import( '../components/MusicRanking.vue')
  },
  {
    path: '/api/search',
    name: 'search',
    component:() => import( '../components/SearchView.vue')
  },
  {
    path: '/api/upload',
    name: 'upload',
    component:() => import( '../components/UplodMusicView.vue')
  },
  {
    path: '/api/test',
    name: 'test',
    component:() => import( '../components/testView.vue')
  },
  {
    path: '/api/review',
    name: 'review',
    component:() => import( '../components/ReviewView.vue')
  },
 
 
 
  
]

const router = new VueRouter({
  routes
})

router.beforeEach((to,from,next)=>
{
  //to 将要访问的路径
  //from 代表从哪一个路劲跳转过来
  //next 放行
 console.log(`路由守卫: ${from.path} → ${to.path}`);
  
  // 定义不需要登录的白名单
  const whiteList = ['/api/login', '/api/home', '/api/sort','/api/songList'];
  
  // 如果在白名单中，直接放行
  if (whiteList.includes(to.path)) {
    return next();
  }
  
  // 获取登录状态
  let token = null;
  try {
    const userStr = localStorage.getItem('User');
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user?.token;
    }
  } catch (error) {
    console.error('解析用户信息失败:', error);
  }
  
  // 如果没有token
  if (!token) {
    // 显示提示
    Vue.prototype.$message({
      showClose: true,
      message: '请先登录',
      type: 'error',
      duration: 1500
    });
    
    // 保存当前路径，登录后跳转回来
    sessionStorage.setItem('redirectUrl', to.fullPath);
    
    // 跳转到登录页
    return next('/api/login');
  }
  
  // 有token但访问登录页，跳转到首页
  if (token && to.path === '/api/login') {
    return next('/api/home');
  }
  
  // 其他情况正常放行
  next();
  
})
export default router
