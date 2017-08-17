# Menestrel

WIP

A library that breaks React's reactive paradigm to describe sequences of operations on components.
Meant to create onboardings, tell stories and ease the art creation dev pain.

```js
const scenario = {
  'first scene': _ => {
    _.mount(FirstComponent)
    _.show(FirstComponent)
    _.wait(2000)
    _.hide(FirstComponent)
    _.wait(1000)
    _.unmount(FirstComponent)
    _.runScene('second scene')
  },
  'second scene': _ => {
    _.mount(SecondComponent)
    _.wait(1000)
    _.show(ThirdComponent)
    _.wait(2000)
    _.pause()
    _.unmount(SecondComponent)
    _.hide(ThirdComponent)
    _.mount(ButtonComponent, {
      onClick: () => _.run(_ => {
        _.unmount(ButtonComponent)
        _.runScene('first scene')
      }),
    })
    _.resume()
  },
}
```
