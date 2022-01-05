var months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const annual_expenses_student = 10000
const annual_expenses_french = 16600
let currentYear = 2021
let currentComparison = "etudiants"
let currentCategorie = "alimentation"

let color = d3
    .scaleQuantize()
    .range(["#006D2C", "#31a354", "#FFD700", "#ff7f00", "#FF0000"]);
color.domain([-1, 1])

let data = {}

function parseDate(dateString) {
    const [dd, mm, yyyy] = dateString.split("/");
    return new Date(`${yyyy}/${mm}/${dd}`);
}

function updateCurrentComparison(comparison){
    currentComparison = comparison
}

function updateCurrentCategorie(categorie){
    currentCategorie = categorie
}


function updateCurrentYear(year){
    currentYear = year
}

function getMaxTuple(listTuple){
    let max = 0
    let keyMax = undefined
    for (let array of listTuple){
        if (array[1] > max){
            max = array[1]
            keyMax = array[0]
        }
    }
    return keyMax
}