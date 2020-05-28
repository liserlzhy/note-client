import React, { Component } from 'react'
import { WhiteSpace, WingBlank, InputItem, Button, List, NavBar, Flex, NoticeBar } from 'antd-mobile'
import Logo from '../logo'
import { reqGetCode, reqReset } from '../../api'
import { isMail } from '../../assets/js'

const FlexItem = Flex.Item

class Reset extends Component {

  state = {
    mail: '',
    password: '',
    repassword: '',
    code: '',
    msg: '',
    isDisable: false,
    codeButtonText: '发送验证码'
  }

  timerId = null 

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  reset = async () => {
    let { mail, password, repassword, code } = this.state

    if (!mail || !password || !repassword || !code) return this.setState({ msg: '请填写相应数据' }) 
    if (!isMail(mail)) return this.setState({ msg: '邮箱地址格式不正确' })
    if (password.length < 6) return this.setState({ msg: '密码长度不能少于6位' })
    if (password !== repassword) return this.setState({ msg: '两次密码不一致' })
    
    const { data } = await reqReset({ mail, password, code })
    if (data.err === 0) {
      clearInterval(this.timerId)
      this.props.history.replace('/login')
    } else {
      this.setState({ msg: data.msg })
    }
  }

  toLogin = () => {
    this.props.history.replace('/login')
  }

  toRegister = () => {
    this.props.history.replace('/register')
  }

  getCode = async () => {
    let { mail } = this.state 

    // 数据验证
    if (!mail) return this.setState({ msg: '邮箱地址不能为空' }) 
    if (!isMail(mail)) return this.setState({ msg: '邮箱地址格式不正确' })

    // 验证码重发倒计时1分钟
    let time = 60
    this.setState({ isDisable: true, codeButtonText: `重新发送(${time})` })
    this.timerId = setInterval(() => {
      time--
      this.setState({ codeButtonText: `重新发送(${time})` })
      if (time <= 0) {
        clearInterval(this.timerId)
        this.setState({ isDisable: false })
        this.setState({ codeButtonText: '发送验证码' })
      }
    }, 1000)

    // 发送请求获取验证码
    const { data: { err, msg } } = await reqGetCode(mail)
    if (err === 1) return this.setState({ msg })
  }

  handleNotiveBarClick = () => {
    this.setState({ msg: '' })
  }
  
  render() {
    const { msg, isDisable, codeButtonText } = this.state
    return (
      <div>
        <NavBar>便&nbsp;&nbsp;签</NavBar>
        <Logo></Logo>
        <WingBlank>
          <List>
            {msg ? <NoticeBar mode="closable" onClick={this.handleNotiveBarClick}>{msg}</NoticeBar> : null}
            <InputItem placeholder="请输入邮箱地址" onChange={val => {this.handleChange('mail', val.trim())}}>邮箱:</InputItem>
            <WhiteSpace/>
            <InputItem placeholder="请输入密码" type="password" onChange={val => {this.handleChange('password', val.trim())}}>密码:</InputItem>
            <WhiteSpace/>
            <InputItem placeholder="请输入确认密码" type="password" onChange={val => this.handleChange('repassword', val.trim())}>确认密码:</InputItem>
            <WhiteSpace/>
            <Flex>
              <FlexItem style={{flex: 2}}>
                <InputItem placeholder="请输入验证码" onChange={val => this.handleChange('code', val.trim())}>验证码:</InputItem>
              </FlexItem>
              <FlexItem>
                <Button onClick={this.getCode} disabled={isDisable} style={{backgroundColor: '#057d9f', color: '#fff'}} activeStyle={{ backgroundColor:  '#06627d' }}>{codeButtonText}</Button>
              </FlexItem>
            </Flex>
            <WhiteSpace/>
            <Button type="primary" onClick={this.reset}>重置密码</Button>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button onClick={this.toRegister} className="foot-button">前往注册</Button>
              <Button onClick={this.toLogin} className="foot-button">前往登录</Button>
            </div>
          </List>
        </WingBlank>
    </div>
    )
  }
}

export default Reset
