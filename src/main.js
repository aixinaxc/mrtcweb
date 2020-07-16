import Vue from 'vue'
import App from './App.vue'
import {Button,Layout,Modal,Menu,Form,Tooltip,Input,Select,Upload,Icon,Row,Col} from 'ant-design-vue';
//import Antd from 'ant-design-vue';
import router from './router'
import store from './store'
import StreamHandle from './assets/js/StreamHandle.js'
//import 'ant-design-vue/dist/antd.css';
Vue.use(Modal);
Vue.config.productionTip = false
//Vue.use(Antd)
Vue.component(Button.name,Button)
Vue.component(Icon.name,Icon)
Vue.component(Layout.name,Layout)
Vue.component(Layout.Content.name,Layout.Content)
Vue.component(Layout.Header.name,Layout.Header)
Vue.component(Layout.Sider.name,Layout.Sider)
Vue.component(Modal.name,Modal)
Vue.component(Menu.name,Menu)
Vue.component(Menu.SubMenu.name,Menu.SubMenu)
Vue.component(Menu.Item.name,Menu.Item)
Vue.component(Form.name,Form)
Vue.component(Tooltip.name,Tooltip)
Vue.component(Input.name,Input)
Vue.component(Select.name,Select)
Vue.component(Select.Option.name,Select.Option)
Vue.component(Upload.name,Upload)
Vue.component(Row.name,Row)
Vue.component(Col.name,Col)

Vue.prototype.$StreamHandle = StreamHandle
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
