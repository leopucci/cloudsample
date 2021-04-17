const userInput = (props) => {
    return <div>Entrada:   
        <input defaultValue={props.valorDefault} 
        onChange={props.changedHandler} 
        type="text"></input>
    </div>
}

export default userInput;