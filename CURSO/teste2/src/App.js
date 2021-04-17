
import React, { Component } from 'react';
import './App.css';
import ValidatorComponent from './ValidatorComponent/ValidatorComponent'
class App extends Component {
  state = {
    lenght: 0,
  }


 lenghHandler = (event) => {
   
   const newvalue = event.target.value
  this.setState ({length : newvalue.length})
  console.log(newvalue.length)
  }


  render() {

    return (
      <div className="App">
        <input onChange={(event) => this.lenghHandler(event)} type="text"></input>
        <p>The lenght is: { this.state.length}</p>
        <ValidatorComponent textLenght={this.state.length} ></ValidatorComponent>
      </div>
    );
  };

}

export default App;
