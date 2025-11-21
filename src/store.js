// import Vue from 'vue';
// import Vuex from 'vuex';
// import { EventBus } from '@/eventBus';
// import { Howl } from 'howler'; // 引入 howler.js
// Vue.use(Vuex);



// export default new Vuex.Store({
//   state: {
//      audioEnabled: true,
//      messageSound: new Howl({  // 🔥 全局维护一个实例
//       src: [require('@/assets/消息提示.mp3')],
//       volume: 0.5,
//       preload: true,
//       onloaderror: (id, err) => {
//         console.error("音效加载失败:", err);
//       }
//     }),
//     isplay: true, //是否在播放
//     songs:[{
//       songAlbum: "",
//       songFilepath: "",
//       songId: "",
//       songImg: "",
//       songLyc: "",
//       songName: "",
//       songSinger: "",
//       songNumber:"",
//       songType:"",
//       songTime:""
//     },],
//   isShow:false,
//   palySongindex:0,
//   img:"",
//   title:"",
//   lyc:"",
//   finalLyric:[{time:"",lyricContent:""},],
//   unreadCount: 0,     // 未读消息数
//   ws: null,           // WebSocket实例
//   notifications: [],   // 消息列表
//   haveAnymsg:false,   //是否有未读消息
//   message:''
//   },
//   mutations: {
//     TOGGLE_AUDIO(state) {
//       state.audioEnabled = !state.audioEnabled;
//     },
//     setSongs(state, songs) {
//       state.songs = songs;
//     },
//     setisShow(state,isShow)
//     {
//       state.isShow=isShow;
//     },
//     setImg(state,img)
//     {
//       console.log("这里记录了头像");
      
//       state.img=img;
//     },
//     setTitle(state,title)
//     {
//       state.title=title;
//     },
//     setLyc(state,lyc)
//     {
//       state.lyc=lyc;
//     },

//     SET_WS(state, ws) {
//       state.ws = ws
//     },
//     ADD_NOTIFICATION(state, msg) {
//       state.notifications.unshift(msg)
//       if (!msg.isRead) state.unreadCount++
//     },
//     MARK_READ(state, msgId) {
//       const msg = state.notifications.find(m => m.id === msgId)
//       if (msg) {
//         msg.isRead = true
//         state.unreadCount--
//       }
//     },
//     RESET(state) {
//       state.unreadCount = 0
//       state.notifications = []
//       if (state.ws) state.ws.close()
//     },
//     SET_MSG(state,flag){
//       state.haveAnymsg=flag
//     },
//     SET_Message(state,message){
//       state.message=message
//     }
//   },
//   actions: {
//      initWebSocket({ commit, state }) {
//       const user=JSON.parse(localStorage.getItem('User'));
//       if(user!=null)
//       {
       
//           const unlockAudio = () => {
//       if (state.messageSound.state() === "loaded") {
//         console.log("播放");
        
//         state.messageSound.play();  // 静音播放一次以解锁
//         state.messageSound.stop();
//         document.removeEventListener("click", unlockAudio); // 解绑
//       }
//     };
//     document.addEventListener("click", unlockAudio);

//         console.log("websocket已开启");
      
//         // 确保用户已登录
//         const userId =user.userId
//         if (!userId) return
  
//         const ws = new WebSocket(`ws://192.168.3.226:1111/ws?userId=${userId}`);
//         ws.onopen = (event) =>{
//          console.log(event);
       
//       };
    
//         ws.onmessage = (event) => {
        
          
          
//           // const msg = JSON.parse(event.data)
//           // commit('ADD_NOTIFICATION', {
//           //   ...msg,
//           //   isRead: false,
//           //   id: Date.now()
//           // })
//           // console.log(event.data);
//           commit('SET_Message', event.data);
//           commit('SET_MSG', true);
//           EventBus.$emit('new-message', event.data); // 触发全局事件
        
//             if (state.audioEnabled) {
//     try {
//       if (state.messageSound.state() === "loaded") {
//         state.messageSound.play();
//       } else {
//         // 如果音效未加载，尝试重新加载
//         state.messageSound.load();
//         console.warn("音效未就绪，正在重新加载...");
//       }
//     } catch (e) {
//       console.error("音效播放失败:", e);
//     }
//   }
         
//         }
       
//         ws.onclose = () => {
//           setTimeout(() => store.dispatch('initWebSocket'), 3000)
//         }
  
//         commit('SET_WS', ws)
//       }
//       else
//       {
//         console.log("未登录");
//       } 
//     }
     
 
//   },
//   getters: {
//     isAudioEnabled: state => state.audioEnabled
//   }


// });
import Vue from 'vue';
import Vuex from 'vuex';
import { EventBus } from '@/eventBus';
import { Howl } from 'howler';

Vue.use(Vuex);

// 创建store实例以便在actions中使用
const store = new Vuex.Store({
  state: {
    audioEnabled: true,
    messageSound: null, // 先设为null，在mutation中初始化
    isplay: true,
    songs: [{
      songAlbum: "",
      songFilepath: "",
      songId: "",
      songImg: "",
      songLyc: "",
      songName: "",
      songSinger: "",
      songNumber: "",
      songType: "",
      songTime: ""
    }],
    isShow: false,
    palySongindex: 0,
    img: "",
    title: "",
    lyc: "",
    finalLyric: [{ time: "", lyricContent: "" }],
    unreadCount: 0,
    ws: null,
    notifications: [],
    haveAnymsg: false,
    message: '',
    reconnectAttempts: 0, // 重连次数计数器
    maxReconnectAttempts: 5 // 最大重连次数
  },
  mutations: {
    INIT_SOUND(state) {
      if (!state.messageSound) {
        state.messageSound = new Howl({
          src: [require('@/assets/消息提示.mp3')],
          volume: 0.5,
          preload: true,
          onloaderror: (id, err) => {
            console.error("音效加载失败:", err);
          },
          onplayerror: (id, err) => {
            console.error("音效播放失败:", err);
          }
        });
      }
    },
    
    TOGGLE_AUDIO(state) {
      state.audioEnabled = !state.audioEnabled;
    },
    
    setSongs(state, songs) {
      state.songs = songs;
    },
    
    setisShow(state, isShow) {
      state.isShow = isShow;
    },
    
    setImg(state, img) {
      state.img = img;
    },
    
    setTitle(state, title) {
      state.title = title;
    },
    
    setLyc(state, lyc) {
      state.lyc = lyc;
    },

    SET_WS(state, ws) {
      state.ws = ws;
    },
    
    ADD_NOTIFICATION(state, msg) {
      state.notifications.unshift(msg);
      if (!msg.isRead) state.unreadCount++;
    },
    
    MARK_READ(state, msgId) {
      const msg = state.notifications.find(m => m.id === msgId);
      if (msg && !msg.isRead) {
        msg.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    RESET(state) {
      state.unreadCount = 0;
      state.notifications = [];
      if (state.ws) {
        state.ws.close();
        state.ws = null;
      }
    },
    
    SET_MSG(state, flag) {
      state.haveAnymsg = flag;
    },
    
    SET_Message(state, message) {
      state.message = message;
    },
    
    SET_RECONNECT_ATTEMPTS(state, attempts) {
      state.reconnectAttempts = attempts;
    },
    
    CLEAR_WS(state) {
      if (state.ws) {
        state.ws.close();
        state.ws = null;
      }
    }
  },
  actions: {
    initWebSocket({ commit, state, dispatch }) {
      const user = JSON.parse(localStorage.getItem('User'));
      
      if (!user) {
        console.log("未登录，不建立WebSocket连接");
        return;
      }

      // 初始化音效
      commit('INIT_SOUND');

      // 如果已存在连接，先关闭
      // if (state.ws) {
      //   commit('CLEAR_WS');
      // }

      console.log("正在建立WebSocket连接...");
      
      const userId = user.userId;
      if (!userId) {
        console.error("用户ID不存在");
        return;
      }

      try {
       const ws = new WebSocket(`ws://192.168.3.226:1111/ws?userId=${userId}`);
        
        ws.onopen = (event) => {
          console.log("WebSocket连接成功", event);
          commit('SET_RECONNECT_ATTEMPTS', 0); // 重置重连计数器
        };

        ws.onmessage = (event) => {
          console.log("收到WebSocket消息:", event.data);
          
          commit('SET_Message', event.data);
          commit('SET_MSG', true);
          
          // 解析消息并添加到通知列表
          try {
            const msgData = JSON.parse(event.data);
            commit('ADD_NOTIFICATION', {
              ...msgData,
              isRead: false,
              id: Date.now(),
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            console.warn("消息解析失败，使用原始数据:", e);
            commit('ADD_NOTIFICATION', {
              content: event.data,
              isRead: false,
              id: Date.now(),
              timestamp: new Date().toISOString()
            });
          }

          // 触发全局事件
          EventBus.$emit('new-message', event.data);

          // 播放音效
          if (state.audioEnabled && state.messageSound) {
            try {
              if (state.messageSound.state() === 'loaded') {
                state.messageSound.play();
              } else {
                console.warn("音效未加载完成");
                // 可以在这里添加重试逻辑
                setTimeout(() => {
                  if (state.messageSound.state() === 'loaded') {
                    state.messageSound.play();
                  }
                }, 500);
              }
            } catch (e) {
              console.error("音效播放失败:", e);
            }
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket错误:", error);
        };

        ws.onclose = (event) => {
          console.log("WebSocket连接关闭", event.code, event.reason);
          
          // 如果不是主动关闭，则尝试重连
          if (event.code !== 1000 && state.reconnectAttempts < state.maxReconnectAttempts) {
            const delay = Math.min(3000 * (state.reconnectAttempts + 1), 15000); // 指数退避，最大15秒
            console.log(`${delay/1000}秒后尝试重连... (${state.reconnectAttempts + 1}/${state.maxReconnectAttempts})`);
            
            setTimeout(() => {
              commit('SET_RECONNECT_ATTEMPTS', state.reconnectAttempts + 1);
              dispatch('initWebSocket');
            }, delay);
          }
        };

        commit('SET_WS', ws);

      } catch (error) {
        console.error("WebSocket连接失败:", error);
      }
    },

    // 手动关闭WebSocket连接
    closeWebSocket({ commit, state }) {
      console.log("手动关闭了");
      
      if (state.ws) {
        state.ws.close(1000, "手动关闭"); // 正常关闭代码
      }
      commit('CLEAR_WS');
      commit('SET_RECONNECT_ATTEMPTS', state.maxReconnectAttempts); // 阻止自动重连
    },

    // 播放音效的独立action
    playNotificationSound({ state }) {
      if (state.audioEnabled && state.messageSound) {
        try {
          if (state.messageSound.state() === 'loaded') {
            state.messageSound.play();
          }
        } catch (e) {
          console.error("音效播放失败:", e);
        }
      }
    },

    // 标记消息为已读
    markAsRead({ commit }, msgId) {
      commit('MARK_READ', msgId);
    }
  },
  getters: {
    isAudioEnabled: state => state.audioEnabled,
    unreadNotifications: state => state.notifications.filter(msg => !msg.isRead),
    hasUnreadMessages: state => state.unreadCount > 0,
    isWebSocketConnected: state => state.ws && state.ws.readyState === WebSocket.OPEN
  }
});

export default store;

