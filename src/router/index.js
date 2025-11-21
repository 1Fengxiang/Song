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
 
  if(to.path==='/api/home') return next();
  if(to.path==='/api/login') return next(); 
  if(to.path==='/api/cal')   return next();
  if(to.path==='/api/sort') return next();
  if(to.path==='/api/songList')
  {
 
    return next();
  }
 
  let token;
  if(JSON.parse(localStorage.getItem('User')))
  token=JSON.parse(localStorage.getItem('User')).token;
  else token=null;
 
  if(!token) { 

    Vue.prototype.$message({
      showClose: true,
      message: '请先登录',
      type: 'error',
      duration: 1500
    });
     return next('/api/login');
    }
    next();
  
})
export default router
