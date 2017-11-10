// Définition de la classe MaterialEdge

Requires("Material");


class MaterialEdge extends Material
{
    /** constructeur */
    constructor()
    {
        let srcVertexShader = dedent
            `#version 300 es
            uniform mat4 matP;
            uniform mat4 matVM;

            // informations des sommets (VBO)
            in vec3 glVertex;

            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                glFragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialEdge");
    }


    /**
     * active le matériau : son shader et lie les variables uniform communes
     * @param mesh : maillage pour lequel on active ce matériau
     * @param matP : matrice de projection perpective
     * @param matVM : matrice de transformation de l'objet par rapport à la caméra
     */
    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // changer la largeur des lignes
        gl.lineWidth(0.5);
    }


    /**
     * désactive le matériau
     */
    deselect()
    {
        // remettre la largeur des lignes
        gl.lineWidth(1.0);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }
}
