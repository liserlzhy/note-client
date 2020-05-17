import React, { Component } from 'react'
import { WingBlank, WhiteSpace, NavBar, List, InputItem, Button, NoticeBar } from 'antd-mobile'
import Logo from '../logo'
import { reqLogin } from '../../api'
import { isMail } from '../../assets/js'

class Login extends Component {

  state = {
    mail: '',
    password: '',
    msg: ''
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value})
  } 

  login = async () => {
    const { mail, password } = this.state

    if (!mail || !password) return this.setState({ msg: '请填写相应的数据' })
    if (!isMail(mail)) return this.setState({ msg: '邮箱地址格式不正确' })

    const { data } = await reqLogin({ mail, password })
    if (data.err === 0) {
      localStorage.setItem('token', data.data)
      this.props.history.replace('/')
    } else {
      this.setState({ msg: data.msg })
    }
  }

  toRegister = () => {
    this.props.history.replace('/register')
  }

  resetPassword = () => {
    this.props.history.replace('/reset')
  }

  handleNotiveBarClick = () => {
    this.setState({ msg: '' })
  }

  render() {
    const { msg } = this.state
    return (
      <div>
        <NavBar>便&nbsp;&nbsp;签</NavBar>
        <Logo></Logo>
        <WingBlank>
          <List>
          {msg ? <NoticeBar mode="closable" onClick={this.handleNotiveBarClick}>{msg}</NoticeBar> : null}
            <InputItem placeholder="请输入邮箱地址" onChange={val => this.handleChange('mail', val.trim())}>邮箱:</InputItem>
            <WhiteSpace />
            <InputItem placeholder="请输入密码" type="password" onChange={val => this.handleChange('password', val.trim())}>密码:</InputItem>
            <WhiteSpace />
            <Button type="primary" onClick={this.login}>登&nbsp;&nbsp;&nbsp;陆</Button>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button onClick={this.toRegister} style={{flex: 1, borderRadius: 0}} >未有帐号?</Button>
              <Button onClick={this.resetPassword} style={{flex: 1, borderRadius: 0}}>忘记密码？</Button>
            </div>
          </List>
        </WingBlank>
      </div>
    )
  }
}

export default Login