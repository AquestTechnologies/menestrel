import React from 'react';
export {React};

const logging = true;
const log = (...messages) => logging ? console.log(...messages) : {};
const logError = (...messages) => logging ? console.error(...messages) : {};

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
      else if (typeof id === 'string' && !tale) logError(new Error('Menestrel: no tale found for id ' + id));
      else if (typeof tale === 'string') resolve(tale);
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
    const knights = this.knights;
    this.mountNode = mountNode;
    Object.keys(knights).forEach(key => {
      if (knights.hasOwnProperty(key)) knights[key].setMenestrel(this);
    });
    this.song = React.render(<Song knights={knights} />, mountNode);
    return this;
  }
  
  update(callback) {
    this.song.setState({knights: this.knights}, callback);
    return this;
  }
}

class Song extends React.Component {
  
  componentWillMount() {
    this.setState({knights: this.props.knights});
  }
  
  render() {
    const {knights} = this.state;
    
    return (
      <div>
        {Object.keys(knights)
        .filter(key => knights.hasOwnProperty(key))
        .map(key => knights[key])
        .filter(knight => knight.mounted)
        .map(knight => {
          const {id, sword, x, y, visible} = knight;
          
          return (<span key={id} style={{
              position: 'fixed',
              top: y,
              left: x,
              opacity: visible ? 1 : 0,
          }}>
            { React.cloneElement(sword, {ref: id}) }
          </span>);
        })}
      </div>
    );
  }  
}

export class Knight {
  
  constructor(pledge) {
    const {x, y, transitionTime, easing, onMount, onUnmount, onShow, onHide, onMoveStart, onMoveEnd, sword} = pledge;
    
    this.dx = 0;
    this.dy = 0;
    this.mounted = false;
    this.visible = false;
    this.easing = easing;
    this.transitionTime = transitionTime;
    this.id = Math.random().toString().slice(2);
    this.x = !isNaN(parseFloat(x)) && isFinite(x) ? x : 0;
    this.y = !isNaN(parseFloat(y)) && isFinite(y) ? y : 0;
    this.sword = React.isValidElement(sword) ? sword : undefined;
    this.onMount     = typeof onMount     === 'function' ? onMount :     () => {};
    this.onUnmount   = typeof onUnmount   === 'function' ? onUnmount :   () => {};
    this.onShow      = typeof onShow      === 'function' ? onShow :      () => {};
    this.onHide      = typeof onHide      === 'function' ? onHide :      () => {};
    this.onMoveStart = typeof onMoveStart === 'function' ? onMoveStart : () => {};
    this.onMoveEnd   = typeof onMoveEnd   === 'function' ? onMoveEnd :   () => {};
  }
  
  mount(x, y) {
    const promise = new Promise((resolve, reject) => {
      this.mounted = true;
      this.visible = true;
      this.x = x || this.x;
      this.y = y || this.y;
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
  
  setMenestrel(menestrel) {
    this.menestrel = menestrel;
  }
  
  passNext(next, id, delay, callback) {
    this.menestrel.song.refs[this.id].setState({next: next.bind(null, id, delay)}, callback);
    return this;
  }
}

export class TextKnight extends Knight {
  
  constructor(text, pledge) {
    super(pledge);
    this.text = text;
    this.sword = React.createElement(TextSword, {text});
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
    this.sword = React.createElement(ImageSword, {url, width, height});
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
    this.sword = React.createElement(ShapeSword, {shape, width, height, color, dx, dy, transitionTime, easing});
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
    console.log(css);
    
    return(
      <div>
        <style>{css}</style>
        {this.renderShape(shape, color, width, height, classes)}
      </div>
    );
  }
}
