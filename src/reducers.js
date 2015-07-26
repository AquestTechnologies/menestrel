// Doit être exporté en premier pour logger avant les autres

import Immutable from 'immutable';
export function tales(state = {}, action) {
  return state;
}

export function knights(state = Immutable.Map({}), action) {
  switch (action.type) {
  case 'MOUNT_MENESTREL':
    const menestrel = action.payload;
    console.log(state);
    return state.map((knight, k) => knight.set('id', k).set('menestrel', menestrel).set('dispatch', menestrel.dispatch));
    
  case 'MOUNT_KNIGHT':
    const {id, x, y} = action.payload;
    console.log(action);
    let newState = state.setIn([id, 'mounted'], true).setIn([id, 'visible'], true);
    if (x && y) newState = state.setIn([id, 'x'], x).setIn([id, 'y'], y);
    return newState;
    
  default:
    return state;
  }
}

