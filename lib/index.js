'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Shooting = exports.Casting = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Casting = function Casting() {
  var _this = this;

  _classCallCheck(this, Casting);

  this.actors = {};

  this.get = function (actor) {
    if (typeof actor === 'string') return _this.actors[actor];
    if (typeof actor === 'function' && actor.id) return actor;

    throw new Error('Actor not found: ' + actor);
  };

  this.add = function () {
    var Component = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$id = _ref.id,
        id = _ref$id === undefined ? Math.random() : _ref$id,
        _ref$Wrapper = _ref.Wrapper,
        Wrapper = _ref$Wrapper === undefined ? 'div' : _ref$Wrapper,
        _ref$wrapperProps = _ref.wrapperProps,
        wrapperProps = _ref$wrapperProps === undefined ? {} : _ref$wrapperProps,
        _ref$visible = _ref.visible,
        visible = _ref$visible === undefined ? true : _ref$visible,
        _ref$mounted = _ref.mounted,
        mounted = _ref$mounted === undefined ? true : _ref$mounted,
        _ref$topLevel = _ref.topLevel,
        topLevel = _ref$topLevel === undefined ? false : _ref$topLevel;

    if (!wrapperProps.style) wrapperProps.style = {};

    var deadState = {
      mounted: mounted,
      visible: visible,
      childProps: {}
    };

    var Actor = function Actor(p) {
      // console.log('Actor', id, 'render');
      var mounted = deadState.mounted,
          visible = deadState.visible,
          childProps = deadState.childProps;


      if (!mounted) return null;

      // keep Wrapper ? or just child ? Maybe option
      var style = _extends({}, wrapperProps.style, {
        opacity: visible ? 1 : 0,
        transition: 'opacity .5s linear' // TODO: transition settings
      });

      return _react2.default.createElement(Wrapper, _extends({}, wrapperProps, { style: style }), _react2.default.createElement(Component, _extends({}, p, childProps)));
    };

    return _this.actors[id] = Object.assign(Actor, {
      id: id,
      topLevel: topLevel,
      deadState: deadState
    });
  };
}
// TODO: extend Map ?
;

var Shooting = function (_React$Component) {
  _inherits(Shooting, _React$Component);

  function Shooting() {
    var _ref2;

    var _temp, _this2, _ret;

    _classCallCheck(this, Shooting);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref2 = Shooting.__proto__ || Object.getPrototypeOf(Shooting)).call.apply(_ref2, [this].concat(args))), _this2), _this2.queues = new Set(), _this2._ = function (q) {
      return {
        pause: function pause() {
          return q.push({ type: 'PAUSE' });
        },

        resume: function resume() {
          return q.push({ type: 'RESUME' });
        },

        wait: function wait(duration) {
          return q.push({ type: 'WAIT', duration: duration });
        },

        updateProps: function updateProps(actor, props) {
          return q.push({ type: 'UPDATE_PROPS', actor: actor, props: props });
        },

        mount: function mount(actor, props) {
          return q.push({ type: 'MOUNT', actor: actor, props: props });
        },

        unmount: function unmount(actor) {
          return q.push({ type: 'UNMOUNT', actor: actor });
        },

        show: function show(actor) {
          return q.push({ type: 'SHOW', actor: actor });
        },

        hide: function hide(actor) {
          return q.push({ type: 'HIDE', actor: actor });
        },

        toggle: function toggle(actor) {
          return q.push({ type: 'TOGGLE', actor: actor });
        },

        runScene: function runScene(sceneId) {
          return q.push({ type: 'SHOOT', sceneId: sceneId });
        },

        run: _this2.shoot,
        update: _this2.update,
        forceUpdate: _this2.forceUpdate.bind(_this2)
      };
    }, _this2.update = function (q) {
      return !q.paused && new Promise(function (resolve) {
        return _this2.forceUpdate(resolve);
      });
    }, _this2.shoot = function (scene) {
      // console.log('shoot:', scene)
      var sceneFn = typeof scene === 'function' ? scene : _this2.props.scenario[scene];

      if (typeof sceneFn !== 'function') throw new Error('Scene "' + scene + '" not found in scenario');

      var q = [];

      _this2.queues.add(q);
      sceneFn(_this2._(q));
      _this2.dequeue(q);
    }, _this2.dequeue = function (q) {
      var casting = _this2.props.casting;

      var action = q.shift();

      if (!action) return _this2.queues.delete(q);

      // console.log('dequeue:', action)

      var promise = void 0;

      switch (action.type) {
        case 'SHOOT':
          _this2.shoot(action.sceneId);
          break;

        case 'PAUSE':
          q.paused = true;
          break;

        case 'RESUME':
          q.paused = false;
          promise = _this2.update(q);
          break;

        case 'WAIT':
          promise = new Promise(function (resolve) {
            return setTimeout(resolve, action.duration);
          });
          break;

        case 'UPDATE_PROPS':
          Object.assign(casting.get(action.actor).deadState.childProps, action.props);
          promise = _this2.update(q);
          break;

        case 'MOUNT':
          {
            var _casting$get = casting.get(action.actor),
                deadState = _casting$get.deadState;

            deadState.mounted = true;

            if (action.props) Object.assign(deadState.childProps, action.props);

            promise = _this2.update(q);
            break;
          }

        case 'UNMOUNT':
          casting.get(action.actor).deadState.mounted = false;
          promise = _this2.update(q);
          break;

        case 'SHOW':
          casting.get(action.actor).deadState.visible = true;
          promise = _this2.update(q);
          break;

        case 'HIDE':
          casting.get(action.actor).deadState.visible = false;
          promise = _this2.update(q);
          break;

        case 'TOGGLE':
          {
            var _casting$get2 = casting.get(action.actor),
                _deadState = _casting$get2.deadState;

            _deadState.visible = !_deadState.visible;
            promise = _this2.update(q);
            break;
          }
      }

      return promise ? promise.then(function () {
        return _this2.dequeue(q);
      }) : _this2.dequeue(q);
    }, _temp), _possibleConstructorReturn(_this2, _ret);
  }

  _createClass(Shooting, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _props = this.props,
          disabled = _props.disabled,
          firstScene = _props.firstScene,
          scenario = _props.scenario;


      if (disabled) return; // TODO: stop all and continue with disabled prop

      // console.log('Mounted Shooting. Running first scene')
      this.shoot(firstScene || Object.keys(scenario)[0]);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          casting = _props2.casting,
          style = _props2.style,
          className = _props2.className,
          children = _props2.children;

      // TODO: remove topLevel ?

      var topLevelActors = _react2.default.Children.toArray(children);

      Object.keys(casting.actors).forEach(function (key) {
        var Actor = casting.actors[key];

        if (Actor.topLevel) topLevelActors.push(_react2.default.createElement(Actor, { key: key }));
      });

      return _react2.default.createElement('div', { className: className, style: style }, topLevelActors);
    }
  }]);

  return Shooting;
}(_react2.default.Component);

exports.Casting = Casting;
exports.Shooting = Shooting;
