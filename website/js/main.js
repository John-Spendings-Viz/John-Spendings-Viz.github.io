document.addEventListener ("DOMContentLoaded", () => {
    d3.csv(expensesByPopFile).then(function (expensesByPop) {
        d3.csv(johnExpensesFile).then(function (johnExpenses) {
            let cleanedJohnData = johnExpenses.filter(d => d.categorie !== ""); // Si une donnée n'est pas catégorisée, on l'enève
            // On regroupe les données de John par année, puis catégorie, puis par mois
            let groupedJohnData = d3.group (cleanedJohnData, d => parseDate(d.date).getFullYear(), d => d.categorie, d => parseDate(d.date).getMonth())
            // On crée une map à partir des données de l'INSEE avec en clé la catégorie
            let groupedDataByPop = d3.index (expensesByPop, d => d.categorie)

            /* On récupère les dépenses moyennes des étudiants et des français */
            annualExpensesStudent = parseFloat (groupedDataByPop.get (totalCategoryName).etudiants).toFixed (2)
            annualExpensesFrench = parseFloat (groupedDataByPop.get (totalCategoryName).francais).toFixed (2)

            /* On remplit l'objet data qui va servir pour l'histogramme et le treemap */
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
                nestedData.push({category: "Origin", parent: ""}) // Le treemap de D3JS demande à ce qu'on ait un noeud racine
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

            drawTreeMap ()

            /* On définit les actions associées aux boutons d'option (année et comparaison) pour les visualisations */
            d3.selectAll("#option-year .option-choices > *").on("click", function () {
                let oldYear = currentYear
                let newYear = this.id.split ("-") [2] // On récupère la 2e partie de l'id du bouton qui contient l'année
                if (oldYear != newYear) {
                    updateCurrentYear(newYear)
                    updateSelectedYear(oldYear)
                    updateTreeMap()
                    updateHistogram()
                }
            })
            //
            d3.selectAll("#option-comparison .option-choices > *").on("click", function () {
                updateSelectedComparison ()
                let newComparisonButton = document.querySelector ("#option-comparison .option-selected")
                let newComparison = newComparisonButton.id.split ("-") [2]
                updateCurrentComparison (newComparison)
                updateTreeMap()
                updateHistogram()
            })
            drawHistogram()
        })
    })

    /* Options de configuration pour les animations */
    AOS.init({
        delay: 300,
        duration: 800,
        once: true,
    });

    /* Quand on redimensionne la fenêtre, on redessine le treemap et l'histogramme */
    window.onresize = function () {
        updateTreeMap()
        updateHistogram()
    }
})