// Définition de la classe Material, superclasse de tous les matériaux

class Material
{
    /**
     * constructeur
     * @param name : nom du matériau
     */
    constructor(srcVertexShader=null, srcFragmentShader=null, name="undefined")
    {
        // test des paramètres
        if (srcVertexShader==null || srcFragmentShader==null) {
            throw "Missing shader source for material subclass";
        }

        // nom du matériau pour la mise au point
        this.m_Name = name;

        // compiler le shader
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShader, srcFragmentShader, this.m_Name);

        // déterminer où sont les variables uniform (paramètres du matériau)
        this.m_MatPLoc   = gl.getUniformLocation(this.m_ShaderId, "matP");
        this.m_MatVMLoc  = gl.getUniformLocation(this.m_ShaderId, "matVM");
        this.m_MatNLoc   = gl.getUniformLocation(this.m_ShaderId, "matN");
        this.m_TimeLoc   = gl.getUniformLocation(this.m_ShaderId, "time");

        // déterminer où sont les variables attribute (associées aux VBO)
        this.m_VertexLoc    = gl.getAttribLocation(this.m_ShaderId, "glVertex");
        this.m_ColorLoc     = gl.getAttribLocation(this.m_ShaderId, "glColor");
        this.m_NormalLoc    = gl.getAttribLocation(this.m_ShaderId, "glNormal");
        this.m_TangentLoc   = gl.getAttribLocation(this.m_ShaderId, "glTangent");
        this.m_TexCoordsLoc = gl.getAttribLocation(this.m_ShaderId, "glTexCoords");

        // test de validité minimal
        if (this.m_VertexLoc == null || this.m_VertexLoc < 0) {
            throw "Vertex shader of "+name+" uses another name for coordinates instead of attribute vec3 glVertex;"
        }

        // matrice normale
        this.m_MatN = mat3.create();
    }


    /**
     * active le matériau : son shader et lie les variables uniform communes
     * @param mesh : maillage pour lequel on active ce matériau
     * @param matP : matrice de projection perpective
     * @param matVM : matrice de transformation de l'objet par rapport à la caméra
     */
    select(mesh, matP, matVM)
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir les matrices P et VM au shader
        mat4.glUniformMatrix(this.m_MatPLoc, matP);
        mat4.glUniformMatrix(this.m_MatVMLoc, matVM);

        // fournir le temps (il n'est pas forcément utilisé par le shader)
        gl.uniform1f(this.m_TimeLoc, Utils.Time);

        // calcul de la matrice normale si elle est utilisée
        if (this.m_MatNLoc != null) {
            mat3.fromMat4(this.m_MatN, matVM);
            mat3.transpose(this.m_MatN, this.m_MatN);
            mat3.invert(this.m_MatN, this.m_MatN);
            mat3.glUniformMatrix(this.m_MatNLoc, this.m_MatN);
        }

        // activer et lier le buffer contenant les coordonnées, attention ce sont des vec3 obligatoirement
        let vertexBufferId = mesh.getVertexBufferId();
        if (vertexBufferId == null) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les couleurs s'il est utilisé dans le shader
        if (this.m_ColorLoc != null && this.m_ColorLoc >= 0) {
            let colorBufferId = mesh.getColorBufferId();
            if (colorBufferId != null) {
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId);
                gl.enableVertexAttribArray(this.m_ColorLoc);
                gl.vertexAttribPointer(this.m_ColorLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);
            }
        }

        // activer et lier le buffer contenant les normales s'il est utilisé dans le shader
        if (this.m_NormalLoc != null && this.m_NormalLoc >= 0) {
            let normalBufferId = mesh.getNormalBufferId();
            if (normalBufferId != null) {
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferId);
                gl.enableVertexAttribArray(this.m_NormalLoc);
                gl.vertexAttribPointer(this.m_NormalLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);
            }
        }

        // activer et lier le buffer contenant les tangentes s'il est utilisé dans le shader
        if (this.m_TangentLoc != null && this.m_TangentLoc >= 0) {
            let tangentBufferId = mesh.getTangentBufferId();
            if (tangentBufferId != null) {
                gl.bindBuffer(gl.ARRAY_BUFFER, tangentBufferId);
                gl.enableVertexAttribArray(this.m_TangentLoc);
                gl.vertexAttribPointer(this.m_TangentLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);
            }
        }

        // activer et lier le buffer contenant les coordonnées de textures s'il est utilisé dans le shader
        if (this.m_TexCoordsLoc != null && this.m_TexCoordsLoc >= 0) {
            let texcoordsBufferId = mesh.getTexCoordsBufferId();
            if (texcoordsBufferId != null) {
                gl.bindBuffer(gl.ARRAY_BUFFER, texcoordsBufferId);
                gl.enableVertexAttribArray(this.m_TexCoordsLoc);
                gl.vertexAttribPointer(this.m_TexCoordsLoc, Utils.VEC2, gl.FLOAT, gl.FALSE, 0, 0);
            }
        }
    }


    /**
     * désactive le matériau
     */
    deselect()
    {
        // désactiver les buffers s'ils sont utilisés
        gl.disableVertexAttribArray(this.m_VertexLoc);
        if (this.m_ColorLoc != null && this.m_ColorLoc >= 0) {
            gl.disableVertexAttribArray(this.m_ColorLoc);
        }
        if (this.m_NormalLoc != null && this.m_NormalLoc >= 0) {
            gl.disableVertexAttribArray(this.m_NormalLoc);
        }
        if (this.m_TangentLoc != null && this.m_TangentLoc >= 0) {
            gl.disableVertexAttribArray(this.m_TangentLoc);
        }
        if (this.m_TexCoordsLoc != null && this.m_TexCoordsLoc >= 0) {
            gl.disableVertexAttribArray(this.m_TexCoordsLoc);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // supprimer le shader
        Utils.deleteShaderProgram(this.m_ShaderId);
    }
}
