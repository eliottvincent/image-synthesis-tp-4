// Définition de la classe Light

class Light
{
    /**
     * constructeur : initialise une lampe, utiliser les setters pour la définir
     */
    constructor()
    {
        this.m_LightColor          = vec3.create();
        this.m_LightPositionScene  = vec4.create();

        // position de la lampe relativement à la caméra
        this.m_LightPositionCamera  = vec4.create();
    }


    /**
     * définit la couleur de la lampe, c'est à dire l'intensité
     */
    setColor(r,g,b)
    {
        vec3.set(this.m_LightColor, r,g,b);
        return this;
    }


    /**
     * retourne la couleur de la lampe
     * @return vec3 couleur
     */
    getColor()
    {
        return this.m_LightColor;
    }

    /**
     * définit la position de la lampe par rapport à la scène
     */
    setPosition(x,y,z,w)
    {
        vec4.set(this.m_LightPositionScene, x,y,z,w);
        return this;
    }


    /**
     * retourne la position de la lampe par rapport à la caméra
     * @return vec4 position caméra
     */
    getPosition()
    {
        return this.m_LightPositionCamera;
    }


    /**
     * calcule la position en coordonnées caméra
     * @param matV : mat4 matrice de vue caméra
     */
    transform(matV)
    {
        vec4.transformMat4(this.m_LightPositionCamera,  this.m_LightPositionScene,  matV);
    }
}
