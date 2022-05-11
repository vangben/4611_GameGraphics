#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// You should modify this fragment shader to implement a toon shading model
// As a starting point, you should copy and paste your completed shader code 
// from phong.frag into this file, and then modify it to use the diffuse
// and specular ramps. 

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

uniform sampler2D diffuseRamp;
uniform sampler2D specularRamp;

in vec3 vertPosition;
in vec3 vertNormal;
in vec4 vertColor;

out vec4 fragColor;

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
        //float diffuseComponent = max(dot(n, l), 0.0); 
        vec2 diffuseLookup = vec2((dot(n,l) * 0.5 + 0.5),0.0);
        //how to make a vec3 if texture() returns a vec4?
        illumination += kDiffuse * diffuseIntensities[i] * texture(diffuseRamp,diffuseLookup).rgb;
        //vec4 diffuse = kDiffuse * diffuseIntensities[i] * texture(diffuseRamp, diffuseLookup);
        
        // e is vector from vertex to eye
        vec3 e = normalize(eyePosition - vertPosition);

        //r is the light vector reflected about the normal
        vec3 r = reflect(-l,n);

        float specularComponent = pow(max(dot(e,r),0.0), shininess);
        vec2 specLookup = vec2(specularComponent,0.0);
        illumination += kSpecular * specularIntensities[i] * texture(specularRamp,specLookup).rgb; 
    }

    //vec4 illuminatedColor = vec4(illumination,1) * vertColor; 
    fragColor = vertColor;
    fragColor.rgb *= illumination;
}