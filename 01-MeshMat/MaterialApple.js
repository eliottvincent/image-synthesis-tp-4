// Définition de la classe MaterialApple

Requires("Material");
Requires("Texture2D");


class MaterialApple extends Material
{
    /** constructeur */
    constructor()
    {
        let srcVertexShader = dedent
            `#version 300 es
            // direction de la lumière)
            const vec3 L = vec3(-0.5, 1.0, 1.0);

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;
            uniform mat3 matN;

            // informations des sommets (VBO)
            in vec3 glVertex;
            in vec3 glNormal;
            in vec2 glTexCoords;

            // calculs allant vers le fragment shader
            out vec3 frgN;
            out vec3 frgL;
            out vec2 frgTexCoords;

            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
                frgN = matN * glNormal;
                frgL = matN * L;
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // texture donnant la couleur de la pomme
            uniform sampler2D txColor;

            // informations venant du vertex shader
            in vec3 frgN;
            in vec3 frgL;
            in vec2 frgTexCoords;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // couleur de la pomme à cet endroit
                vec3 Kd = texture(txColor, frgTexCoords).rgb;
                // calcul de Lambert
                vec3 N = normalize(frgN);
                vec3 L = normalize(frgL);
                float dotNL = clamp(dot(N, L), 0.0, 1.0);
                // couleur finale = diffus + ambiant
                glFragColor = vec4(Kd * (0.8 * dotNL + 0.2), 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialApple");

        // emplacement des variables uniform spécifiques
        this.m_TextureLoc = gl.getUniformLocation(this.m_ShaderId, "txColor");

        // charge l'image de la pomme en tant que texture
        this.m_Texture = new Texture2D("data/Apple/skin.jpg");
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

        // activer la texture sur l'unité 0
        this.m_Texture.setTextureUnit(gl.TEXTURE0, this.m_TextureLoc);
    }


    /**
     * désactive le matériau
     */
    deselect()
    {
        // libérer le sampler
        this.m_Texture.setTextureUnit(gl.TEXTURE0);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer la texture
        this.m_Texture.destroy();
    }
}
