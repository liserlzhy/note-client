import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Loadable from '../loadable'

const Authentication = Loadable(() => import('../authentication'))
const NoteList = Loadable(() => import('../note-list'))
const Editor = Loadable(() => import('../editor'))
const NotFound = Loadable(() => import('../not-found'))

class Main extends Component {
  state = {
    user: ''
  }
  render() {
    return (
      <Authentication>
        <Switch>
          <Route path="/editor/:category/:id" exact component={Editor}></Route>
          <Route path="/" exact component={NoteList}></Route>
          <Route path='*' exact component={NotFound} />
        </Switch>
      </Authentication>
    )
  }
}

export default Main
