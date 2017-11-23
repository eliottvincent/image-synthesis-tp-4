// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Grid");
Requires("Cow");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Grid = new Grid(5, 5);
        this.m_Cow = new Cow();

        // couleur du fond : gris très clair
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // gestion souris
        this.m_Azimut    = 30.0;
        this.m_Elevation = 20.0;
        this.m_Distance  = 12.0;
        this.m_Center    = vec3.fromValues(0, -1.0, 0);
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

        // dessiner la grille
        this.m_Grid.onDraw(this.m_MatP, this.m_MatV);

        // dessiner la vache en la réduisant à 20% de sa taille
        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(1.0, 0.0, 0.0));
        mat4.scale(this.m_MatVM, this.m_MatVM, vec3.fromValues(0.2, 0.2, 0.2));
        this.m_Cow.onDraw(this.m_MatP, this.m_MatVM);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Grid.destroy();
        this.m_Cow.destroy();
    }
}
