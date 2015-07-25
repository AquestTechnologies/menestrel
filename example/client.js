import Menestrel, {textKnight} from '../src';

const tales = {
  beginning: {
    content: (actors, next) => {
      console.log('first');
      const {arthur, lancelot} = actors;
      actors.perceval.unmount();
      arthur.mount();
      lancelot.mount().then(() => next('second', 1500));
    }
  },
  second: {
    content: (actors, next) => {
      console.log('second');
      actors.galaad.mount().then(() => next('third', 1500));
    }
  },
  third: {
    content: (actors, next) => {
      console.log('third');
      actors.arthur.unmount();
      actors.lancelot.unmount();
      actors.galaad.unmount();
      actors.perceval.mount().then(() => next('beginning', 1500));
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
  }),
  galaad: new textKnight('galaad', {
    x: 200,
    y: 200,
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
