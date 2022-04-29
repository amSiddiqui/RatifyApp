import React from 'react';
import { PositionType, POSITION_OFFSET_X, POSITION_OFFSET_Y, INPUT_HEIGHT, INPUT_WIDTH, getBgColorBold } from '../types';


const DraggableInput: React.FC<{ pos: PositionType, color: string, placeholder: string }> = ({ pos, color, placeholder }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: pos.y - POSITION_OFFSET_Y,
                left: pos.x - POSITION_OFFSET_X,
                zIndex: 100,
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    width: INPUT_WIDTH,
                    height: INPUT_HEIGHT - 17,
                }}
                className={"z-10 text-white flex justify-center items-center cursor-pointer " + getBgColorBold(color)}
            >
                {placeholder}
            </div>
        </div>
    );
};

export default DraggableInput;