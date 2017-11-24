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
            // direction de la lumière en coordonnées locales
            // cette lampe est positionnée par rapport à l'objet
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
            out vec4 frgPosition;
            out vec3 frgN;
            out vec3 frgL;
            out vec2 frgTexCoords;

            void main()
            {
                frgPosition = matVM  * vec4(glVertex, 1.0); // position camera
                gl_Position = matP * frgPosition; // position écran
                frgN = matN * glNormal; //transformation du vecteur normal en coordonnées globales
                frgL = matN * L;
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // texture donnant la couleur de la pomme
            uniform sampler2D txColor;

            // informations venant du vertex shader
            in vec4 frgPosition;
            in vec3 frgN;
            in vec3 frgL;
            in vec2 frgTexCoords;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // couleur de la pomme à cet endroit
                vec3 Kd = texture(txColor, frgTexCoords).rgb;
                vec3 Ks = vec3(1.0, 1.0, 1.0);

                // prépa des vecteurs
                vec3 V = normalize(-frgPosition.xyz);
                vec3 N = normalize(frgN);
                vec3 L = normalize(frgL);

                // calcul de Lambert
                float D = clamp(dot(N, L), 0.0, 1.0);

                // calcul de Blinn
                vec3 H = normalize(V + L);
                float dotNH = clamp(dot(N, H), 0.0, 1.0);
                float S = pow(dotNH, 100.0);

                // couleur finale = diffus + ambiant
                vec3 amb = 0.2 * Kd; //contribution ambiante
                vec3 dif = 0.8 * Kd * D; //contribution diffuse
                vec3 spec = 0.5 * Ks * S;

                glFragColor = vec4(amb + dif + spec, 1.0);
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
