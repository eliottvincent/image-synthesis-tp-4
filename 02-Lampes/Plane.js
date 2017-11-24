// Définition de la classe Plane

Requires("Mesh");
Requires("MaterialColor");


class Plane extends Mesh
{
    /**
     * constructeur
     * @param size : étendue en -x..+x et -z..+z
     */
    constructor(size=5)
    {
        // matériau
        let material = new MaterialColor(0.07, 0.06, 0.05);

        // initialisation de this
        super("Plane", material);
        this.m_Material = material;

        // sommets
        let P1 = new Vertex(this, -size, 0, +size);
        let P2 = new Vertex(this, +size, 0, +size);
        let P3 = new Vertex(this, +size, 0, -size);
        let P4 = new Vertex(this, -size, 0, -size);

        // rectangle
        this.addQuad(P1, P2, P3, P4);

        // sommets
        let P1b = new Vertex(this, -size, 0, +size);
        let P2b = new Vertex(this, +size, 0, +size);
        let P3b = new Vertex(this, +size, 0, -size);
        let P4b = new Vertex(this, -size, 0, -size);

        // rectangle
        this.addQuad(P4b, P3b, P2b, P1b);

        this.computeNormals();
        this.setReady();
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
