import React from 'react';

export default class ImageSword extends React.Component {
  
  componentWillMount() {
    const {path, width, height} = this.props;
    this.setState({path, width, height});
  }
  
  render() {
    const {path, width, height} = this.state;
    return <img src={path} width={width ? width : 'auto'} height={height ? height : 'auto'} />;
  }
}
