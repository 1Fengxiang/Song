import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';

import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/global.css'
import store from './store';  // 确保 store 文件存在
// import { loadOml2d } from 'oh-my-live2d';
// const oml2d = loadOml2d({
//   models: [
//     {
//       path: 'https://model.oml2d.com/Pio/model.json',
//       scale: 0.4,
//       position: [0, 50],
//       stageStyle: {
//         height: 300
//       }
//     },
//     {
//       path: 'https://model.oml2d.com/Senko_Normals/senko.model3.json',
//       position: [-10, 20]
//     },
//     {
//       path: 'https://model.oml2d.com/cat-black/model.json',
//       scale: 0.15,
//       position: [0, 20],
//       stageStyle: {
//         height: 350
//       }
//     }
//   ]
// });

// // 词库
// const phrases = [
//   "你好！很高兴见到你。",
//   "今天的天气真不错！",
//   "你有什么有趣的事情吗？",
//   "我爱学习新知识！",
//   "你喜欢什么类型的音乐？",
//   "存在的意义在于追寻，而非抵达。",
//   "时间如沙，流逝之间，我们是否珍惜每一刻？",
//   "在虚无中，我们找到自我，选择定义存在的边界。",
//   "思考是自由的翅膀，能够超越现实的桎梏。",
//   "真理如同海洋，而我们的理解，只是一滴水。",
//   "简单的快乐才是真正的智慧。",
//   "人生的价值不在于拥有什么，而在于经历的风雨。",
//   "内心的平和，是对外界喧嚣的反叛。",
//   "爱与孤独是生命的两极，交织出真实的自我。",
//   "每个灵魂都是一部未完成的书，空白是无尽的可能。"
// ];

// oml2d.onLoad((status) => {
//   switch (status) {
//     case 'success':
//       console.log("加载成功");
//       break;
//     case 'fail':
//       console.log("加载失败");
//       break;
//     case 'loading':
//       console.log("加载中......");
//       break;
//   }
// });

// oml2d.onStageSlideIn(() => {
//   let intervalId;

//   const showMessage = () => {
//     const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
//     oml2d.tipsMessage(randomPhrase, 4000, 10);
//   };

//   showMessage();
//   intervalId = setInterval(showMessage, 20000);

//   // 处理点击事件
//   if (typeof oml2d.onClick === "function") {
//     oml2d.onClick(() => {
//       clearInterval(intervalId);
//       const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
//       oml2d.tipsMessage(randomPhrase, 4000, 10);
//     });
//   }

//   // 处理关闭事件
//   const closeHandler = () => {
//     clearInterval(intervalId);
//     console.log("Closed and interval cleared.");
//   };

//   if (typeof oml2d.onClose === "function") {
//     oml2d.onClose(closeHandler);
//   } else {
//     console.warn("onClose is not defined.");
//   }

//   // 如果 onClose 方法未定义，可以手动添加一个监听器
//   if (!oml2d.onClose) {
//     oml2d.onClose = closeHandler;
//     console.log("Fallback: onClose handler is now defined.");
//   }
// });
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
 