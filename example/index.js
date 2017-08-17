import React from 'react'
import ReactDOM from 'react-dom'
import { Casting, Shooting } from '../lib'

let t = Date.now()

// Casting

const casting = new Casting()

const Title = () => <h1>Aquest Technologies presents</h1>
const Button = ({ onClick }) => <button onClick={onClick}>Click me!</button>
const InfoText = () => <div>Some info text</div>

casting.add(Title, {
  name: 'Aquest Technologies presents',
  topLevel: true,
  mounted: false,
  visible: false,
})

casting.add(Button, {
  name: 'cool button',
  topLevel: true,
  mounted: false,
})

const InfoTextActor = casting.add(InfoText, {
  name: 'info text',
  visible: false,
})

const Info = () => (
  <div>
    Here is some info:
    <InfoTextActor />
  </div>
)

casting.add(Info, {
  name: 'info',
  topLevel: true,
  mounted: false,
})

// Scenario

const scenario = {
  'first scene': _ => {
    _.mount('Aquest Technologies presents')
    _.wait(0) // TODO: delay after first action/rerender
    _.show('Aquest Technologies presents')
    _.wait(2000)
    _.hide('Aquest Technologies presents')
    _.wait(1000)
    _.unmount('Aquest Technologies presents')
    _.runScene('second scene')
  },
  'second scene': _ => {
    _.mount('info')
    _.wait(1000)
    _.show('info text')
    _.wait(2000)
    _.pause()
    _.unmount('info') // TODO: add reset method
    _.hide('info text')
    _.mount('cool button', {
      onClick: () => _.run(_ => {
        _.unmount('cool button')
        _.runScene('first scene')
      }),
    })
    _.resume()
  },
}

console.log(`Scenario created. ${Date.now() - t}`)

t = Date.now()

ReactDOM.render(
  <Shooting scenario={scenario} casting={casting} />,
  document.getElementById('root'),
  () => console.log(`App rendered. ${Date.now() - t}`)
)
