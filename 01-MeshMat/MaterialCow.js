// Définition de la classe MaterialCow

Requires("Material");


class MaterialCow extends Material
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

            // calculs allant vers le fragment shader
            out vec4 frgPosition;
            out vec3 frgN;
            out vec3 frgL;

            void main()
            {
                frgPosition = matVM  * vec4(glVertex, 1.0); // position camera
                gl_Position = matP * frgPosition; // position écran
                frgN = matN * glNormal; //transformation du vecteur normal en coordonnées globales
                frgL = matN * L;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // couleur de la vache à cet endroit
            vec3 Kd = vec3(1.0, 0.7, 0.6);
            vec3 Ks = vec3(1.0, 1.0, 1.0);

            // informations venant du vertex shader
            in vec4 frgPosition;
            in vec3 frgN;
            in vec3 frgL;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
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
        super(srcVertexShader, srcFragmentShader, "MaterialCow");
    }
}
