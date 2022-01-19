const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

const expensesByPopFile = "data/expenses_by_population.csv"
const johnExpensesFile = "data/john_expenses.csv"
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
    currentYear = newYear
}

function updateSelectedYear (oldYear) {
    document.querySelector ("#option-year-" + oldYear).classList.toggle ("option-selected")
    document.querySelector ("#option-year-" + currentYear).classList.toggle ("option-selected")
}

function updateSelectedComparison () {
    document.querySelectorAll ("#option-comparison .option-choices > *").forEach (e => e.classList.toggle ("option-selected"))
}

function updateSelectedCategory (oldCategory) {
    if (oldCategory !== "all" && oldCategory !== currentCategory) {
        document.querySelector ("#treemap rect.category-selected").classList.remove ("category-selected")
    }
    if (currentCategory !== "all") {
        document.querySelector (`#treemap rect[category='${currentCategory}']`).classList.remove ("category-not-selected")
        document.querySelector (`#treemap rect[category='${currentCategory}']`).classList.add ("category-selected")
        document.querySelectorAll ("#treemap rect:not(.category-selected)").forEach (e => e.classList.add ("category-not-selected"))
    } else {
        document.querySelectorAll ("#treemap rect").forEach (e => e.classList.remove ("category-not-selected"))
    }
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