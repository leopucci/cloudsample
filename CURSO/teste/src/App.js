import logo from './logo.svg';
import './App.css';
import UserOutput from './UserOutput/UserOutput'
import UserInput from './UserInput/UserInput'
import React,{Component} from 'react';
class App extends Component{
state = {
  username: 'NOME DE USER'
}

usernameChangedHandler = (event) => {
  this.setState({username: event.target.value});
}
render(){
  return (
    <div className="App">
       <UserInput changedHandler={this.usernameChangedHandler} valorDefault={this.state.username}></UserInput>
      <UserOutput username={this.state.username}>a</UserOutput>
      <UserOutput></UserOutput>
      <UserOutput></UserOutput>
    </div>
  );
}
};
export default App;
