import Menestrel, {Knight, TextKnight, React} from '../src';

class Button extends React.Component {
  handleClick() {
    this.state.next();
  }
  render() {
    return <button type="button" onClick={this.handleClick.bind(this)}>Click Me!</button>;
  }
}

const tales = {
  beginning: {
    content: (actors, next) => {
      console.log('beginning');
      const {arthur, lancelot} = actors;
      Promise.all([
        arthur.mount(),
        lancelot.mount(),
      ]).then(() => next('second', 500));
    }
  },
  first: {
    content: (actors, next) => {
      console.log('first');
      const {perceval, lancelot, chuck} = actors;
      Promise.all([
        chuck.mounted ? chuck.toogle() : Promise.resolve(),
        perceval.unmount(),
        lancelot.toogle(),
      ]).then(() => next('second', 500));
    }
    
  },
  second: {
    content: (actors, next) => {
      console.log('second');
      const {lancelot, galaad} = actors;
      Promise.all([
        galaad.mount(),
        lancelot.toogle(),
      ]).then(() => next('third', 500));
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
      ]).then(() => next('fourth', 500));
    }
  },
  fourth: {
    content: (actors, next) => {
      console.log('fourth');
      const {chuck} = actors;
      if (chuck.mounted) {
        chuck.show().then(() => chuck.passNext(next, 'first'));
      }
      else chuck.mount().then(() => chuck.passNext(next, 'first'));
    }
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
  perceval: new TextKnight('perceval', {
    x: 300,
    y: 300,
  }),
  gauvin: new TextKnight('gauvin', {
    x: 1000,
    y: 1000,
  }),
  chuck: new Knight({
    sword: <Button />,
    x: 1920 / 3,
    y: 1080 / 3,
  })
};

console.log('scenes', tales);
console.log('knights', knights);
console.log('starting Menestrel...\n');

const onboarding = new Menestrel(tales, knights)
.mount(document.getElementById('mountNode'))
.start('beginning');

