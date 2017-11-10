// Définition de la classe MaterialCow

Requires("Material");


class MaterialCow extends Material
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

            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
                frgN = matN * glNormal;
                frgL = matN * L;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // couleur de la vache
            const vec3 Kd = vec3(1.0, 0.7, 0.6);

            // informations venant du vertex shader
            in vec3 frgN;
            in vec3 frgL;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // calcul de Lambert
                vec3 N = normalize(frgN);
                vec3 L = normalize(frgL);
                float dotNL = clamp(dot(N, L), 0.0, 1.0);
                // couleur finale = diffus + ambiant
                glFragColor = vec4(Kd * (0.8 * dotNL + 0.2), 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialCow");
    }
}
