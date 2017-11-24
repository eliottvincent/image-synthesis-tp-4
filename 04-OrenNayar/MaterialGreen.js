// Définition de la classe MaterialGreen

Requires("Material");


class MaterialGreen extends Material
{
    constructor()
    {
        let srcVertexShader = dedent
            `#version 100

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;
            uniform mat3 matN;

            // VBO fournissant les infos des sommets
            attribute vec3 glVertex;
            attribute vec3 glNormal;
            attribute vec2 glTexCoords;

            // données pour le fragment shader
            varying vec4 frgPosition;
            varying vec3 frgN;

            void main()
            {
                frgPosition = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * frgPosition;
                frgN = matN * glNormal;
            }`;

        let srcFragmentShader = dedent
            `#version 100
            precision mediump float;

            // caractéristiques du matériau
            const vec3 Kd = vec3(0.0, 0.6, 0.0);
            const vec3 Ks = vec3(0.6, 0.6, 0.6);
            const float ns = 64.0;

            // lampes
            const int nbL = 3;
            uniform vec3 LightColors[nbL];
            uniform vec4 LightPositions[nbL];

            // données venant du vertex shader
            varying vec4 frgPosition;
            varying vec3 frgN;
            varying vec2 frgTexCoords;

            void main()
            {
                // éclairement ambiant : 20 % 
                gl_FragColor = vec4(Kd * 0.2, 1.0);

                // vecteur N et -V et Reflet de V
                vec3 N = normalize(frgN);
                vec3 V = normalize(-frgPosition.xyz);
                vec3 mV = -normalize(frgPosition.xyz);
                vec3 Rv = reflect(mV, N);
                
                // déclaration pour Oren-Nayar
                float dotNV = dot(N, V);
                float angleNV = acos(dotNV);
                vec3 Vtb = normalize(V - N*dotNV);
                const float m = 5.0;
                const float sigma2 = 0.64;
                const float a = 1.0 - 0.5 * sigma2 / (sigma2 + 0.57);
                const float b = 0.45 * sigma2/(sigma2 + 0.09);

                for (int i = 0; i < nbL; i++)
                {
                    vec3 L = LightPositions[i].xyz - frgPosition.xyz * LightPositions[i].w;
                    float dist = length(L);
                    L = L / dist;   // normalisation de L
                    vec3 LightColorEffective =  LightColors[i] / (dist*dist);   
                    
                    // déclaration pour Oren-Nayar
                    float dotNL = dot(N, L);
                    float angleNL = acos(dotNL);
                    vec3 Ltb = normalize(L - N*dotNL);
                    
                    float alpha = max(angleNV, angleNL);
                    float beta  = min(angleNV, angleNL);
                    float c = sin(alpha) * tan(beta);
                    float gamma = max(0.0, dot(Vtb, Ltb));

                    float D = clamp(dotNL, 0.0, 1.0) * (a + b * gamma * c);
                    
                    // ajout de la composante diffuse (Oren-Nayar)
                    gl_FragColor += vec4(Kd * D * LightColorEffective, 1.0);
                    
                    // Blinn-Oren Nayar
                    vec3 H = normalize(V + L);
                    float dotNH = clamp(dot(N,H), 0.0, 1.0);
                    float S = pow(dotNH, ns);
                    
                    // ajout de la composante speculaire (Oren-Nayar)
                    gl_FragColor += vec4(S * Ks * LightColorEffective, 1.0);
                }
                
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialGreen");

        // emplacement des variables uniform spécifiques
        this.m_LightColorsLoc = gl.getUniformLocation(this.m_ShaderId, "LightColors");
        this.m_LightPositionsLoc = gl.getUniformLocation(this.m_ShaderId, "LightPositions");
    }


    /**
     * définit l'ensemble des lampes
     * @param lights : tableau de Light donnant la position des lampes par rapport à la caméra
     */
    setLights(lights)
    {
        // TODO recompiler le shader si le nombre de lampes a changé
        let nblights = lights.length;
        if (nblights != 3) throw "bad lights number";

        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // construire un tableau regroupant les couleurs et un autre avec les positions
        let colors = new Float32Array(3*nblights);
        let positions = new Float32Array(4*nblights);
        for (let i=0; i<nblights; i++) {
            let color = lights[i].getColor();
            colors[i*3+0] = color[0];
            colors[i*3+1] = color[1];
            colors[i*3+2] = color[2];
            let position = lights[i].getPosition();
            positions[i*4+0] = position[0];
            positions[i*4+1] = position[1];
            positions[i*4+2] = position[2];
            positions[i*4+3] = position[3];
        }
        gl.uniform3fv(this.m_LightColorsLoc, colors);
        gl.uniform4fv(this.m_LightPositionsLoc, positions);
    }
}
