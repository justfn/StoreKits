<div align="center">
  <h1> 存储/缓存 store/sessionStorage&localStorage </h1>
</div>

## 功能对象介绍 
* Store: 内存存储, 可用于状态的统一管理 
* StoreMap: 基于 Store 的对象形式的封装, 便于存取map结构数据 
* StoreSession: sessionStorage功能封装, 增强功能和便捷性 
* SessionMap: 基于 StoreSession 的对象形式的封装, 便于存取map结构数据 
* StoreLocal: localStorage功能封装, 增强功能和便捷性 
* LocalMap: 基于 StoreLocal 的对象形式的封装, 便于存取map结构数据 

## 使用
```javascript
import { 
  Store, 
  StoreMap, 
  StoreSession, 
  SessionMap, 
  StoreLocal, 
  LocalMap 
} from "@justfn/StoreKits";

``` 


# Store 

### 基本用法 
```javascript
const storeKey01 = 'test/01';
const store01 = Store.use(storeKey01);
// 读 
let val01 = store01.get(); 
console.log( val01 );  // null
// 写 
store01.set('aaa');
// 读 
val01 = store01.get(); 
console.log( val01 ); // 'aaa' 
// 写  等价于 .set('bbb')  
store01.value = 'bbb';
// 读 等价于 .get() 
val01 = store01.value; 
console.log( val01 ); // 'bbb'
````

### 默认值 & 格式化方法 & 清除数据 
```javascript
const storeKey02 = 'test/02';
// 默认值, 未定义则为 null 
const defaultValue = '0'; 
// 格式化方法, 默认为 v=>v 
const trimFn = (val)=>{ return '0'+val; }
const store02 = Store.use(storeKey02, defaultValue, trimFn);
let val02 = store02.value; 
console.log(val02); // '00'
store02.set('1');
val02 = store02.value; 
console.log(val02); // '01'
// 获取未格式化的数据
console.log(
  store02.get(false) // '1'
);
// 获取后清除数据 
// 相当于获取后手动调用 store02.clear(); 
// 清除数据, 即将重置为默认值 
console.log(
  store02.get(true, true) // '01'
);
console.log( store02.get() ); // '00'
````

### 监听数据变化  
```javascript
const storeKey03 = 'test/03';
const store03 = Store.use(storeKey03, 'aa');
// 监听数据变化 
store03.listen((val, preVal)=>{
  console.log(val, preVal);
})
store03.set('bb');
// 立即执行的监听 
store03.listen((val, preVal)=>{
  console.log(val, preVal);
}, true)
```


# StoreMap 
* StoreMap 继承自 Store 
* 读写的始终为对象 
* 新增方法 setAttr getAttr  用户读写对象的属性值 
* 新增方法 isEmpty  用于判断对象是否为空对象 

```javascript
const storeMapKey01 = 'test/01'
const storeMap01 = StoreMap.use(storeMapKey01);
console.log( storeMap01.get() ); // {} 
console.log( storeMap01.isEmpty() ); // true
storeMap01.setAttr('a', '001');
console.log( storeMap01.get() ); // { a: '001'} 
console.log( storeMap01.getAttr('a') ); // '001'
console.log( storeMap01.isEmpty() ); // false
```

# StoreSession 
* 提供的功能及使用方法同 Store 一致, 
* 区别: StoreSession 中的数据存储在 sessionStorage 中, 有缓存功能 
```javascript
const storeSessionKey01 = 'test/01'
const storeSession01 = StoreSession.use(storeSessionKey01, '00');
storeSession01.listen((val, preVal)=>{
  console.log( val, preVal );
});
console.log( storeSession01.get() );
storeSession01.set('abc');
console.log( storeSession01.get() );
storeSession01.listen((val, preVal)=>{
  console.log( val, preVal );
}, true);
console.log( storeSession01.get(true, true) );
storeSession01.clear();
```

# SessionMap 
* SessionMap 继承自 StoreSession 
* 读写的始终为对象 
* 新增方法 setAttr getAttr  用户读写对象的属性值 
* 新增方法 isEmpty  用于判断对象是否为空对象 


# StoreLocal 
* 提供的功能及使用方法同 StoreSession 基本一致, 
* 区别: StoreLocal 中的数据存储在 localStorage 中 
* 区别: 增加了数据过期时间功能, 当数据过期时, 再次读取则为默认值 

```javascript
const storeLocalKey01 = 'test/01'
const storeLocal01 = StoreLocal.use(
  storeLocalKey01, 
  '00',
  100, // 100 秒后过期, 0 则表示永不过期 
  v=>v
);
storeLocal01.listen((val, preVal)=>{
  console.log( val, preVal );
});
console.log( storeLocal01.get() );
storeLocal01.set('aaa');
console.log( storeLocal01.get() );
storeLocal01.listen((val, preVal)=>{
  console.log( val, preVal );
}, true);
storeLocal01.set('bbb', false); // 本次设置数据, 但不刷新过期时间 
console.log( storeLocal01.get(true, 'session') ); // 使用 sessionStorage 接管, 数据在浏览器窗口关闭后失效 
console.log( storeLocal01.get(true, 'clear') ); // 本次读取后, 数据失效 
storeLocal01.clear();

```

# LocalMap 
* LocalMap 继承自 StoreLocal 
* 读写的始终为对象 
* 新增方法 setAttr getAttr  用户读写对象的属性值 
* 新增方法 isEmpty  用于判断对象是否为空对象 

















