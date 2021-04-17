import React from 'react';


const validatorComponent = (props) => {

  const teste = 
        (props.textLenght > 5) ?
        <p>The text is to short</p>
        :
        <p>The text is to big</p>
    

    return <div>
        { teste}
    </div>

}


export default validatorComponent;