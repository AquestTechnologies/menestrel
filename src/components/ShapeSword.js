import React from 'react';

export default class ShapeSword extends React.Component {
  
  componentWillMount() {
    const {shape, width, height, color} = this.props;
    this.setState({shape, width, height, color});
  }

  render() {
    const {shape, width, height, color} = this.state;
    
    if (shape === 'rectangle') return <div style={{
      backgroundColor: color,
      width: width ? width : 'auto',
      height: height ? height : 'auto',
    }} />;
  }
}
