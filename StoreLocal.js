/* localStorage 存储封装 
人为避免重复定义 
  实例统一入口文件定义 
  使用 '/' 符号, 定义命名空间 
过期控制 
  num  num秒后失效,方案: 始终储存为一对象值, 通过一个键值来定义有效时间 
  0    永不过期 
*/


const name_space = 'SK/L';
const store_pre_key = Symbol('store_pre');
const callbacks_key_flg = Symbol('callbacks_key');
export default class StoreLocal {
  [store_pre_key] = 'V';
  constructor(store_key, dftVal=null, timeout=0, trimFn){ 
    this._key = `${name_space}/${this[store_pre_key]}/${store_key}`;
    // 初始值 
    this._dftVal = dftVal;
    // 格式化函数 
    this._trim = trimFn || function(val){ return val; };
    
    timeout = Number(timeout) * 1000 ;
    if ( Number.isNaN(timeout) ) { return new Error('timeout is not a number'); }
    
    this._timeout = timeout ? timeout : 0;
    
    this._value = JSON.parse( localStorage.getItem(this._key) );
    if ( this._value===null ) {
      this._value = {
        start: Date.now(),
        timeout: this._timeout, 
        isOutTime: false, // 是否已超时 
        v: this._dftVal,
      };
      localStorage.setItem(this._key, JSON.stringify( this._value ));
      
      this._preValue = null; 
      this._preTrimedValue = this._trim(this._preValue);
    }
    else {
      this._value.timeout = this._timeout;
      this._value.isOutTime = Date.now() > this._value.start + this._timeout;
      this._preValue = this._value.v; 
      this._preTrimedValue = this._trim(this._preValue);
    }
    // 缓存格式化的值 
    this._trimedValue = this._trim(this._value.v);
  }
  
  /* --------------------------------------------------------- APIs */
  // 使用 
  static use(store_key, dftVal, timeout, trimFn){
    // 必须指定key 
    if (!store_key) { throw new Error('store key is not define'); }

    let instance = new this(store_key, dftVal, timeout, trimFn);
    return instance;
  }
  // 取值 
  get = (isTrimed=true, handleFlg )=>{
    if ( this.checkIsTimeout() ) { return this._dftVal; }
    
    // 是否单次有效: 单次有效,即本窗口存在,关闭后清除 
    if ( handleFlg==='session' ) {
      let result = JSON.parse( sessionStorage.getItem( this._key ) );
      if (result===null) {
        result = this._value.v; 
        sessionStorage.setItem(this._key, JSON.stringify(result));
        this.clear(); 
      }
      if (isTrimed) { return this._trim(result); }
      return result;
    }
    
    let isClear = handleFlg==='clear';
    if ( isTrimed ) {
      let trimedResult = this._trimedValue;
      if ( isClear ) { this.clear() }
      return trimedResult; 
    }
    
    let result = this._value.v; 
    if ( isClear ) { this.clear() }
    return result; 
  }
  get value(){ return this.get(); }
  // 写值 
  set = (val, isRefresh=true)=>{
    if ( this.checkIsTimeout() && !isRefresh ) { return this._dftVal; }
    
    // 重复设置相同值,不处理 
    try {
      let isSame = JSON.stringify(val)===JSON.stringify(this._value.v)
      if ( isSame ) { return ; }
    } 
    catch (err) { return console.warn(err); } 
    

    this._preValue = this._value.v;
    this._preTrimedValue = this._trimedValue;
    this._value = {
      ...this._value, 
      v: val,
    }; 
    if ( isRefresh ) { 
      this._value.start = Date.now();
      this._value.isOutTime = false; 
    }
    this._trimedValue = this._trim( val ); 
    localStorage.setItem( this._key, JSON.stringify(this._value) );
    this[callbacks_key_flg].forEach((listenRun, idx)=>{
      listenRun(
        this._value.v, 
        this._preValue, 
        this._trimedValue, 
        this._preTrimedValue
      );
    })
  }
  set value(val){ return this.set(val); }
  // 清除 
  clear = ()=>{ this.set( this._dftVal, false ); }
  // 监听 
  listen = (listenRun, immediate=false)=>{
    if ( typeof listenRun!=='function' ) {
      throw new Error('first argument is not a function');
    }

    this[callbacks_key_flg].push( listenRun )
    if ( immediate ) {
      this.checkIsTimeout();
      listenRun(
        this._trimedValue, 
        this._preTrimedValue,
        this._value.v, 
        this._preValue 
      );
    }
  }

  /* --------------------------------------------------------- DATAs */
  [callbacks_key_flg] = [];
  /* --------------------------------------------------------- KITs */
  // 检查是否过期 
  checkIsTimeout = ()=>{ 
    if ( this._value.timeout===0 ) { return false; }
    if ( this._value.isOutTime ) { return true; }
    let outTime = this._value.start + this._timeout;
    if ( outTime - Date.now() > 0 ) { return false; }
    
    // 过期 
    this._preValue = this._value.v;
    this._preTrimedValue = this._trimedValue;
    this._value = {
      ...this._value, 
      isOutTime: true, 
      v: this._dftVal,
    }; 
    this._trimedValue = this._trim( this._dftVal ); 
    localStorage.setItem( this._key, JSON.stringify(this._value) );
    return true;
  }
}
export class LocalMap extends StoreLocal {
  [store_pre_key] = 'M';
  constructor(store_key, dftVal={}, timeout, trimFn){
    if ( typeof dftVal!=='object' ) {
      throw new Error('dftVal is not a map value');
    }
    super(store_key, dftVal, timeout, trimFn);
  }
  
  /* --------------------------------------------------------- APIs */
  setAttr = (k, v)=>{
    this.set({
      ...this.get(false),
      [k]: v, 
    })
  }
  getAttr = (k)=>{ return this.value[k]; }
  isEmpty = ()=>{
    let objMap = this.get(true);
    return Object.keys(objMap).length===0
  }
}


/* ** ------------------------------------------------------- test */





