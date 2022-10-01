import { input } from "../main.js";
import Rendering from "../Engine/Rendering.js";
import ECSManager from "../Engine/ECS/ECSManager.js";
import Entity from "../Engine/ECS/Entity.js";
import ParticleSpawnerComponent from "../Engine/ECS/Components/ParticleSpawnerComponent.js";
import GraphicsComponent from "../Engine/ECS/Components/GraphicsComponent.js";
import PositionComponent from "../Engine/ECS/Components/PositionComponent.js";
import MovementComponent from "../Engine/ECS/Components/MovementComponent.js";
import { ComponentTypeEnum } from "../Engine/ECS/Components/Component.js";
import Checkbox from "../Engine/GUI/Checkbox.js";
import TextObject3D from "../Engine/GUI/Text/TextObject3D.js";
import Vec3 from "../Engine/Maths/Vec3.js";
import PointLight from "../Engine/Lighting/PointLight.js";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent.js";
import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent.js";
import AnimationComponent from "../Engine/ECS/Components/AnimationComponent.js";

export default class Game {
	private rendering: Rendering;
	private ecsManager: ECSManager;

	private crtCheckbox: Checkbox;
	private bloomCheckbox: Checkbox;
	private shadowCheckbox: Checkbox;

	private particleText: TextObject3D;
	private particleSpawner: Entity;

	private boxEntity: Entity;
	private playerEntity: Entity;

	private enemyEntities: Array<Entity>;

	constructor(
		gl: WebGL2RenderingContext,
		rendering: Rendering,
		ecsManager: ECSManager
	) {
		this.rendering = rendering;
		this.ecsManager = ecsManager;

		// Load all textures to avoid loading mid game
		let smileyTexture =
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png";
		rendering.loadTextureToStore(smileyTexture);
		let floorTexture =
			"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/371b6fdf-69a3-4fa2-9ff0-bd04d50f4b98/de8synv-6aad06ab-ed16-47fd-8898-d21028c571c4.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM3MWI2ZmRmLTY5YTMtNGZhMi05ZmYwLWJkMDRkNTBmNGI5OFwvZGU4c3ludi02YWFkMDZhYi1lZDE2LTQ3ZmQtODg5OC1kMjEwMjhjNTcxYzQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wa-oSVpeXEpWqfc_bexczFs33hDFvEGGAQD969J7Ugw";
		rendering.loadTextureToStore(floorTexture);
		let laserTexture =
			"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f04b32b4-58c3-4e24-a642-67320f0a66bb/ddwzap4-c0ad82e3-b949-479c-973c-11daaa55a554.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YwNGIzMmI0LTU4YzMtNGUyNC1hNjQyLTY3MzIwZjBhNjZiYlwvZGR3emFwNC1jMGFkODJlMy1iOTQ5LTQ3OWMtOTczYy0xMWRhYWE1NWE1NTQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.vSK6b4_DsskmHsiVKQtXQAospMA6_WZ2BoFYrODpFKQ";
		rendering.loadTextureToStore(laserTexture);
		let boxTexture =
			"https://as2.ftcdn.net/v2/jpg/01/99/14/99/1000_F_199149981_RG8gciij11WKAQ5nKi35Xx0ovesLCRaU.jpg";
		rendering.loadTextureToStore(boxTexture);
		let fireTexture = "Assets/textures/fire.png";
		rendering.loadTextureToStore(fireTexture);
		let knightTexture = "Assets/textures/knight.png";
		rendering.loadTextureToStore(knightTexture);
		let mouseFrontTexture = "Assets/textures/mouse_front.png";
		rendering.loadTextureToStore(mouseFrontTexture);
		let normy = "Assets/textures/normy.png";
		rendering.loadTextureToStore(normy);

		this.createFloorEntity(floorTexture);

		for (let i = 0; i < 5; i++) {
			this.createTestEntity(
				new Vec3({ x: -1.25 + i * 0.5, y: 0.0, z: -2.0 }),
				-10.0 * i
			);
		}

		this.createPointLight(
			new Vec3({ x: 0.0, y: 0.2, z: 0.0 }),
			new Vec3({ x: 0.7, y: 0.0, z: 0.0 })
		);
		this.createPointLight(
			new Vec3({ x: 4.0, y: 0.2, z: 2.0 }),
			new Vec3({ x: 0.7, y: 0.0, z: 1.0 })
		);

		let particleSpawnerPos = new Vec3({ x: -2.0, y: 1.0, z: 0.0 });
		this.particleSpawner = this.createParticleSpawner(
			particleSpawnerPos,
			10000,
			1.3,
			fireTexture
		);

		this.rendering.camera.setPosition(0.0, 0.0, 5.5);

		rendering.getNewQuad(smileyTexture);

		this.particleText = this.rendering.getNew3DText();
		this.particleText.textString = "This is a fire fountain";
		this.particleText.getElement().style.color = "lime";
		this.particleText.size = 100;
		this.particleText.position = particleSpawnerPos;
		this.particleText.center = true;

		this.crtCheckbox = this.rendering.getNewCheckbox();
		this.crtCheckbox.position.x = 0.8;
		this.crtCheckbox.position.y = 0.1;
		this.crtCheckbox.textString = "CRT-effect ";
		this.crtCheckbox.getElement().style.color = "cyan";
		this.crtCheckbox.getInputElement().style.accentColor = "red";

		this.bloomCheckbox = this.rendering.getNewCheckbox();
		this.bloomCheckbox.position.x = 0.8;
		this.bloomCheckbox.position.y = 0.15;
		this.bloomCheckbox.textString = "Bloom-effect ";
		this.bloomCheckbox.getElement().style.color = "cyan";
		this.bloomCheckbox.getInputElement().style.accentColor = "red";

		this.shadowCheckbox = this.rendering.getNewCheckbox();
		this.shadowCheckbox.position.x = 0.75;
		this.shadowCheckbox.position.y = 0.2;
		this.shadowCheckbox.textString = "Smaller shadows ";
		this.shadowCheckbox.getElement().style.color = "cyan";
		this.shadowCheckbox.getInputElement().style.accentColor = "red";

		// let testButton = this.rendering.getNewButton();
		// testButton.position.x = 0.5;
		// testButton.position.y = 0.5;
		// testButton.textString = "Test button";
		// testButton.center = true;
	}

	async init() {
		// ---- Box ----
		let boxTexture =
			"https://as2.ftcdn.net/v2/jpg/01/99/14/99/1000_F_199149981_RG8gciij11WKAQ5nKi35Xx0ovesLCRaU.jpg";
		let boxMesh = await this.rendering.getNewMesh(
			"Assets/objs/cube.obj",
			boxTexture,
			boxTexture
		);
		this.boxEntity = this.ecsManager.createEntity();

		this.ecsManager.addComponent(
			this.boxEntity,
			new GraphicsComponent(boxMesh)
		);
		let boxPosComp = new PositionComponent();
		this.ecsManager.addComponent(this.boxEntity, new MovementComponent());
		boxPosComp.position.setValues(-4.0, 0.0, 0.0);
		// boxPosComp.rotation.setValues(0.0, 45.0, 0.0);
		boxPosComp.scale.setValues(0.2, 0.2, 0.2);
		this.ecsManager.addComponent(this.boxEntity, boxPosComp);

		// Collision stuff
		let boxBoundingBoxComp = new BoundingBoxComponent();
		boxBoundingBoxComp.setup(boxMesh);
		boxBoundingBoxComp.updateTransformMatrix(boxMesh.modelMatrix);
		this.ecsManager.addComponent(this.boxEntity, boxBoundingBoxComp);
		this.ecsManager.addComponent(this.boxEntity, new CollisionComponent());
		// -------------

		// ---- Player ----
		let mouseFrontTexture = "Assets/textures/normy.png";
		this.playerEntity = this.ecsManager.createEntity();

		let phongQuad = this.rendering.getNewPhongQuad(
			mouseFrontTexture,
			mouseFrontTexture
		);
		this.ecsManager.addComponent(
			this.playerEntity,
			new GraphicsComponent(phongQuad)
		);

		let playerMoveComp = new MovementComponent();
		playerMoveComp.constantAcceleration.y = 0.0;
		this.ecsManager.addComponent(this.playerEntity, playerMoveComp);

		let playerPosComp = new PositionComponent();
		playerPosComp.rotation.setValues(-30.0, 0.0, 0.0);
		this.ecsManager.addComponent(this.playerEntity, playerPosComp);

		let playerAnimComp = new AnimationComponent();
		playerAnimComp.spriteMap.setNrOfSprites(3, 2);
		playerAnimComp.startingTile = { x: 0, y: 0 };
		playerAnimComp.advanceBy = { x: 1.0, y: 0.0 };
		playerAnimComp.modAdvancement = { x: 2.0, y: 1.0 };
		playerAnimComp.updateInterval = 0.3;
		this.ecsManager.addComponent(this.playerEntity, playerAnimComp);

		// let playerBoundingBoxComp = new BoundingBoxComponent();
		// playerBoundingBoxComp.setup(phongQuad);
		// playerBoundingBoxComp.updateTransformMatrix(phongQuad.modelMatrix);
		// this.ecsManager.addComponent(this.playerEntity, playerBoundingBoxComp);
		// this.ecsManager.addComponent(this.playerEntity, new CollisionComponent());

		// ----------------
	}

	createFloorEntity(texturePath: string) {
		let entity = this.ecsManager.createEntity();
		let phongQuad = this.rendering.getNewPhongQuad(texturePath, texturePath);
		phongQuad.textureMatrix.setScale(50.0, 50.0, 1.0);
		this.ecsManager.addComponent(entity, new GraphicsComponent(phongQuad));
		let posComp = new PositionComponent(new Vec3({ x: 0.0, y: -2.0, z: 0.0 }));
		posComp.rotation.setValues(-90.0, 0.0, 0.0);
		posComp.scale.setValues(50.0, 50.0, 1.0);
		this.ecsManager.addComponent(entity, posComp);

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(phongQuad);
		boundingBoxComp.updateTransformMatrix(phongQuad.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);
	}

	createTestEntity(pos: Vec3, rotX: number = 0.0) {
		let entity = this.ecsManager.createEntity();
		let smileyPath =
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png";
		this.ecsManager.addComponent(
			entity,
			new GraphicsComponent(
				this.rendering.getNewPhongQuad(smileyPath, smileyPath)
			)
		);
		let posComp = new PositionComponent(pos);
		posComp.rotation.setValues(rotX, 0.0, 0.0);
		this.ecsManager.addComponent(entity, posComp);

		// let ac = new AnimationComponent();
		// ac.spriteMap.setNrOfSprites(2, 1);
		// ac.startingTile = {x: 0, y: 0};
		// ac.advanceBy = {x: 1.0, y: 0.0};
		// ac.modAdvancement = {x: 2.0, y: 1.0};
		// ac.updateInterval = 0.5;
		// this.ecsManager.addComponent(entity, ac);

		return entity;
	}

	createPointLight(position: Vec3, colour: Vec3): PointLight {
		let pl = this.rendering.getNewPointLight();
		pl.position = position;
		pl.colour = colour;

		return pl;
	}

	createParticleSpawner(
		position: Vec3,
		numParticles: number,
		lifeTime: number,
		texturePath: string
	): Entity {
		let particleSpawner = this.rendering.getNewParticleSpawner(
			texturePath,
			numParticles
		);
		particleSpawner.fadePerSecond = 1.0 / lifeTime;
		particleSpawner.sizeChangePerSecond = -0.4 * (1.0 / lifeTime);

		for (let i = 0; i < particleSpawner.getNumberOfParticles(); i++) {
			let rand = Math.random() * 2.0 * Math.PI;

			particleSpawner.setParticleData(
				i,
				new Vec3(position),
				0.4,
				new Vec3({
					x: Math.cos(rand),
					y: 5.0 + Math.random() * 20.0,
					z: Math.sin(rand),
				})
					.normalize()
					.multiply(8.0 + Math.random() * 3.0),
				new Vec3({ x: 0.0, y: -4.0, z: 0.0 })
			);
		}

		let entity = this.ecsManager.createEntity();
		this.ecsManager.addComponent(entity, new PositionComponent(position));
		let movComp = new MovementComponent();
		movComp.velocity.z = 5.0;
		movComp.constantAcceleration.multiply(0.0);
		this.ecsManager.addComponent(entity, movComp);
		let particleComp = new ParticleSpawnerComponent(particleSpawner);
		particleComp.lifeTime = lifeTime;
		this.ecsManager.addComponent(entity, particleComp);
		return entity;
	}

	update(dt: number) {
		let accVec: Vec3 = new Vec3({ x: 0.0, y: 0.0, z: 0.0 });
		let move = false;
		let playerDirection = 0;
		if (input.keys["w"]) {
			accVec.setValues(0.0, 0.0, -1.0);
			playerDirection = 1;
			move = true;
		}

		if (input.keys["s"]) {
			accVec.setValues(0.0, 0.0, 1.0);
			playerDirection = 0;
			move = true;
		}

		if (input.keys["a"]) {
			accVec.setValues(-1.0, 0.0, 0.0);
			move = true;
		}

		if (input.keys["d"]) {
			accVec.setValues(1.0, 0.0, 0.0);
			move = true;
		}

		if (input.keys[" "]) {
			move = true;
		}

		if (input.keys["Shift"]) {
			move = true;
		}

		let playerMoveComp = <MovementComponent>(
			this.playerEntity.getComponent(ComponentTypeEnum.MOVEMENT)
		);
		// Set player acceleration
		if (move && playerMoveComp) {
			playerMoveComp.accelerationDirection = accVec;
		}

		let playerAnimComp = <AnimationComponent>(
			this.playerEntity.getComponent(ComponentTypeEnum.ANIMATION)
		);
		if (playerAnimComp && move) {
			if (playerDirection == 0) {
				playerAnimComp.startingTile = { x: 0, y: 0 };
				playerAnimComp.advanceBy = { x: 1, y: 0 };
			} else {
				playerAnimComp.startingTile = { x: 0, y: 1 };
				playerAnimComp.advanceBy = { x: 1, y: 0 };
			}
		} else if (playerAnimComp) {
			if (playerDirection == 0) {
				playerAnimComp.startingTile = { x: 2, y: 0 };
				playerAnimComp.advanceBy = { x: 0, y: 0 };
			} else {
				playerAnimComp.startingTile = { x: 2, y: 0 };
				playerAnimComp.advanceBy = { x: 0, y: 0 };
			}
		}

		let playerPosComp = <PositionComponent>(
			this.playerEntity.getComponent(ComponentTypeEnum.POSITION)
		);
		// Update camera
		if (playerPosComp) {
			let camOffset = new Vec3({ x: 0.0, y: 3.0, z: 2.0 });
			let camPos = new Vec3(playerPosComp.position).add(camOffset);
			this.rendering.camera.setPosition(camPos.x, camPos.y, camPos.z);
			this.rendering.camera.setDir(-camOffset.x, -camOffset.y, -camOffset.z);
		}

		this.rendering.useCrt = this.crtCheckbox.getChecked();
		this.rendering.useBloom = this.bloomCheckbox.getChecked();
		if (this.shadowCheckbox.getChecked()) {
			this.rendering.setShadowMappingResolution(400);
			this.rendering.getDirectionalLight().lightProjectionBoxSideLength = 20.0;
		} else {
			this.rendering.setShadowMappingResolution(4096);
			this.rendering.getDirectionalLight().lightProjectionBoxSideLength = 50.0;
		}

		let particleMovComp = <MovementComponent>(
			this.particleSpawner.getComponent(ComponentTypeEnum.MOVEMENT)
		);
		const particlePosComp = <PositionComponent>(
			this.particleSpawner.getComponent(ComponentTypeEnum.POSITION)
		);
		if (particleMovComp && particlePosComp) {
			particleMovComp.accelerationDirection.deepAssign(
				particlePosComp.position
			);
			particleMovComp.accelerationDirection.y = 0.0;
			particleMovComp.accelerationDirection.multiply(-1.0);
			this.particleText.position = particlePosComp.position;
		}

		if (input.keys["e"]) {
			let boxPosComp = <PositionComponent>(
				this.boxEntity.getComponent(ComponentTypeEnum.POSITION)
			);
			boxPosComp.position
				.deepAssign(this.rendering.camera.getPosition())
				.add(this.rendering.camera.getDir());

			let boxMovComp = <MovementComponent>(
				this.boxEntity.getComponent(ComponentTypeEnum.MOVEMENT)
			);
			boxMovComp.velocity
				.deepAssign(this.rendering.camera.getDir())
				.multiply(15.0);
		}
	}
}
