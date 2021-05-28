import React, { ChangeEventHandler } from 'react'

export type InputProps = {
  label: string,
  inputName: string,
  id: string,
  value: string | number,
  onChange: ChangeEventHandler,
  options: string[]
};

const DropdownComponent = (props: InputProps) => {
  return (
    <label>
      <p style={{fontSize: 'max(4vmin, 24px)', fontWeight: 'bold', margin: '5px 0'}}>
        {props.label}<br/>
        <select
          className='form' required={true}
          name={props.inputName} id={props.id}
          value={props.value} onChange={props.onChange}
        >
          {props.options.map(option => <option key={option}>{option}</option>)}
        </select>
      </p>
    </label>
  );
};

export default DropdownComponent;