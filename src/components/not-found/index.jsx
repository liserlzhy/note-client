import React, { Component } from 'react'
import { Flex, Button } from 'antd-mobile'

class NotFound extends Component {
  render() {
    return (
      <Flex justify="center" align="center" direction="column" style={{height: '100vh'}}>
        <div style={{fontSize: 100, fontWeight: 30, color: 'red', fontFamily: 'cursive'}}>404</div>
        <Button type="ghost" inline={true} onClick={() => this.props.history.replace('/')}>返回首页</Button>
      </Flex>
    )
  }
}

export default NotFound