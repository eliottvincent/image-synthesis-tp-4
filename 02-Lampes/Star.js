// Définition de la classe Star


/**
 * Cette classe permet de dessiner un maillage en forme d'étoile
 */
class Star
{
    /**
     * constructeur
     * @param size : longueur des branches
     * @param width : largeur des branches
     */
    constructor(size=0.5, width=1.0)
    {
        /** divers */

        this.m_Width = width;

        /** shader */

        let srcVertexShader = dedent
            `#version 100
            uniform mat4 matrix;
            attribute vec3 glVertex;
            void main()
            {
                gl_Position = matrix * vec4(glVertex, 1.0);
            }`;

        let srcFragmentShader = dedent
            `#version 100
            precision mediump float;
            void main()
            {
                gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
            }`;

        // compiler le shader de dessin
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShader, srcFragmentShader, "Star");

        // déterminer où sont les variables attribute et uniform
        this.m_MatrixLoc = gl.getUniformLocation(this.m_ShaderId, "matrix");
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");

        /** VBOs */

        // créer et remplir le buffer des coordonnées
        let vertices = [];

        // dessiner une sorte d'étoile sur tous les axes (lampe omnidirectionnelle)
        let s = size;
        vertices.push(-s); vertices.push( 0.0); vertices.push( 0.0);
        vertices.push(+s); vertices.push( 0.0); vertices.push( 0.0);

        vertices.push( 0.0); vertices.push(-s); vertices.push( 0.0);
        vertices.push( 0.0); vertices.push(+s); vertices.push( 0.0);

        vertices.push( 0.0); vertices.push( 0.0); vertices.push(-s);
        vertices.push( 0.0); vertices.push( 0.0); vertices.push(+s);

        let k = 0.577 * s; // c'est à dire 1/racine carrée de 3, pour faire une longueur unitaire
        vertices.push(-k); vertices.push(-k); vertices.push(-k);
        vertices.push(+k); vertices.push(+k); vertices.push(+k);

        vertices.push(-k); vertices.push(+k); vertices.push(-k);
        vertices.push(+k); vertices.push(-k); vertices.push(+k);

        vertices.push(-k); vertices.push(-k); vertices.push(+k);
        vertices.push(+k); vertices.push(+k); vertices.push(-k);

        vertices.push(-k); vertices.push(+k); vertices.push(+k);
        vertices.push(+k); vertices.push(-k); vertices.push(-k);

        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        this.VERTICES_COUNT = vertices.length / 3;

        // matrices de transformation intermédiaires (on pourrait économiser l'une d'elles)
        this.m_MatPVM = mat4.create();      // P * V * M
    }


    /**
     * dessiner l'objet
     * @param matP : matrice de projection perpective
     * @param matV : matrice de transformation de l'objet par rapport à la caméra
     */
    onDraw(matP, matV)
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la matrice P * V * M au shader
        mat4.mul(this.m_MatPVM, matP, matV);
        mat4.glUniformMatrix(this.m_MatrixLoc, this.m_MatPVM);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // largeur des lignes
        gl.lineWidth(this.m_Width);

        // dessiner les lignes
        gl.drawArrays(gl.LINES, 0, this.VERTICES_COUNT);

        // remettre la valeur par défaut
        gl.lineWidth(1.0);

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }


    /** destructeur */
    destroy()
    {
        // supprimer le shader et les VBOs
        Utils.deleteShaderProgram(this.m_ShaderId);
        Utils.deleteVBO(this.m_VertexBufferId);
    }
}
