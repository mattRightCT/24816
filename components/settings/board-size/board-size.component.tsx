import React, { ChangeEvent } from 'react';
import InputComponent from '../../forms/input/input.component';

export type BoardSizeProps = {
  boardSize: number,
  onBoardSizeChange: (event: ChangeEvent<HTMLInputElement>) => void
};

const BoardSizeComponent = (props: BoardSizeProps) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '10vmin auto',
      gridTemplateRows: '4vmin auto',
      backgroundColor: '#000'
    }}>
      <div style={{gridColumn: 2, gridRow: 2}}>
        <InputComponent
          label={'Board Size'} inputName={'boardSize'} type={'number'} id={'boardSize'}
          value={props.boardSize} onChange={props.onBoardSizeChange} regexMatch={'/^[-+]?\\d+$/'}
          afterInput={' X '} repeatInput={true}
        ></InputComponent>
      </div>
    </div>
  );
};

export default BoardSizeComponent;