import React from 'react'

class Casting {
  // TODO: extend Map ?
  actors = {}

  get = actor => {
    if (typeof actor === 'string') return this.actors[actor]
    if (typeof actor === 'function' && actor.name) return actor
    
    throw new Error(`Actor not found: ${actor}`)
  }

  add = (Component = 'div', {
    name = Math.random(),
    Wrapper = 'div',
    wrapperProps = {},
    visible = true,
    mounted = true,
    topLevel = false,
  } = {}) => {

    if (!wrapperProps.style) wrapperProps.style = {}

    const deadState = {
      mounted,
      visible,
      childProps: {},
    }

    const Actor = p => {
      // console.log('Actor', name, 'render');
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

    return this.actors[name] = Object.assign(Actor, {
      name,
      topLevel,
      deadState,
    })
  }
}

class Shooting extends React.Component {

  queues = new Set()

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

    run: this.shoot,
    update: this.update,
    forceUpdate: this.forceUpdate.bind(this),
  })

  update = q => !q.paused && new Promise(resolve => this.forceUpdate(resolve))

  shoot = scene => {
    // console.log('shoot:', scene)
    const sceneFn = typeof scene === 'function' ? scene : this.props.scenario[scene]

    if (typeof sceneFn !== 'function') throw new Error(`Scene "${scene}" not found in scenario`)

    const q = []

    this.queues.add(q)
    sceneFn(this._(q))
    this.dequeue(q)
  }

  dequeue = q => {
    const { casting } = this.props
    const action = q.shift()

    if (!action) return this.queues.delete(q)

    // console.log('dequeue:', action)

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

    // console.log('Mounted Shooting. Running first scene')
    this.shoot(firstScene || Object.keys(scenario)[0])
  }

  render() {
    const { casting, style, className, children } = this.props

    // TODO: remove topLevel ?
    const topLevelActors = []

    Object.keys(casting.actors).forEach(actorId => {
      const Actor = casting.actors[actorId]

      if (Actor.topLevel) topLevelActors.push(<Actor key={actorId} />)
    })

    return (
      <div {...{ className, style }}>
        {children}
        {topLevelActors}
      </div>
    )
  }
}

export { Casting, Shooting }
