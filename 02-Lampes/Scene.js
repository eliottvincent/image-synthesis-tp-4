// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Plane");
Requires("Apple");
Requires("Star");
Requires("Light");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Plane = new Plane(8);
        this.m_Apple = new Apple();
        this.m_Star = new Star(0.3, 4.0);

        // caractéristiques de la lampe
        this.m_Light = new Light();
        this.m_Light.setColor(150.0, 150.0, 150.0);
        //this.m_Light.setPosition(-3.0, 3.0, 1.0, 0.0);      // directionnelle
        this.m_Light.setPosition(-3.0,  3.0,  1.0, 1.0);    // positionnelle
        this.m_Light.setDirection(1.5, -2.0, -0.5, 0.0);
        this.m_Light.setAngles(30.0, 38.0);

        // couleur du fond : gris très sombre
        gl.clearColor(0.05, 0.05, 0.05, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        // gestion souris
        this.m_Azimut    = -30.0;
        this.m_Elevation = 20.0;
        this.m_Distance  = 20.0;
        this.m_Center    = vec3.fromValues(0, -0.8, 0);
        this.m_Clicked   = false;

        // matrices
        this.m_MatV = mat4.create();
        this.m_MatVM = mat4.create();
        this.m_MatTMP = mat4.create();
    }


    /**
     * appelée quand on appuie sur une touche du clavier
     * @param code : touche enfoncée
     */
    onKeyDown(code)
    {
        // construire la matrice inverse de l'orientation de la vue à la souris
        mat4.identity(this.m_MatTMP);
        mat4.rotateY(this.m_MatTMP, this.m_MatTMP, Utils.radians(-this.m_Azimut));
        mat4.rotateX(this.m_MatTMP, this.m_MatTMP, Utils.radians(-this.m_Elevation));

        // vecteur indiquant le décalage à appliquer au pivot de la rotation
        let offset = vec3.create();
        switch (code) {
        case 'Z':
            this.m_Distance *= Math.exp(-0.01);
            break;
        case 'S':
            this.m_Distance *= Math.exp(+0.01);
            break;
        case 'Q':
            vec3.transformMat4(offset, vec3.fromValues(+0.1, 0, 0), this.m_MatTMP);
            break;
        case 'D':
            vec3.transformMat4(offset, vec3.fromValues(-0.1, 0, 0), this.m_MatTMP);
            break;
        case 'A':
            vec3.transformMat4(offset, vec3.fromValues(0, -0.1, 0), this.m_MatTMP);
            break;
        case 'W':
            vec3.transformMat4(offset, vec3.fromValues(0, +0.1, 0), this.m_MatTMP);
            break;
        default:
            // appeler la méthode de la superclasse
            super.onKeyDown(code);
        }

        // appliquer le décalage au centre de la rotation
        vec3.add(this.m_Center, this.m_Center, offset);
    }

    onMouseDown(btn, x, y)
    {
        this.m_Clicked = true;
        this.m_MousePrecX = x;
        this.m_MousePrecY = y;
    }

    onMouseUp(btn, x, y)
    {
        this.m_Clicked = false;
    }

    onMouseMove(x, y)
    {
        if (! this.m_Clicked) return;
        this.m_Azimut  += (x - this.m_MousePrecX) * 0.2;
        this.m_Elevation += (y - this.m_MousePrecY) * 0.2;
        if (this.m_Elevation >  90.0) this.m_Elevation =  90.0;
        if (this.m_Elevation < -90.0) this.m_Elevation = -90.0;
        this.m_MousePrecX = x;
        this.m_MousePrecY = y;
    }


    onSurfaceChanged(width, height)
    {
        // met en place le viewport
        gl.viewport(0, 0, width, height);

        // matrice de projection
        this.m_MatP = mat4.create();
        mat4.perspective(this.m_MatP, Utils.radians(18.0), width / height, 0.1, 90.0);
    }


    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra
        mat4.identity(this.m_MatV);

        // éloignement de la scène
        mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(0.0, 0.0, -this.m_Distance));

        // rotation demandée par la souris
        mat4.rotateX(this.m_MatV, this.m_MatV, Utils.radians(this.m_Elevation));
        mat4.rotateY(this.m_MatV, this.m_MatV, Utils.radians(this.m_Azimut));

        // centre des rotations
        mat4.translate(this.m_MatV, this.m_MatV, this.m_Center);

        // calculer la position et la direction de la lampe par rapport à la scène
        this.m_Light.transform(this.m_MatV);

        // fournir position et direction en coordonnées caméra aux objets qui les enverront à leurs matériaux
        this.m_Plane.setLight(this.m_Light);
        this.m_Apple.setLight(this.m_Light);

        // dessiner une étoile là où est la lampe si elle est positionnelle
        if (this.m_Light.m_LightPositionScene[3] === 1.0) {
            mat4.translate(this.m_MatVM, this.m_MatV, this.m_Light.m_LightPositionScene);
            this.m_Star.onDraw(this.m_MatP, this.m_MatVM);
        }

        // dessiner le plan
        this.m_Plane.onDraw(this.m_MatP, this.m_MatV);

        // dessiner la pomme en réduisant sa taille
        mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(1.0, 0.0, 0.0));
        mat4.scale(this.m_MatVM, this.m_MatV, vec3.fromValues(0.03, 0.03, 0.03));
        this.m_Apple.onDraw(this.m_MatP, this.m_MatVM);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Plane.destroy();
        this.m_Apple.destroy();
        this.m_Star.destroy();
    }
}
