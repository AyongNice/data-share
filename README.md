关注 (微信公众号 、抖音、B站)搜索 阿勇学前端

# 轻量 小 简约 而不简单  好学不难

# vue-data-share

## 组件公共数据状态共享

This is a lightweight global data common state management component compatible with vue2 and vue3:

**这是一个兼容 vue2 和 vue3 的轻量级全局数据公共状态管理组件**

组件库作者: Ayong

作者微信 非诚勿扰 :X154001888

组件库源码GitHub地址:https://github.com/AyongNice/data-share

### 一 :框架兼容:

#### **他可以运行在vue@2.6.14 至  vue@3.2.47 (也就是我们常说的vue2和vue3)版本**

### 二 : 他可以帮你做什么?

**他可以帮你在vue框架中实现 跨组件进行数据共享!**

说到vue跨组件数据共享大家会想到 vueX. pain 等组件 该组件与她不同点在于 他是一个非常轻量级别 **只有4KB大小** 并且 他是一个非常容易掌握学习的组件,使用起来非常简单, 我们经常称之为 **无脑傻瓜式用法**!  但是我们不是傻瓜 我们都是**优秀有趣的前端工程师**

### 三: 他应该如果下载使用?

```
npm i  vue-data-share
```

## 介绍下该库方法信息

| 方法名         | 介绍               | 入参字段             | 入参介绍是否缓存数据                               |
| -------------- | ------------------ |------------------|------------------------------------------|
| VueDataShare   | 组件构造函数       | Object<Parma>    | Parma全局数据共享组件的配置信息见下方详情介绍                |
| setInitialData | 原始公共数据       | Object<any,any>  | 原始数据 通常在mian.js文件设置可以设置全局的 基础数据 对象以及 函数  |
| get            | 获取全局基本数据值 | string           | 传入原始数据字段的key 即可响应式的获取数据                  |
| set            | 设置全局基本数据值 | string           | 传入原始数据字段的key 即可响应式的设置数据                  |
| callFunction   | 调用公共方法       | string ,args     | 第一个参数为传入原始数据函数名的key  方法入参数,第二个参数为 该方法的入参 |
| register       | 消息订阅事件       | string, Funticon | 定于一个函数名,以及函数体.使用示例见下方                    |
| publish        | 消息事件发布       | string ,args     | 发布制定的消息事件名称,传入函数参数使用示例见下方                |
| deleteSnapshot        | 删除缓存记录       | -                | 删除缓存数据                                   |

## Parma 字段介绍

| 字段名   | 介绍         | 入参字段 | 入参介绍是否缓存数据                                         |
| -------- | ------------ | -------- | ------------------------------------------------------------ |
| snapshot | 组件构造函数 | boolean  | 组件数据是否缓存,数据讲缓存浏览器indexDB,true缓存默认false不缓存 |

## vue2版本使用示例

### Main.js 文件 setInitialData 设置原始数据

```javascript
import Vue from 'vue'
import App from './App.vue'
import router from "@/router";
Vue.config.productionTip = false
import VueDataShare from 'vue-data-share'
const vueDataShare = new VueDataShare({snapshot: true})
vueDataShare.setInitialData({
    num: 1, 
    list: [{
        name: '河南省', num: 18, child: [{
            name: '日本县', num: 1
        }]
     }], 
   logout: () => {
        console.log('退出登录')
    }
})
Vue.prototype.$vueDataShare = vueDataShare
new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
```

### 在组件、页面组件中使用 get获取数据  、 set设置数据

App.vue 在app页面获取 num

```javascript
<template>
  <div id="app">
    {{ $vueDataShare.get('num') }}
    <router-view/>
  </div>
</template>
<script>
export default {
  name: 'App',
}
```

在其中一个组件使用set方法设置数据时候、真个项目所有组件用到改值都会统一同步

```javascript
<template>
  <div>
    <h1>
      公共数据num数值: {{ $vueDataShare.get('num') }}
    </h1>
    <div class="three">
      <dd v-for="(item,index) in $vueDataShare.get('list')" :key="index">
        {{ item.name }}
        {{ item.num }}
        <p v-for="(child,indexK) in item.child" :key="indexK">
          {{ child.name }} 
          <span>{{ child.num }}</span>
        </p>
      </dd>
    </div>
    <button @click="setNum">全局数据设置++</button>
    <button @click="logout">logout</button>
    <button @click="getList">getList</button>
    <button @click="chanListNum">chanListNum</button>
  </div>
</template>
<script>
import Vue, {defineComponent} from 'vue'
export default defineComponent({
  name: "page1",
  methods: {
    //设置全局 num 值
    setNum() {
      let num = this.$vueDataShare.get('num');
      num++
      this.$vueDataShare.set({num})
    },
    //调用公共方法退出登陆
    logout() {
      this.$vueDataShare.callFunction('logout')
    },
    //获取全局list数据
    getList() {
      const list = this.$vueDataShare.get('list')
      console.log('list', list)
    },
    //设置全局list数据值
    chanListNum() {
      const list = this.$vueDataShare.get('list')
      list[0].num = 100
    }
  }
})
</script>
```

### 调用公共方法 callFunction

调用原始数据中封装的公共方法 我们只需要调用 组件的callFunction 方法 传入对应函数字段名即可

```javascript
<script>
import Vue, {defineComponent} from 'vue'
export default defineComponent({
  name: "page1",
  methods: {
    //调用公共方法退出登陆
    logout() {
      this.$vueDataShare.callFunction('logout')
    },
  }
})
</script>
```



### 跨组件通信 register 与 publish

vue-data-share 组件帮你提供了跨页面夸组件之间的通信方案功能就是 **消息订阅与发布**,那如何使用他呢

在通知页面组件中 注册一个自定义事件 定一个名字 requestList

```javascript
<script>
import Vue, {defineComponent} from 'vue'
export default defineComponent({
  name: "page1",
  mounted() {
    this.$vueDataShare.register('requestList', (parmas) => {
      console.log(parmas)
    })
  },
})
</script>
```

在通知页面中,我们只需要 调用publish方法发送消息, 被通知页面将会收到消息及参数,来完成我们的业务逻辑需求

```javascript
<script>
export default {
  name: 'App',
  methods: {
    message() {
      this.$vueDataShare.publish("requestList", "Hello, World!");
    }
  }
}
</script>
```

## Vue3版本使用示例

**我们使用ts为大家示例**

main.js文件 如同vue2一样 在main.js引入组件库 设置原始默认数据,并且可以设置是否缓存数据

```
import {createApp} from 'vue'
import App from './App.vue'
import VueDataShare from 'vue-data-share'
const vueDataShare:VueDataShare = new VueDataShare({snapshot: true});
vueDataShare.setInitialData({
    num: 1,
    loginOut: () => {
        console.log('loginOut')
    },
})
createApp(App).mount('#app')
```

App.vue文件

```typescript
<template>
  <HelloWorld></HelloWorld>
  <h1>{{ vueDataShare.get('num') }}</h1>
  <button @click="num">++</button>
  <button @click="loginOut">退出登陆</button>
</template>

<script lang="ts" setup>
import VueDataShare from 'vue-data-share';
import HelloWorld from './components/HelloWorld.vue';

const vueDataShare: VueDataShare = new VueDataShare({snapshot: false});
//设置全局num字段数据
const num = (): void => {
  vueDataShare.set({num:vueDataShare.get('num')++})
}
//设置全局公共方法
const loginOut = (): void => {
  vueDataShare.callFunction('loginOut')
}
//注册跨页面通信事件
vueDataShare.register('request', (callback) => {
  callback({name: 'ayong'})
})
console.log('全局原始数据num获取-----', vueDataShare.get('num'))

</script>

```

HelloWorld组件

```typescript
<template>
  <button @click="vueDataSharePage">通信</button>
  <h1>{{ vueDataShare.get('num') }}</h1>
</template>

<script setup lang="ts">
import VueDataShare from 'vue-data-share';

const vueDataShare: VueDataShare = new VueDataShare();

defineProps<{ msg: string }>()

const vueDataSharePage = () => {
  //发送消息通知
  vueDataShare.publish('request', (res) => {
    console.log('通信回调参数', res)
  })
}
</script>
```

以上vue3 使用示例我们一次性列举了 **设置原始数据、获取全局数据、设置全局数据、夸组件通信消息订阅与发布**的示例

**与vue2 唯一不同的是VueDataShare没有挂载到全局this ,因为在vue3中没有this,所有每个组件需要引入自定义函数**

**其他所有的功能以及使用方式 vue2版本与vue3都一样的,这里我们不在重复描述每一个方法功能**

## 轻量 小 简约 而不简单 好学不难 

