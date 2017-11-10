#!/usr/bin/python
# -*- coding: utf-8 -*-

# script python qui fait en sorte que les facettes d'un fichier obj ne soient que des triangles et que les sommets soient uniques


FICHIEROBJ = 'avion.obj'

vertices = []

coordonnees = [ ]

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
    if nv < 0: return None
    # ajouter un sommet
    iv = len(vertices)
    s = (nv,)
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

with open('tmp.obj', 'wt') as sortie:
    sortie.write('# refait par CleanObjFileMin (PN)\n')
    for vert in vertices:
        sortie.write('v  %f %f %f\n'%(coordonnees[vert[0]*3+0],coordonnees[vert[0]*3+1],coordonnees[vert[0]*3+2]))
    for i,j,k in triangles:
        sortie.write('f %d %d %d\n'%(i,j,k))

