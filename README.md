

# Space Shooting Game

A simple space shooting game that runs in the browser. Created using HTML5 Canvas elements.

## How to Play

1. Open `index.html` in your browser
2. Select a difficulty level (Easy, Medium, Hard)
3. Click the "Game Start" button to begin

## Controls

* **Left and right arrow keys**: Move the spaceship
* **Space key**: Fire bullets

## Game Features

### Difficulty System

* **Easy**: Enemies move slower and fire fewer bullets. Higher item drop rate but score multiplier is 0.8x
* **Medium**: Balanced standard difficulty. Score multiplier is 1.0x
* **Hard**: Enemies move faster and fire more bullets. Lower item drop rate but score multiplier is 1.5x

### Weapon System

* Weapons can be powered up to 5 levels
* Number and power of bullets increase with each level
* Level 5 allows firing bullets in diagonal directions

### Items

* **Blue star**: Weapon power-up (dropped when defeating enemies)
* **Green shield**: Shield (dropped when defeating large enemies, blocks one attack)

### Other Features

* Enemy defeat counter
* High score ranking (recorded by difficulty)
* Explosion effects when defeating enemies
* Space-themed background with star effects

## File Structure

* `index.html` - HTML file for the game
* `style.css` - Stylesheet for the game
* `game.js` - JavaScript file containing game logic

## Technical Specifications

* HTML5 Canvas
* CSS3
* JavaScript (ES6)
* Local Storage (for saving ranking data)

## Future Enhancements

* Adding sound effects and background music
* Mobile support (touch controls)
* Implementation of boss enemies
* Additional weapon types

