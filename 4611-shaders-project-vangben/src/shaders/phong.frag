#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// You should modify this fragment shader to implement per-pixel illumination.
// The code will be similar to the per-vertex illumination shading
// implemented in GopherGfx/shaders/gouraud.vert.

precision mediump float;

#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

const int MAX_LIGHTS = 16;

uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositions[MAX_LIGHTS];
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];
uniform vec3 eyePosition;

in vec3 vertPosition; //worldposition
in vec3 vertNormal;
in vec4 vertColor;

out vec4 fragColor;

//sets fragment(after being divided up by vertex shader phong.vert) to vertcolor
//why do for() through numLights in fragment shader and not phong.vert?
//lecture vids how to calculate specular?
//how to calculate per-pixel? just lerp between normals? how to lerp?
void main() 
{ //TODO
    vec3 illumination = vec3(0,0,0);
    vec3 n = normalize(vertNormal); //normalize again after rasterizer uses
    for(int i =0;i<numLights;i++){ //do inner for loop to lerp()?

        // Ambient component: ambient refl coeff * intensity
        illumination+= kAmbient * ambientIntensities[i];

        vec3 l;
        if(lightTypes[i] == DIRECTIONAL_LIGHT) //SUN light
            l = normalize(lightPositions[i]);
        else //POINT light
            l = normalize(lightPositions[i] - vertPosition);
        
        // Diffuse component: diffuse refl coeff*intensity*(n dot l)
            // if ndotl is negative, make it 0
        float diffuseComponent = max(dot(n, l), 0.0); 
        illumination += kDiffuse * diffuseIntensities[i] * diffuseComponent;

        // h is vector from vertex to eye
        vec3 h = normalize(eyePosition - vertPosition);

        //n is the light vector reflected about the normal
        vec3 r = reflect(-l,n);

        float specularComponent = pow(max(dot(h,r),0.0), shininess);
        illumination += kSpecular * specularIntensities[i] * specularComponent; 

    }

    vec4 illuminatedColor = vec4(illumination,1) * vertColor; 
    fragColor = illuminatedColor;
}