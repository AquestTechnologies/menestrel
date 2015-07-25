import Menestrel, {textKnight} from '../src';

const tales = {
  beginning: {
    content: (actors, next) => {
      console.log('beginning');
      const {arthur, lancelot} = actors;
      Promise.all([
        arthur.mount(),
        lancelot.mount(),
      ]).then(() => next('second', 1500));
    }
  },
  first: {
    content: (actors, next) => {
      console.log('first');
      const {perceval, lancelot} = actors;
      Promise.all([
        perceval.unmount(),
        lancelot.toogle(),
      ]).then(() => next('second', 1500));
    }
    
  },
  second: {
    content: (actors, next) => {
      console.log('second');
      const {lancelot, galaad} = actors;
      Promise.all([
        galaad.mount(),
        lancelot.toogle(),
      ]).then(() => next('third', 1500));
    }
  },
  third: {
    content: (actors, next) => {
      console.log('third');
      const {arthur, galaad, perceval, lancelot} = actors;
      Promise.all([
        arthur.toogle(),
        lancelot.toogle(),
        galaad.unmount(),
        perceval.mount(),
      ]).then(() => next('first', 1500));
    }
  }
};

const knights = {
  arthur: new textKnight('arthur', {
    x: 0,
    y: 0,
  }),
  lancelot: new textKnight('lancelot', {
    x: 100,
    y: 100,
    onShow: () => console.log('lancelot onShow')
  }),
  galaad: new textKnight('galaad', {
    x: 200,
    y: 200,
    onUnmount: () => console.log('galaad onUnmount')
  }),
  perceval: new textKnight('perceval', {
    x: 300,
    y: 300,
  }),
  gauvin: new textKnight('gauvin', {
    x: 1000,
    y: 1000,
  }),
};

console.log('scenes', tales);
console.log('knights', knights);
console.log('starting Menestrel...\n');

const onboarding = new Menestrel(tales, knights)
.mount(document.getElementById('mountNode'))
.start('beginning');
