#!/usr/bin/python
# -*- coding: utf-8 -*-

# script python qui fait en sorte que les facettes d'un fichier obj ne soient que des triangles et que les sommets soient uniques


FICHIEROBJ = 'Rock1.obj'

vertices = []

coordonnees = [ ]
texcoords = [ ]
normales = [ ]

triangles = []

def lireIndice(nombres, indice, maximal):
    if indice >= len(nombres): return -1
    val = nombres[indice]
    if not val: return -1
    i = int(val)
    if i < 0: return maximal + i
    return i - 1

def ChercherCreerSommet(nvntnn):
    # extraire les indices
    nombres = nvntnn.split('/')
    nv = lireIndice(nombres, 0, len(coordonnees))
    nt = lireIndice(nombres, 1, len(texcoords))
    nn = lireIndice(nombres, 2, len(normales))
    if nv < 0: return None
    # parcourir les sommets et voir s'il y a le même
    for iv,vert in enumerate(vertices):
        if vert[0] == nv and vert[1] == nt and vert[2] == nn:
            return iv
    # ajouter un sommet
    iv = len(vertices)
    s = (nv,nt,nn)
    vertices.append(s)
    return iv


with open(FICHIEROBJ, 'rt') as entree:
    for ligne in entree:
        mots = ligne.strip().replace("  ", " ").split(' ')

        if mots[0] == 'f':
            s1 = ChercherCreerSommet(mots[1])
            s2 = ChercherCreerSommet(mots[2])
            for i in range(3, len(mots)):
                s3 = ChercherCreerSommet(mots[i])
                triangles.append( (s1+1,s2+1,s3+1) )
                s2 = s3
        elif mots[0] == 'v':
            for i in range(3):
                coordonnees.append(float(mots[i+1]))
        elif mots[0] == 'vt':
            for i in range(2):
                texcoords.append(float(mots[i+1]))
        elif mots[0] == 'vn':
            for i in range(3):
                normales.append(float(mots[i+1]))

with open('tmp.obj', 'wt') as sortie:
    sortie.write('# refait par CleanObjFile (PN)\n')
    for vert in vertices:
        sortie.write('v  %f %f %f\n'%(coordonnees[vert[0]*3+0],coordonnees[vert[0]*3+1],coordonnees[vert[0]*3+2]))
        if texcoords:
            sortie.write('vt %f %f\n'%(texcoords[vert[1]*2+0],texcoords[vert[1]*2+1]))
        if normales:          
            sortie.write('vn %f %f %f\n'%(normales[vert[2]*3+0],normales[vert[2]*3+1],normales[vert[2]*3+2]))
    for i,j,k in triangles:
        sortie.write('f %d/%d/%d %d/%d/%d %d/%d/%d\n'%(i,i,i, j,j,j, k,k,k))

