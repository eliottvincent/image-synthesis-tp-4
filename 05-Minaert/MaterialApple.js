// Définition de la classe MaterialApple

Requires("Material");
Requires("Texture2D");


class MaterialApple extends Material
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
            varying vec2 frgTexCoords;

            void main()
            {
                frgPosition = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * frgPosition;
                frgN = matN * glNormal;
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 100
            precision mediump float;

            // caractéristiques du matériau
            uniform sampler2D texDiffuse;
            const vec3 Ks = vec3(1.0, 1.0, 1.0);
            const float ns = 128.0;

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
                vec3 Kd = texture2D(texDiffuse, frgTexCoords).rgb;

                // éclairement ambiant : 20 % 
                gl_FragColor = vec4(Kd * 0.2, 1.0);

                // vecteur N et -V et Reflet de V
                vec3 N = normalize(frgN);
                vec3 V = normalize(-frgPosition.xyz);
                vec3 mV = -normalize(frgPosition.xyz);
                vec3 Rv = reflect(mV, N);

                // déclaration pour Minaert
                const float m = 5.0;
                float dotNV = clamp(dot(N,V), 0.0, 1.0);

                for (int i = 0; i < nbL; i++)
                {
                    vec3 L = LightPositions[i].xyz - frgPosition.xyz * LightPositions[i].w;
                    float dist = length(L);
                    L = L / dist;   // normalisation de L
                    vec3 LightColorEffective =  LightColors[i] / (dist*dist);
                    
                    // déclaration pour Minaert
                    float dotNL = clamp(dot(N,L), 0.0, 1.0);
                    float D = pow(dotNL*dotNV, m);
                    
                    // ajout de la composante diffuse (Minaert)
                    gl_FragColor += vec4(Kd * D * LightColorEffective, 1.0);
   
                    // Blinn-Minaert
                    vec3 H = normalize(L + V);
                    float dotNH = clamp(dot(N,H), 0.0, 1.0);
                    float S = pow(dotNH, ns);
                    
                    // ajout de la composante speculaire (Minaert)
                    gl_FragColor += vec4(S * Ks * LightColorEffective, 1.0);
                }
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialApple");

        // emplacement des variables uniform spécifiques
        this.m_TexDiffuseLoc = gl.getUniformLocation(this.m_ShaderId, "texDiffuse");
        this.m_LightColorsLoc = gl.getUniformLocation(this.m_ShaderId, "LightColors");
        this.m_LightPositionsLoc = gl.getUniformLocation(this.m_ShaderId, "LightPositions");

        // charge l'image de la pomme en tant que texture
        this.m_Texture = new Texture2D("data/Apple/skin.jpg");
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


    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // activer la texture sur l'unité 0
        this.m_Texture.setTextureUnit(gl.TEXTURE0, this.m_TexDiffuseLoc);
    }


    deselect()
    {
        // libérer le sampler
        this.m_Texture.setTextureUnit(gl.TEXTURE0);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }


    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer la texture
        this.m_Texture.destroy();
    }
}
