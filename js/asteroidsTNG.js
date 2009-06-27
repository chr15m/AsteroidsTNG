function startAsteroidsTNG(gs) {
	function Asteroid(world, radius, x, y) {
		this.world = world;
		// variables
		this.x = x || gs.random(0, gs.width);
		this.y = y || gs.random(0, gs.height);
		this.angle = gs.random(0, Math.PI);
		this.radius = radius || 40;
		// velocities
		this.angleV = gs.random(-0.1, 0.1);
		this.xV = gs.random(-0.5, 0.5);
		this.yV = gs.random(-0.5, 0.5);
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
		
		this.update = function() {
			// update all our state variables
			this.angle += this.angleV;
			this.x = (this.x + this.xV + gs.width) % gs.width;
			this.y = (this.y + this.yV + gs.height) % gs.height;
			// update our shape definition
			for (n=0; n<this.points.length; n++) {
				this.poly[n] = [this.points[n][0] * Math.cos(this.angle) - this.points[n][1] * Math.sin(this.angle) + this.x, this.points[n][0] * Math.sin(this.angle) + this.points[n][1] * Math.cos(this.angle) + this.y];
			}
		}
		
		this.draw = function(c) {
			c.strokeStyle = 'rgba(255, 255, 255, 1.0)';
			gs.polygon(this.poly);
		}
	}
	
	function Star(world) {
		this.world = world;
		this.rate = gs.random(0, 1);
		this.type = Math.round(gs.random(0, 2));
	}
	
	function Ship(world) {
		this.world = world;
		this.world.player = this;
		this.x = gs.width / 2;
		this.y = gs.height / 2;
		this.angle = 0;
		this.speed = 0;
		this.points = [[0, -13], [-7, 7], [7, 7]];
		this.poly = [];
		
		this.keyDown = function (keyCode) {
			//console.log(keyCode);
		}
		
		this.keyHeld_37 = this.keyDown_37 = function () {
			this.angle -= 0.1;
		}
		
		this.keyHeld_39 = this.keyDown_39 = function () {
			this.angle += 0.1;
		}
		
		this.collisionPoly = function () {
			return this.poly;
		}
		
		this.update = function() {
			for (n=0; n<this.points.length; n++) {
				this.poly[n] = [this.points[n][0] * Math.cos(this.angle) - this.points[n][1] * Math.sin(this.angle) + this.x, this.points[n][0] * Math.sin(this.angle) + this.points[n][1] * Math.cos(this.angle) + this.y];
			}
		}
		
		this.draw = function(c) {
			c.strokeStyle = 'rgba(255, 255, 255, 1.0)';
			gs.polygon(this.poly);
		}
	}
	
	function World() {
		this.player = null;
		this.x = 0;
		this.y = 0;
		this.update = function() {
			if (this.player) {
				var xdiff = this.player.x - gs.width / 2;
				if (Math.abs(xdiff) > 0.01)
					this.x += diff * 0.5;
				var ydiff = this.player.y - gs.width / 2;
				if (Math.abs(ydiff) > 0.01)
					this.y += ydiff * 0.5;
			}
		}
		
		this.draw = function() {
			gs.clear();
			gs.background('rgba(100, 100, 100, 1.0)');
		}
	}
	
	w = new World();
	gs.addEntity(w);
	gs.addEntity(new Ship(w));
	gs.addEntity(new Asteroid(w));
}
