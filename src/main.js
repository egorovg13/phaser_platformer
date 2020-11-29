import Phaser from 'phaser'

import JumperScene from './scenes/JumperScene.js'
import GameOver from './scenes/GameOver.js'

const config = {
	type: Phaser.AUTO,
	width: 480,
	height: 640,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 250 },
			debug: true
		}
	},
	scene: [JumperScene, GameOver]
}

export default new Phaser.Game(config)
