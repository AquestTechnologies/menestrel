import React from 'react';

export default class TextSword extends React.Component {
  
  componentWillMount() {
    this.setState({text: this.props.text});
  }
  
  render() {
    return <span>{ this.state.text }</span>;
  }
}
