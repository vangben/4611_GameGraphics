// @ts-ignore
import wireframeVertexShader from '../shaders/wireframe.vert'
// @ts-ignore
import wireframeFragmentShader from '../shaders/wireframe.frag'

import { Material } from './Material';
import { ShaderProgram } from './ShaderProgram';
import { Mesh } from '../geometry/Mesh';
import { Camera } from '../core/Camera';
import { Transform } from '../core/Transform';
import { LightManager } from '../lights/LightManager';
import { Color4 } from '../math/Color4';
import { Matrix4 } from '../math/Matrix4'


export class WireframeMaterial extends Material
{
    private static shader = new ShaderProgram(wireframeVertexShader, wireframeFragmentShader);

    public color : Color4;

    private wireframeBuffers: Map<Mesh, WebGLBuffer>;

    private positionAttribute : number;
    private modelViewUniform : WebGLUniformLocation | null;
    private projectionUniform : WebGLUniformLocation | null;
    private colorUniform : WebGLUniformLocation | null;

    constructor()
    {
        super();

        this.color = new Color4(1, 1, 1, 1);
        this.wireframeBuffers = new Map();

        WireframeMaterial.shader.initialize(this.gl);
        this.positionAttribute = WireframeMaterial.shader.getAttribute(this.gl, 'position');
        this.modelViewUniform = WireframeMaterial.shader.getUniform(this.gl, 'modelViewMatrix');
        this.projectionUniform = WireframeMaterial.shader.getUniform(this.gl, 'projectionMatrix');
        this.colorUniform = WireframeMaterial.shader.getUniform(this.gl, 'color');
    }

    draw(mesh: Mesh, transform: Transform, camera: Camera, lightManager: LightManager): void
    {
        if(!this.visible || mesh.triangleCount == 0)
            return;
            
        // Switch to this shader
        this.gl.useProgram(WireframeMaterial.shader.getProgram());

        // Set the uniform matrices
        this.gl.uniformMatrix4fv(this.modelViewUniform, false, Matrix4.multiply(transform.getWorldMatrix(), camera.getViewMatrix()).mat);
        this.gl.uniformMatrix4fv(this.projectionUniform, false, camera.projectionMatrix.mat);
        this.gl.uniform4f(this.colorUniform, this.color.r, this.color.g, this.color.b, this.color.a);

        // // Set the vertex positions
        this.gl.enableVertexAttribArray(this.positionAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttribute, 3, this.gl.FLOAT, false, 0, 0);

        if(!this.wireframeBuffers.get(mesh) || mesh.positionBufferDirty)
            this.updateWireframeBuffer(mesh);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.wireframeBuffers.get(mesh) as WebGLBuffer);
        this.gl.drawElements(this.gl.LINES, mesh.triangleCount * 6, this.gl.UNSIGNED_SHORT, 0);
    }

    private updateWireframeBuffer(mesh: Mesh) : void
    {
        let wireframeBuffer : WebGLBuffer | null | undefined;
        wireframeBuffer = this.wireframeBuffers.get(mesh);

        if(!wireframeBuffer)
        {
            wireframeBuffer = this.gl.createBuffer();
            
            if(wireframeBuffer)
                this.wireframeBuffers.set(mesh, wireframeBuffer);
        }

        const indexArray = new Uint16Array(mesh.triangleCount * 3);
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, mesh.indexBuffer);
        this.gl.getBufferSubData(this.gl.COPY_READ_BUFFER, 0, indexArray);
        const indices = [... indexArray];

        const wireframeIndices = [];
        for(let i=0; i < mesh.triangleCount; i++)
        {
            wireframeIndices.push(indices[i*3]);
            wireframeIndices.push(indices[i*3+1]);

            wireframeIndices.push(indices[i*3+1]);
            wireframeIndices.push(indices[i*3+2]);

            wireframeIndices.push(indices[i*3+2]);
            wireframeIndices.push(indices[i*3]);
        }

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, wireframeBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireframeIndices), this.gl.DYNAMIC_DRAW);
    }
}