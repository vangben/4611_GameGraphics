#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// You should modify this vertex shader to move the edge vertex
// along the normal away from the mesh surface if you determine
// that the vertex belongs to a silhouette edge.

precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix; //moves normal; from eye -> object space
uniform float thickness;

in vec3 position; //vertex position (in object space)
in vec3 normal; //vertex's normal "n"
in vec3 leftNormal; //transform these to eye/camera space first via normalMatrix
in vec3 rightNormal;

void main() 
{ //TODO
    //vec3 vertNormal = normalize(normal);

    //move left/right norms to eye space to help calculate "e" (vector to eye)
    vec3 nl = normalize(normalMatrix * vec4(leftNormal,0)).xyz; //make nl/nr a vec3?
    vec3 nr = normalize(normalMatrix * vec4(rightNormal,0)).xyz;

    //move vertex position to eye space - vec3 or vec4?
    vec3 preE = (modelViewMatrix * vec4(position,1)).xyz; 

    vec3 e = -(preE); //eye vector -- why does -position = vector?

    float left = dot(e, nl); //direction the mesh triangle is facing from eye/camera
    float right = dot(e, nr);

    /*if triangles on either side have diff signed 
        +/- normals(are facing opposite directions)
      then offset the vertex by thickness * vertex's normal(aka "normal")*/
    vec3 newPos;
    if((left*right) < 0.0){ //is boundary edge, create thick line segment in obj space
        newPos = position + ( thickness * normal );
    }
    //change vertex to world position AFTER thickening boundary edges
    //vec3 worldPos = (modelViewMatrix * vec4(position, 1)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1);
}