import * as THREE from 'three'
import { Sphere, SphereGeometry, Vector2, Vector3 } from 'three';
import { EdgeMesh } from './Materials/EdgeMesh'
import {Scene} from 'three'

export class Ground extends THREE.Mesh
{
    private segments: number;
    private vertices: number[];

    public edgeMesh: EdgeMesh;
    //public screenPath3D : THREE.Vector3[];

    //constructor sets up ground plane with triangle mesh grid
    constructor(size: number, segments: number)
    {
        super();

        // to initialize ground geometry, a simple grid is used.  if it is running too slow,
        // you can turn down the resolution by decreasing the number of segments, but this will
        // make the hills look more jaggy.

        this.segments = segments;
        this.vertices = [];

        //this.screenPath3D = [];// = []; //store 3d-projected screenpath in array

        const normals = [];
        const indices = [];

        const increment = size / segments;
        for(let i = -size/2; i <= size/2; i += increment)
        {
            for(let j= -size/2; j <= size/2; j += increment)
            {
                this.vertices.push(i, 0, j);
                normals.push(0, 1, 0);
            }
        }

        for(let i = 0; i < segments; i++)
        {
            for(let j = 0; j < segments; j++)
            {
                // first triangle
                indices.push(this.convertRowColToIndex(i, j));
                indices.push(this.convertRowColToIndex(i, j+1));
                indices.push(this.convertRowColToIndex(i+1, j));

                // second triangle
                indices.push(this.convertRowColToIndex(i+1, j));
                indices.push(this.convertRowColToIndex(i, j+1));
                indices.push(this.convertRowColToIndex(i+1, j+1));
            }
        }

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
        this.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        this.geometry.setIndex(indices);

        // Create an edge mesh for the outline shader
        this.edgeMesh = new EdgeMesh();
        this.edgeMesh.createFromMesh(this); 
        this.add(this.edgeMesh);
    }


    // Modifies the vertices of the ground mesh to create a hill or valley based
    // on the input stroke.  The 2D path of the stroke on the screen is passed
    // in, this is the centerline of the stroke mesh that is actually drawn on
    // the screen while the user is drawing.
    public reshapeGround(screenPath: THREE.Vector2[], groundStartPoint: THREE.Vector3,  groundEndPoint: THREE.Vector3, camera: THREE.Camera): void
    {
        // TO DO: Deform the 3D ground mesh according to the algorithm described in the
        // Cohen et al. Harold paper.

        // There are 3 major steps to the algorithm, outlined here:
//---------------
        // 1. Define a plane to project the stroke onto.  The first and last points
        // of the stroke are guaranteed to project onto the ground plane.  The plane
        // should pass through these two points on the ground.  The plane should also
        // have a normal vector that points toward the camera(?) and is parallel to the
        // ground plane.

        //have plane be orthogonal to ground 
        //find difference vector between start and endpoint, cross product with vector looking straightup
            //ortho vectors = creates local coord system
        const difference = new THREE.Vector3().subVectors(groundStartPoint, groundEndPoint);//(groundStartPoint.sub(groundEndPoint));
        const upVec = new Vector3(0,1,0);
        const normVec = difference.cross(upVec); //normVec is ortho to the plane
   
        //const normVec = (new Vector3(camera.position.x,camera.position.y,1)).normalize;
        var plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normVec.normalize(),groundStartPoint);
            //don't have to initialize plane location because setfromNorm... does that
                //using 1 point and a normal already

//-----------------------
        // 2. Project the 2D stroke into 3D so that it lies on the "projection plane"
        // defined in step 1.

        // You will need to create a THREE.Raycaster, as discussed in class
        // You can use the raycaster.ray.intersectPlane() method to check
        // for an intersection with a THREE.Plane object.
        var screenPath3D: THREE.Vector3[] = []; //store 3d-projected screenpath in array
        const raycaster = new THREE.Raycaster(); // camera.position, (new Vector3(screenPath[i].y,screenPath[i].x,-1)).normalize());

        for(let i=0;i<screenPath.length;i++){ 
            //cast a ray from camera -> screenpath for every point
            //initialize raycaster
            //const point = new Vector2(); //set raycaster to start from cam position
            //point = this.renderer.getNormalizedDevicecoords(screenpath.x,y) //<< may have to do
            raycaster.setFromCamera(screenPath[i], camera); //dont have to set point b/c of screenpath3d[]?
            const intersection = new Vector3(); //stores point were raycaster intersects plane

            raycaster.ray.intersectPlane(plane,intersection); //returns point
            //const DPoint = new Vector3();
            //plane.projectPoint(intersection,DPoint); //store 3dpoint in Dpoint
            screenPath3D.push(intersection); //TODO: FIX intersection point stays the same
            // var test3DPath = new Vector3();
            // test3DPscreenPath3D[i];
           
        }
//-------------------------
        // 3. Loop through all of the vertices of the ground mesh, and adjust the
        // height of each based on the equations in section 4.5 of the paper, also
        // repeated in the assignment readme.  The equations rely upon a function
        // h(), and we have implemented that for you as computeH() defined below.
        // Then, update the mesh geometry with the adjusted vertex positions.
        // const verts = this.vertices;
        //let currVert= 0;
        for(let i=0; i < this.vertices.length/3 ;i++){ //for every vertex(vector3's), adjust ONLY the 1st index(y-coord)
            const currentP = new Vector3(); 
            const closestP = new Vector3(); 
            //closest point on plane to currentP; used for computeH

            //currVert = this.vertices[i*3]; 
            currentP.set(this.vertices[i*3],this.vertices[i*3+1], //current vertex on ground mesh
            this.vertices[i*3+2]); 

            //calculate w(d) first
            const d = plane.distanceToPoint(currentP); //distance from currentP to plane
            const wd = Math.max(0, 1 - (d / 5) * (d / 5)); //code given from TA
            if(wd>0){ //wd weight can't be negative 

                //project currentP to plane, store in closestP
                plane.projectPoint(currentP, closestP);
                const H = this.computeH( closestP, screenPath3D, plane);

                var pStar = 0;
                if(H != 0){
                    //equation, calculate pStar to set new height for currentP 
                    pStar = (1-wd)*currentP.y + wd*H;

                    //access just the y-coord of every 3-coord vertex
                    this.vertices[i*3+1] = pStar; 
                } 
            }             
            //note vertices[i*3+1] should be 0 height by default before applying pStar
            //this.vertices[i*3+1] = pStar.y; //access just the y-coord of every 3pointed-vertex
            //wizardly?: use this.indices? adjust height of entire triangles, not just vertices? 
        }

        
        // Finally, after the position buffer has been updated, we need to compute
        // new vertex normals and update the edge mesh for the outline shader.
        // You will not need to modify this part of the code.
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
        this.geometry.computeVertexNormals();   
        this.edgeMesh.createFromMesh(this); 
    }


    // This implements the "h" term used in the equations described in section 4.5 of the paper. 
    // Three arguments are needed:
    //
    // 1. closestPoint: As described in the paper, this is the closest point within
    // the projection plane to the vertex of the mesh that we want to modify.  In other
    // words, it is the perpendicular projection of the vertex we want to modify onto
    // the projection plane.
    //
    // 2. silhouetteCurve: As described in the paper, the silhouette curve is a 3D version
    // of the curve the user draws with the mouse.  It is formed by projecting the
    // original 2D screen-space curve onto the 3D projection plane. 
    //
    // 3. projectionPlane: We need to know where the projection plane is in 3D space.
    private computeH(closestPoint: THREE.Vector3, silhouetteCurve: THREE.Vector3[], projectionPlane: THREE.Plane): number
    {
        // define the y axis for a "plane space" coordinate system as a world space vector
        const planeY = new THREE.Vector3(0, 1, 0);

         // define the x axis for a "plane space" coordinate system as a world space vector
        const planeX = new THREE.Vector3().crossVectors(planeY, projectionPlane.normal);
        planeX.normalize();

        // define the origin for a "plane space" coordinate system as the first point in the curve
        const origin = silhouetteCurve[0];

        // loop over line segments in the curve, find the one that lies over the point by
        // comparing the "plane space" x value for the start and end of the line segment
        // to the "plane space" x value for the closest point to the vertex that lies
        // in the projection plane.
        const xTarget = new THREE.Vector3().subVectors(closestPoint, origin).dot(planeX);
        for(let i=1; i < silhouetteCurve.length; i++)
        {
            const xStart = new THREE.Vector3().subVectors(silhouetteCurve[i-1], origin).dot(planeX);
            const xEnd = new THREE.Vector3().subVectors(silhouetteCurve[i], origin).dot(planeX);

            if((xStart <= xTarget) && (xTarget <= xEnd))
            {
                const alpha = (xTarget - xStart) / (xEnd - xStart);
                const yCurve = silhouetteCurve[i-1].y + alpha * (silhouetteCurve[i].y - silhouetteCurve[i-1].y);
                return yCurve - closestPoint.y;
            }
            else if((xEnd <= xTarget) && (xTarget <= xStart))
            {
                const alpha = (xTarget - xEnd) / (xStart - xEnd);
                const yCurve = silhouetteCurve[i].y + alpha * (silhouetteCurve[i-1].y - silhouetteCurve[i].y); 
                return yCurve - closestPoint.y;
            }
        }

        // return 0 because the point does not lie under the curve
        return 0;
    }

    private convertRowColToIndex(row: number, col: number): number
    {
        return row * (this.segments+1) + col;
    }
}