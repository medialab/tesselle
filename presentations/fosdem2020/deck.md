---
title: FOSDEM 2020 - Empowering social scientists with web mining tools
description: Why and how to enable researchers to perform complex web mining tasks
url: https://medialab.github.io/minet/presentations/fosdem2020
image: https://medialab.github.io/artoo/public/img/artoo-icon.svg
marp: true
---

<style>
  h1 {
    background-color: rgb(0, 169, 157);;
    padding: 25px;
    color: white;
  }

  h2 {
    color: rgb(0, 169, 157);
  }

  a {
    color: rgb(0, 169, 157);
  }

  code {
    color: #CC3300;
  }
</style>

<style scoped>
  h1 {
    text-align: center;
  }

  section > p:first-child {
    text-align: center;
  }

  p {
    text-align: center;
    margin-bottom: 0;
  }

  p > em {
    font-size: 20px;
  }
</style>

![width:250px](img/logo.svg)

# Tesselle
## Ease viewing and sharing High Resolution images on the web

*FOSDEM 2020*

*Open Media Devroom*

*Arnaud Pichon, SciencesPo médialab*

---

# Why and how to enable researchers to open and annotate big images easily?

---

# What's a reasercher?
![width:550px](img/donato.jpg)![width:550px](img/bruno.jpg)

- Very different sets of technical skills.
- A need to share easily.
- Seting up a tiling server is hard therefore costly.

---
# What's a big image ?
Cartography, networks, High res photography...
Anything above 5Mo ?
More like 100Mpx

---

# Tabula Peutingeriana
![width:500px](img/330px-Table-de-Peutinger-detail.jpg)
Drawn by a monk in 1265
The first network !
6,82 m sur 0,34 m = 200 000km of roads, cities, rivers, forests, mountains...
From spain to china 🙃
46380 × 2953px = 136,960,140px

---

# Andromeda Galaxy
![width:500px](img/out-min.jpg)
Biggest Hubble image ever released
100 million stars and thousands of star clusters
40 000 light-years long
original: 69536 × 22230px = 1,545,785,280px
cropped: 40000 × 12788 = 511,520,000

---

# And what's the problem ?
Big images are big
Low def images are ugly
FORRCAST is all about ease of publication
I don't want to intall things on my computer

---

# Front end tiling !

## How ?

Canvas VS WASM

---

# Save the memory

---
