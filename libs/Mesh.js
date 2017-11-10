// Définition d'un maillage en version 0, "triangle-sommet"


/**
 * Cette classe représente l'ensemble du maillage : listes des sommets et des triangles, avec une méthode de dessin
 */
class Mesh
{
    /**
     * constructeur. On lui fournit au moins un matériau (sous-classe de Material), pour les triangles et/ou les arêtes.
     * @param name : nom du maillage (pour la mise au point)
     * @param facesmaterial : sous-classe de Material pour dessiner les facettes
     * @param edgesmaterial : sous-classe de Material pour dessiner les arêtes
     */
    constructor(name, facesmaterial=null, edgesmaterial=null)
    {
        // nom du maillage, pour l'afficher lors de la mise au point
        this.m_Name = name;

        // liste des sommets
        this.m_VertexList = [];

        // liste des triangles
        this.m_TriangleList = [];

        // identifiants des VBOs
        this.m_VertexBufferId     = null;
        this.m_ColorBufferId      = null;
        this.m_TexCoordsBufferId  = null;
        this.m_NormalBufferId     = null;
        this.m_TangentBufferId    = null;
        this.m_FacesIndexBufferId = null;
        this.m_EdgesIndexBufferId = null;

        // matériaux, l'un peut être null
        this.m_FacesMaterial = facesmaterial;
        this.m_EdgesMaterial = edgesmaterial;

        // prêt à être dessiné ? non pas encore : les VBO ne sont pas créés
        this.m_Ready = false;
    }


    /**
     * ajoute deux triangles pour former un quadrilatère
     * @param
     */
    addQuad(P1, P2, P3, P4)
    {
        new Triangle(this, P1, P2, P3);
        new Triangle(this, P1, P3, P4);
    }


    /**
     * recalcule les normales de tous les triangles et sommets du maillage
     * NB: attention, le nom de la méthode est computeNormals pour un Mesh,
     * mais c'est computeNormal pour un triangle ou un sommet
     */
    computeNormals()
    {
        // recalculer les normales des triangles
        for (let triangle of this.m_TriangleList) {
            triangle.computeNormal();
        }

        // recalculer les normales des sommets
        for (let vertex of this.m_VertexList) {
            vertex.computeNormal();
        }
    }


    /**
     * Cette méthode recalcule les tangentes des triangles et sommets.
     * Les tangentes des triangles sont calculées d'après leurs côtés et les coordonnées de texture.
     * Les tangentes des sommets sont les moyennes des tangentes des triangles
     * auxquels ils appartiennent.
     */
    computeTangents()
    {
        // calculer les tangentes des triangles
        for (let triangle of this.m_TriangleList) {
            triangle.computeTangent();
        }

        // calculer les tangentes des sommets
        for (let vertex of this.m_VertexList) {
            vertex.computeTangent();
        }
    }


    /**
     * Cette méthode indique qu'on peut maintenant dessiner le maillage.
     * Elle est à utiliser quand on crée soi-même le maillage, par exemple après avoir calculé les normales
     */
    setReady()
    {
        this.m_Ready = true;
    }


    /**
     * Cette méthode lit le fichier indiqué, il contient un maillage au format OBJ
     * @param filename : nom complet du fichier à lire
     * @param callback : fonction à appeler à la fin du chargement du fichier OBJ, elle doit appeler buildVBO par exemple, si on fournit null, alors ça appelle buildVBO
     */
    loadObj(filename, callback=null)
    {
        // faire une requête HTTP pour demander le fichier obj
        let request = new XMLHttpRequest();
        request.mesh = this;
        request.overrideMimeType('text/plain; charset=x-user-defined');
        request.open("GET", filename, true);
        request.responseType = "text";
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status === 200) {
                    this.mesh.onLoadObj(request.responseText, callback);
                }
            }
        }
        request.onerror = function() {
            console.error(this.m_Name+" : "+filename+" cannot be loaded, check name and access");
            console.error(request);
        }
        request.send();
    }


    /**
     * Cette méthode est appelée automatiquement, quand le contenu du fichier obj
     * est devenu disponible.
     * @param content : contenu du fichier obj
     * @param callback : fonction à appeler à la fin du chargement du fichier OBJ, elle doit appeler buildVBO par exemple
     */
    onLoadObj(content, callback=null)
    {
        // précédent vertex traité
        let vertex = null;
        // parcourir le fichier obj ligne par ligne
        let lines = content.split('\n');
        for (let l=0; l<lines.length; l++) {
            // nettoyer la ligne
            let line = lines[l].replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
            // séparer la ligne en mots
            let words = line.split(' ');
            // mettre le premier mot en minuscules
            let word0 = words[0].toLowerCase();
            if (word0 == 'f' && words.length == 4) {
                // lire le numéro du premier point
                let v1 = this.m_VertexList[parseInt(words[1])-1];
                // lire le numéro du deuxième point
                let v2 = this.m_VertexList[parseInt(words[2])-1];
                // lire le numéro du troisième point
                let v3 = this.m_VertexList[parseInt(words[3])-1];
                // ajouter un triangle v1,v2,v3
                new Triangle(this, v1,v2,v3);
            } else
            if (word0 == 'v' && words.length == 4) {
                // coordonnées 3D d'un sommet
                let x = parseFloat(words[1]);
                let y = parseFloat(words[2]);
                let z = parseFloat(words[3]);
                vertex = new Vertex(this, x,y,z);
            } else
            if (word0 == 'vt' && words.length == 3) {
                // coordonnées 3D d'un sommet
                let s = parseFloat(words[1]);
                let t = parseFloat(words[2]);
                vertex.setTexCoords(s, t);
            } else
            if (word0 == 'vn' && words.length == 4) {
                // coordonnées 3D d'un sommet
                let nx = parseFloat(words[1]);
                let ny = parseFloat(words[2]);
                let nz = parseFloat(words[3]);
                vertex.setNormal(nx, ny, nz);
            }
        }

        // message
        console.log(this.m_Name+" : obj loaded,",this.m_VertexList.length+" vertices,", this.m_TriangleList.length+" triangles");

        // appeler la callback sur this si elle est définie
        if (callback != null) {
            callback.call(this);
        }

        // maintenant le maillage est prêt à être dessiné
        this.m_Ready = true;
    }


    /**
     * Cette méthode retourne l'identifiant du VBO contenant les coordonnées 3D des sommets.
     * Elle construit ce VBO s'il n'est pas encore créé mais que le maillage est complet
     * Cette méthode met aussi à jour tous les indices m_Index des sommets
     * @return null si le maillage n'est pas prêt, sinon c'est l'identifiant WebGL du VBO des coordonnées
     */
    getVertexBufferId()
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return null;

        // créer le VBO s'il n'a pas été déjà créé
        if (this.m_VertexBufferId == null) {

            let vertices = [];
            let num = 0;
            for (let v of this.m_VertexList) {
                v.m_Index = num;
                num++;
                vertices.push(v.m_Coords[0]); vertices.push(v.m_Coords[1]); vertices.push(v.m_Coords[2]);
            }
            this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // retourner l'identifiant du VBO
        return this.m_VertexBufferId;
    }


    /**
     * Cette méthode retourne l'identifiant du VBO contenant les couleurs des sommets.
     * Elle construit ce VBO s'il n'est pas encore créé mais que le maillage est complet
     * @return null si le maillage n'est pas prêt, sinon c'est l'identifiant WebGL du VBO des couleurs
     */
    getColorBufferId()
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return null;

        // créer le VBO s'il n'a pas été déjà créé
        if (this.m_ColorBufferId == null) {

            let colors = [];
            for (let v of this.m_VertexList) {
                colors.push(v.m_Color[0]); colors.push(v.m_Color[1]); colors.push(v.m_Color[2]);
            }
            this.m_ColorBufferId = Utils.makeFloatVBO(colors, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // retourner l'identifiant du VBO
        return this.m_ColorBufferId;
    }


    /**
     * Cette méthode retourne l'identifiant du VBO contenant les coordonnées de texture des sommets.
     * Elle construit ce VBO s'il n'est pas encore créé mais que le maillage est complet
     * @return null si le maillage n'est pas prêt, sinon c'est l'identifiant WebGL du VBO des coordonnées de texture 2D
     */
    getTexCoordsBufferId()
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return null;

        // créer le VBO s'il n'a pas été déjà créé
        if (this.m_TexCoordsBufferId == null) {

            let texcoords = [];
            for (let v of this.m_VertexList) {
                texcoords.push(v.m_TexCoords[0]); texcoords.push(v.m_TexCoords[1]);
            }
            this.m_TexCoordsBufferId = Utils.makeFloatVBO(texcoords, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // retourner l'identifiant du VBO
        return this.m_TexCoordsBufferId;
    }


    /**
     * Cette méthode retourne l'identifiant du VBO contenant les normales des sommets.
     * Elle construit ce VBO s'il n'est pas encore créé mais que le maillage est complet
     * @return null si le maillage n'est pas prêt, sinon c'est l'identifiant WebGL du VBO des normales
     */
    getNormalBufferId()
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return null;

        // créer le VBO s'il n'a pas été déjà créé
        if (this.m_NormalBufferId == null) {

            let normals = [];
            for (let v of this.m_VertexList) {
                normals.push(v.m_Normal[0]); normals.push(v.m_Normal[1]); normals.push(v.m_Normal[2]);
            }
            this.m_NormalBufferId = Utils.makeFloatVBO(normals, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // retourner l'identifiant du VBO
        return this.m_NormalBufferId;
    }


    /**
     * Cette méthode retourne l'identifiant du VBO contenant les tangentes des sommets.
     * Elle construit ce VBO s'il n'est pas encore créé mais que le maillage est complet
     * @return null si le maillage n'est pas prêt, sinon c'est l'identifiant WebGL du VBO des tangentes
     */
    getTangentBufferId()
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return null;

        // créer le VBO s'il n'a pas été déjà créé
        if (this.m_TangentBufferId == null) {

            let tangents = [];
            for (let v of this.m_VertexList) {
                tangents.push(v.m_Tangent[0]); tangents.push(v.m_Tangent[1]); tangents.push(v.m_Tangent[2]);
            }
            this.m_TangentBufferId = Utils.makeFloatVBO(tangents, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // retourner l'identifiant du VBO
        return this.m_TangentBufferId;
    }


    /**
     * Cette méthode retourne l'identifiant du VBO contenant les indices pour dessiner les triangles en primitives indexées.
     * Elle construit ce VBO s'il n'est pas encore créé mais que le maillage est complet
     * Il faut avoir appelé getVertexBufferId auparavant pour que les indices soient corrects et cohérents
     * @return null si le maillage n'est pas prêt, sinon c'est l'identifiant WebGL du VBO des indices de triangles
     */
    getFacesIndexBufferId()
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return null;

        // créer le VBO s'il n'a pas été déjà créé
        if (this.m_FacesIndexBufferId == null) {

            // créer le VBO des indices pour dessiner les triangles
            let indexlist = [];
            for (let t of this.m_TriangleList) {
                indexlist.push(t.m_Vertices[0].m_Index);
                indexlist.push(t.m_Vertices[1].m_Index);
                indexlist.push(t.m_Vertices[2].m_Index);
            }
            this.m_FacesIndexBufferId = Utils.makeShortVBO(indexlist, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // retourner l'identifiant du VBO
        return this.m_FacesIndexBufferId;
    }


    /**
     * Cette méthode retourne l'identifiant du VBO contenant les indices pour dessiner les arêtes en primitives indexées.
     * Elle construit ce VBO s'il n'est pas encore créé mais que le maillage est complet
     * Il faut avoir appelé getVertexBufferId auparavant pour que les indices soient corrects et cohérents
     * @return null si le maillage n'est pas prêt, sinon c'est l'identifiant WebGL du VBO des indices de lignes
     */
    getEdgesIndexBufferId()
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return null;

        // créer le VBO s'il n'a pas été déjà créé
        if (this.m_EdgesIndexBufferId == null) {

            // VBO des indices des arêtes
            let indexlist = [];
            for (let t of this.m_TriangleList) {
                indexlist.push(t.m_Vertices[0].m_Index);
                indexlist.push(t.m_Vertices[1].m_Index);

                indexlist.push(t.m_Vertices[1].m_Index);
                indexlist.push(t.m_Vertices[2].m_Index);

                indexlist.push(t.m_Vertices[2].m_Index);
                indexlist.push(t.m_Vertices[0].m_Index);
            }
            this.m_EdgesIndexBufferId = Utils.makeShortVBO(indexlist, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // retourner l'identifiant du VBO
        return this.m_EdgesIndexBufferId;
    }


    /**
     * dessiner le maillage s'il est prêt. S'il y a un matériau pour les faces, elles sont dessinées, pareil pour les arêtes.
     * @param matP : matrice de projection perpective
     * @param matVM : matrice de transformation de l'objet par rapport à la caméra
     */
    onDraw(matP, matVM)
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return;

        // le matériau des facettes est-il défini ?
        if (this.m_FacesMaterial != null) {

            // décalage des polygones s'il y a aussi les arêtes
            if (this.m_EdgesMaterial != null) {
                gl.enable(gl.POLYGON_OFFSET_FILL);
                gl.polygonOffset(1.0, 1.0);
            }

            // activer le matériau des triangles
            this.m_FacesMaterial.select(this, matP, matVM);

            // activer et lier le buffer contenant les indices
            let facesindexbufferid = this.getFacesIndexBufferId();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, facesindexbufferid);

            // dessiner les triangles
            gl.drawElements(gl.TRIANGLES, this.m_TriangleList.length * 3, gl.UNSIGNED_SHORT, 0);

            // désactiver le matériau
            this.m_FacesMaterial.deselect();

            // désactiver le VBO des indices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            // fin du décalage des polygones s'il y a les arêtes
            if (this.m_EdgesMaterial != null) {
                gl.disable(gl.POLYGON_OFFSET_FILL);
            }
        }

        // le matériau des arêtes est-il défini ?
        if (this.m_EdgesMaterial != null) {

            // activer le matériau des arêtes
            this.m_EdgesMaterial.select(this, matP, matVM);

            // activer et lier le buffer contenant les indices
            let edgesindexbufferid = this.getEdgesIndexBufferId();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgesindexbufferid);

            // dessiner les triangles
            gl.drawElements(gl.LINES, this.m_TriangleList.length * 6, gl.UNSIGNED_SHORT, 0);

            // désactiver le matériau
            this.m_EdgesMaterial.deselect();

            // désactiver le VBO des indices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }


    /**
     * applique une extrusion sur un groupe de triangles
     * @param triangles : liste des triangles à extruder
     * @param vector : direction et distance d'extrusion
     */
    extrude(triangles, vector)
    {
        // construire une table d'association sommet->clone
        let clones = new Map();
        for (let t of triangles) {
            for (let v of t.m_Vertices) {
                if (! clones.has(v)) {
                    // créer un sommet déplacé par rapport à v
                    let x1 = v.m_Coords[0]+vector[0];
                    let y1 = v.m_Coords[1]+vector[1];
                    let z1 = v.m_Coords[2]+vector[2];
                    let v1 = new Vertex(this, x1, y1, z1);
                    v1.setColor(vec3.clone(v.m_Color));
                    v1.setNormal(vec3.clone(v.m_Normal));

                    // mémoriser ce sommet
                    clones.set(v, v1);
                }
            }
        }

        // construire les flancs des triangles
        // TODO éviter les triangles en double sur les arêtes partagées (difficile)
        for (let t of triangles) {
            for (let i=0; i<3; i++) {
                let j = (i+1)%3;
                new Triangle(this, t.m_Vertices[i], t.m_Vertices[j], clones.get(t.m_Vertices[j]));
                new Triangle(this, t.m_Vertices[i], clones.get(t.m_Vertices[j]), clones.get(t.m_Vertices[i]));
            }
        }

        // modifier les triangles extrudés
        for (let t of triangles) {
            t.m_Vertices = [
                clones.get(t.m_Vertices[0]),
                clones.get(t.m_Vertices[1]),
                clones.get(t.m_Vertices[2]) ];
        }
    }


    /**
     * Effectue une subdivision de tous les triangles
     * @param normalize true s'il faut normaliser les sommets intermédiaire
     */
    subdivide(normalize=false)
    {
        // copier la liste des triangles pour ne pas traiter les nouveaux triangles
        let triangles = this.m_TriangleList.slice(0);

        // construire les dictionnaires des milieux des sommets
        for (let v of this.m_VertexList) {
            v.m_Milieux = new Map();
        }

        // chaque triangle est coupé en 4
        for (let t of triangles) {

            // sommets et coordonnées
            let A = t.m_Vertices[0]; let cA = A.m_Coords;
            let B = t.m_Vertices[1]; let cB = B.m_Coords;
            let C = t.m_Vertices[2]; let cC = C.m_Coords;

            // créer les milieux des côtés sauf s'ils existent déjà
            let mAB = A.m_Milieux.get(B);
            if (mAB == undefined) {
                 mAB = new Vertex(this, 0.5*(cA[0]+cB[0]), 0.5*(cA[1]+cB[1]), 0.5*(cA[2]+cB[2]));
                 A.m_Milieux.set(B, mAB);
                 B.m_Milieux.set(A, mAB);
            }
            let mBC = B.m_Milieux.get(C);
            if (mBC == undefined) {
                 mBC = new Vertex(this, 0.5*(cB[0]+cC[0]), 0.5*(cB[1]+cC[1]), 0.5*(cB[2]+cC[2]));
                 B.m_Milieux.set(C, mBC);
                 C.m_Milieux.set(B, mBC);
            }
            let mCA = C.m_Milieux.get(A);
            if (mCA == undefined) {
                 mCA = new Vertex(this, 0.5*(cC[0]+cA[0]), 0.5*(cC[1]+cA[1]), 0.5*(cC[2]+cA[2]));
                 C.m_Milieux.set(A, mCA);
                 A.m_Milieux.set(C, mCA);
            }

            // s'il faut normaliser les coordonnées pour lisser la forme
            if (normalize) {
                vec3.normalize(mAB.m_Coords, mAB.m_Coords);
                vec3.normalize(mBC.m_Coords, mBC.m_Coords);
                vec3.normalize(mCA.m_Coords, mCA.m_Coords);
            }

            // créer les triangles intermédiaires
            new Triangle(this, A, mAB, mCA);
            new Triangle(this, B, mBC, mAB);
            new Triangle(this, C, mCA, mBC);

            // modifier le triangle initial
            t.m_Vertices = [mAB, mBC, mCA];
        }

        // supprimer les maps pour libérer la mémoire
        for (let v of this.m_VertexList) {
            v.m_Milieux = null;
        }
    }


    /** destructeur */
    destroy()
    {
        // supprimer les VBOs (le shader n'est pas créé ici)
        Utils.deleteVBO(this.m_VertexBufferId);
        Utils.deleteVBO(this.m_ColorBufferId);
        Utils.deleteVBO(this.m_TexCoordsBufferId);
        Utils.deleteVBO(this.m_NormalBufferId);
        Utils.deleteVBO(this.m_FacesIndexBufferId);
        Utils.deleteVBO(this.m_EdgesIndexBufferId);
    }
}


/**
 * Cette classe représente l'un des sommets d'un maillage
 */
class Vertex
{
    constructor(mesh, x,y,z)
    {
        // attributs de sommet
        this.m_Index     = -1;
        this.m_Coords    = vec3.fromValues(x,y,z);
        this.m_Color     = vec3.fromValues(1, 0, 1);
        this.m_TexCoords = vec2.create();
        this.m_Normal    = vec3.create();
        this.m_Tangent   = vec3.create();

        // lien entre sommet et mesh
        mesh.m_VertexList.push(this);
        this.m_Mesh = mesh;
    }


    /**
     * affecte la couleur de ce sommet
     */
    setColor(r, g, b)
    {
        vec3.set(this.m_Color, r, g, b);
        // pour pouvoir faire let v = new Vertex(...).setColor(...).setNormal(...);
        return this;
    }

    /**
     * affecte les coordonnées de texture de ce sommet
     */
    setTexCoords(s, t)
    {
        vec2.set(this.m_TexCoords, s, t);
        // pour pouvoir faire let v = new Vertex(...).setColor(...).setNormal(...);
        return this;
    }

    /**
     * affecte la normale de ce sommet
     */
    setNormal(nx, ny, nz)
    {
        vec3.set(this.m_Normal, nx, ny, nz);
        // pour pouvoir faire let v = new Vertex(...).setColor(...).setNormal(...);
        return this;
    }


    /**
     * calcule la normale du sommet = moyenne des normales des triangles autour
     */
    computeNormal()
    {
        // calculer la moyenne des normales des triangles contenant ce sommet
        vec3.zero(this.m_Normal);

        // parcourir tous les triangles du maillage et prendre en compte ceux qui contiennent this
        for (let t of this.m_Mesh.m_TriangleList) {
            if (t.contains(this)) {
                // ajouter la normale du triangle courant, elle tient compte de la surface
                vec3.add(this.m_Normal, this.m_Normal, t.m_Normal);
            }
        }

        // normaliser le résultat
        vec3.normalize(this.m_Normal, this.m_Normal);
    }


    /**
     * Cette méthode calcule la tangente du sommet = moyenne des tangentes des
     * triangles contenant ce sommet.
     */
    computeTangent()
    {
        // calculer la moyenne des tangentes des triangles contenant ce sommet
        vec3.zero(this.m_Tangent);

        // parcourir tous les triangles du maillage et prendre en compte ceux qui contiennent this
        for (let t of this.m_Mesh.m_TriangleList) {
            if (t.contains(this)) {
                // ajouter la normale du triangle courant, elle tient compte de la surface
                vec3.add(this.m_Tangent, this.m_Tangent, t.m_Tangent);
            }
        }

        // normaliser le résultat
        vec3.normalize(this.m_Tangent, this.m_Tangent);
    }
}


/**
 * Cette classe représente l'un des triangles d'un maillage
 */
class Triangle
{
    constructor(mesh, v0, v1, v2)
    {
        // tableau des sommets
        this.m_Vertices = [v0, v1, v2];

        // lien entre triangle et mesh
        mesh.m_TriangleList.push(this);
        this.m_Mesh = mesh;

        // vecteur normal non normalisé, il est proportionnel à la surface du triangle
        this.m_Normal = vec3.create();

        // vecteur tangent, idem
        this.m_Tangent = vec3.create();
    }


    /**
     * retourne true si this contient ce sommet
     * @param vertex : cherché parmi les 3 sommets du triangle
     * @return true si vertex = l'un des sommets, false sinon
     */
    contains(vertex)
    {
        return this.m_Vertices.includes(vertex);
    }


    /**
     * calcule la normale du sommet = moyenne des normales des triangles autour
     */
    computeNormal()
    {
        // les trois sommets
        let A = this.m_Vertices[0];
        let B = this.m_Vertices[1];
        let C = this.m_Vertices[2];

        // les coordonnées des trois sommets
        let cA = A.m_Coords;
        let cB = B.m_Coords;
        let cC = C.m_Coords;

        // vecteurs AB et AC (dans des variables de classe, voir plus bas)
        vec3.subtract(Triangle.cAB, cB, cA);
        vec3.subtract(Triangle.cAC, cC, cA);

        // calculer le vecteur normal
        vec3.cross(this.m_Normal, Triangle.cAB, Triangle.cAC);
    }

    /**
     * recalcule la tangente du triangle à l'aide de la normale et des coordonnées de texture
     */
    computeTangent()
    {
        // les trois sommets
        let A = this.m_Vertices[0];
        let B = this.m_Vertices[1];
        let C = this.m_Vertices[2];

        // les coordonnées des trois sommets
        let cA = A.m_Coords;
        let cB = B.m_Coords;
        let cC = C.m_Coords;

        // vecteurs AB et AC (dans des variables de classe, voir plus bas)
        vec3.subtract(Triangle.cAB, cB, cA);
        vec3.subtract(Triangle.cAC, cC, cA);

        // récupération de leur 2e coordonnée de texture
        let tA = A.m_TexCoords[1];
        let tB = B.m_TexCoords[1];
        let tC = C.m_TexCoords[1];

        // vecteurs dans l'espace (s,t), et uniquement la coordonnée t
        let tAB = tB - tA;
        let tAC = tC - tA;

        // TODO s'il n'y a pas de coordonnées de texture, alors tAB et tAC sont nuls, les remplacer par AB et AC

        // calcul de la tangente
        vec3.scale(Triangle.cAB, Triangle.cAB, tAC);
        vec3.scale(Triangle.cAC, Triangle.cAC, tAB);
        vec3.subtract(this.m_Tangent, Triangle.cAB, Triangle.cAC);
    }
}


// vecteurs temporaires pour le calcul de la normale (créés une seule fois)
// c'est la syntaxe pour une variable de classe
Triangle.cAB = vec3.create();
Triangle.cAC = vec3.create();
