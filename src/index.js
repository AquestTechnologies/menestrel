import React from 'react';

export default class Menestrel {
  
  constructor(tales, knights) {
    this.tales = tales;
    this.knights = knights;
  }
  
  _sing(id) {
    new Promise(resolve => this.tales[id].content(this.knights, (id, delay) => {
      if (delay) setTimeout(resolve.bind(null, id), delay); 
      else resolve(id);
    }))
    .then(nextId => { 
      if (nextId) {
        if (nextId) this._sing.call(this, nextId);
        else throw new Error('Menestrel : in tale ' + id + ', cannot find next tale ' + nextId);
      } 
      else console.log('tale ' + id + ': nothing next');
    });
  }
  
  start(id) {
    this._sing.call(this, id);
    return this;
  }
  
  mount(mountNode) {
    this.mountNode = mountNode;
    const knights = this.knights;
    Object.keys(knights).forEach(key => {
      if (knights.hasOwnProperty(key)) knights[key].setMenestrel(this);
    });
    this.song = React.createElement(Song, {knights});
    React.render(this.song, mountNode);
    return this;
  }
  
  update(callback) {
    React.render(this.song, this.mountNode, callback);
  }
}

class Song extends React.Component {
  
  render() {
    const {knights} = this.props;
    return (
      <div>
        {Object.keys(knights)
        .filter(key => knights.hasOwnProperty(key))
        .map(key => knights[key])
        .map(knight => {
          if (knight.mounted) {
            const {id, sword, x, y, visible} = knight;
            return (
              <span key={id} style={{
                  position: 'fixed',
                  top: y,
                  left: x,
                  opacity: visible ? 1 : 0,
                }}>
                {sword}
              </span>
            );
          }
        })}
      </div>
    );
  }  
}
/* interpoler medias

medias:
texte // SVG ou DOM -> Dom avec du SVG eventuellement
forme // SVG ou DOM -> Dom avec du SVG eventuellement
video // Youtube ou DOM -> Dom avec une video Youtube eventuellement
son
composant react

Knight
() mount, unmount, show, hide, move(x, y, t, method)
 . mounted visible position 

Knights list :
onMount, 
onUnmount, 
onShow, 
onHide, 
onMoveStart, 
onMoveEnd


Sequences :
conteneur : Promise.all sequences
sequence : Promise that resolving calls next sequence


*/

export class Knight {
  
  constructor(pledge) {
    this.id = Math.random().toString().slice(2);
    this.mounted = false;
    this.visible = false;
    
    const { x, y, onMount, onUnmount, onShow, onHide, onMoveStart, onMoveEnd, sword } = pledge;
    this.x = !isNaN(parseFloat(x)) && isFinite(x) ? x : 0;
    this.y = !isNaN(parseFloat(y)) && isFinite(y) ? y : 0;
    this.onMount     = typeof onMount     === 'function' ? onMount : () => {};
    this.onUnmount   = typeof onUnmount   === 'function' ? onUnmount : () => {};
    this.onShow      = typeof onShow      === 'function' ? onShow : () => {};
    this.onHide      = typeof onHide      === 'function' ? onHide : () => {};
    this.onMoveStart = typeof onMoveStart === 'function' ? onMoveStart : () => {};
    this.onMoveEnd   = typeof onMoveEnd   === 'function' ? onMoveEnd : () => {};
    this.sword = sword instanceof React.Component ? sword : undefined;
  }
  
  setMountNode(node) {
    this.mountNode = node;
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
      resolve();
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
      resolve();
    });
    
    promise.then(() => this.onHide());
    
    return promise;
  }
  
  toogle() {
    return this.visible ? this.hide() : this.show();
  }
  
  move(x, y, t, m) {
    this.onMoveStart();
    
    const promise = new Promise((resolve, reject) => {
      if (!x && !y) throw new Error('Knight.move: missing x and y args');
      
      if (!t) {
        this.x = x;
        this.y = y;
      } else {
        
      }
      resolve();
    });
    
    promise.then(() => this.onUnmount());
    
    return promise;
  }
  
  setMenestrel(menestrel) {
    this.menestrel = menestrel;
  }
}

export class textKnight extends Knight {
  
  constructor(text, pledge) {
    super(pledge);
    this.sword = React.createElement(textSword, {text});
  }
  
  setText(text, callback) {
    return this.sword.setState({text}, callback);
  }
  
  getText() {
    return this.sword.state.text;
  }
}

class textSword extends React.Component {
  
  componentWillMount() {
    const {text} = this.props;
    this.setState({text});
  }
  
  render() {
    return <span>{this.state.text}</span>;
  }
}