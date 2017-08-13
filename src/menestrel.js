import React from 'react'

class Casting {
  actors = {}

  get = actor => {
    let Actor

    // Id reference
    if (typeof actor === 'string') Actor = this.actors[actor]

    // Class variable
    if (typeof actor === 'function' && actor.id) Actor = actor

    if (!Actor) throw new Error(`Actor not found: ${actor}`)

    return Actor
  }

  add = ({
    id = Math.random(),
    Component = 'div',
    Wrapper = 'div',
    wrapperProps = {},
    visible = true,
    mounted = true,
    topLevel = false,
  }) => {

    console.log('Adding actor', id)

    if (!wrapperProps.style) wrapperProps.style = {}

    const deadState = {
      mounted,
      visible,
      childProps: {},
    }

    const Actor = p => {
      // console.log('Actor', id, 'render');
      const { mounted, visible, childProps } = deadState

      if (!mounted) return null

      // keep Wrapper ? or just child ? Maybe option
      const style = {
        ...wrapperProps.style,
        opacity: visible ? 1 : 0,
        transition: 'opacity .5s linear', // TODO: transition settings
      }

      return React.createElement(
        Wrapper,
        { ...wrapperProps, style },
        React.createElement(Component, { ...p, ...childProps })
      )
    }

    return this.actors[id] = Object.assign(Actor, {
      id,
      topLevel,
      deadState,
    })
  }
}

class Shooting extends React.Component {

  _ = q => ({
    pause: () => q.push({ type: 'PAUSE' }),

    resume: () => q.push({ type: 'RESUME' }),

    wait: duration => q.push({ type: 'WAIT', duration }),

    updateProps: (actor, props) => q.push({ type: 'UPDATE_PROPS', actor, props }),

    mount: (actor, props) => q.push({ type: 'MOUNT', actor, props }),

    unmount: actor => q.push({ type: 'UNMOUNT', actor }),

    show: actor => q.push({ type: 'SHOW', actor }),

    hide: actor => q.push({ type: 'HIDE', actor }),

    toggle: actor => q.push({ type: 'TOGGLE', actor }),

    runScene: sceneId => q.push({ type: 'SHOOT', sceneId }),

    run: x => this.shoot(x),

    update: this.update,
    forceUpdate: this.forceUpdate.bind(this),
  })

  update = q => !q.paused && new Promise(resolve => this.forceUpdate(resolve))

  shoot = sceneId => {
    console.log('shoot:', sceneId)

    const q = []
    const sceneFn = typeof sceneId === 'function' ? sceneId : this.props.scenario[sceneId]

    if (typeof sceneFn !== 'function') throw new Error(`Scene "${sceneId}" not found in scenario`)

    sceneFn(this._(q))

    this.dequeue(q)
  }

  dequeue = q => {
    const { casting } = this.props
    const action = q.shift()

    if (!action) return

    console.log('dequeue:', action)

    let promise

    switch (action.type) {
      case 'SHOOT':
        this.shoot(action.sceneId)
        break

      case 'PAUSE':
        q.paused = true
        break

      case 'RESUME':
        q.paused = false
        promise = this.update(q)
        break

      case 'WAIT':
        promise = new Promise(resolve => setTimeout(resolve, action.duration))
        break

      case 'UPDATE_PROPS':
        Object.assign(casting.get(action.actor).deadState.childProps, action.props)
        promise = this.update(q)
        break

      case 'MOUNT': {
        const { deadState } = casting.get(action.actor)

        deadState.mounted = true

        if (action.props) Object.assign(deadState.childProps, action.props)

        promise = this.update(q)
        break
      }

      case 'UNMOUNT':
        casting.get(action.actor).deadState.mounted = false
        promise = this.update(q)
        break

      case 'SHOW':
        casting.get(action.actor).deadState.visible = true
        promise = this.update(q)
        break

      case 'HIDE':
        casting.get(action.actor).deadState.visible = false
        promise = this.update(q)
        break

      case 'TOGGLE': {
        const { deadState } = casting.get(action.actor)

        deadState.visible = !deadState.visible
        promise = this.update(q)
        break
      }
    }

    return promise ? promise.then(() => this.dequeue(q)) : this.dequeue(q)
  }

  componentDidMount() {
    const { disabled, firstScene, scenario } = this.props

    if (disabled) return // TODO: stop all and continue with disabled prop

    console.log('Mounted Shooting. Running first scene')

    this.shoot(firstScene || Object.keys(scenario)[0])
  }

  render() {
    const { casting, style, className } = this.props
    const children = []

    Object.keys(casting.actors).forEach(actorId => {
      const Actor = casting.actors[actorId]

      if (Actor.topLevel) children.push(<Actor key={actorId} />)
    })

    return (
      <div {...{ className, style }}>
        {children}
      </div>
    )
  }
}

export { Casting, Shooting }
