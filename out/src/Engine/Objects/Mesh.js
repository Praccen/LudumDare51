import GraphicsObject from "./GraphicsObject.js";
import Vec2 from "../Maths/Vec2.js";
import Vec3 from "../Maths/Vec3.js";
import Triangle from "../Physics/Shapes/Triangle.js";
export default class Mesh extends GraphicsObject {
    // Public
    textureMatrix;
    diffuse;
    specular;
    // Private
    vertices;
    constructor(gl, shaderProgram, objContent, diffuse, specular) {
        super(gl, shaderProgram);
        this.parseObjContent(objContent);
        this.setVertexData(this.vertices);
        this.diffuse = diffuse;
        this.specular = specular;
        this.modelMatrix = new Matrix4(null);
        this.textureMatrix = new Matrix4(null);
    }
    parseObjContent(objContent) {
        /*
        https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
        */
        const lines = objContent.split("\n");
        let vertexPositions = new Array();
        let vertexTexCoords = new Array();
        let vertexNormals = new Array();
        let vertices = new Array();
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith("vt")) {
                // Texture coordinates
                const coords = line.split(/\s+/).filter((element) => {
                    return element != "vt";
                });
                vertexTexCoords.push(new Vec2({ x: coords[0], y: coords[1] }));
            }
            else if (line.startsWith("vn")) {
                // Normal
                const coords = line.split(/\s+/).filter((element) => {
                    return element != "vn";
                });
                vertexNormals.push(new Vec3({ x: coords[0], y: coords[1], z: coords[2] }));
            }
            else if (line.startsWith("v")) {
                // Position
                const coords = line.split(/\s+/).filter((element) => {
                    return element != "v";
                });
                vertexPositions.push(new Vec3({ x: coords[0], y: coords[1], z: coords[2] }));
            }
            else if (line.startsWith("f")) {
                // Faces
                const coords = line.split(/\s+/).filter((element) => {
                    return element != "f";
                });
                for (let i = 0; i < coords.length - 2; i++) {
                    for (let j = 0; j < 3; j++) {
                        let index = j == 0 ? 0 : i + j; // 0 if j is zero, otherwize i +j
                        const indices = coords[index].split("/");
                        const last = vertices.push({
                            posIndex: NaN,
                            texCoordIndex: NaN,
                            normalIndex: NaN,
                        });
                        if (indices.length > 0) {
                            vertices[last - 1].posIndex = parseInt(indices[0]) - 1;
                        }
                        if (indices.length > 1) {
                            vertices[last - 1].texCoordIndex = parseInt(indices[1]) - 1; // Can be empty, texCoordIndex will then be NaN
                        }
                        if (indices.length > 2) {
                            vertices[last - 1].normalIndex = parseInt(indices[2]) - 1;
                        }
                    }
                }
            }
            else if (line.startsWith("#")) {
                // A comment, ignore
            }
            else if (line.length > 0) {
                // Unhandled keywords
                //console.warn("OBJ loader: Unhandled keyword " + line.split(/\s+/)[0]);
            }
        }
        this.vertices = new Float32Array(vertices.length * 8); // 3 * pos + 3 * norm + 2 * tx
        for (let i = 0; i < vertices.length; i++) {
            if (!isNaN(vertices[i].posIndex)) {
                this.vertices[i * 8] = vertexPositions[vertices[i].posIndex].x;
                this.vertices[i * 8 + 1] = vertexPositions[vertices[i].posIndex].y;
                this.vertices[i * 8 + 2] = vertexPositions[vertices[i].posIndex].z;
            }
            else {
                this.vertices[i * 8] = 0.0;
                this.vertices[i * 8 + 1] = 0.0;
                this.vertices[i * 8 + 2] = 0.0;
            }
            if (!isNaN(vertices[i].normalIndex)) {
                this.vertices[i * 8 + 3] = vertexNormals[vertices[i].normalIndex].x;
                this.vertices[i * 8 + 4] = vertexNormals[vertices[i].normalIndex].y;
                this.vertices[i * 8 + 5] = vertexNormals[vertices[i].normalIndex].z;
            }
            else {
                this.vertices[i * 8 + 3] = 1.0;
                this.vertices[i * 8 + 4] = 0.0;
                this.vertices[i * 8 + 5] = 0.0;
            }
            if (!isNaN(vertices[i].texCoordIndex)) {
                this.vertices[i * 8 + 6] = vertexTexCoords[vertices[i].texCoordIndex].x;
                this.vertices[i * 8 + 7] = vertexTexCoords[vertices[i].texCoordIndex].y;
            }
            else {
                this.vertices[i * 8 + 6] = 0.0;
                this.vertices[i * 8 + 7] = 0.0;
            }
        }
    }
    setupTriangles(triangles) {
        triangles.length = 0; // Clear triangles
        for (let i = 0; i < this.vertices.length; i += 8 * 3) {
            // Go through the vertices
            // Save the positions as shapes in the input array
            const length = triangles.push(new Triangle());
            triangles[length - 1].setVertices(new Vec3({
                x: this.vertices[i],
                y: this.vertices[i + 1],
                z: this.vertices[i + 2],
            }), new Vec3({
                x: this.vertices[i + 8],
                y: this.vertices[i + 8 + 1],
                z: this.vertices[i + 8 + 2],
            }), new Vec3({
                x: this.vertices[i + 16],
                y: this.vertices[i + 16 + 1],
                z: this.vertices[i + 16 + 2],
            }));
        }
    }
    getVertexPositions() {
        let returnArr = new Array();
        for (let i = 0; i < this.vertices.length; i += 8) {
            returnArr.push(new Vec3({
                x: this.vertices[i],
                y: this.vertices[i + 1],
                z: this.vertices[i + 2],
            }));
        }
        return returnArr;
    }
    draw(bindDiffuse = true, bindBoth = true) {
        this.bindVAO();
        if (bindDiffuse || bindBoth) {
            this.diffuse.bind(0);
        }
        if (bindBoth) {
            this.specular.bind(1);
        }
        let modelReturn = this.shaderProgram.getUniformLocation("modelMatrix");
        if (modelReturn[1]) {
            this.gl.uniformMatrix4fv(modelReturn[0], false, this.modelMatrix.elements);
        }
        let textureReturn = this.shaderProgram.getUniformLocation("textureMatrix");
        if (textureReturn[1]) {
            this.gl.uniformMatrix4fv(textureReturn[0], false, this.textureMatrix.elements);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 8);
    }
}
//# sourceMappingURL=Mesh.js.map