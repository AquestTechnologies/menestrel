import React from 'react';
import ReactDOM from 'react-dom';
export {React};

import Song from './components/Song';
import TextSword from './components/TextSword';
import ImageSword from './components/ImageSword';
import ShapeSword from './components/ShapeSword';

const logging = true;
const log = (...messages) => logging ? console.log(...messages) : {};

const isNumber = x => !isNaN(parseFloat(x)) && isFinite(x);
const filterFn = fn => typeof fn === 'function' ? fn : () => {};
const throwError = msg => { throw new Error(msg) };

function checkType(arg, correctType, caller, argName) {
  const type = typeof arg;
  if (type !== correctType) throwError(`${caller}: expected ${argName} argument to be a ${correctType}, but got ${type} instead`);
}

function simpleMerge(a, b) { // Mutation ok?
  Object.keys(b).forEach(key => {
    if (b.hasOwnProperty(key)) a[key] = b[key];
  });
  return a;
}

function simpleAdd(a, b) {
  const c = {};
  Object.keys(a).forEach(key => {
    if (a.hasOwnProperty(key)) c[key] = a[key];
  });
  Object.keys(b).forEach(key => {
    if (b.hasOwnProperty(key)) c[key] = b[key];
  });
  return c;
}

export default class Menestrel {
  
  constructor(tales, knights) {
    checkType(tales, 'object', 'Menestrel.constructor', 'tales');
    checkType(knights, 'object', 'Menestrel.constructor', 'knights');
    
    this.tales = tales;
    this.knights = knights;
  }
  
  _sing(id) {
    log(id);
    
    const tale = this.tales[id];
    const knights = this.knights;
    const sing = this._sing.bind(this);
    
    new Promise(resolve => {
      
      const resolveAfter = (id, delay) => delay ? setTimeout(resolve.bind(null, id), delay) : resolve(id);
      if (id instanceof Array) id.forEach(i => sing(i));
      else if (tale instanceof Array) tale.forEach(t => sing(t));
      else if (typeof id === 'string' && !tale) throwError(`Menestrel: no tale found for id ${id}`);
      else if (typeof tale === 'string') resolve(tale);
      else if (typeof tale === 'function') tale(knights, resolveAfter);
      else if (tale.content) {
        if (tale.onStart) sing(tale.onStart);
        tale.content(knights, resolveAfter); 
      }
      else throwError(`Menestrel: invalid tale format found in tale ${id}`);
      
    }).then(nextId => { 
      if (tale.onEnd) sing(tale.onEnd);
      nextId ? sing(nextId) : log(`tale ${id}: nothing next`);
    });
  }
  
  start(id) {
    this._sing.call(this, id);
    return this;
  }
  
  mount(mountNode, callback) {
    const knights = this.knights;
    const filteredCallback = filterFn(callback);
    this.mountNode = mountNode;
    Object.keys(knights).forEach(key => {
      if (knights.hasOwnProperty(key)) knights[key]._initialize(this, key);
    });
    this.song = ReactDOM.render(<Song knights={knights} />, mountNode, filteredCallback);
    return this;
  }
  
  update(callback) {
    console.log('Menestrel update');
    this.song.setState({knights: this.knights}, callback);
    return this;
  }
}

export class Knight {
  
  constructor(pledge) {
    const {x, y, onMount, onUnmount, onShow, onHide, onMoveStart, onMoveEnd, Sword, props} = pledge;
    
    this.pledge = pledge; // could be usefull
    this.mounted = false;
    this.visible = false;
    this.x = isNumber(x) ? x : 0;
    this.y = isNumber(y) ? y : 0;
    this.onMount     = filterFn(onMount);
    this.onUnmount   = filterFn(onUnmount);
    this.onShow      = filterFn(onShow);
    this.onHide      = filterFn(onHide);
    this.onMoveStart = filterFn(onMoveStart);
    this.onMoveEnd   = filterFn(onMoveEnd);
    this.Sword = Sword;
    this.props = typeof props === 'object' ? props : {};
  }
  
  _initialize(menestrel, name) {
    this.menestrel = menestrel;
    this.id = name;
  }
  
  _update(callback) {
    this.menestrel.song.forceUpdate(callback);
  }
  
  mount(x, y) {
    const promise = new Promise((resolve, reject) => {
      this.mounted = true;
      this.visible = true;
      this.x = isNumber(x) ? x : this.x;
      this.y = isNumber(y) ? y : this.y;
      this._update(resolve);
    });
    promise.then(() => this.onMount());
    
    return promise;
  }
  
  unmount() {
    const promise = new Promise((resolve, reject) => {
      this.mounted = false;
      this.visible = false;
      this._update(resolve);
    });
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  show() {
    const promise = new Promise((resolve, reject) => {
      this.visible = true;
      this._update(resolve);
      resolve();
    });
    promise.then(() => this.onShow());
    
    return promise;
  }
  
  hide() {
    const promise = new Promise((resolve, reject) => {
      this.visible = false;
      this._update(resolve);
    });
    promise.then(() => this.onHide());
    
    return promise;
  }
  
  toogle() {
    return this.visible ? this.hide() : this.show();
  }
  
  displace(dx, dy) {
    if (!dx && !dy) throwError('Knight.displace: missing dx and dy args');
    this.onMoveStart();
    
    const promise = new Promise((resolve, reject) => {
      this.x = this.x + dx;
      this.y = this.y + dy;
      this._update(resolve);
    });
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  move(x, y) {
    if (!x && !y) throwError('Knight.move: missing x and y args');
    this.onMoveStart();
    
    const promise = new Promise((resolve, reject) => {
      this.x = x;
      this.y = y;
      this._update(resolve);
    });
    promise.then(() => this.onMoveEnd());
    
    return promise;
  }
  
  replaceProps(newProps) {
    return new Promise(resolve => {
      this.props = newProps;
      this._update(resolve);
    });
  }
  
  setProps(newProps) {
    return new Promise(resolve => {
      this.props = simpleAdd(this.props, newProps);
      this._update(resolve);
    });
  }
  
  passNext(next, id, delay) {
    return this.setProps({next: next.bind(null, id, delay)});
  }
}

export class TextKnight extends Knight {
  
  constructor(pledge) {
    super(pledge);
    
    const {text} = pledge;
    checkType(text, 'string', 'TextKnight.constructor', 'pledge.text');
    this.Sword = TextSword;
    this.props.text = text;
    this.text = text;
  }
  
  setText(text) {
    checkType(text, 'string', 'TextKnight.setText', 'text');
    
    return new Promise(resolve => {
      this.text = text;
      this.props.text = text;
      this._update(resolve);
    });
  }
}

export class ImageKnight extends Knight {
  
  constructor(pledge) {
    super(pledge);
    
    const {width, height, path} = pledge;
    checkType(path, 'string', 'ImageKnight.constructor', 'pledge.path');
    this.path = path;
    this.width = isNumber(width) ? width : undefined;
    this.height = isNumber(height) ? height : undefined;
    this.Sword = ImageSword;
    this.props = {
      path, 
      width: this.width, 
      height: this.height,
    };
  }
  
  setPath(path) {
    checkType(path, 'string', 'ImageKnight.setPath', 'path');
    
    return new Promise(resolve => {
      this.path = path;
      this.props.path = path;
      this._update(resolve);
    });
  }
  
  setWidth(width) {
    checkType(width, 'number', 'ImageKnight.setWidth', 'width');
    
    return new Promise(resolve => {
      this.width = width;
      this.props.width = width;
      this._update(resolve);
    });
  }
  
  setHeight(height) {
    checkType(height, 'number', 'ImageKnight.setHeight', 'height');
    
    return new Promise(resolve => {
      this.height = height;
      this.props.height = height;
      this._update(resolve);
    });
  }
  
  setSize(width, height) {
    checkType(width, 'number', 'ImageKnight.setSize', 'width');
    checkType(height, 'number', 'ImageKnight.setSize', 'height');
    
    return new Promise(resolve => {
      this.width = width;
      this.height = height;
      this.props.width = width;
      this.props.height = height;
      this._update(resolve);
    });
  }
}

export class ShapeKnight extends Knight {
  
  constructor(pledge) {
    super(pledge);
    
    const {shape, width, height, color} = pledge;
    checkType(shape, 'string', 'ShapeKnight.constructor', 'shape');
    
    this.shape = shape;
    this.color = typeof color === 'string' && color.charAt(0) === '#' && (color.length === 4 || color.length === 7) ? color : '#000';
    this.width = isNumber(width) ? width : undefined;
    this.height = isNumber(height) ? height : undefined;
    this.Sword = ShapeSword;
    this.props = {
      shape,
      color: this.color,
      width: this.width,
      height: this.height,
    };
  }
  
  setShape(shape) {
    checkType(shape, 'string', 'ShapeKnight.setShape', 'shape');
    
    return new Promise(resolve => {
      this.shape = shape;
      this.props.shape = shape;
      this._update(resolve);
    });
  }
  
  setWidth(width) {
    checkType(width, 'number', 'ShapeKnight.setWidth', 'width');
    
    return new Promise(resolve => {
      this.width = width;
      this.props.width = width;
      this._update(resolve);
    });
  }
  
  setHeight(height) {
    checkType(height, 'number', 'ShapeKnight.setHeight', 'height');
    
    return new Promise(resolve => {
      this.height = height;
      this.props.height = height;
      this._update(resolve);
    });
  }
  
  setColor(color) {
    checkType(color, 'number', 'ShapeKnight.setColor', 'color');
    
    return new Promise(resolve => {
      this.color = color;
      this.props.color = color;
      this._update(resolve);
    });
  }
}
