const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

const expensesByPopFile = "../data/expenses_by_population.csv"
const johnExpensesFile = "../data/john_expenses.csv"
const totalCategoryName = "Total (euros)"

let annualExpensesStudent = 0
let annualExpensesFrench = 0

let currentYear = "2021"
let currentComparison = "student"
let currentCategory = "all"
const treemapWidth = 600
const treemapHeight = 400

let colorScale = d3
    .scaleQuantize()
    .domain([-0.7, 0.7])
    .range(["#d7191c", "#fdae61", "#f1f175", "#9dcc4d", "#1a9641"].reverse())

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

function updateCurrentCategory(category){
    currentCategory = category
}

function updateCurrentYear (oldYear, newYear){
    if (oldYear === newYear) {
        currentYear = "all"
    } else {
        currentYear = newYear
    }
}

function updateSelectedYear (oldYear, newYear) {
    if (oldYear !== "all") document.querySelector ("#option-year-" + oldYear).classList.toggle ("year-selected")
    if (newYear !== "all") document.querySelector ("#option-year-" + newYear).classList.toggle ("year-selected")
}

function updateSelectedComparison () {
    document.querySelectorAll ("#option-comparison .option-choices > *").forEach (e => e.classList.toggle ("comparison-selected"))
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
    for (let i of [0,1,2,3,4,5,6,7,8,9,10,11]) {
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