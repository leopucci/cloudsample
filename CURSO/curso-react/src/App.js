import './App.css';
import React, { Component } from 'react';
import Person from './Person/Person'

class App extends Component {
  state = {
    persons: [
      { id: 12, name: 'Max', age: '98' },
      { id: 23, name: 'Maaax', age: '8' },
      { id: 8, name: 'Maeex', age: '38' },
    ],
    showPersons: false
  }

  deletePersonHandler = (personIndex) => {
    const persons = this.state.persons.slice()
    persons.splice(personIndex, 1)
    this.setState({ persons: persons })

  }

  nameChangeHandler = (event,id) => {
    const findPersonIndex = this.state.persons.findIndex(person =>{
      return person.id === id;
    })
    const personFound = {
      ...this.state.persons[findPersonIndex]
    }
    
      personFound.name = event.target.value

    const personsc = [...this.state.persons];
    personsc[findPersonIndex] = personFound;

    this.setState({
      persons: personsc
    })
  }


  togglePersonsHandler = (event) => {
    const actualState = this.state.showPersons;
    this.setState({ showPersons: !actualState })
  }



  render() {
    const style = {
      backgroundColor: 'white',
      font: 'inherit',
      border: '1px solid blue',
      padding: '8px',
      cursor: 'pointer'
    }

    let persons = null;
    if (this.state.showPersons) {
      persons = (
        <div>
          {this.state.persons.map((person, index) => {
            return <Person
              name={person.name}
              age={person.age}
              click={() => this.deletePersonHandler(index)}
              changed={(event) => this.nameChangeHandler(event,person.id)}
              key={person.id}></Person>
          })}
        </div>
      )
    }
    return (

      <div className="App">
        <h1>REACT APP</h1>
        <p>Teste paragrafo</p>
        <button style={style} onClick={this.togglePersonsHandler}>Trocar Nome</button>
        { persons}
      </div>
    )

  };


  //return React.createElement('div',{className: 'App'},React.createElement('h1',null,'Hi I am a react app?'))

}
export default App;
