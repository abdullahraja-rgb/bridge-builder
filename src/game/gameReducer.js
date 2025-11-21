import { LEVEL_01, JOINT_COST, MATERIALS, GRID_SIZE } from './constants.js';

/**
 * Creates the initial set of joints, including the two static anchor points.
 * @param {object} level - The level configuration object.
 * @returns {object} An object of joints, keyed by ID.
 */
function createInitialJoints(level) {
    const startId = `joint-${level.start.x}-${level.start.y}`;
    const endId = `joint-${level.end.x}-${level.end.y}`;

    return {
        [startId]: {
            id: startId,
            x: level.start.x,
            y: level.start.y,
            static: true, // Anchor joints do not move
        },
        [endId]: {
            id: endId,
            x: level.end.x,
            y: level.end.y,
            static: true, // Anchor joints do not move
        },
    };
}

export const initialState = {

    joints: createInitialJoints(LEVEL_01),
    beams: {},
    budget: LEVEL_01.initialBudget,

    mode: 'build',


    status: 'building',
    
    stress: {},

    level: LEVEL_01,
};

/**
 * The game reducer manages all state transitions for the game.
 * @param {object} state - The current game state.
 * @param {object} action - The action being dispatched.
 * @returns {object} The new game state.
 */
export function gameReducer(state, action) {
    switch (action.type) {
        case 'ADD_JOINT': {
            const { id, x, y } = action.payload;
            const newCost = JOINT_COST;

            // Check if we have enough budget
            if (state.budget < newCost) {
                return state; // Not enough money, return current state
            }

            // Check if a joint already exists at this position
            if (state.joints[id]) {
                return state; // Joint already exists
            }

            // Create the new joint
            const newJoint = { id, x, y, static: false };


            return {
                ...state,
                budget: state.budget - newCost,
                joints: {
                    ...state.joints,
                    [id]: newJoint,
                },
            };
        }

        case 'ADD_BEAM': {
            const { id, jointAId, jointBId, material } = action.payload;
            
            // Get the joint objects
            const jointA = state.joints[jointAId];
            const jointB = state.joints[jointBId];
            
            // Check if beam already exists (in either direction)
            const- reverseId = `beam-${jointBId}-${jointAId}`;
            if (state.beams[id] || state.beams[reverseId]) {
                return state;
            }

            // Calculate cost
            const dx = (jointB.x - jointA.x) / GRID_SIZE;
            const dy = (jointB.y - jointA.y) / GRID_SIZE;
            const lengthInUnits = Math.sqrt(dx * dx + dy * dy);
            const materialProps = MATERIALS[material];
            const newCost = lengthInUnits * materialProps.cost;

            if (state.budget < newCost) {
                return state; // Not enough money
            }

            const newBeam = {
                id,
                jointAId,
                jointBId,
                material,
                strength: materialProps.strength,
            };

            return {
                ...state,
                budget: state.budget - newCost,
                beams: {
                    ...state.beams,
                    [id]: newBeam,
                },
            };
        }

        case 'SET_MODE': {
            return {
                ...state,
                mode: action.payload,

                stress: (action.payload === 'build') ? {} : state.stress,
            };
        }

        case 'SET_STATUS': {
            return {
                ...state,
                status: action.payload,
            };
        }
        
        case 'UPDATE_JOINT_POSITION': {
            const { id, x, y } = action.payload;
            

            return {
                ...state,
                joints: {
                    ...state.joints,
                    [id]: {
                        ...state.joints[id],
                        x: x,
                        y: y,
                    },
                },
            };
        }
        
        case 'UPDATE_STRESS': {

            return {
                ...state,
                stress: action.payload,
            };
        }
        
        case 'SNAP_BEAM': {

            const newBeams = { ...state.beams };
            delete newBeams[action.payload.id];
            
            return {
                ...state,
                beams: newBeams,
            };
        }

        case 'RESET_LEVEL': {
            return {
                ...initialState,
                level: state.level, 
                joints: createInitialJoints(state.level),
                budget: state.level.initialBudget,
            };
        }

        default:
            return state;
    }
}
