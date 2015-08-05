import React from 'react';
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


export default class Menestrel {
  
  constructor(tales, knights) {
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
      if (knights.hasOwnProperty(key)) knights[key].initialize(this, key);
    });
    this.song = React.render(<Song knights={knights} />, mountNode, filteredCallback);
    return this;
  }
  
  update(callback) {
    this.song.setState({knights: this.knights}, callback);
    return this;
  }
}

export class Knight {
  
  constructor(pledge) {
    const {x, y, onMount, onUnmount, onShow, onHide, onMoveStart, onMoveEnd, sword} = pledge;
    
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
    this.id = Math.random().toString().slice(2); // random is bad ! needs a mock db
    this.sword = React.isValidElement(sword) ? sword : undefined;
  }
  
  mount(x, y) {
    const promise = new Promise((resolve, reject) => {
      this.mounted = true;
      this.visible = true;
      this.x = isNumber(x) ? x : this.x;
      this.y = isNumber(y) ? y : this.y;
      this.menestrel.update(resolve);
    });
    promise.then(() => this.onMount());
    
    return promise;
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
    if (!dx && !dy) throwError('Knight.displace: missing dx and dy args');
    this.onMoveStart();
    
    const promise = new Promise((resolve, reject) => {
      
      this.x = this.x + dx;
      this.y = this.y + dy;
      this.menestrel.update(resolve);
    });
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  move(x, y, transitionTime, easing) {
    if (!x && !y) throwError('Knight.move: missing x and y args');
    this.onMoveStart();
    
    const promise = new Promise((resolve, reject) => {
      
      this.x = x;
      this.y = y;
      this.menestrel.update(resolve);
    });
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  initialize(menestrel, name) {
    this.menestrel = menestrel;
    this.name = name;
  }
  
  setSwordState(newState, callback) {
    const sword = this.menestrel.song.refs[this.id]; // Magic !
    if (!sword) throwError(`Knight.setSwordState: knight ${this.name} must be mounted`);
    sword.setState(newState, callback);
    return this;
  }
  
  passNext(next, id, delay, callback) {
    this.setSwordState({next: next.bind(null, id, delay)}, callback);
    return this;
  }
}

export class TextKnight extends Knight {
  
  constructor(pledge) {
    super(pledge);
    const {text} = pledge;
    checkType(text, 'string', 'TextKnight.constructor', 'pledge.text');
    this.text = text;
    this.sword = React.createElement(TextSword, {text});
  }
  
  setText(text, callback) {
    checkType(text, 'string', 'TextKnight.setText', 'text');
    this.text = text;
    this.setSwordState({text}, callback);
    return this;
  }
}

export class ImageKnight extends Knight {
  
  constructor(pledge) {
    super(pledge);
    const {width, height, path} = pledge;
    checkType(path, 'string', 'ImageKnight.constructor', 'pledge.path');
    this.width = isNumber(width) ? width : undefined;
    this.height = isNumber(height) ? height : undefined;
    this.url = path;
    this.sword = React.createElement(ImageSword, {path, width, height});
  }
  
  setPath(path, callback) {
    checkType(path, 'string', 'ImageKnight.setPath', 'path');
    this.path = path;
    this.setSwordState({path}, callback);
    return this;
  }
  
  setWidth(width, callback) {
    checkType(width, 'number', 'ImageKnight.setWidth', 'width');
    this.width = width;
    this.setSwordState({width}, callback);
    return this;
  }
  
  setHeight(height, callback) {
    checkType(height, 'number', 'ImageKnight.setHeight', 'height');
    this.height = height;
    this.setSwordState({height}, callback);
    return this;
  }
  
  setSize(width, height, callback) {
    checkType(width, 'number', 'ImageKnight.setSize', 'width');
    checkType(height, 'number', 'ImageKnight.setSize', 'height');
    this.width = width;
    this.height = height;
    this.setSwordState({width, height}, callback);
    return this;
  }
}

export class ShapeKnight extends Knight {
  
  constructor(pledge) {
    super(pledge);
    const {shape, width, height, color} = pledge;
    this.width = width;
    this.height = height;
    this.color = color;
    this.shape = shape;
    this.sword = React.createElement(ShapeSword, {shape, width, height, color});
  }
  
  setShape(shape, callback) {
    this.shape = shape;
    this.setSwordState({shape}, callback);
    return this;
  }
  
  setWidth(width, callback) {
    this.width = width;
    this.setSwordState({width}, callback);
    return this;
  }
  
  setHeight(height, callback) {
    this.height = height;
    this.setSwordState({height}, callback);
    return this;
  }
  
  setColor(color, callback) {
    this.color = color;
    this.setSwordState({color}, callback);
    return this;
  }
}
