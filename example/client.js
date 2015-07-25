import Menestrel, {Knight, TextKnight, React} from '../src';

class Button extends React.Component {
  handleClick() {
    this.state.next();
  }
  render() {
    return <button type="button" onClick={this.handleClick.bind(this)}>Click Me!</button>;
  }
}

const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const tales = {
  beginning: {
    content: (knights, next) => {
      console.log('beginning');
      const {arthur, lancelot} = knights;
      Promise.all([
        arthur.mount(),
        lancelot.mount(),
      ]).then(() => next('second', 1000));
    }
  },
  first: {
    content: (knights, next) => {
      console.log('first');
      const {perceval, lancelot, chuck} = knights;
      Promise.all([
        chuck.mounted ? chuck.toogle() : Promise.resolve(),
        perceval.unmount(),
        lancelot.toogle(),
      ]).then(() => next('second', 1000));
    }
    
  },
  second: {
    content: (knights, next) => {
      console.log('second');
      const {lancelot, galaad, arthur} = knights;
      Promise.all([
        galaad.mount(),
        lancelot.toogle(),
        arthur.setText(arthur.getText() + '.')
          .move(randomInteger(0, 1500), randomInteger(0, 800)),
      ]).then(() => next('third', 1000));
    }
  },
  third: {
    content: (knights, next) => {
      console.log('third');
      const {arthur, galaad, perceval, lancelot} = knights;
      Promise.all([
        arthur.toogle(),
        lancelot.toogle(),
        galaad.unmount(),
        perceval.mount(),
      ]).then(() => next('fourth', 1000));
    }
  },
  fourth: {
    content: (knights, next) => {
      console.log('fourth');
      const {chuck} = knights;
      if (chuck.mounted) {
        chuck.passNext(next, 'first');
        chuck.show();
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

console.log('tales', tales);
console.log('knights', knights);
console.log('starting Menestrel...\n');

const onboarding = new Menestrel(tales, knights)
.mount(document.getElementById('mountNode'))
.start('beginning');
