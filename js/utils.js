const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

const expensesByPopFile = "../data/expenses_by_population.csv"
const johnExpensesFile = "../data/john_expenses.csv"
const totalCategoryName = "Total (euros)"

let annualExpensesStudent = 0
let annualExpensesFrench = 0

let currentYear = "all"
let currentComparison = "student"
let currentCategory = "all"

let treemapWidth = 0
let treemapHeight = 0
let histWidth = 0
let histHeight = 0

let colorScale = d3
    .scaleQuantize()
    .domain([-0.7, 0.7])
    .range(["#d7191c", "#fdae61", "#f1f175", "#9dcc4d", "#1a9641"].reverse())
//    .range(["#2c7bb6", "#abd9e9", "#ffffbf", "#fdae61", "#d7191c"])

/*let colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateRdYlGn)
    .domain([0.7, -0.7])*/

let data = {}

function parseDate(dateString) {
    let [dd, mm, yyyy] = dateString.split("/");
    return new Date(`${yyyy}/${mm}/${dd}`);
}

function updateCurrentComparison(comparison){
    currentComparison = comparison
}

function updateCurrentCategory (newCategory){
    if (newCategory === currentCategory) {
        currentCategory = "all"
    } else {
        currentCategory = newCategory
    }
}

function updateCurrentYear (newYear) {
    if (currentYear === newYear) {
        currentYear = "all"
    } else {
        currentYear = newYear
    }
}

function updateSelectedYear (oldYear) {
    if (oldYear !== "all") document.querySelector ("#option-year-" + oldYear).classList.toggle ("option-selected")
    if (currentYear !== "all") document.querySelector ("#option-year-" + currentYear).classList.toggle ("option-selected")
}

function updateSelectedComparison () {
    document.querySelectorAll ("#option-comparison .option-choices > *").forEach (e => e.classList.toggle ("option-selected"))
}

function updateSelectedCategory (rect, oldCategory) {
    if (oldCategory !== "all") {
        document.querySelector ("#treemap rect.category-selected").classList.remove ("category-selected")
        rect.classList.remove ("category-not-selected")
    }
    if (currentCategory !== "all") {
        rect.classList.add ("category-selected")
        document.querySelectorAll ("#treemap rect:not(.category-selected)").forEach (e => e.classList.add ("category-not-selected"))
    } else {
        document.querySelectorAll ("#treemap rect").forEach (e => e.classList.remove ("category-not-selected"))
    }
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

function buildDataByMonthJohn(year) {

    let array = []
    for (let i = 0; i <= 11; i++) {
        let sum = 0;
        for (let o of data[year]) {
            if (o.category !== "Origin") {
                sum += o.expensesByMonth[i]
            }
        }
        array.push(sum)
    }
    return array
}