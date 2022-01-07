const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
const years = [2020, 2021]

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

let color = d3
    .scaleQuantize()
    .domain([-1, 1])
    .range(["#006D2C", "#31a354", "#FFD700", "#ff7f00", "#FF0000"])

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