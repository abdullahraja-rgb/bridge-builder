import React from 'react';
import { JOINT_COST } from '../../game/constants';

export default function Controls({ 
    budget, 
    currentTool, 
    onToolChange, 
    onTest, 
    onReset, 
    gameMode,
    hasBeams 
}) {
    return (
        <div className="flex-shrink-0 bg-gray-700 p-3 flex items-center justify-between w-full rounded-b-lg">
            <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-white">Tools:</span>
                
                <button 
                    onClick={() => onToolChange('joint')}
                    className={`px-4 py-2 rounded transition-colors text-white ${
                        currentTool === 'joint' 
                            ? 'bg-blue-600' 
                            : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                >
                    Joint (${JOINT_COST})
                </button>
                
                <button
                    onClick={() => onToolChange('beam')}
                    className={`px-4 py-2 rounded transition-colors text-white ${
                        currentTool === 'beam' 
                            ? 'bg-blue-600' 
                            : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                >
                    Wood Beam
                </button>
            </div>

            <div className={`font-bold text-xl ${budget < 0 ? 'text-red-500' : 'text-green-400'}`}>
                Budget: ${Math.round(budget)}
            </div>

            <div>
                {gameMode === 'build' ? (
                    <button
                        onClick={onTest}
                        disabled={!hasBeams}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Test Bridge
                    </button>
                ) : (
                    <button
                        onClick={onReset}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-lg transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}