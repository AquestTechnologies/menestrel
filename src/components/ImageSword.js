import React from 'react';

export default class ImageSword extends React.Component {
  
  render() {
    const {path, width, height} = this.props;
    return <img src={path} width={width ? width : 'auto'} height={height ? height : 'auto'} />;
  }
}
