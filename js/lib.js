import {drawBackground,loadMarioImage,drawObjects} from "./drawImage.js";
import {loadJson} from "./loadJson.js";
import {keys} from "./keyEvent.js";
import {sceneObjects} from "./objectLib.js"

let LibObj = {
	drawBackground:drawBackground,
	loadMarioImage:loadMarioImage,
	drawObjects:drawObjects,
	loadJson:loadJson,
	keys:keys,
	createMarioArray:createMarioArray,
	createObjectArray:createObjectArray,
	createFragmentArray:createFragmentArray,
	drawAndUpdateObject:drawAndUpdateObject,
	spliceObjectArray:spliceObjectArray,
	snippet:snippet,
	smallMarioUnderBrick:smallMarioUnderBrick,
	bigMarioUnderBrick:bigMarioUnderBrick,
	smallLowerZoneDetect:smallLowerZoneDetect,
	bigLowerZoneDetect:bigLowerZoneDetect,
	upperZoneStop:upperZoneStop,
	controlBrickBorder:controlBrickBorder,
	handleSmallJumpFromBorder:handleSmallJumpFromBorder,
	handleBigJumpFromBorder:handleBigJumpFromBorder
};

let snippetArr = new Array();
let backToSmallSnippetArr = new Array();
let backToBigSnippetArr = new Array();
let fireSnippetArr = new Array();


function createMarioArray(name) {
	return fetch(`../marioJSON/${name}.json`)
		.then(r =>r.json())
		.then(marioSprite=>{
			let marioArray = [];
			marioSprite.Pos[0].ranges.forEach(([x,y])=>{
				let mario = new sceneObjects.Mario();
				mario.pos.set(x,y);
				mario.speed.set(4,2);
				marioArray.push(mario);
			});
			return marioArray;
		});
}


function createObjectArray(name,objectName) {
	return fetch(`../marioJSON/${name}.json`)
		.then(r =>r.json())
		.then(Sprite=>{
			let objectArray = [];
			Sprite.Pos[0].ranges.forEach(([x,y])=>{
				let object = new objectName();
				object.pos.set(x,y);
				objectArray.push(object);
			});
			return objectArray;
		});
}

function createFragmentArray(){
	return fetch(`../marioJSON/brick.json`)
		.then(r =>r.json())
		.then(Sprite=>{
			let brickArray = Sprite.Pos[0].ranges;
			let fragmentArray = [];
			for(let i = 0;i < brickArray.length;i += 1){
				let fragment1 = new sceneObjects.Fragment();
				fragment1.pos.set(brickArray[i][0],brickArray[i][1]);
				let fragment2 = new sceneObjects.Fragment();
				fragment2.pos.set(brickArray[i][0] + 8,brickArray[i][1]);
				let fragment3 = new sceneObjects.Fragment();
				fragment3.pos.set(brickArray[i][0],brickArray[i][1] + 8);
				let fragment4 = new sceneObjects.Fragment();
				fragment4.pos.set(brickArray[i][0] + 8,brickArray[i][1] + 8);
				fragmentArray.push(fragment1);
				fragmentArray.push(fragment2);
				fragmentArray.push(fragment3);
				fragmentArray.push(fragment4);
			}
			return fragmentArray;
		});
}

function drawAndUpdateObject(objectArray,context,objectSprite,marioArray,...args) {
	for(let j = 0;j < objectArray.length;j += 1){
		objectArray[j].draw(context,objectSprite,marioArray[0]);
		if(objectArray[j].update && !args){
			objectArray[j].update(marioArray[0]);
		}else if(objectArray[j].update && args){
			objectArray[j].update(marioArray[0],...args);
		}
	}	
}



function spliceObjectArray(objectArray) {
	for(let j = 0;j < objectArray.length;j += 1){
		let object = objectArray[j];
		if(object.show == false){
			objectArray.splice(j,1);
			j--;
		}
		if(objectArray.length == 0){
			break;
		}  
	}	
}

function snippet(keys,marioArray,powerupSound,powerdownSound) {
	if(keys.zbutton){
		let temp = "z";
		snippetArr.push(temp);
	}else if(keys.abutton){
		let temp = "a";
		fireSnippetArr.push(temp);
	}else if(keys.qbutton){
		let temp = "q";
		backToSmallSnippetArr.push(temp);
	}else if(keys.wbutton){
		let temp = "w";
		backToBigSnippetArr.push(temp);
	}

	if(snippetArr.length >= 18){
		snippetArr = [];
		if(!marioArray[0].isBigMario && !marioArray[0].isFireMario){
			marioArray[0].changeToBig = true;
			powerupSound.play();
		}	
		return;
	}

	if(fireSnippetArr.length >= 18){
		fireSnippetArr = [];
		if(marioArray[0].isBigMario ){
			marioArray[0].changeToFire = true;
			powerupSound.play();
		}	
		return;
	}

	if(backToSmallSnippetArr.length >= 18){
		backToSmallSnippetArr = [];
		if(marioArray[0].isBigMario ){
			marioArray[0].backToSmall = true;
			powerdownSound.play();
		}	
		return;
	}

	if(backToBigSnippetArr.length >= 18){
		backToBigSnippetArr = [];
		if(marioArray[0].isFireMario ){
			marioArray[0].backToBig = true;
			powerdownSound.play();
		}	
		return;
	}

}

// 	碰撞公式:shape.pos.x + shape.width > this.pos.x 
//	&& shape.pos.x < this.pos.x + this.width
//	&& shape.pos.y + shape.height > this.pos.y
//	&& shape.pos.y < this.pos.y + this.height

function smallMarioUnderBrick(marioArray,brick) {
	if(marioArray.speed.y < 0 
	  && marioArray.pos.y + marioArray.height / 2 >= brick.pos.y  //Mario 頭頂大於磚塊上緣
	  && marioArray.pos.y + marioArray.height / 2 <= brick.pos.y + brick.height  //Mario 頭頂小於磚塊下緣
	  && marioArray.pos.x + marioArray.width  > brick.pos.x   
	  && marioArray.pos.x < brick.pos.x + brick.width 
	){
		if(!brick.isUseLess){
			brick.powerUpSound();
		}
		brick.isUseLess = true;
		marioArray.pos.y = brick.pos.y ;
		marioArray.speed.y = 0;
		marioArray.isBottomBrick = true;
	}
}

function bigMarioUnderBrick(marioArray,brick) {
	if(marioArray.speed.y < 0 
		&& marioArray.pos.y >= brick.pos.y
		&& marioArray.pos.y <= brick.pos.y + brick.height
		&& marioArray.pos.x + marioArray.width  > brick.pos.x 
		&& marioArray.pos.x < brick.pos.x + brick.width 
	){
		if(!brick.isUseLess){
			brick.powerUpSound();
		}
		brick.isUseLess = true;
		marioArray.pos.y = brick.pos.y + brick.height ;
		marioArray.speed.y = 0;
		marioArray.isBottomBrick = true;
	}
}

function smallLowerZoneDetect(marioArray,brick) {
  	// lowzerzone 第一段為 馬力歐的頭頂大於磚塊的下緣
	// lowzerzone 第二段為 馬力歐腳底小於磚塊上緣
	if(marioArray.pos.x + marioArray.width >= brick.pos.x  
    && marioArray.pos.x <= brick.pos.x + brick.width 
    && marioArray.pos.y + marioArray.height / 2  >= brick.pos.y + brick.height) {
		brick.lowerzone = true;
	}else if(marioArray.pos.x + marioArray.width >= brick.pos.x  
    && marioArray.pos.x <= brick.pos.x + brick.width 
    && marioArray.pos.y + marioArray.height / 2  <= brick.pos.y ||
    marioArray.pos.y + marioArray.height - marioArray.speed.y <= brick.pos.y ){
		brick.lowerzone = false;
	}
}

function bigLowerZoneDetect(marioArray,brick) {
	// lowzerzone 第一段為 馬力歐的頭頂大於磚塊的下緣
// lowzerzone 第二段為 馬力歐腳底小於磚塊上緣
	if(marioArray.pos.x + marioArray.width >= brick.pos.x  
	&& marioArray.pos.x <= brick.pos.x + brick.width 
	&& marioArray.pos.y  >= brick.pos.y + brick.height) {
		brick.lowerzone = true;
	}else if(marioArray.pos.x + marioArray.width >= brick.pos.x  
	&& marioArray.pos.x <= brick.pos.x + brick.width 
	&& (marioArray.pos.y + marioArray.height <= brick.pos.y ||
		marioArray.pos.y + marioArray.height - marioArray.speed.y <= brick.pos.y)){
		brick.lowerzone = false;
	}
}

function upperZoneStop(marioArray,brick) {
	if(!brick.lowerzone  
    && !marioArray.underGround  
    && marioArray.speed.y > 0 
    && marioArray.pos.x + marioArray.width > brick.pos.x  
    && marioArray.pos.x < brick.pos.x + brick.width 
	){
		if(marioArray.pos.y > brick.pos.y - marioArray.height){
			marioArray.fallingFromLeftBorder = false;
			marioArray.fallingFromRightBorder = false;
			marioArray.pos.y = brick.pos.y - marioArray.height;
			marioArray.speed.y = 0;
			marioArray.isOnBrick = true;
			marioArray.isJump = false;
		}
	}
}

function controlBrickBorder(marioArray,brick) {
	if(marioArray.isOnBrick 
		&& marioArray.pos.x == brick.pos.x + brick.width 
		&&  marioArray.speed.y > 0.5)
	{
		marioArray.fallingFromRightBorder = true;
	}else if(marioArray.isOnBrick 
  	&& marioArray.pos.x + marioArray.width == brick.pos.x 
   	&&  marioArray.speed.y > 0.5)
	{
		marioArray.fallingFromLeftBorder = true;
	}
}

function handleSmallJumpFromBorder(marioArray,brick) {
	if(!marioArray.underGround 
		&& marioArray.isJump
		&& !marioArray.isBigMario 
		&& !marioArray.isFireMario
		&& marioArray.pos.x == brick.pos.x + brick.width 
		&& marioArray.pos.y + marioArray.height  >= brick.pos.y
		&& marioArray.pos.y + marioArray.height / 2 <= brick.pos.y + brick.height)
	{
		marioArray.pos.x = brick.pos.x + brick.width ;
		marioArray.stopX = true;
		marioArray.touchBrickBorderByJumping = true;
	}else if(!marioArray.underGround 
		&& marioArray.isJump
		&& !marioArray.isBigMario 
		&& !marioArray.isFireMario
		&& marioArray.pos.x + marioArray.width == brick.pos.x 
		&& marioArray.pos.y + marioArray.height  >= brick.pos.y
		&& marioArray.pos.y + marioArray.height / 2 <= brick.pos.y + brick.height)
	{
		marioArray.pos.x = brick.pos.x - marioArray.width ;
		marioArray.stopX = true;
		marioArray.touchBrickBorderByJumping = true;
	}else if(!marioArray.underGround 
		&& marioArray.isJump 
		&& !marioArray.isBigMario 
		&& !marioArray.isFireMario
		&& marioArray.pos.x == brick.pos.x + brick.width 
		&& marioArray.pos.y + marioArray.height < brick.pos.y ){
		marioArray.stopX = false;
	}	else if(!marioArray.underGround 
		&& marioArray.isJump 
		&& !marioArray.isBigMario 
		&& !marioArray.isFireMario
		&& marioArray.pos.x + marioArray.width == brick.pos.x 
		&& marioArray.pos.y + marioArray.height < brick.pos.y ){
		marioArray.stopX = false;
	}
}

function handleBigJumpFromBorder(marioArray,brick) {
	if(!marioArray.underGround 
		&& marioArray.isJump 
		&& (marioArray.isBigMario || marioArray.isFireMario)
		&& marioArray.pos.x == brick.pos.x + brick.width 
		&& marioArray.pos.y + marioArray.height  >= brick.pos.y
		&& marioArray.pos.y  <= brick.pos.y + brick.height)
	{
		marioArray.pos.x = brick.pos.x + brick.width ;
		marioArray.stopX = true;
		marioArray.touchBrickBorderByJumping = true;
	} else	if(!marioArray.underGround 
		&& marioArray.isJump 
		&& (marioArray.isBigMario || marioArray.isFireMario)
		&& marioArray.pos.x + marioArray.width == brick.pos.x 
		&& marioArray.pos.y + marioArray.height  >= brick.pos.y
		&& marioArray.pos.y  <= brick.pos.y + brick.height)
	{
		marioArray.pos.x = brick.pos.x - marioArray.width ;
		marioArray.stopX = true;
		marioArray.touchBrickBorderByJumping = true;
	} else if(!marioArray.underGround 
		&& marioArray.isJump 
		&& (marioArray.isBigMario || marioArray.isFireMario)
		&& marioArray.pos.x == brick.pos.x + brick.width 
		&& marioArray.pos.y + marioArray.height < brick.pos.y ){
		marioArray.stopX = false;
	}
	else if(!marioArray.underGround 
		&& marioArray.isJump 
		&& (marioArray.isBigMario || marioArray.isFireMario)
		&& marioArray.pos.x + marioArray.width == brick.pos.x  
		&& marioArray.pos.y + marioArray.height < brick.pos.y ){
		marioArray.stopX = false;
	}
}

export {LibObj};