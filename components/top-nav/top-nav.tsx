import React from 'react';
import MenuButtonComponent from './menu-button/menu-button'
import UndoButtonComponent from './undo-button/undo-button'
import ResetButtonComponent from './reset-button/reset-button'
import ScoreComponent from './score/score'

const TopNavComponent = () => {
  return (
    <div style={{
      display: 'grid',
      width: '99%',
      gridTemplateColumns: '5% 90% 5%',
      backgroundColor: 'black',
      border: '2px solid white',
      marginBottom: '7px'
    }}>
      <div style={{
        gridColumn: '2',
        display: 'grid',
        gridTemplateColumns: '50px 150px auto 150px',
        gridTemplateRows: '5% auto 5%'
      }}>
        <div style={{gridColumn: 1, gridRow: 2}} className='center-contents'>
          <MenuButtonComponent></MenuButtonComponent>
        </div>
        <div style={{gridColumn: 2, gridRow: 2}} className='center-contents'>
          <ResetButtonComponent></ResetButtonComponent>
        </div>
        <div style={{gridColumn: 3, gridRow: 2}} className='center-contents'>
          <ScoreComponent></ScoreComponent>
        </div>
        <div style={{gridColumn: 4, gridRow: 2}} className='center-contents'>
          <UndoButtonComponent></UndoButtonComponent>
        </div>
      </div>
    </div>
  );
}

export default TopNavComponent;