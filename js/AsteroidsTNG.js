function startAsteroidsTNG(gs) {
	/*** Define some different types of things ***/
	t_ship = 1;
	t_asteroid = 2;
	
	/*** reload the game ***/
	function doReload(secs) {
		setTimeout(function() {window.location.href = unescape(window.location.pathname);}, 1000 * secs);
	}
	
	/*** A single asteroid ***/
	function Asteroid(world, data, asteroidScale, quadrant) {
		this.type = t_asteroid;
		this.world = world;
		// get variables from the incoming data
		this.id = data.id
		this.x = data.x * gs.width + quadrant[0] * gs.width;
		this.y = data.y * gs.height + quadrant[1] * gs.height;
		this.angle = data.angle;
		this.radius = 100 * asteroidScale + 30;
		this.quadrant = quadrant;
		// structure of this shape
		this.points = [];
		for (p=0; p<data.points.length; p++)
			this.points.push([this.radius * data.points[p][0], this.radius * data.points[p][1]]);
		this.poly = [];
		// precalculate rotated version
		for (n=0; n<data.points.length; n++)
			this.points[n] = [this.points[n][0] * Math.cos(this.angle) - this.points[n][1] * Math.sin(this.angle), this.points[n][0] * Math.sin(this.angle) + this.points[n][1] * Math.cos(this.angle)];
		
		this.update = function() {
			// update our shape definition
			for (n=0; n<this.points.length; n++) {
				this.poly[n] = [this.points[n][0] + this.x - this.world.cameraX(), this.points[n][1] + this.y - this.world.cameraY()];
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
		this.type = t_ship;
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
		this.quadrant = [0, 0];
		// seedable deterministic random number generator	
		var mt = new MersenneTwister();
		// our procedural map generator
		var map = new Map(mt);
		
		this.setPlayer = function(player) {
			this.player = player;
			this.x = player.x;
			this.y = player.y;
			this.updateQuadrant();
		}
		
		this.updateQuadrant = function() {
			this.quadrant = [Math.floor(this.player.x / gs.width),
				Math.floor(this.player.y / gs.height)];
			this.getQuadrant(this.quadrant);
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
			if (Math.floor(this.player.x / gs.width) != this.quadrant[0] ||
				Math.floor(this.player.y / gs.height) != this.quadrant[1]) {
				this.updateQuadrant();
			}
		}
		
		// cache of all asteroid objects by their ID
		var asteroidcache = {};
		var asteroidcachesize = 0;
		
		// let us get every asteroid around quadrant [x, y] using our map-generator object
		this.getQuadrant = function(quadrant) {
			var allasteroids = [];
			for (var i=-1; i<2; i++) {
				for (var j=-1; j<2; j++) {
					var pos = [quadrant[0] + i, quadrant[1] + j];
					var quadrantData = map.getQuadrantData(pos);
					var asteroids = quadrantData['asteroids'];
					allasteroids = allasteroids.concat(asteroids);
					for (var a=0; a<asteroids.length; a++) {
						if (!asteroidcache[asteroids[a]]) {
							asteroidcache[asteroids[a]] = new Asteroid(w, map.getAsteroidData(asteroids[a], quadrantData['asteroidSize']), quadrantData['asteroidSize'], pos);
							asteroidcachesize += 1;
							gs.addEntity(asteroidcache[asteroids[a]]);
						}
					}
				}
			}
			// get rid of the asteroids in the cache which we no longer care about
			for (a in asteroidcache) {
				if (allasteroids.indexOf(asteroidcache[a].id) == -1) {
					gs.delEntity(asteroidcache[a])
					delete asteroidcache[a];
					asteroidcachesize -= 1;
				}
			}
		}
	}
	
	w = new World();
	gs.addEntity(w);
	gs.addEntity(new Ship(w));
	for (n=0; n<10; n++) {
		gs.addEntity(new Star(w));
	}
}
