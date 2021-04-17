import React from 'react';
import './CharComponent.css';


const charComponent = (props) =>{
    return <div className="CharComponent">
        <p onClick={props.click}>I'm {props.name}! Age {props.age}</p>
        <p>{props.children}</p>
        <input type="text" onChange={props.changed} value={props.name}></input>
        </div>

};

export default charComponent;