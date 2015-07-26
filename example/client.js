import Menestrel, {passNext, mount, unmount, show, hide, toogle, Knight, TextKnight, ImageKnight, ShapeKnight, React} from '../src';

class Button extends React.Component {
  handleClick() {
    this.state.next();
  }
  render() {
    return <button type="button" onClick={this.handleClick.bind(this)}>Click Me!</button>;
  }
}

const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let stepDown = true;

const tales = {
  beginning: {
    content: (knights, next) => {
      const {arthur, lancelot} = knights;
      // console.log(arthur.menestrel);
      mount(arthur);
      mount(lancelot);
      next('second', 1000);
    }
  },
  first: {
    content: (knights, next) => {
      const {perceval, lancelot, chuck} = knights;
        
        if (chuck.mounted) toogle(chuck);
        unmount(perceval);
        toogle(lancelot);
        next('second', 1000);
    }
    
  },
  second: {
    content: (knights, next) => {
      const {lancelot, galaad, arthur} = knights;
      mount(galaad);
      toogle(lancelot);
        // arthur.setText(arthur.text + '.')
          // .move(randomInteger(0, 1500), randomInteger(0, 800)),
      next('third', 1000);
    }
  },
  third: {
    content: (knights, next) => {
      const {arthur, galaad, perceval, lancelot} = knights;
      toogle(arthur),
      toogle(lancelot),
      unmount(galaad),
      mount(perceval),
      next('fourth', 1000);
    }
  },
  fourth: {
    content: (knights, next) => {
      const {chuck} = knights;
      if (chuck.mounted) {
        show(chuck);
        chuck.passNext(next, 'fifth');
      }
      else {
        mount(chuck);
        passNext(chuck, next, 'fifth');
      }
    }
  },
  
  // direct reference
  fifth: 'sixth', 
  
  // containers
  sixth: ['n1', [['n2', 'n3'], 'seventh']], // same as ['n1', 'n2', 'n3', 'sixth']

  // containers as next
  seventh: { 
    content: (knights, next) => next(['n2', 'eigth'], 100)
  },
  
  // onStart
  eigth: { 
    onStart: ['ninth', 'n4'],
    content: (knights, next) => next(),
  },
  
  // onEnd
  ninth: { 
    onEnd:   ['first'],
    content: (knights, next) => next(null, 200),
  },
  
  // shorthand
  n1: (knights, next) => next(),
  n2: (knights, next) => next(),
  n3: (knights, next) => next(),
  n4: (knights, next) => next(),
  
  blink: (knights, next) => {
    const {bruce} = knights;
    bruce.mounted ?
      bruce.toogle().then(() => next('blink', 5000)) :
      bruce.mount().then(() => next('blink', 5000));
  },
  
  step: (knights, next) => {
    const {lee} = knights;
    if (lee.mounted) {
      if (stepDown) {
        if (lee.y > 880) stepDown = false;
        lee.displace(0, 10).then(() => next('step', 1000));
      } else {
        if (lee.y < 20) stepDown = true;
        lee.displace(0, -10).then(() => next('step', 1000));
      }
    }
    else lee.mount().then(() => next('step', 1000));
  }
};

const knights = {
  arthur: new TextKnight('arthur', {
    x: 0,
    y: 0,
  }),
  lancelot: new TextKnight('lancelot', {
    x: 100,
    y: 100,
    onShow: () => console.log('lancelot onShow')
  }),
  galaad: new TextKnight('galaad', {
    x: 200,
    y: 200,
    onUnmount: () => console.log('galaad onUnmount')
  }),
  perceval: new ImageKnight('https://matricien.files.wordpress.com/2012/04/perceval-sur-sa-monture.jpg', {
    x: 200,
    y: 300,
    width: 200,
  }),
  chuck: new Knight({
    Sword: Button,
    x: 200,
    y: 280,
  }),
  bruce: new ShapeKnight('rectangle', {
    x: 700,
    y: 100,
    width: 100,
    height: 100,
    color: '#113F59',
  }),
  lee: new ShapeKnight('rectangle', {
    x: 810,
    y: 100,
    width: 100,
    height: 100,
    color: '#113F59',
    easing: 'linear',
    transitionTime: 1
  }),
};

console.log('starting Menestrel...\n');

const onboarding = new Menestrel(tales, knights)
.mount(document.getElementById('mountNode'))
.start('beginning');
// .start(['blink', 'step', 'beginning']);
