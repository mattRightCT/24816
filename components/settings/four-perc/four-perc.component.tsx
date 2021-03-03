import React, { ChangeEvent } from 'react';
import InputComponent from '../../forms/input/input.component';

export type BoardSizeProps = {
  fourPerc: number,
  onFourPercChange: (event: ChangeEvent<HTMLInputElement>) => void
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
          label={'4 Block Chance'} inputName={'fourPerc'} type={'number'} id={'fourPerc'}
          value={props.fourPerc} onChange={props.onFourPercChange} regexMatch={'/^[-+]?\\d+$/'}
          afterInput={' % of new blocks'} repeatInput={false}
        ></InputComponent>
      </div>
    </div>
  );
};

export default BoardSizeComponent;