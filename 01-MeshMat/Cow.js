// Définition de la classe Cow

Requires("Mesh");
Requires("MaterialCow");
Requires("MaterialEdge");


class Cow extends Mesh
{
    /** constructeur */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let matcow  = new MaterialCow();
        let matedge = new MaterialEdge();

        // initialisation de this
        super("Cow", matcow, matedge);
        this.m_MatCow  = matcow;
        this.m_MatEdge = matedge;

        // lire le fichier obj
        this.loadObj("data/cow.obj", this.onCowLoaded);
    }


    /**
     * cette méthode est appelée quand le fichier OBJ est chargé
     */
    onCowLoaded()
    {
        // calculer les normales du maillage car celui de la vache ne contient pas de normales
        this.computeNormals();
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer les matériaux
        this.m_MatCow.destroy();
        this.m_MatEdge.destroy();
    }
}
