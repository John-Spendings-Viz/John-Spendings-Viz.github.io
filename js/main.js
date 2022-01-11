document.addEventListener ("DOMContentLoaded", () => {
    d3.select("#treemap")
        .append ("svg")
        .attr("width", treemapWidth)
        .attr("height", treemapHeight)

    d3.csv(expensesByPopFile).then(function (expensesByPop) {
        d3.csv(johnExpensesFile).then(function (johnExpenses) {
            let cleanedJohnData = johnExpenses.filter(d => d.categorie !== "");
            let groupedJohnData = d3.group (cleanedJohnData, d => parseDate(d.date).getFullYear(), d => d.categorie, d => parseDate(d.date).getMonth())
            let groupedDataByPop = d3.index (expensesByPop, d => d.categorie)

            annualExpensesStudent = parseFloat (groupedDataByPop.get (totalCategoryName).etudiants).toFixed (2)
            annualExpensesFrench = parseFloat (groupedDataByPop.get (totalCategoryName).francais).toFixed (2)

            for (let [year, dataYear] of groupedJohnData.entries ()) {
                let nestedData = []
                for (let [category, dataCategory] of dataYear.entries ()) {
                    let sumExpensesByMonth = new Array (12).fill (0)
                    for (let [month, dataMonth] of dataCategory.entries ()) {
                        sumExpensesByMonth [month] = d3.sum(dataMonth, d => d.montant).toFixed(2)
                    }
                    nestedData.push({
                        category,
                        parent: "Origin",
                        totalExpenses: parseFloat(d3.sum(sumExpensesByMonth).toFixed(2)),
                        expensesByMonth: sumExpensesByMonth.map (parseFloat),
                        proportionStudent: parseFloat(groupedDataByPop.get (category).etudiants),
                        proportionFrench: parseFloat(groupedDataByPop.get (category).francais)
                    })
                }
                nestedData.push({category: "Origin", parent: ""})
                data[year] = nestedData
            }
            let nestedData = d3.rollups(
                cleanedJohnData,
                dataByCategoryYear => d3.sum(dataByCategoryYear, d => d.montant).toFixed(2),
                d => d.categorie, d => parseDate(d.date).getFullYear()
            )
            nestedData = nestedData.map(([category, totalExpensesByYear]) => ({
                category: category,
                parent:"Origin",
                totalExpenses: d3.sum(totalExpensesByYear, d => d[1]).toFixed(2),
                totalExpensesByYear:totalExpensesByYear,
                proportionStudent: parseFloat(groupedDataByPop.get (category).etudiants),
                proportionFrench: parseFloat(groupedDataByPop.get (category).francais)
            }))
            nestedData.push({category: "Origin", parent: ""})
            data["all"] = nestedData

            let root = calculateTreeMap()
            if (root !== undefined) {
                drawRectTreeMap(root)
                drawLabelsTreeMap(root)
            }
            d3.selectAll("#option-year .option-choices > *").on("click", function () {
                let oldYear = currentYear
                let newYear = +this.textContent
                updateCurrentYear(oldYear, newYear)
                newYear = currentYear
                updateSelectedYear (oldYear, newYear)
                updateTreeMap()
                updateHistogram()
            })
            //
            d3.selectAll("#option-comparison .option-choices > *").on("click", function () {
                updateSelectedComparison ()
                updateCurrentComparison (this.id.split ("-") [2]) // c'est temporaire
                updateTreeMap()
                updateHistogram()
            })
            drawHistogram()
        })
    })

    AOS.init();
})