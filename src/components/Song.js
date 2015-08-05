import React from 'react';

export default class Song extends React.Component {
  
  componentWillMount() {
    this.setState({knights: this.props.knights});
  }
  
  renderSwords(knights) {
    return Object.keys(knights)
    .filter(key => knights.hasOwnProperty(key)) // How does that perform ?
    .map(key => knights[key]) // seems sloooow
    .filter(knight => knight.mounted)
    .map(knight => {
      
      const {id, Sword, x, y, visible, props} = knight;
      const spanStyle = {
        position: 'fixed',
        top: y,
        left: x,
        opacity: visible ? 1 : 0,
      };
      return (
        <span key={id} style={spanStyle}>
          { React.createElement(Sword, props) }
        </span>
      );
    }); 
  }
  
  render() {
    
    return <div>{ this.renderSwords(this.state.knights) }</div>;
  }  
}
