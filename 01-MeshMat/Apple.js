// Définition de la classe Apple

Requires("Mesh");
Requires("MaterialApple");


class Apple extends Mesh
{
    /** constructeur */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let matapple  = new MaterialApple();

        // initialisation de this
        super("Apple", matapple);
        this.m_MatApple = matapple;

        // lire le fichier obj
        this.loadObj("data/Apple/apple.obj");
        // il n'y a pas de callback, car le fichier obj contient les normales et coordonnées de texture
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse (suppression des VBOs)
        super.destroy();

        // supprimer le matériau
        this.m_MatApple.destroy();
    }
}
