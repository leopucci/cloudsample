import React from 'react'
import { useSelector } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom'

import LogIn from './LogIn/LogIn'
import Register from './Register/Register'
import Home from './Home/Home'
import Public from './PublicPage/Public'
import NotFound from './NotFound/NotFound'
import Header from '../Components/Header'

export default function App() {

  const isLoggedIn = useSelector(state => state.user.isLoggedIn && state.user.jwt !== null)

  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      isLoggedIn === true
        ? <Component {...props} />
        : <Redirect to='/login' />
    )} />
  )

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} />
      <Switch>
        <Route path='/' component={Public} exact />
        <Route path="/login" component={LogIn} />
        <Route path="/signup" component={Register} />
        <PrivateRoute path='/Home' component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  )
}
