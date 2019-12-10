/* * * * * * * * * * * * * * * * *
 *    CMST 495 6380 Group 2      *
 * * * * * * * * * * * * * * * * *
 *
 * Name: food.js
 * Author: Rachael Schutzman, Selamawit Asfaw, Danny Ramirez, Gilda Hogan, Gavin Spain
 * Description: Handles the food's creation.
 *
 */

/* Revision History
 * 12/01/2019 - Initially created.
 * (Selamawit Asfaw)
 * 
 * 12/09/2019 - Updated the spawnFood method to randomly create the food 
 *              position.
 * (Selamawit Asfaw)
 * 
 */
class food {
    constructor(x, y) {
        this.position = {
            x: 0,
            y: 0
        };
        this.size = 20;
        this.spawnFood();
    }
    spawnFood() {
    food.position.x = floor(random(0, MAX_COLS));
    food.position.y = floor(random(0, MAX_ROWS - 1));
}
}
