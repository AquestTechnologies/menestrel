import React from 'react'
import ReactDOM from 'react-dom'
import { Casting, Shooting } from './menestrel'

let t = Date.now()

// Casting

const casting = new Casting()

const Title = () => <h1>Aquest Technologies presents</h1>
const Button = ({ onClick }) => <button onClick={onClick}>Click me!</button>

casting.add({
  id: 'Aquest Technologies presents',
  Component: Title,
  topLevel: true,
  mounted: false,
  visible: false,
})

casting.add({
  id: 'cool button',
  Component: Button,
  topLevel: true,
  mounted: false,
})

const InfoText = () => <div>Some info text</div>

const InfoTextActor = casting.add({
  id: 'info text',
  Component: InfoText,
  visible: false,
})

const Info = () => (
  <div>
    Here is some info:
    <InfoTextActor />
  </div>
)

casting.add({
  id: 'info',
  Component: Info,
  topLevel: true,
  mounted: false,
})

// Scenario

const scenario = {
  'first scene': _ => {
    _.mount('Aquest Technologies presents')
    _.wait(0) // TODO: delay after first action/rerender
    _.show('Aquest Technologies presents')
    _.wait(3000)
    _.hide('Aquest Technologies presents')
    _.unmount('Aquest Technologies presents')
    _.wait(1000)
    _.runScene('second scene')
  },
  'second scene': _ => {
    _.mount('info')
    _.wait(2000)
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
