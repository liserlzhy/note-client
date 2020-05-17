import React from 'react'
import { render } from 'react-dom' 
import { BrowserRouter } from 'react-router-dom'
import { Switch, Route } from 'react-router-dom'
import Loadable from './components/loadable'
import './assets/css/style.less'
import Main from './components/main'

const Login = Loadable(() => import('./components/login'))
const Register = Loadable(() => import('./components/register'))
const Reset = Loadable(() => import('./components/reset'))

render(
  <BrowserRouter>
    <Switch>
      <Route path='/login' exact component={Login}/>
      <Route path='/register' exact component={Register}/>
      <Route path='/reset' exact component={Reset}/>
      <Route component={Main}/>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
)