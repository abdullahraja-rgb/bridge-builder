// constant values that can be imported into other files.
export const GRID_SIZE = 40;
export const JOINT_RADIUS = 8;
export const BEAM_WIDTH = 6;

export const MATERIALS = {
    wood: {
        cost: 100, // per gird unit length
        strength: 2.5,
        color: '#A97C50',
        stressColor: [35, 38] // how the color changes based on strength
    },
    steel: {
        cost: 300, // per gird unit length
        strength: 8,
        color: '#C0C0C0',
        stressColor: [200, 10] // how the color changes based on strength
    }
}

export const JOINT_COST = 50; // cost to put a single joint (flat)

export const VEHICLE_WIDTH = 60;
export const VEHICLE_HEIGHT = 30;
export const WHEEL_RADIUS = 12;

export const LEVEL_01 = {
    start: { x: 4 * GRID_SIZE, y: 8 * GRID_SIZE },
    end: { x: 20 * GRID_SIZE, y: 8 * GRID_SIZE },
    chasmWidth: 16 * GRID_SIZE,
    initialBudget: 5000
};