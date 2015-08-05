import React from 'react';

export default class ShapeSword extends React.Component {
  
  render() {
    const {shape, width, height, color} = this.props;
    
    if (shape === 'rectangle') return <div style={{
      backgroundColor: color,
      width: width ? width : 'auto',
      height: height ? height : 'auto',
    }} />;
  }
}
