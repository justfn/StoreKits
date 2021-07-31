/* 存储封装,状态集中管理 
特点: 
  可跨页面 缓存数据, 
todo: 
  key 值改为可用任意类型值 
  StoreList 
*/

const store_pre_key = Symbol('store_pre');
const instances_key = Symbol('instances');
const callbacks_key_flg = Symbol('callbacks_key');

// 
const store_instances = {
  // <store_key>: instance,
}
export default class Store {
  [store_pre_key] = 'V';
  constructor(store_key, dftVal=null, trimFn ){ 
    this._key = this[store_pre_key] + '/' + store_key;
    // 初始值 
    this._dftVal = dftVal;
    // 格式化函数 
    this._trim = trimFn || function(val){ return val; };
    
    this._value = this._dftVal;
    // 缓存格式化的值 
    this._trimedValue = this._trim(this._value);
    this._preValue = null; 
    this._preTrimedValue = this._trim(this._preValue); 
  }
  
  /* --------------------------------------------------------- APIs */
  // 使用 
  static use(store_key, dftVal, trimFn){
    // 必须指定key 
    if (!store_key) { throw new Error('store key is not define'); }
    
    // 已定义,则直接使用
    let instance = this[instances_key][store_key];
    if ( instance ) { return instance; }
    
    // 未定义时,初始定义后使用 
    instance = new this(store_key, dftVal, trimFn);
    this[instances_key][store_key] = instance;
    return instance;
  }
  // 取值 
  get = (isTrimed=true, isClear=false)=>{
    if ( isTrimed ) {
      let trimedResult = this._trimedValue;
      if ( isClear ) { this.clear() }
      return trimedResult; 
    }
    
    let result = this._value; 
    if ( isClear ) { this.clear() }
    return result; 
  }
  get value(){ return this.get(); }
  // 写值 
  set = (val)=>{
    // 重复设置相同值,不处理 
    if ( val===this._value ) { return ; }
    
    this._preValue = this._value;
    this._preTrimedValue = this._trimedValue;
    this._value = val; 
    this._trimedValue = this._trim( val ); 
    this[callbacks_key_flg].forEach((listenRun, idx)=>{
      listenRun(
        this._value, 
        this._preValue, 
        this._trimedValue, 
        this._preTrimedValue
      );
    })
  }
  set value(val){ return this.set(val); }
  // 清除 
  clear = ()=>{ this.set( this._dftVal ); }
  // 监听 
  listen = (listenRun, immediate=false)=>{
    if ( typeof listenRun!=='function' ) {
      throw new Error('first argument is not a function');
    }
    
    this[callbacks_key_flg].push( listenRun );
    if ( immediate ) {
      listenRun(
        this._trimedValue, 
        this._preTrimedValue, 
        this._value, 
        this._preValue
      );
    }
  }
  
  
  /* --------------------------------------------------------- DATAs */
  // 实例集合 
  static [instances_key] = store_instances;
  // 监听函数集 
  [callbacks_key_flg] = [];
}

// 
const store_map_instances = {
  // 
}
export class StoreMap extends Store {
  [store_pre_key] = 'M';
  constructor(store_key, dftVal={}, trimFn){
    let isObjVal = dftVal instanceof Object
    if ( !isObjVal ) { throw new Error('default value is not map value'); }
    super(store_key, dftVal, trimFn);
  }
  
  /* --------------------------------------------------------- APIs */
  setAttr = (k, v)=>{
    this.set({
      ...this.get(false, false),
      [k]: v, 
    })
  }
  getAttr = (k)=>{
    return this.value[k];
  }
  isEmpty = ()=>{
    let objMap = this.get(true);
    return Object.keys(objMap).length===0
  }
  
  /* --------------------------------------------------------- DATAs */
  // 实例集合 
  static [instances_key] = store_map_instances;
}





/** -------------------------------------------------------------- test */
export function test(){
  setTimeout(()=>{
    console.log(' ================================================ ');
    console.log('v', store_instances);
    console.log('m', store_map_instances);
  })
} 





