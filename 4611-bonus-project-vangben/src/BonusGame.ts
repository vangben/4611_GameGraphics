import * as THREE from 'three'
import  {Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import  {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import { Object3D, ObjectLoader, Texture, Vector3, WebGLIndexedBufferRenderer } from 'three';
import { GraphicsApp } from './GraphicsApp'

export class BonusGame extends GraphicsApp
{ 
    //private testMesh: gfx.BoxMesh;
    
    private inputVector : THREE.Vector2;
    private ground : THREE.Mesh;
    private groundHeight : number;
    
    private bomb : THREE.Mesh;
    private bombStartPos : THREE.Vector3;
    private shootDir : THREE.Vector3;

    private loader : OBJLoader; 
    private fontLoader : FontLoader;
    private font : Font;
    private startTextMesh : THREE.Mesh;
    private duringTextMesh : THREE.Mesh;
    private killCount : number;
    // private startTextGeo : TextGeometry;
    // private redTextGeo : TextGeometry;
    private textureLoader : THREE.TextureLoader;

    private bunnies : THREE.Group[];
    private bunnyInterval : number;

    private hippo : THREE.Group;

    constructor()
    {
        // Pass in the aspect ratio to the constructor
        super(60, 1920/1080, 0.1, 1000);
  
        this.inputVector = new THREE.Vector2();
        //this.inputVector = Math.floor(Math.random() * )

        this.ground = new THREE.Mesh();
        this.groundHeight = -2;

        this.bomb = new THREE.Mesh();
                //^^ ambient light etc is already calc'd
        this.bombStartPos = new THREE.Vector3();
        this.shootDir = new THREE.Vector3();

        this.loader = new OBJLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.fontLoader = new FontLoader();
        this.font = new Font(null);
        this.startTextMesh = new THREE.Mesh();
        this.duringTextMesh = new THREE.Mesh();
        this.killCount = 0;
        // this.redTextGeo = new TextGeometry('',{font:this.fontLoader.load('./assets/helvetiker_bold.typeface.json')});
        
        this.bunnies = [];
        this.bunnyInterval = 0;

        this.hippo = new THREE.Group;
        this.hippo.position.copy(new THREE.Vector3(0,-1,-25));
    }

    //generates random number between min and max, inclusive
    randomGen(min:number,max:number) : number{
        return Math.floor(Math.random() * (max-min +1) + min);
    }

    createScene() : void
    {
        // Setup camera
        this.camera.position.set(0, 8, 4);
        this.camera.lookAt(0, 7.5, 0);
        this.camera.up.set(0, 1, 0);

        // Create an ambient light
        const ambientLight = new THREE.AmbientLight('white', 0.3);
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new THREE.DirectionalLight('white', .6);
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight)

        //load in textures
        const mud = this.textureLoader.load('./assets/mud.jpg');
        const fur = this.textureLoader.load('./assets/rabbit_fur.jpg');
        const bombSkin = this.textureLoader.load('./assets/bomb_skin.jpg');

        //texture mapping #1
        this.bomb = new THREE.Mesh(new THREE.SphereGeometry(.5), 
            new THREE.MeshLambertMaterial({color: 'brown', map:bombSkin}));

        // Create the skybox material
        var skyboxMaterial = new THREE.MeshBasicMaterial();
        skyboxMaterial.side = THREE.BackSide;
        skyboxMaterial.color.set('skyblue');

        // Create a skybox
        var skybox = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), skyboxMaterial);
        this.scene.add(skybox)

        // Create a mesh for the ground, texture mapping #2        
        this.ground = new THREE.Mesh(
            new THREE.BoxGeometry(250, 1, 250), 
            new THREE.MeshLambertMaterial({color: 'lightblue', 
                map:mud})
        );
        this.ground.position.set(0, this.groundHeight, 0);
        this.scene.add(this.ground);

        const scene = this.scene;

        //create starting sky 3d text
        this.fontLoader.load(
            './assets/helvetiker_bold.typeface.json',
            (font)=>{
                var startTextGeo = new TextGeometry('The hippo is stuck in the mud! \nProtect it from the killer bunnies!', {
                    font: font,
                    size:2,
                    height:2,
                    curveSegments:5,

                    bevelThickness:.5,
                    bevelSize: .5,
                    bevelEnabled: false
                });
                this.font = font;
                var textMaterial = new THREE.MeshPhongMaterial(
                    {color: 0xff0000, specular:0xffffff} //texture mapping #3
                );
                this.startTextMesh = new THREE.Mesh(startTextGeo, textMaterial);
                this.startTextMesh.position.set(-21, 15, -20);
                // this.startTextMesh.geometry.pa
                this.scene.add(this.startTextMesh);
            }
        );
        
        //load in hippo model in center of screen
        this.loader.load('./assets/hippo.obj', function(hippo){
            hippo.position.x = 0;
            hippo.position.y = 0;
            hippo.position.z = -25;
            hippo.lookAt(0,0,0);
            hippo.scale.x = 10;
            hippo.scale.y = 10;
            hippo.scale.z = 10;
            hippo.traverse(function(child){
                if (child instanceof THREE.Mesh){
                    child.material = new THREE.MeshLambertMaterial(
                        {color: 0xD3D3D3});
                }
            });
            
            scene.add(hippo);
        });

        const randomGen = this.randomGen; //function generates random number for bunny position
        var bunnies = this.bunnies;

        //
        this.bunnyInterval = setInterval(() => { //spawn bunny at an interval
            this.loader.load('./assets/bunny.obj', function(bunny){ //spawn killer bunnies
                bunny.position.x = randomGen(-25,25); //spawn anywhere left&right
                bunny.position.y = -1; //spawn above ground height
                bunny.position.z = randomGen(-10,-9); //spawn about 10 away from hippo
                bunny.lookAt(0,-1,-25); //look towards hippo
                bunny.scale.x = 2;
                bunny.scale.y = 2;
                bunny.scale.z = 2;
                bunny.traverse(function(child){
                    if (child instanceof THREE.Mesh){
                        child.material = new THREE.MeshLambertMaterial(
                            {color: 'white', map: fur});
                    }
                });
                bunnies.push(bunny); //keep an array of bunnies spawned
                scene.add(bunny);
            });
        },3000);
    }

    update(deltaTime : number) : void
    {
        //camera movement based on wasd keys
        var cameraMoveSpeed = 3;
        this.camera.translateX(this.inputVector.x * cameraMoveSpeed *deltaTime);
        this.camera.translateY(this.inputVector.y * cameraMoveSpeed * deltaTime);

        //bomb moves towards mouse's ray, only one bomb can spawn at a time
        const bulletSpeed = 30;
        this.bomb.position.addScaledVector(this.shootDir,bulletSpeed*deltaTime);
        if(this.bomb.position.y < this.groundHeight){ //bomb hit ground, disappear
            this.bomb.visible = false;
        } else if(this.bomb.position.y > this.groundHeight){ //bomb is visible above ground
            this.bomb.visible = true;
        }
        

        //find vector from bunny to hippo, move towards it
        for(let i = 0; i<this.bunnies.length; i++){
            var toHippo = new THREE.Vector3(0,0,0);
            toHippo.x = this.hippo.position.x - this.bunnies[i].position.x;
            toHippo.y = this.hippo.position.y - this.bunnies[i].position.y;
            toHippo.z = this.hippo.position.z - this.bunnies[i].position.z;
            this.bunnies[i].translateOnAxis(toHippo.normalize().negate(),4*deltaTime);
               
            //bomb to bunny collision detection, remove bunny from scene and from bunnies[]
            if(this.bomb.position.distanceTo(this.bunnies[i].position) < 1){
                this.scene.remove(this.duringTextMesh);

                //create new 3D text with killCount counter
                this.killCount ++;
                var duringTextGeo =  new TextGeometry('\nCombo: '+this.killCount, {
                    font: this.font,
                    size:2,
                    height:2,
                    curveSegments:5,

                    bevelThickness:.5,
                    bevelSize: .5,
                    bevelEnabled: false
                });
                var textMaterial = new THREE.MeshPhongMaterial(
                    {color: 0xff0000, specular:0xffffff} //texture mapping #3
                );
                this.duringTextMesh = new THREE.Mesh(duringTextGeo, textMaterial)
                this.duringTextMesh.position.set(-6, 15, -20);
                this.scene.add(this.duringTextMesh);

                this.scene.remove(this.startTextMesh);
                this.scene.remove(this.bunnies[i]);
                this.bunnies.splice(i, 1); //remove [i] from bunnies[]
            }

            //if bunny hasn't been killed yet...
            if(this.bunnies[i]){ 

                //bunny to hippo collision detection requirement, bunny turns red and game over screen
                if(this.bunnies[i].position.distanceTo(this.hippo.position) < 2){
                    //turn bunny mesh red upon reaching hippo - dynamic vertex properties requirement
                    this.bunnies[i].traverse(function(child){ //this.bunnies[i] is a Group()
                        if (child instanceof THREE.Mesh){ //accesses child of parent 
                            child.material = new THREE.MeshLambertMaterial(
                                {color: 'darkred'});
                        }
                    });

                    //end program if bunny reaches hippo
                    clearInterval(this.bunnyInterval); //stop spawning bunnies
                    this.gameOver();
                    return;
                }
                
                //if move past hippo, disappear
                if(this.bunnies[i].position.z < -30){ 
                    this.scene.remove(this.bunnies[i]);
                }
            }
            //remove excess bunnies
            if(this.bunnies.length > 10){ 
                this.scene.remove(this.bunnies[i]);
                this.bunnies.shift();
            }
        }
    }
    
    //creates new 3D text game over to screen
    gameOver(): void{ 
        console.log("game over, killer bunnies hit hippo");
        var end = new TextGeometry('GAME\nOVER',{
            font:this.font, //only have to load in font once, saved into this.font
            size:2,
            height:1,
            curveSegments:5,

            bevelEnabled: false
        });
        var endMat = new THREE.MeshPhongMaterial(
            {color: 0xff0000, specular:0xffffff} 
        );
        var endMesh = new THREE.Mesh(end, endMat);
        endMesh.position.set(-4, 8, -10);

        //replace starting text with game over
        this.startTextMesh.visible = false;  

        this.scene.add(endMesh);
    }

    onMouseDown(event: MouseEvent): void {
        if(event.button == 0){

            // Get the mouse position in normalized device coordinates
            const deviceCoords = this.getDeviceCoordinates(event.x, event.y);

            // Create a ray caster
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(deviceCoords, this.camera);

            const groundIntersection = raycaster.intersectObject(this.ground);
            if(groundIntersection.length > 0) //only create bomb if aimed at ground 
            {
                this.bomb.position.copy(this.camera.position); //spawn bomb at camera position
                this.bombStartPos = this.camera.position;
                this.scene.add(this.bomb);
                this.shootDir = (raycaster.ray.direction).normalize(); //used in update() to move bomb towards shootDir
                return;
            }

        }
    }
    onMouseUp(event: MouseEvent): void{}
    onMouseMove(event: MouseEvent): void {}
    onMouseWheel(event: WheelEvent): void {}

    //enable wasd movement
    onKeyDown(event: KeyboardEvent): void {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key =='d' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
    }
    

    onKeyUp(event: KeyboardEvent): void {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y =0;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = 0;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = 0;
        else if(event.key =='d' || event.key == 'ArrowRight')
            this.inputVector.x =0;
    }
    private getDeviceCoordinates(mouseX: number, mouseY: number): THREE.Vector2
    {
        const viewportCoords = new THREE.Vector4();
        this.renderer.getViewport(viewportCoords);

        return new THREE.Vector2
        (
            THREE.MathUtils.clamp((mouseX - viewportCoords.x) / viewportCoords.width * 2 - 1, -1, 1),
            THREE.MathUtils.clamp((mouseY - viewportCoords.y) / viewportCoords.height * -2 + 1, -1, 1)
        );
    }
}
