// Définition de la classe Apple

Requires("Mesh");


class Apple extends Mesh
{
    /** constructeur */
    constructor(material)
    {
        // initialisation de this
        super("Apple", material);

        // lire le fichier obj
        this.loadObj("data/Apple/apple.obj");
        // il n'y a pas de callback, car le fichier obj contient les normales et coordonnées de texture
    }


    /**
     * définit les lampes
     * @param lights : tableau de Light donnant la position des lampes par rapport à la caméra
     */
    setLights(lights)
    {
        this.m_Material.setLights(lights);
    }
}
