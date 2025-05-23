
# Autor: Oskar
# Popis: Program pro simulaci "Game of Life"

# Vložíme externí knihovny
import time
import os
import random
os.system("clear||cls")

# Definujeme proměnné
rozloha = int(input("Zadejte velikost pole: "))
fill = int(input("Zadejte vyplnění pole v procentech: "))
iterace = int(input("Zadejte počet iterací: "))


# Definujeme funkci
def GoL(size, fill, iterate):
    
    # Barvicky
    cerveny = "\u001b[31;1m" + "██" 
    cerny = "\u001b[30;1m" + "██"
    
    # Vytvoření pole
    plocha = []
    for i in range(size):
        plocha.append([])
        for j in range(size):
            plocha[i].append(cerny)
    for i in range(len(plocha)):
        for j in range(len(plocha[i])):
            if random.randint(0, 100) < fill:
                plocha[i][j] = cerveny
    
    
    for i in plocha:
        print("".join(i))
    
    # Vytvoření sekundárního pole
    plochanew = plocha
    
    # Hlavní smyčka
    for i in range(iterate):
        os.system("clear||cls")
        for i in range(len(plocha)):
            for j in range(len(plocha)):
                around = 0
                for x in range(-1, 2):
                    for m in range(-1, 2):
                        if i + x < size and j + m < size and (x != 0 or m != 0):
                                if plocha[i + x][j + m] == cerveny:
                                    around += 1
                if plocha[i][j] == cerny:
                    if around == 3:
                        plochanew[i][j] = cerveny
                if plocha[i][j] == cerveny:
                    if around < 2 or around > 3:
                        plochanew[i][j] = cerny
                    else:
                        plochanew[i][j] = cerveny
                if plocha[i][j] == cerny:
                    if around == 3:
                        plochanew[i][j] = cerveny
                        
        # Výpis
        plocha = plochanew
        for i in plocha:
            print("".join(i))
        time.sleep(0.1)

GoL(rozloha, fill, iterace)