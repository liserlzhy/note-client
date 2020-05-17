import React, { Component } from 'react'
import { reqGetUser } from '../../api'
import { withRouter } from 'react-router-dom'
import { Icon } from 'antd-mobile'

class Authentication extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: ''
    }  
  }

  componentDidMount() {
    const token = localStorage.getItem('token')
    if (!token) return this.props.history.replace('/login')
    
    reqGetUser()
      .then(res => {
        this.setState({ user: res.data})
      })
      .catch(err => {
        this.props.history.replace('/login')
      })
  }

  render() {
    if (!this.state.user) {
      return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon type="loading" size="lg"/></div>
    }
    return (
      <>
        { this.props.children }
      </>
    )
  }
}

export default withRouter(Authentication)