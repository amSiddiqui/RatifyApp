import React from 'react';
import { PositionType, POSITION_OFFSET_X, POSITION_OFFSET_Y, INPUT_HEIGHT, INPUT_WIDTH, getBgColorLight, SIGN_INPUT_HEIGHT, SIGN_POSITION_OFFSET_Y } from '../types';


const DraggableInput: React.FC<{ pos: PositionType, color: string, placeholder: string, type: string }> = ({ pos, color, placeholder, type }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: pos.y - (type === 'signature' ? SIGN_POSITION_OFFSET_Y : POSITION_OFFSET_Y),
                left: pos.x - POSITION_OFFSET_X,
                zIndex: 100,
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    width: INPUT_WIDTH,
                    height: type === 'signature' ? (SIGN_INPUT_HEIGHT - 17) : (INPUT_HEIGHT - 17),
                }}
                className={"z-10 text-muted flex justify-center items-center cursor-pointer " + getBgColorLight(color)}
            >
                {placeholder}
            </div>
        </div>
    );
};

export default DraggableInput;