import {PositionAndSpeed} from "../positionAndSpeed.js";
// import {marioArray} from "../marioArrayTest.js";


class Fireball{
	constructor(){
		this.pos = new PositionAndSpeed();
		this.previousPos = new PositionAndSpeed();
		this.speed = new PositionAndSpeed(2,2);
		this.frameIndex = 0;
		this.faceDirection = 1;
		this.goRight = false;
		this.direction = 0;
		this.width = 8;
		this.height = 8;
		this.show = false;
		this.framesRun = [
			"bullet-1","bullet-1","bullet-1","bullet-1",
			"bullet-2","bullet-2","bullet-2","bullet-2",
			"bullet-3","bullet-3","bullet-3","bullet-3",
			"bullet-4","bullet-4","bullet-4","bullet-4",
		];

	}
	
	update(marioArray,screen){
		this.faceDirection = marioArray.faceDirection;
		console.log(this.pos.x);
		// 	碰撞公式:shape.pos.x + shape.width > this.pos.x  左
		//	&& shape.pos.x < this.pos.x + this.width 右
		//	&& shape.pos.y + shape.height > this.pos.y 上
		//	&& shape.pos.y < this.pos.y + this.height 下

		// 這裡用來控制當馬力歐發射火球的狀況。

		screen.backgrounds[1].ranges.forEach(([x1,x2,y1,y2]) =>{
			if(this.pos.y == y1 * screen.height - this.height){
				this.speed.y *= -1;
			}
			if(this.pos.y <= 232 ){
				this.speed.y *= -1;
			}

		});

		if(!this.show  && this.faceDirection == 1 && !this.goRight){
			console.log("1");
			this.pos.x = marioArray.pos.x ;
			this.previousPos.x = this.pos.x;
			this.pos.y = marioArray.pos.y + 8;
			this.goRight = true;
			this.show = true;
		}


		// 左邊--------bug--------


		if(!this.show && this.faceDirection == -1){
			console.log("2");
			this.pos.x = marioArray.pos.x ;
			this.previousPos.x = this.pos.x;
			this.pos.y = marioArray.pos.y + 8;
			this.goRight = false;
			this.show = true;
		}

		if(this.goRight){
			console.log("2");
			this.pos.x += this.speed.x;
		}

		if(!this.goRight){
			this.pos.x -= this.speed.x;
		}

		this.pos.y += this.speed.y;
		
		
		if(this.pos.x > this.previousPos.x + 320
			|| this.pos.x < this.previousPos.x - 320 ){

			console.log("3");
			this.goRight = false;
			this.show = false;
		}
	
	}

	firing(){
		this.frameIndex = ++this.frameIndex % 16 ;
		return this.framesRun[this.frameIndex];
	}


	draw(context,fireballSprite,marioArray){	
		// 這邊要調數字 BUG
		if(this.show && this.goRight ){
			if(this.pos.x < 450){
				fireballSprite.drawFireBallSprite(this.firing(),context,this.pos.x,this.pos.y,this.faceDirection < 0);
			}else if(this.pos.x >= 450 && this.pos.x < 2500 ){
				fireballSprite.drawFireBallSprite(this.firing(),context,this.pos.x - this.previousPos.x + 16 + 450 ,this.pos.y,this.faceDirection < 0);
			}else if(this.pos.x >= 2500 ){
				fireballSprite.drawFireBallSprite(this.firing(),context,this.pos.x  - 2050 ,this.pos.y,this.faceDirection < 0);
			}
		}

		if(this.show && !this.goRight){
			if(this.pos.x < 450){
				fireballSprite.drawFireBallSprite(this.firing(),context,this.pos.x,this.pos.y,this.faceDirection < 0);
			}else if(this.pos.x >= 450 && this.pos.x < 2500 ){
				fireballSprite.drawFireBallSprite(this.firing(),context,this.pos.x - this.previousPos.x - 16 + 450 ,this.pos.y,this.faceDirection < 0);
			}else if(this.pos.x >= 2500 ){
				fireballSprite.drawFireBallSprite(this.firing(),context,this.pos.x  - 2050 ,this.pos.y,this.faceDirection < 0);
			}
		}
	}
}

export {Fireball};