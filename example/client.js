import Menestrel, {Knight, TextKnight, ImageKnight, ShapeKnight, React} from '../src';

class Button extends React.Component {
  handleClick() {
    this.props.next();
  }
  render() {
    return <button type="button" onClick={this.handleClick.bind(this)}>Click Me!</button>;
  }
}

const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
let stepDown = true;

const knights = {
  arthur: new TextKnight({
    text: 'Arthur',
    x: 0,
    y: 0,
  }),
  lancelot: new TextKnight({
    text: 'Lancelot',
    x: 100,
    y: 100,
    onShow: () => console.log('lancelot onShow')
  }),
  galaad: new TextKnight({
    text: 'Galaad',
    x: 200,
    y: 200,
    onUnmount: () => console.log('galaad onUnmount')
  }),
  perceval: new ImageKnight({
    path: 'https://matricien.files.wordpress.com/2012/04/perceval-sur-sa-monture.jpg',
    x: 200,
    y: 300,
    width: 200,
  }),
  chuck: new Knight({
    Sword: Button,
    x: 200,
    y: 280,
  }),
  bruce: new ShapeKnight({
    shape: 'rectangle',
    x: 700,
    y: 100,
    width: 100,
    height: 100,
    color: '#113F59',
  }),
  lee: new ShapeKnight({
    shape: 'rectangle',
    x: 810,
    y: 100,
    width: 100,
    height: 100,
  }),
};

const pace = 100;
const tales = {
  
  beginning: (knights, next) => {
    const {arthur, lancelot} = knights;
    Promise.all([
      arthur.mount(),
      lancelot.mount(),
    ]).then(() => next('second', pace));
  },
  
  first: (knights, next) => {
    const {perceval, lancelot, chuck} = knights;
    Promise.all([
      chuck.mounted ? chuck.toogle() : Promise.resolve(),
      perceval.unmount(),
      lancelot.toogle(),
    ]).then(() => next('second', pace));
  },
  
  second: (knights, next) => {
    const {lancelot, galaad, arthur} = knights;
    Promise.all([
      galaad.mount(),
      lancelot.toogle(),
      arthur.setText(arthur.text + '.'),
      arthur.move(randomInteger(0, 1000), randomInteger(0, 500)),
    ]).then(() => next('third', pace));
  },
  
  third: (knights, next) => {
    const {arthur, galaad, perceval, lancelot} = knights;
    Promise.all([
      arthur.toogle(),
      lancelot.toogle(),
      galaad.unmount(),
      perceval.mount(),
    ]).then(() => next('fourth', pace));
  },
  fourth: (knights, next) => {
    const {chuck} = knights;
    if (chuck.mounted) {
      chuck.passNext(next, 'fifth');
      chuck.show();
    }
    else chuck.mount().then(() => chuck.passNext(next, 'fifth'));
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
      bruce.toogle().then(() => next('blink', 3000)) :
      bruce.mount().then(() => next('blink', 3000));
  },
  
  step: (knights, next) => {
    const {lee} = knights;
    if (lee.mounted) {
      if (stepDown) {
        if (lee.y > 880) stepDown = false;
        lee.displace(0, 10).then(() => next('step', 100));
      } else {
        if (lee.y < 20) stepDown = true;
        lee.displace(0, -10).then(() => next('step', 100));
      }
    }
    else lee.mount().then(() => next('step', 10));
  }
};

console.log('starting Menestrel...\n');

const onboarding = new Menestrel(tales, knights)
.mount(document.getElementById('mountNode'))
.start('beginning');
// .start(['blink', 'beginning']);
// .start(['blink', 'step', 'beginning']);
