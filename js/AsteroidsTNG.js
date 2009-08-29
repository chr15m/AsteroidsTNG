function startAsteroidsTNG(gs) {
	/*** Define some different types of things ***/
	ship = 1;
	bullet = 2;
	asteroid = 3;
	
	/*** Number of asteroids ***/
	var numAsteroids = 3;
	
	/*** reload the game ***/
	function doReload(secs) {
		setTimeout(function() {window.location.href = unescape(window.location.pathname);}, 1000 * secs);
	}
	
	/*** A single spinning asteroid ***/
	function Asteroid(world, radius, x, y) {
		this.type = asteroid;
		this.world = world;
		// variables
		this.x = x || (gs.random(0, gs.width / 2) + 3 * gs.width / 4);
		this.y = y || (gs.random(0, gs.height / 2) + 3 * gs.height / 4);
		this.angle = gs.random(0, Math.PI);
		this.radius = radius || 40;
		// structure of this shape
		this.points = [];
		this.randomPoint = function() {
			return gs.random(-this.radius/2, this.radius/2);
		}
		for (i = 0; i < Math.round(this.radius / 5); i++)
			this.points.push([this.radius * Math.sin(i * Math.PI / Math.round(this.radius / 10)) + this.randomPoint(),
				this.radius * Math.cos(i * Math.PI / Math.round(this.radius / 10)) + this.randomPoint()]);
		this.poly = [];
		
		this.collisionPoly = function() {
			return this.poly;
		}
		
		this.explode = function () {
			gs.delEntity(this);
			if (this.radius < 4.0)
				gs.addEntity(new Asteroid(this.world, this.radius / 2, this.x, this.y));
		}
		
		this.update = function() {
			// update our shape definition
			for (n=0; n<this.points.length; n++) {
				this.poly[n] = [this.points[n][0] * Math.cos(this.angle) - this.points[n][1] * Math.sin(this.angle) + this.x - this.world.cameraX(), this.points[n][0] * Math.sin(this.angle) + this.points[n][1] * Math.cos(this.angle) + this.y - this.world.cameraY()];
			}
		}
		
		this.draw = function(c) {
			c.strokeStyle = 'rgba(255, 255, 255, 1.0)';
			gs.polygon(this.poly);
		}
	}
	
	/*** A background parallax star ***/
	function Star(world) {
		this.world = world;
		this.rate = gs.random(0.5, 1.0);
		this.size = Math.round(gs.random(0, 3));
		this.x = gs.random(0, 10000);
		this.y = gs.random(0, 10000);
		this.fs = 'rgba(255, 255, 255, ' + this.rate + ')';
		
		this.update = function() {
		}
		
		this.getX = function() {
			return Math.round((this.x - this.world.cameraX()) * this.rate % gs.width);
		}
		
		this.getY = function() {
			return Math.round((this.y - this.world.cameraY()) * this.rate % gs.height);
		}
		
		if (this.size > 1.0) {
			this.draw = function(c) {
				c.strokeStyle = this.fs;
				c.beginPath();
				c.arc(this.getX(), this.getY(), this.size, 0, Math.PI*2, true);
				c.closePath();
				c.stroke();
			}
		} else {
			this.draw = function(c) {
				c.fillStyle = this.fs;
				var sx = this.getX() - 0.5;
				var sy = this.getY() - 0.5;
				c.beginPath();
				c.rect(sx, sy, 1, 1);
				for (var i=0; i<2; i++) {
					for (var j=0; j<2; j++) {
						c.rect(sx + (i * 2 - 1) * 2, sy + (j * 2 - 1) * 2, 1, 1);
						c.rect(sx + (i * 2 - 1), sy + (j * 2 - 1), 1, 1);
					}
				}
				c.closePath();
				c.fill();
				
			}
		}
	}
	
	/*** A player ship ***/
	function Ship(world) {
		this.type = ship;
		this.world = world;
		this.x = gs.width / 2;
		this.y = gs.height / 2;
		this.angle = 0;
		this.speed = 0;
		this.points = [[0, -13], [-7, 7], [7, 7]];
		this.poly = [];
		this.lastsmoke = null;
		this.world.setPlayer(this);
		
		this.keyHeld_37 = this.keyDown_37 = function () {
			this.angle -= 0.1;
		}
		
		this.keyHeld_39 = this.keyDown_39 = function () {
			this.angle += 0.1;
		}
		
		this.keyDown_38 = function () {
			this.speed = 1;
		}
		
		this.keyHeld_38 = function () {
			if (this.speed < 3.0)
				this.speed += 0.3;
		}
		
		this.keyDown_32 = function () {
			// pass
		}
		
		this.keyDown = function (keyCode) {
			//console.log(keyCode);
		}
		
		this.collisionPoly = function() {
			return this.poly;
		}
		
		this.collided = function(other) {
			if (other.type == asteroid) {
				this.explode();
				other.explode();
				doReload(1);
			}
		}
		
		this.explode = function() {
			gs.delEntity(this);
		}
		
		this.update = function() {
			if (this.speed > 0.1)
				this.speed -= 0.1;
			else
				this.speed = 0;
			this.x = this.x + this.speed * Math.sin(this.angle);
			this.y = this.y - this.speed * Math.cos(this.angle);
			for (n=0; n<this.points.length; n++) {
				this.poly[n] = [this.points[n][0] * Math.cos(this.angle) - this.points[n][1] * Math.sin(this.angle) + this.x - this.world.cameraX(), this.points[n][0] * Math.sin(this.angle) + this.points[n][1] * Math.cos(this.angle) + this.y - this.world.cameraY()];
			}
			if (this.speed && (!gs.inEntities(this.lastsmoke) || gs.distance([this.lastsmoke.x, this.lastsmoke.y], [this.x, this.y]) > 15)) {
				this.lastsmoke = new Smoke(world, this.x - 9 * Math.sin(this.angle), this.y + 9 * Math.cos(this.angle));
				gs.addEntity(this.lastsmoke);
			}
		}
		
		this.draw = function(c) {
			c.strokeStyle = 'rgba(255, 255, 255, 1.0)';
			gs.polygon(this.poly);
		}
	}
	
	/*** Smoke coming out of the ship ***/
	function Smoke(world, x, y) {
		this.x = x;
		this.y = y;
		this.world = world;
		this.life = 1.0;
		
		this.draw = function(c) {
			c.strokeStyle = 'rgba(200, 200, 200, ' + this.life + ')';
			c.beginPath();
			c.arc(this.x - this.world.cameraX(), this.y - this.world.cameraY(), 2, 0, Math.PI*2, true);
			c.closePath();
			c.stroke();
		}
		
		this.update = function() {
			this.life -= 0.08;
			if (this.life < 0)
			{
				gs.delEntity(this);
				this.life = 0.01;
			}
		}
	}
	
	/*** World ***/
	function World() {
		this.player = null;
		this.x = 0;
		this.y = 0;
		this.w = gs.width / 2;
		this.h = gs.height / 2;
		
		this.setPlayer = function(player) {
			this.player = player;
			this.x = player.x;
			this.y = player.y;
		}
		
		this.cameraX = function() {
			return this.x - this.w;
		}
		
		this.cameraY = function () {
			return this.y - this.h;
		}
		
		this.draw = function() {
			gs.clear();
			gs.background('rgba(100, 100, 100, 1.0)');
		}
		
		this.update = function() {
			this.x = this.x + (this.player.x - this.x) * 0.1;
			this.y = this.y + (this.player.y - this.y) * 0.1;
		}
	}
	
	w = new World();
	gs.addEntity(w);
	gs.addEntity(new Ship(w));
	for (n=0; n<numAsteroids; n++) {
		gs.addEntity(new Asteroid(w));
	}
	for (n=0; n<10; n++) {
		gs.addEntity(new Star(w));
	}
}
