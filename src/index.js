// import React from 'react';
import React from 'react/addons';
import aguid from 'aguid';
import { createFragment } from 'react/addons';
import Immutable from 'immutable';
import * as reducers from './reducers';
import { Provider, Connector } from 'react-redux';
// import promiseMiddleware  from './promiseMiddleware.js';
import { createStore, combineReducers, applyMiddleware, bindActionCreators } from 'redux';
export {React};

const logging = true;
const log = (...messages) => logging ? console.log(...messages) : {};
const logError = (...messages) => logging ? console.error(...messages) : {};


// From the Immutable.js Github wiki
function fromJSGreedy(js) {
  return typeof js !== 'object' || js === null ? js :
    Array.isArray(js) ? 
      Immutable.Seq(js).map(fromJSGreedy).toList() :
      Immutable.Seq(js).map(fromJSGreedy).toMap();
}

export default class Menestrel {
  
  constructor(tales, knights) {
    this.tales = tales;
    // this.knights = Immutable.fromJS(knights);
    // this.store = applyMiddleware(promiseMiddleware)(createStore)(combineReducers(reducers), {tales, knights});
    this.store = createStore(combineReducers(reducers), {tales, knights: fromJSGreedy(knights)});
    this.dispatch = this.store.dispatch;
    this.getState = this.store.getState;
    this.getKnights = () => this.getState().knights.toJS();
  }
  
  _sing(id) {
    log(id);
    
    const knights = this.getKnights();
    const tale = this.tales[id];
    const sing = this._sing.bind(this);
    
    new Promise(resolve => {
      const resolveAfter = (id, delay) =>  delay ? setTimeout(resolve.bind(null, id), delay) : resolve(id);
      if (id instanceof Array)             id.forEach(i => sing(i));
      else if (tale instanceof Array)      tale.forEach(t => sing(t));
      else if (typeof id === 'string'      && !tale) logError(new Error('Menestrel: no tale found for id ' + id));
      else if (typeof tale === 'string')   resolve(tale);
      else if (typeof tale === 'function') tale(knights, resolveAfter);
      else if (tale.content) {
        if (tale.onStart) sing(tale.onStart);
        tale.content(knights, resolveAfter); 
      }
      else logError(new Error('Menestrel: invalid tale format found in tale ' + id));
      
    }).then(nextId => { 
      if (tale.onEnd) sing(tale.onEnd);
      nextId ? sing(nextId) : log(`tale ${id}: nothing next`);
    });
  }
  
  start(id) {
    this._sing.call(this, id);
    return this;
  }
  
  mount(mountNode) {
    // const knights = this.getKnights();
    this.dispatch({
      type: 'MOUNT_MENESTREL',
      payload: this,
    });
    // Object.keys(knights).forEach(key => {
    //   if (knights.hasOwnProperty(key)) {
    //     knights[key].setId(key);
    //     knights[key].setMenestrel(this);
    //   }
    // });
    console.log('state before mount', this.getState());
    const select = state => ({ knights: state.knights.toJS() });
    this.song = React.render(
      <Provider store={this.store}>
      { () => <Connector select={select}> 
        { ({ knights }) => <Song knights={knights}/> } 
        </Connector>
      }
      </Provider>,
      mountNode, 
      log('Song rendered'));
    // this.song = React.render(<Song knights={knights} />, mountNode);
    return this;
  }
  
  // update(callback) {
  //   this.song.setState({knights: this.knights}, callback);
  //   return this;
  // }
}
function randomString(l) {
  let text = '';
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < l; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return text;
}

class Song extends React.Component {
  
  renderKnights(knights) {
    // let elements = [];
    // Object.keys(knights)
    //   .filter(key => knights.hasOwnProperty(key))
    //   .map(key => knights[key])
    //   .filter(knight => knight.mounted)
    //   .map(knight => {
    //   // const knight = knights.get(key);
    //   // console.log('knight', knights);
    //   const {id, Sword, x, y, visible} = knight;
    //   // console.log(id, mounted);
    //   console.log(knight.text);
    //   elements.push(<span key={id} style={{
    //     position: 'fixed',
    //     top: y,
    //     left: x,
    //     opacity: visible ? 1 : 0,
    //   }}>
    //     { Sword }
    //   </span>);
    // });
    // let keydobj = {};
    // elements.forEach(knight => {
    //   keydobj[randomString(10)] = knight;
    // });
    // console.log(keydobj);
    // if (elements.length) return elements;
    let l = [];
    Object.keys(knights).filter(key => knights[key].mounted)
    .map(key => l.push(<Geste
        key={key}
        knight={knights[key]}
      />));
    return l;
  }
  
  render() {
    const {knights} = this.props;
    // console.log(knights);
    return <div> 
    { this.renderKnights(knights) } 
    </div>;
  }  
}

class Geste extends React.Component{
  
  chooseSword(Sword, text, url, width, height) {
    if (text) return <TextSword text={text} />;
    if (url) return <ImageSword url={url} width={width} height={height} />;
    else return <Sword />;
  }
  
  render() {
    const {Sword, x, y, visible, text, url, width, height, id} = this.props.knight;
    return <span style={{
      position: 'fixed',
      top: y,
      left: x,
      opacity: visible ? 1 : 0,
    }}>
      <Sword text={text} url={url} width={width} height={height} id={id}/>
    </span>;
  }
}

export function mount(knight, x, y) {
  knight.dispatch({
    type: 'MOUNT_KNIGHT',
    payload: {id: knight.id, x, y}
  });
  knight.onMount();
}

export function unmount(knight) {
  knight.dispatch({
    type: 'UNMOUNT_KNIGHT',
    payload: {id: knight.id}
  });
  knight.onUnmount();
}

export function show(knight) {
  knight.dispatch({
    type: 'SHOW_KNIGHT',
    payload: {id: knight.id}
  });
  knight.onShow();
}

export function hide(knight) {
  knight.dispatch({
    type: 'HIDE_KNIGHT',
    payload: {id: knight.id}
  });
  knight.onHide();
}

export function toogle(knight) {
  return knight.visible ? hide(knight) : show(knight);
}

export function passNext(knight, next, id, delay, callback) {
  console.log(knight.menestrel.song.refs);
  knight.menestrel.song.refs[knight.id].setState({next: next.bind(null, id, delay)}, callback);
}

export class Knight {
  
  constructor(pledge) {
    const {x, y, transitionTime, easing, onMount, onUnmount, onShow, onHide, onMoveStart, onMoveEnd, Sword} = pledge;
    
    this.dx = 0;
    this.dy = 0;
    this.mounted = false;
    this.visible = false;
    this.easing = easing;
    this.transitionTime = transitionTime;
    this.id = Math.random().toString().slice(2);
    this.x = !isNaN(parseFloat(x)) && isFinite(x) ? x : 0;
    this.y = !isNaN(parseFloat(y)) && isFinite(y) ? y : 0;
    this.Sword = React.isValidElement(Sword) ? Sword : undefined;
    this.onMount     = typeof onMount     === 'function' ? onMount :     () => {};
    this.onUnmount   = typeof onUnmount   === 'function' ? onUnmount :   () => {};
    this.onShow      = typeof onShow      === 'function' ? onShow :      () => {};
    this.onHide      = typeof onHide      === 'function' ? onHide :      () => {};
    this.onMoveStart = typeof onMoveStart === 'function' ? onMoveStart : () => {};
    this.onMoveEnd   = typeof onMoveEnd   === 'function' ? onMoveEnd :   () => {};
  }
  
  mount(x, y) {
    this.menestrel.dispatch({
      type: 'MOUNT_KNIGHT',
      payload: {id: this.id, x, y}
    });
    this.onMount();
    // const promise = new Promise((resolve, reject) => {
      // this.mounted = true;
      // this.visible = true;
      // this.x = x || this.x;
      // this.y = y || this.y;
      // this.menestrel.update(resolve);
    //   console.log('dispatch');
    //   this.menestrel.dispatch(resolve, {
    //     type: 'MOUNT_KNIGHT',
    //     payload: {id: this.id, x, y}
    //   });
    // });
    // promise.then(() => this.onMount());
    
    // return promise;
  }
  
  unmount() {
    const promise = new Promise((resolve, reject) => {
      this.mounted = false;
      this.visible = false;
      this.menestrel.update(resolve);
    });
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  show() {
    const promise = new Promise((resolve, reject) => {
      this.visible = true;
      this.menestrel.update(resolve);
      resolve();
    });
    promise.then(() => this.onShow());
    
    return promise;
  }
  
  hide() {
    const promise = new Promise((resolve, reject) => {
      this.visible = false;
      this.menestrel.update(resolve);
    });
    promise.then(() => this.onHide());
    
    return promise;
  }
  
  toogle() {
    return this.visible ? this.hide() : this.show();
  }
  
  displace(dx, dy, transitionTime, easing) {
    this.onMoveStart();
    
    const promise = new Promise((resolve, reject) => {
      if (!dx && !dy) throw new Error('Knight.move: missing dx and dy args');
      
      this.x = this.x + dx;
      this.y = this.y + dy;
      this.dx = dx;
      this.dy = dy;
      this.transitionTime = transitionTime || this.transitionTime;
      this.easing = easing || this.easing;
      this.menestrel.update(resolve);
    });
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  move(x, y, transitionTime, easing) {
    this.onMoveStart();
    
    const promise = new Promise((resolve, reject) => {
      if (!x && !y) throw new Error('Knight.move: missing x and y args');
      
      this.dx = x - this.x;
      this.dy = y - this.y;
      this.x = x;
      this.y = y;
      this.transitionTime = transitionTime || this.transitionTime;
      this.easing = easing || this.easing;
      this.menestrel.update(resolve);
    });
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  setTransitionTime(transitionTime, callback) {
    this.transitionTime = transitionTime;
    this.menestrel.song.refs[this.id].setState({transitionTime}, callback);
    return this;
  }
  
  setEasing(easing, callback) {
    this.easing = easing;
    this.menestrel.song.refs[this.id].setState({easing}, callback);
    return this;
  }
  
  
}

export class TextKnight extends Knight {
  
  constructor(text, pledge) {
    super(pledge);
    this.text = text;
    this.Sword = TextSword;
  }
  
  setText(text, callback) {
    this.text = text;
    this.menestrel.song.refs[this.id].setState({text}, callback);
    return this;
  }
}

class TextSword extends React.Component {
  
  componentWillMount() {
    this.setState({text: this.props.text});
  }
  
  render() {
    return <span>{ this.state.text }</span>;
  }
}

export class ImageKnight extends Knight {
  
  constructor(url, pledge) {
    super(pledge);
    const {width, height} = pledge;
    this.width = width;
    this.height = height;
    this.url = url;
    this.Sword = ImageSword;
  }
  
  setUrl(url, callback) {
    this.url = url;
    this.menestrel.song.refs[this.id].setState({url}, callback);
    return this;
  }
  
  setWidth(width, callback) {
    this.width = width;
    this.menestrel.song.refs[this.id].setState({width}, callback);
    return this;
  }
  
  setHeight(height, callback) {
    this.height = height;
    this.menestrel.song.refs[this.id].setState({height}, callback);
    return this;
  }
}

class ImageSword extends React.Component {
  
  componentWillMount() {
    const {url, width, height} = this.props;
    this.setState({url, width, height});
  }
  
  render() {
    const {url, width, height} = this.state;
    return <img src={url} width={width ? width : 'auto'} height={height ? height : 'auto'} />;
  }
}

export class ShapeKnight extends Knight {
  
  constructor(shape, pledge) {
    super(pledge);
    const {width, height, color} = pledge;
    this.width = width;
    this.height = height;
    this.color = color;
    const transitionTime = this.transitionTime;
    const easing = this.easing;
    const dx = this.dx;
    const dy = this.dy;
    this.shape = shape;
    this.Sword = React.createElement(ShapeSword, {shape, width, height, color, dx, dy, transitionTime, easing});
  }
  
  setShape(shape, callback) {
    this.shape = shape;
    this.menestrel.song.refs[this.id].setState({shape}, callback);
    return this;
  }
  
  setWidth(width, callback) {
    this.width = width;
    this.menestrel.song.refs[this.id].setState({width}, callback);
    return this;
  }
  
  setHeight(height, callback) {
    this.height = height;
    this.menestrel.song.refs[this.id].setState({height}, callback);
    return this;
  }
  
  setColor(color, callback) {
    this.color = color;
    this.menestrel.song.refs[this.id].setState({color}, callback);
    return this;
  }
  
}

class ShapeSword extends React.Component {
  
  componentWillMount() {
    const {shape, width, height, color, transitionTime, easing, dx, dy} = this.props;
    this.setState({shape, width, height, color, transitionTime, easing, dx, dy, css: '', classes: []});
  }
  
  componentWillReceiveProps() {
    console.log('componentWillReceiveProps');
    const c = Math.random().toString().slice(2);
    const {transitionTime, easing, dx, dy, classes, css} = this.state;
    let ncss = ".animate" + c + " {animation: move" + c + " " + transitionTime + "s " + easing + ";} ";
    ncss += "@keyframes move" + c + " {100% {transform: translate(" + dx + "px, " + dy + "px);}} ";
    this.setState({
      css: css + ncss,
      classes: classes.concat(['animate'+ c])
    });
  }
  renderShape(shape, color, width, height, classes) {
    if (shape === 'rectangle') return <div style={{
      backgroundColor: color,
      width: width ? width : 'auto',
      height: height ? height : 'auto',
    }} className={classes.toString()} />;
  }
  render() {
    const {shape, width, height, color, css, classes} = this.state;
    // console.log(css);
    
    return(
      <div>
        <style>{css}</style>
        {this.renderShape(shape, color, width, height, classes)}
      </div>
    );
  }
}
