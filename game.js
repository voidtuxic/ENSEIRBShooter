window.onload = function(){
	var canvas = document.getElementById("canvas");

	var gameOverLabel = document.getElementById("gameOver");
	var scoreLabel = document.getElementById("score");
	var score = 0;

	if (!BABYLON.Engine.isSupported()) {
		window.alert('Browser not supported');
	} else {

		var engine = new BABYLON.Engine(canvas, true);

		var scene = new BABYLON.Scene(engine);
		var light = new BABYLON.HemisphericLight("Omni", new BABYLON.Vector3(0, 1, 0), scene);
		var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0,0,-50), scene);

		var sky = BABYLON.Mesh.CreateSphere("Sky", 100, 200, scene);
		var skyMat = new BABYLON.StandardMaterial("skyMat", scene);
		skyMat.backFaceCulling = false;
		skyMat.diffuseTexture = new BABYLON.Texture("textures/sky.jpg", scene);
		sky.material = skyMat;

		var fighter = null;
		var fighterMat = new BABYLON.StandardMaterial("fighterMat", scene);
		fighterMat.diffuseTexture = new BABYLON.Texture("textures/fighter.png", scene);
		BABYLON.SceneLoader.ImportMesh("", "assets/", "fighter.babylon", scene, function (newMeshes, particleSystems) {
			fighter = newMeshes[0];
			fighter.rotation.y = -Math.PI/2;
			fighter.scaling = new BABYLON.Vector3(2,2,2);
			fighter.material = fighterMat;
			fighter.position = new BABYLON.Vector3(-35,0,0);
		});

		var keys = new Array();
		window.addEventListener("keydown", function (event) {
			keys[event.keyCode] = true;
        });
		window.addEventListener("keyup", function (event) {
			keys[event.keyCode] = false;
        });

		var bullets = new Array();
		var bulletMat = new BABYLON.StandardMaterial("bulletMat", scene);
		bulletMat.emissiveColor = new BABYLON.Color3(1,0,0);
		var bThreshold = 0;

		var enemies = new Array();
		var eThreshold = 0;
		var enemyMat;
		enemyMat = fighterMat.clone();
		enemyMat.emissiveColor = new BABYLON.Color3(0,1,0);

		var gameOver = false;

		engine.runRenderLoop(function () {
			if(fighter == null || gameOver)
				return;
			sky.rotation.y -= 0.001;


			if(keys[90])
				fighter.position.y += 0.5;
			if(keys[83])
				fighter.position.y -= 0.5;
			if(keys[68])
				fighter.position.x += 0.5;
			if(keys[81])
				fighter.position.x -= 0.5;

			if(fighter.position.x < - 40)
				fighter.position.x = -40;
			if(fighter.position.x > 40)
				fighter.position.x = 40;
			if(fighter.position.y < - 20)
				fighter.position.y = -20;
			if(fighter.position.y > 20)
				fighter.position.y = 20;

			for(var e in enemies)
			{
				for(var b in bullets)
				{
					score += bullets[b].collisionCheck(enemies[e])
				}

				if (fighter.intersectsMesh(enemies[e].prefab, false)) {
					enemies[e].destroy();
					fighter.dispose();
					gameOver = true;
					gameOverLabel.style.display = "block";
				}
			}

			if(keys[32])
			{
				bThreshold += BABYLON.Tools.GetDeltaTime();
				if(bThreshold >= 200)
				{
					bullets.push(new Bullet(fighter.position, bulletMat, scene));
					bThreshold = 0;
				}
			} 
			else if (!keys[32] && bThreshold != 0)
				bThreshold = 0;

			for(var b in bullets)
			{
				bullets[b].update();
				if(!bullets[b].alive)
				{
    				bullets.splice(b, 1);
				}
			}
			
			eThreshold += BABYLON.Tools.GetDeltaTime();
			if(eThreshold >= 2000)
			{
				enemies.push(new Enemy(fighter.clone(), enemyMat));
				eThreshold = 0;

			}

			for(var e in enemies)
			{
				enemies[e].update();
				if(!enemies[e].alive)
				{
    				enemies.splice(e, 1);
				}
			}

			scoreLabel.textContent = "Score : " + score;

			scene.render();
		});

		window.addEventListener("resize", function () {
			engine.resize();
		});
	}
};



function Bullet(position, material, scene)
{
	this.prefab = new BABYLON.Mesh.CreateSphere("bullet", 10, 0.4, scene);
	this.prefab.position = new BABYLON.Vector3(position.x + 5, position.y, position.z);
	this.prefab.material = material;
	this.alive = true;
}

Bullet.prototype.update = function()
{
	this.prefab.position.x += 1;

	if(this.prefab.position.x > 50)
	{
		this.destroy();
	}
};

Bullet.prototype.destroy = function()
{
	this.prefab.dispose();
	this.alive = false;
};

Bullet.prototype.collisionCheck = function(enemy, score)
{
	if (this.prefab.intersectsMesh(enemy.prefab, false)) {
		enemy.destroy();
		this.destroy();
		return 100;
	}
	return 0;
};



function Enemy(prefab, material)
{
	this.prefab = prefab;
	this.prefab.position = new BABYLON.Vector3(50,Math.floor((Math.random()*30) - 15),0);
	this.prefab.rotation.y = Math.PI/2;
	var size = Math.random();
	this.prefab.scaling = new BABYLON.Vector3(1 + size,1 + size,1 + size);
	this.prefab.material = material;
	this.alive = true;
}

Enemy.prototype.update = function()
{
	this.prefab.position.x -= 0.2;
	if(this.prefab.position.x < -50)
	{
		this.destroy();
	}
};

Enemy.prototype.destroy = function()
{
	this.prefab.dispose();
	this.alive = false;
};