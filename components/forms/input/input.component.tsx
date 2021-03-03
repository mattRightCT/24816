import React, { ChangeEventHandler } from 'react'

export type InputProps = {
  label: string,
  inputName: string,
  type: string,
  id: string,
  value: string | number,
  onChange: ChangeEventHandler,
  regexMatch: string,
  afterInput: string,
  repeatInput: boolean
};

const InputComponent = (props: InputProps) => {
  return (
    <label>
      <p style={{fontSize: 'max(4vmin, 24px)', fontWeight: 'bold', margin: '5px 0'}}>
        {props.label}<br/>
        <input
          className='form' required={true}
          name={props.inputName} type={props.type} id={props.id}
          value={props.value} onChange={props.onChange}
          pattern={props.regexMatch}
        />{props.afterInput}{props.repeatInput? props.value : ''}
      </p>
    </label>
  );
};

export default InputComponent;