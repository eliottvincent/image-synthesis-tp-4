// Définition de la classe Apple

Requires("Mesh");
Requires("MaterialColor");


class Apple extends Mesh
{
    /** constructeur */
    constructor()
    {
        // matériau
        let material = new MaterialColor(0.0, 0.8, 0.2);

        // initialisation de this
        super("Apple", material);
        this.m_Material = material;

        // lire le fichier obj
        this.loadObj("data/Apple/apple.obj");
    }


    /**
     * définit la lampe
     * @param light : instance de Light spécifiant les caractéristiques de la lampe
     */
    setLight(light)
    {
        this.m_Material.setLight(light);
    }


    destroy()
    {
        super.destroy();
        this.m_Material.destroy();
    }
}
