import Phaser from 'phaser'
import Carrot from '../game/Carrot.js'

export default class JumperScene extends Phaser.Scene{

    carrotsCollected = 0

    /** @type {Phaser.GameObjects.Text} */
    carrotsCollectedText

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms

    /** @type {Phaser.Physics.Arcade.Sprite} */
    player

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors

    /** @type {Phaser.Physics.Arcade.Group} */
    carrots



	constructor()
	{
        super('game')
	}

    init(){
        this.carrotsCollected = 0;
    }
	preload()
    {
        this.load.image('carrot', 'assets/carrot.png')
        this.load.image('background', 'assets/bg_layer1.png');
        this.load.image('platform', 'assets/ground_grass.png');
        this.load.image('bunny-stand', 'assets/bunny1_stand.png');
        this.load.image('bunny-jump', 'assets/bunny1_jump.png');

        this.cursors = this.input.keyboard.createCursorKeys()

        this.load.audio('jump', 'assets/jump.mp3');

        // this.load.image('sky', 'assets/sky.png')
		// this.load.image('ground', 'assets/platform.png')
		// this.load.image('star', 'assets/star.png')
		// this.load.image('bomb', 'assets/bomb.png')

		// this.load.spritesheet('dude', 
		// 	'assets/dude.png',
		// 	{ frameWidth: 32, frameHeight: 48 }
		// )
    }

    create()
    {
        


        // this.add.image(240, 320, 'sky');
        this.add.image(240, 320, 'background').setScrollFactor(1, 0);

        // this.physics.add.image(240, 320, 'platform').setScale(0.5);

        this.platforms = this.physics.add.staticGroup();

        this.carrots = this.physics.add.group({
            classType: Carrot
        })

        this.carrots.get(240,320, 'carrot');

        for (let index = 0; index < 5; index++) {
            const x = Phaser.Math.Between(80,400);
            const y = 150*index;

            const platform = this.platforms.create(x, y, 'platform');
            platform.scale = 0.5;
            this.addCarrotAbove(platform)

            const body = platform.body;
            body.updateFromGameObject();
        }

        this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5);
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        this.physics.add.collider(this.platforms, this.player);
        this.physics.add.collider(this.platforms, this.carrots);

        this.cameras.main.startFollow(this.player)
        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        this.player.setBounce(0.2);

        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        )

        const style = { color: '#000', fontSize: 24 }
        this.carrotsCollectedText = this.add.text(240,10,'Carrots: 0', style).setScrollFactor(0).setOrigin(0.5,0);
        
    }

    horizontalWrap(sprite){
        const halfWidth = sprite.displayWidth * 0.5;
        const gameWidth = this.scale.width;

        if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth
        } else if (sprite.x < - halfWidth) { 
            sprite.x = gameWidth + halfWidth
        }
    }

    handleCollectCarrot(player, carrot){
        this.carrots.killAndHide(carrot);
        this.physics.world.disableBody(carrot.body);
        this.carrotsCollected++;

        this.carrotsCollectedText.text = `Carrots: ${this.carrotsCollected}`
    }

    addCarrotAbove(sprite){
        const y = sprite.y - sprite.displayHeight;
        const carrot = this.carrots.get(sprite.x, y, 'carrot');

        this.add.existing(carrot);

        carrot.setActive(true)
        carrot.setVisible(true)

        carrot.body.setSize(carrot.width, carrot.height);

        this.physics.world.enable(carrot)

        return carrot
    }

    findBottomMostPlatform(){
        const platforms = this.platforms.getChildren();
        let bottomPlatform = platforms[0];

        for (let i = 1; i < platforms.length; i++) {
            const platform = platforms[i];

            if (platform.y < bottomPlatform.y){
                continue
            }

            bottomPlatform = platform;
        }

        return bottomPlatform;
    }

    
    update(){

        const touchingDown = this.player.body.touching.down;
        this.horizontalWrap(this.player)

        if (touchingDown) {
            this.player.setVelocityY(-300);
            this.player.setTexture('bunny-jump');
            this.sound.play('jump')
        }

        if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200);
        }

        else if (this.cursors.right.isDown && !touchingDown) {
            this.player.setVelocityX(200)
        } else {
            this.player.setVelocityX(0);
        }

        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'bunny-stand'){
            this.player.setTexture('bunny-stand');
        }

        this.platforms.children.iterate(child => {
            // /** @type {Phaser.Physics.Arcade.Sprite} */
            // const platform = child;

            const scrollY = this.cameras.main.scrollY;
            if (child.y > scrollY+700){
                child.y = scrollY - Phaser.Math.Between(50, 100);
                child.body.updateFromGameObject();
                this.addCarrotAbove(child);
            }
        })

        const bottomPlatform = this.findBottomMostPlatform();
        if (this.player.y > bottomPlatform.y + 200) {
            console.log('game over')

            this.scene.start('game-over')
        }

    }

}